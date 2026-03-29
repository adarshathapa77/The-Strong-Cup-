# Visual Setup Guide - Admin Backend Integration

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Your App (Port 3000)                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React Frontend - Admin System                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  AdminContext (useAdmin hook)                    │  │ │
│  │  │  - Manages login state                           │  │ │
│  │  │  - Stores JWT token                              │  │ │
│  │  │  - Calls backend API                             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────────┬──────────────────────────────────────────────┘
                 │ HTTP API Calls
                 │ (JSON)
                 ↓
┌────────────────────────────────────────────────────────────────┐
│             Backend Server (Port 5000)                         │
│             Express.js + Node.js                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes                                              │  │
│  │  ├─ POST /api/admin/login      → Authenticate          │  │
│  │  ├─ POST /api/admin/verify-session → Check session     │  │
│  │  ├─ POST /api/admin/logout     → Invalidate session    │  │
│  │  └─ GET /api/admin/profile/:id → Get user info        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Authentication Functions (auth.js)                     │  │
│  │  ├─ hashPassword()         → bcryptjs                  │  │
│  │  ├─ comparePassword()      → Check hash                │  │
│  │  ├─ generateToken()        → Create JWT                │  │
│  │  ├─ verifyToken()          → Validate JWT              │  │
│  │  ├─ getAdminByEmail()      → Query DB                  │  │
│  │  ├─ createSession()        → Store session             │  │
│  │  ├─ logAuditAction()       → Track login attempts     │  │
│  │  └─ updateLastLogin()      → Update timestamp          │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Database Connection Pool (db.js)                       │  │
│  │  Query function with connection pooling                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────┬──────────────────────────────────────────────┘
                 │ TCP Connection
                 │ (PostgreSQL Protocol)
                 ↓
┌────────────────────────────────────────────────────────────────┐
│        Neon PostgreSQL Database                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  admin_users                                             │  │
│  │  ├─ id          → Unique identifier                     │  │
│  │  ├─ email       → admin@thestrong.com                   │  │
│  │  ├─ password_hash → bcryptjs encrypted                 │  │
│  │  ├─ name        → Admin User                            │  │
│  │  ├─ role        → admin                                 │  │
│  │  ├─ is_active   → true/false                            │  │
│  │  ├─ last_login  → Timestamp                             │  │
│  │  ├─ created_at  → Timestamp                             │  │
│  │  └─ updated_at  → Timestamp                             │  │
│  ├─ admin_sessions (JWT tokens, expiration)               │  │
│  └─ admin_audit_log (Login history)                       │  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Indexes (for performance)                              │  │
│  │  ├─ idx_admin_users_email                              │  │
│  │  ├─ idx_admin_sessions_token                           │  │
│  │  ├─ idx_admin_sessions_admin_id                        │  │
│  │  └─ idx_admin_sessions_expires_at                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## Login Flow Diagram

```
START: User opens app (http://localhost:3000)
   ↓
User taps logo 5 times (in navbar)
   ↓
AdminCodeModal appears
   ↓
User enters secret code: "NANU"
   ↓
Code validated (localStorage state)
   ↓
Modal closes, redirect to /admin/login
   ↓
User enters credentials:
   - Email: admin@thestrong.com
   - Password: NANU@ADMIN
   ↓
onClick "Sign In" button
   ↓
AdminContext.login() called
   ↓
POST /api/admin/login
   │
   ├─ Body: { email, password }
   ├─ Headers: { Content-Type: application/json }
   └─ Destination: http://localhost:5000
   ↓
Backend receives request
   ↓
Extract email and password from request
   ↓
Query: SELECT * FROM admin_users WHERE email = ?
   ↓
   ├─ If user NOT found:
   │  └─ Log: INSERT INTO admin_audit_log (action: LOGIN_ATTEMPT, status: FAILED)
   │  └─ Response: 401 "Invalid email or password"
   │
   ├─ If user found but is_active = false:
   │  └─ Response: 403 "Account is inactive"
   │
   └─ If user found and is_active = true:
      ↓
      bcryptjs.compare(password, user.password_hash)
      ↓
      ├─ If password doesn't match:
      │  └─ Log: INSERT INTO admin_audit_log (action: LOGIN_ATTEMPT, status: FAILED)
      │  └─ Response: 401 "Invalid email or password"
      │
      └─ If password matches:
         ↓
         jwt.sign({ id, email }, JWT_SECRET)
         ↓
         INSERT INTO admin_sessions (admin_id, token, expires_at)
         ↓
         UPDATE admin_users SET last_login = NOW()
         ↓
         Log: INSERT INTO admin_audit_log (action: LOGIN_SUCCESS, status: SUCCESS)
         ↓
         Response: 200 {
           success: true,
           data: {
             token: "eyJhbGc...",
             admin: { id, email, name, role }
           }
         }
   ↓
Frontend receives response
   ↓
   ├─ If success: true
   │  ├─ Save token to AdminContext state
   │  ├─ Save token to localStorage
   │  ├─ Save admin info to localStorage
   │  ├─ Redirect to /admin/dashboard
   │  └─ Display user name: "Welcome back, Admin User"
   │
   └─ If success: false
      ├─ Show error message
      └─ Stay on login page
   ↓
END: Admin logged in and authenticated
```

