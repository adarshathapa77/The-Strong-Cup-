import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import {
  getAdminByEmail,
  getAdminById,
  comparePassword,
  generateToken,
  createSession,
  getSessionByToken,
  deleteSession,
  logAuditAction,
  updateLastLogin,
} from './auth.js';
import userAuthRoutes from './routes/userAuth.js';
import orderRoutes from './routes/orders.js';
import invoiceRoutes from './routes/invoices.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/users', userAuthRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);

// Helper function to get client IP
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
}

// Helper function to get user agent
function getUserAgent(req) {
  return req.headers['user-agent'] || 'Unknown';
}

// Route: Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const ipAddress = getClientIp(req);

    // Get admin by email
    const admin = await getAdminByEmail(email);

    if (!admin) {
      // Log failed attempt
      await logAuditAction(null, 'LOGIN_ATTEMPT', `Failed - user not found: ${email}`, ipAddress, 'FAILED');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!admin.is_active) {
      await logAuditAction(admin.id, 'LOGIN_ATTEMPT', 'Account is inactive', ipAddress, 'FAILED');
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive',
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, admin.password_hash);

    if (!isPasswordValid) {
      await logAuditAction(admin.id, 'LOGIN_ATTEMPT', 'Failed - invalid password', ipAddress, 'FAILED');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(admin.id, admin.email);

    // Create session in database
    const session = await createSession(admin.id, jwtToken, ipAddress, getUserAgent(req));

    // Update last login
    await updateLastLogin(admin.id);

    // Log successful login
    await logAuditAction(admin.id, 'LOGIN_SUCCESS', 'Admin login successful', ipAddress, 'SUCCESS');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: jwtToken,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
});

// Route: Verify Session
app.post('/api/admin/verify-session', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const session = await getSessionByToken(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: session.admin_id,
          email: session.email,
          name: session.name,
          role: session.role,
        },
      },
    });
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during session verification',
    });
  }
});

// Route: Admin Logout
app.post('/api/admin/logout', async (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      await deleteSession(token);
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      await logAuditAction(decoded.id, 'LOGOUT', 'Admin logged out', getClientIp(req), 'SUCCESS');
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
});

// Route: Get Admin Profile
app.get('/api/admin/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const session = await getSessionByToken(token);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session',
      });
    }

    const admin = await getAdminById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Admin API is running',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Admin API server running on http://localhost:${PORT}`);
});
