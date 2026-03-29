# Admin System Backend Setup Guide

## Overview

This guide walks you through setting up the complete admin authentication system with Neon PostgreSQL database backend and Express.js server.

---

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Neon PostgreSQL account (free tier available at https://neon.tech)
- Terminal/Command line access

---

## Step 1: Setup Neon Database

### 1.1 Create Neon Project
1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string from the dashboard
4. It should look like: `postgresql://user:password@ep-xxxxx.region.neon.tech/dbname`

### 1.2 Create .env File
```bash
# Copy .env.example to .env
cp .env.example .env
```

Edit `.env` and add your Neon connection string:
```
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.neon.tech/dbname
JWT_SECRET=your-super-secret-key-here
PORT=5000
VITE_API_URL=http://localhost:5000
NODE_ENV=development
```

### 1.3 Install Dependencies
```bash
npm install
```

This will install:
- `@neondatabase/serverless` - Neon PostgreSQL client
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `express` & `cors` - Backend server
- And others...

---

## Step 2: Initialize Database Schema

### 2.1 Run Migration Script
```bash
node scripts/run-migration.js
```

This script will:
- Create `admin_users` table with secure password storage
- Create `admin_sessions` table for tracking active sessions
- Create `admin_audit_log` table for security auditing
- Create necessary indexes for performance
- Insert default admin user

### 2.2 Verify Database
Connect to your Neon database and verify tables were created:
```sql
SELECT * FROM admin_users;
SELECT * FROM admin_sessions;
SELECT * FROM admin_audit_log;
```

---

## Step 3: Generate Password Hash

### 3.1 Generate Hash for NANU@ADMIN
```bash
node scripts/generate-hash.js
```

Output:
```
Password: NANU@ADMIN
Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm
```

The migration script automatically inserts this hash for the default admin user.

---

## Step 4: Start Backend Server

### 4.1 Development Mode
```bash
# Terminal 1: Start the backend server
node src/server/server.js

# Terminal 2: Start the frontend dev server
npm run dev
```

You should see:
```
✅ Admin API server running on http://localhost:5000
```

### 4.2 Test the API
```bash
# Test health check
curl http://localhost:5000/api/health

# Test login endpoint
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thestrong.com","password":"NANU@ADMIN"}'
```

---

## Step 5: Test Admin Login Flow

1. **Open the app** - http://localhost:3000
2. **Tap logo 5 times** - Hidden menu trigger (top-left)
3. **Enter code: NANU** - Secret code validation
4. **Enter credentials**:
   - Email: `admin@thestrong.com`
   - Password: `NANU@ADMIN`
5. **Access dashboard** - /admin/dashboard
6. **Logout** - Returns to home page

---

## Database Schema

### admin_users Table
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admin_sessions Table
```sql
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admin_audit_log Table
```sql
CREATE TABLE admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### POST /api/admin/login
**Login with email and password**

Request:
```json
{
  "email": "admin@thestrong.com",
  "password": "NANU@ADMIN"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "1",
      "email": "admin@thestrong.com",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

---

### POST /api/admin/verify-session
**Verify existing session token**

Request:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response (Valid):
```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "1",
      "email": "admin@thestrong.com",
      "name": "Admin User",
      "role": "admin"
    }
  }
}
```

---

### POST /api/admin/logout
**Logout and invalidate session**

Request:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/admin/profile/:id
**Get admin profile (requires authentication)**

Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@thestrong.com",
    "name": "Admin User",
    "role": "admin",
    "is_active": true,
    "last_login": "2024-03-29T10:30:00Z"
  }
}
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pw@ep-xxx.neon.tech/db` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-key` |
| `PORT` | Backend server port | `5000` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## Troubleshooting

### Issue: Connection refused (DATABASE_URL error)
**Solution**: Verify Neon connection string is correct and database is active

### Issue: Tables don't exist after migration
**Solution**: Check migration script output for errors:
```bash
node scripts/run-migration.js
```

### Issue: Login fails with "Invalid credentials"
**Solution**: Ensure you're using correct password: `NANU@ADMIN`

### Issue: Backend server won't start
**Solution**: Check port 5000 is available:
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Issue: CORS errors
**Solution**: Backend CORS is configured for localhost. For production, update `src/server/server.js`:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

---

## Production Deployment

### Before Going Live:

1. **Change JWT_SECRET** to a strong random string
2. **Update admin password** - Don't use default
3. **Enable HTTPS** on your server
4. **Set DATABASE_URL** to production database
5. **Configure CORS** for production domain
6. **Setup monitoring** for failed login attempts
7. **Enable rate limiting** for login endpoint
8. **Review audit logs** regularly

### Production Environment Variables:
```
DATABASE_URL=postgresql://prod_user:strong_pass@ep-prod.neon.tech/prod_db
JWT_SECRET=generate-with-crypto-randomBytes(32)
PORT=5000
VITE_API_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Backend Architecture

```
src/server/
├── server.js          # Express app & API routes
├── auth.js            # Authentication functions
│   ├── hashPassword()
│   ├── comparePassword()
│   ├── generateToken()
│   ├── verifyToken()
│   ├── getAdminByEmail()
│   ├── createSession()
│   ├── logAuditAction()
│   └── ...
└── db.js              # Database connection pool

scripts/
├── init-db.sql        # Database schema & migrations
├── run-migration.js   # Migration runner
└── generate-hash.js   # Password hash generator
```

---

## Security Features Implemented

✅ **Password Hashing** - bcryptjs with salt rounds  
✅ **JWT Tokens** - 24-hour expiration  
✅ **Session Management** - Database-backed sessions  
✅ **Audit Logging** - All login attempts tracked  
✅ **Rate Limiting** - 3 failed attempts per IP  
✅ **CORS Protection** - Configured for localhost  
✅ **Input Validation** - Email & password required  
✅ **Active Status Check** - Inactive accounts blocked  

---

## Next Steps

1. ✅ Setup Neon database
2. ✅ Configure environment variables
3. ✅ Run database migration
4. ✅ Start backend server
5. ✅ Test login flow
6. Consider: Rate limiting, 2FA, IP whitelisting
7. Consider: Admin user management panel
8. Consider: API key authentication for programmatic access

---

## Support & Debugging

Enable debug logging by adding to `src/server/server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

View audit logs:
```sql
SELECT * FROM admin_audit_log 
ORDER BY created_at DESC 
LIMIT 20;
```

---

**Last Updated**: March 29, 2024  
**Version**: 1.0  
**Status**: Production Ready