---

## Database Schema Diagram

```
┌─────────────────────────────────┐
│       admin_users               │
├─────────────────────────────────┤
│ PK  id               SERIAL      │
│     email            VARCHAR     │◄─────────┐
│     password_hash    VARCHAR     │          │
│     name             VARCHAR     │          │
│     role             VARCHAR     │          │
│     is_active        BOOLEAN     │          │
│     last_login       TIMESTAMP   │          │
│     created_at       TIMESTAMP   │          │
│     updated_at       TIMESTAMP   │          │
└─────────────────────────────────┘          │
         △                                     │
         │ 1:N                                 │
         │                                     │
┌────────┴──────────────────────────┐         │
│       admin_sessions              │         │
├───────────────────────────────────┤         │
│ PK  id               SERIAL       │         │
│ FK  admin_id         INT ─────────┼─────────┤
│     token            VARCHAR      │ (unique)
│     ip_address       VARCHAR      │
│     user_agent       VARCHAR      │
│     expires_at       TIMESTAMP    │
│     created_at       TIMESTAMP    │
└───────────────────────────────────┘


         admin_users (1)
             △
             │ 1:N
             │
         admin_audit_log
        (optional)
         ├─ admin_id
         ├─ action
         ├─ details
         ├─ ip_address
         ├─ status
         └─ created_at
```

---

## File Organization

```
The-Strong-Cup/
├── src/
│   ├── server/                    (NEW)
│   │   ├── server.js              ← Express API
│   │   ├── auth.js                ← Auth functions
│   │   └── db.js                  ← DB connection
│   ├── context/
│   │   └── AdminContext.tsx       ← UPDATED
│   ├── pages/
│   │   ├── AdminLogin.tsx         ← UPDATED
│   │   └── AdminDashboard.tsx     ← UPDATED
│   └── ...other files
├── scripts/                        (NEW)
│   ├── init-db.sql                ← Schema
│   ├── run-migration.js           ← Setup script
│   └── generate-hash.js           ← Hash generator
├── .env                           ← YOUR CONFIG (create from .env.example)
├── .env.example                   ← UPDATED
├── package.json                   ← UPDATED
├── vite.config.ts                 ← UPDATED
├── QUICK_START_BACKEND.md         ← START HERE (5 min)
├── ADMIN_BACKEND_SETUP.md         ← Full guide (30 min)
├── BACKEND_IMPLEMENTATION_COMPLETE.md
├── BACKEND_SETUP_INDEX.md
├── README_BACKEND_CHANGES.md      ← What changed
└── SETUP_VISUAL_GUIDE.md          ← This file
```

---

## Setup Timeline

```
5 MINUTES        │
    │            │
    ├─ Copy .env.example → .env
    ├─ Add DATABASE_URL
    ├─ npm install
    ├─ npm run db:migrate
    ├─ npm run dev:server (Terminal 1)
    ├─ npm run dev (Terminal 2)
    │
    ↓
DONE! Backend + Database Running
```

---

## Security Layers

```
LAYER 1: Secret Code Entry
   Input: "NANU"
   Validates: Client-side check
   Purpose: Hide login from normal users

LAYER 2: Email & Password
   Input: admin@thestrong.com / NANU@ADMIN
   Validates: Backend against database
   Stored: password_hash (bcryptjs)
   Purpose: Authentication

LAYER 3: Password Verification
   Method: bcryptjs.compare()
   Hash Rounds: 10
   Purpose: Secure password comparison

LAYER 4: JWT Token Generation
   Method: jwt.sign(payload, SECRET)
   Secret: JWT_SECRET (32+ chars)
   Expiry: 24 hours
   Purpose: Session token for subsequent requests

LAYER 5: Session Storage
   Storage: admin_sessions table
   Tracks: IP address, user agent, token, expiration
   Purpose: Revocation & tracking

LAYER 6: Audit Logging
   Storage: admin_audit_log table
   Tracks: All login attempts, success/failure, IP
   Purpose: Security monitoring
```

---

## Terminal Commands Reference

```bash
# Setup Phase
npm install                          # Install dependencies
npm run db:migrate                   # Create database tables
npm run db:hash                      # Generate password hash

# Development Phase
npm run dev:server                   # Backend server (port 5000)
npm run dev                          # Frontend server (port 3000)

# Utility
npm run build                        # Build for production
npm run preview                      # Preview production build
npm run lint                         # TypeScript check
npm run clean                        # Clean dist folder
```

---

## Environment Variables Explained

