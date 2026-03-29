# Quick Start - Backend Setup (5 Minutes)

## TL;DR Setup

### 1. Get Neon Connection String
- Go to https://neon.tech → Sign up → Create project
- Copy connection string from dashboard

### 2. Create .env File
```bash
cp .env.example .env
```

Edit `.env` and paste:
```
DATABASE_URL=postgresql://user:password@ep-xxxxx.neon.tech/dbname
JWT_SECRET=my-secret-key-12345
PORT=5000
VITE_API_URL=http://localhost:5000
NODE_ENV=development
```

### 3. Install & Setup Database
```bash
npm install
npm run db:migrate
```

### 4. Start Backend (Terminal 1)
```bash
npm run dev:server
```

You'll see: `✅ Admin API server running on http://localhost:5000`

### 5. Start Frontend (Terminal 2)
```bash
npm run dev
```

### 6. Test Admin Login
1. Open http://localhost:3000
2. Tap logo 5 times (top-left)
3. Enter code: `NANU`
4. Login with:
   - Email: `admin@thestrong.com`
   - Password: `NANU@ADMIN`

---

## That's It!

Backend is now running with Neon PostgreSQL integration.

### Common Commands
```bash
npm run db:migrate    # Setup database
npm run db:hash       # Generate password hash
npm run dev:server    # Start backend server
npm run dev           # Start frontend
```

### Need Help?
- Full setup guide: `ADMIN_BACKEND_SETUP.md`
- Issue troubleshooting: See "Troubleshooting" section in setup guide
- API endpoints: See "API Endpoints" section in setup guide

---

**Status**: ✅ Backend Integration Complete  
**Database**: ✅ Neon PostgreSQL  
**Authentication**: ✅ JWT Tokens + Secure Passwords  
**Sessions**: ✅ Database-backed sessions  
