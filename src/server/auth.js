import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

// Hash password using bcrypt
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

// Compare password with hash
export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Failed to compare password');
  }
}

// Generate JWT token
export function generateToken(adminId, email) {
  try {
    return jwt.sign(
      { id: adminId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate token');
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Get admin by email
export async function getAdminByEmail(email) {
  try {
    const result = await query(
      'SELECT id, email, password_hash, name, role, is_active FROM admin_users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching admin by email:', error);
    throw error;
  }
}

// Get admin by ID
export async function getAdminById(id) {
  try {
    const result = await query(
      'SELECT id, email, name, role, is_active, last_login FROM admin_users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching admin by ID:', error);
    throw error;
  }
}

// Create session
export async function createSession(adminId, token, ipAddress, userAgent) {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const result = await query(
      `INSERT INTO admin_sessions (admin_id, token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, token, expires_at`,
      [adminId, token, ipAddress, userAgent, expiresAt]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Get session by token
export async function getSessionByToken(token) {
  try {
    const result = await query(
      `SELECT s.*, a.email, a.name, a.role 
       FROM admin_sessions s
       JOIN admin_users a ON s.admin_id = a.id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
}

// Delete session
export async function deleteSession(token) {
  try {
    await query(
      'DELETE FROM admin_sessions WHERE token = $1',
      [token]
    );
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

// Log audit action
export async function logAuditAction(adminId, action, details, ipAddress, status) {
  try {
    await query(
      `INSERT INTO admin_audit_log (admin_id, action, details, ip_address, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId || null, action, details, ipAddress, status]
    );
  } catch (error) {
    console.error('Error logging audit action:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

// Update last login
export async function updateLastLogin(adminId) {
  try {
    await query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [adminId]
    );
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}