```
┌─────────────────────────────────────────────────────────────┐
│  DATABASE_URL (REQUIRED)                                    │
│  Purpose: Connect to Neon PostgreSQL                        │
│  Format:  postgresql://user:pass@host:port/dbname          │
│  Source:  https://neon.tech (get from dashboard)           │
│  Example: postgresql://alex:pw@ep-123.neon.tech/mydb       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  JWT_SECRET (REQUIRED IN PRODUCTION)                        │
│  Purpose: Sign JWT tokens                                   │
│  Format:  Random string, min 32 characters                  │
│  Example: aB3xYpQwZ9mN2kL5jH8fG7rT4vBxC6dE                │
│  Default: Uses hardcoded value (change before deploy!)     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VITE_API_URL (OPTIONAL)                                    │
│  Purpose: Frontend API endpoint                             │
│  Default: http://localhost:5000                             │
│  Prod:    https://yourdomain.com/api                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PORT (OPTIONAL)                                            │
│  Purpose: Backend server port                               │
│  Default: 5000                                              │
│  Note:    Must be available (not in use)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  NODE_ENV (OPTIONAL)                                        │
│  Purpose: Environment mode                                  │
│  Values:  development (default) or production              │
│  Effect:  Controls logging, CORS, error details           │
└─────────────────────────────────────────────────────────────┘
```

---

## Decision Points

```
Do you have a Neon account?
├─ YES → Go to step 3
└─ NO  → Create one at https://neon.tech (free tier OK)

Is DATABASE_URL set?
├─ YES → Continue
└─ NO  → Copy it from Neon dashboard

Did npm install complete?
├─ YES → Continue
└─ NO  → Check for errors, run again

Did npm run db:migrate complete?
├─ YES → Database is ready
└─ NO  → Check DATABASE_URL is correct

Is backend running (port 5000)?
├─ YES → Terminal 1 OK
└─ NO  → Run: npm run dev:server

Is frontend running (port 3000)?
├─ YES → Terminal 2 OK
└─ NO  → Run: npm run dev

Can you login?
├─ YES → Success! 🎉
└─ NO  → Check credentials & backend status
```

---

## Monitoring & Logs

### Check Database Activity
```sql
-- Recent login attempts
SELECT admin_id, action, status, ip_address, created_at
FROM admin_audit_log
ORDER BY created_at DESC
LIMIT 20;

-- Active sessions
SELECT a.email, s.created_at, s.expires_at, s.ip_address
FROM admin_sessions s
JOIN admin_users a ON s.admin_id = a.id
WHERE s.expires_at > NOW();

-- Failed logins (last hour)
SELECT COUNT(*) as failed_attempts, ip_address
FROM admin_audit_log
WHERE action = 'LOGIN_ATTEMPT'
  AND status = 'FAILED'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address;
```

### Check Backend Logs
```bash
# Running backend server shows:
✅ Admin API server running on http://localhost:5000
[timestamp] POST /api/admin/login
[timestamp] 200 OK
```

### Browser Console Logs
```javascript
// React component debug logs
console.log("[v0] Login attempted")
console.log("[v0] Session verified")
console.log("[v0] Redirect to dashboard")
```

---

## Troubleshooting Decision Tree

```
PROBLEM: Can't connect to database
├─ Check: DATABASE_URL in .env
├─ Check: Neon project is active
├─ Test: psql <DATABASE_URL>
└─ Fix: Update .env, restart backend

PROBLEM: Login fails
├─ Check: Email is "admin@thestrong.com"
├─ Check: Password is "NANU@ADMIN"
├─ Check: Backend is running
├─ Check: Database tables exist
└─ Fix: Run npm run db:migrate

PROBLEM: Frontend can't connect to backend
├─ Check: Backend is running (port 5000)
├─ Check: VITE_API_URL in .env
├─ Check: CORS is configured
└─ Fix: Kill port 5000, restart

PROBLEM: Unexpected error
├─ Check: console.log in backend server
├─ Check: Browser console for errors
├─ Check: Database connectivity
└─ Fix: Restart both servers
```

---

## Performance Considerations

```
Database Indexes:
├─ admin_users_email        → Fast email lookup
├─ admin_sessions_token     → Quick token validation
├─ admin_sessions_admin_id  → Session retrieval
└─ admin_sessions_expires_at → Cleanup queries

Connection Pooling:
├─ Pool size: 20 connections (configurable)
├─ Reuses connections: No new connection per request
└─ Reduces: Database overhead

JWT Benefits:
├─ No server state: Token carries all info
├─ Stateless: Scales horizontally
└─ Fast: Decode without database lookup
```

---

## Deployment Checklist Visual

```
✓ Pre-Deployment
  ├─ [ ] Change admin password
  ├─ [ ] Update JWT_SECRET
  └─ [ ] Review security settings

✓ Deployment
  ├─ [ ] Setup production database
  ├─ [ ] Configure HTTPS/SSL
  ├─ [ ] Setup environment variables
  └─ [ ] Enable CORS for domain

✓ Post-Deployment
  ├─ [ ] Test login flow
  ├─ [ ] Monitor audit logs
  ├─ [ ] Check error logs
  └─ [ ] Verify backups work
```

---

**Next Step**: Read QUICK_START_BACKEND.md (5 minutes) 🚀
