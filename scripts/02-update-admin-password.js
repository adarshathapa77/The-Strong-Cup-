// =====================================================
// ADMIN PASSWORD UPDATE SCRIPT
// Updates admin@thestrong.com password to "NANU@ADMIN"
// =====================================================

import bcrypt from 'bcryptjs';
import { query } from '../src/server/db.js';
import 'dotenv/config';

async function updateAdminPassword() {
  try {
    console.log('[v0] Starting admin password update...');

    const email = 'admin@thestrong.com';
    const newPassword = 'NANU@ADMIN';

    // Hash the new password
    console.log('[v0] Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update the admin password
    console.log('[v0] Updating password in database...');
    const result = await query(
      'UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, email, name',
      [passwordHash, email]
    );

    if (result.rows.length === 0) {
      console.log('[v0] Admin user not found. Creating new admin...');

      // If admin doesn't exist, create one
      const createResult = await query(
        `INSERT INTO admin_users (email, password_hash, name, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, email, name, role`,
        [email, passwordHash, 'Admin', 'admin']
      );

      const admin = createResult.rows[0];
      console.log('[v0] ✅ Admin created successfully!');
      console.log(`[v0] ID: ${admin.id}`);
      console.log(`[v0] Email: ${admin.email}`);
      console.log(`[v0] Name: ${admin.name}`);
      console.log(`[v0] Role: ${admin.role}`);
    } else {
      const admin = result.rows[0];
      console.log('[v0] ✅ Admin password updated successfully!');
      console.log(`[v0] Admin ID: ${admin.id}`);
      console.log(`[v0] Email: ${admin.email}`);
      console.log(`[v0] Name: ${admin.name}`);
    }

    console.log('[v0] ✅ Update completed!');
    console.log('[v0] You can now login with:');
    console.log(`[v0] Email: ${email}`);
    console.log(`[v0] Password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('[v0] Error updating admin password:', error);
    process.exit(1);
  }
}

// Run the update
updateAdminPassword();
