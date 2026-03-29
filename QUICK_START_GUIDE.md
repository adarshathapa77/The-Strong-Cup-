# Quick Start Guide - The Strong Cup Full System

## 5-Minute Setup

### Step 1: Environment Setup
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Neon database URL
# Get it from: https://console.neon.tech
```

### Step 2: Database Setup
```bash
# Run migration to create tables
npm run db:migrate

# Update admin password (creates admin user)
npm run db:hash
```

### Step 3: Start Servers
```bash
# Terminal 1: Start backend API
npm run dev:server

# Terminal 2: Start frontend (in new terminal)
npm run dev
```

### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## Testing User Features

### Register New User
1. Go to http://localhost:3000/user/register
2. Fill in: Name, Email, Phone (optional), Password
3. Click "Create Account"
4. Redirected to Dashboard

### Login as User
1. Go to http://localhost:3000/user/login
2. Enter registered email and password
3. Click "Login"
4. Access user dashboard

### View Orders
1. Go to http://localhost:3000/user/orders
2. See all your orders
3. Click eye icon to see details
4. Click download icon to get invoice

### Download Invoice
1. In user orders page, click download icon
2. HTML file downloads automatically
3. Can open in browser and print as PDF

---

## Testing Admin Features

### Access Admin Panel
**Option 1: Direct Login**
1. Go to http://localhost:3000/admin/login
2. Email: `admin@thestrong.com`
3. Password: `NANU@ADMIN`

**Option 2: Secret Code in Menu**
1. From home page, tap logo 5 times quickly
2. Modal appears: "Enter Admin Code"
3. Code: `NANU`
4. Redirected to admin login page

### Manage Orders
1. Dashboard shows statistics
2. Scroll down to see orders table
3. Search by customer email in search box
4. Click order row to change status
5. Select new status from dropdown

### View Order Details
1. Click eye icon in Actions column
2. Modal opens with order details
3. See all items in order
4. Click "Download Invoice" to get file
5. Close modal

### Download Invoice
1. Click download icon in Actions column
2. OR click "Download Invoice" in details modal
3. HTML file downloads with invoice data
4. Open in browser and print/save as PDF

---

## Default Credentials

### Admin Account
- Email: `admin@thestrong.com`
- Password: `NANU@ADMIN`
- Secret Code: `NANU`

### Test User (Create Your Own)
- Register at: http://localhost:3000/user/register
- Use any email (doesn't need to be real)
- Any password (min recommended 6 chars)

---

## Common Tasks

### Create Test Order
1. Go to http://localhost:3000/shop
2. Add products to cart
3. Go to cart
4. Click Checkout
5. Choose guest or login
6. Fill shipping info
7. Complete checkout
8. Order appears in admin dashboard

### Update Order Status
1. Admin Dashboard
2. Find order in table
3. Click status badge
4. Select new status from dropdown
5. Status updates immediately

### Check Order Details
1. Admin Dashboard
2. Click eye icon for order
3. Modal shows all details
4. See items and total amount
5. Download invoice from modal

### Reset Admin Password
1. Run: `npm run db:hash`
2. Enter new password
3. Update admin account in database
4. Login with new credentials

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED
→ Check DATABASE_URL in .env
→ Verify Neon connection string is correct
→ Check internet connection
```

### API Not Responding
```
Error: Failed to fetch
→ Check backend is running: npm run dev:server
→ Check VITE_API_URL in .env matches backend port
→ Check CORS is enabled (should be)
```

### Login Failing
```
Error: Invalid credentials
→ Check email/password are correct
→ For admin: admin@thestrong.com / NANU@ADMIN
→ For user: check registration was successful
```

### Invoice Not Downloading
```
Error: Invoice not found
→ Make sure order exists
→ Check backend is running
→ Try creating new order first
→ Check browser console for errors
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
→ Change PORT in .env
→ Or kill process: lsof -i :5000 | kill -9
```

---

## File Structure

```
src/
├── pages/
│   ├── UserRegister.tsx      # User registration
│   ├── UserLogin.tsx          # User login
│   ├── UserDashboard.tsx      # User dashboard
│   ├── UserOrders.tsx         # User orders & invoices
│   ├── AdminLogin.tsx         # Admin login
│   └── AdminDashboard.tsx     # Admin panel
├── context/
│   ├── UserContext.tsx        # User state management
│   ├── AdminContext.tsx       # Admin state management
│   └── CartContext.tsx        # Cart state
├── server/
│   ├── server.js              # Express API
│   ├── db.js                  # Database connection
│   ├── auth.js                # Auth functions
│   └── routes/
│       ├── userAuth.js        # User API routes
│       ├── orders.js          # Orders API routes
│       └── invoices.js        # Invoices API routes
└── components/
    ├── Navbar.tsx             # Navigation
    ├── AdminCodeModal.tsx     # Secret code modal
    └── ProtectedRoute.tsx     # Route protection

scripts/
├── 01-create-tables.sql       # Database schema
└── 02-update-admin-password.js # Admin setup

.env                           # Environment variables
.env.example                   # Example .env
package.json                   # Dependencies & scripts
```

---

## API Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9999999999"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "1", "name": "Coffee", "price": 150, "quantity": 2}
    ],
    "email": "customer@example.com",
    "phone": "9999999999",
    "guestName": "Guest User",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "MH",
      "zip": "400001"
    }
  }'
```

### Get User Orders
```bash
curl -X GET http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Orders (Admin)
```bash
curl -X GET http://localhost:5000/api/orders/all-orders \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Update Order Status
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"status": "shipped"}'
```

---

## Next Steps

1. Create test user account
2. Place test order
3. View order in admin dashboard
4. Download invoice
5. Modify order status
6. Verify all features work

For detailed documentation, see: **FULL_SYSTEM_DOCUMENTATION.md**

---

Happy Testing!
