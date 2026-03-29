-- =====================================================
-- CREATE ADMIN USER WITH PASSWORD: NANU@ADMIN
-- This creates the default admin account
-- Password hash is for: NANU@ADMIN (bcryptjs hashed)
-- =====================================================

-- Delete existing admin if needed (optional - comment out to keep existing)
DELETE FROM admin_users WHERE email = 'admin@thestrong.com';

-- Insert new admin user with password: NANU@ADMIN
-- Password hash generated using: bcrypt.hash('NANU@ADMIN', 10)
INSERT INTO admin_users (id, email, password_hash, secret_code, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@thestrong.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye/T8MkSRbFX3BFa7fxB8gZmNzfDKt2jK', -- NANU@ADMIN hashed
  'NANU',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye/T8MkSRbFX3BFa7fxB8gZmNzfDKt2jK',
  updated_at = CURRENT_TIMESTAMP;

-- Verify admin user was created/updated
SELECT id, email, secret_code, is_active, created_at FROM admin_users WHERE email = 'admin@thestrong.com';
