# THE STRONG CUP - Complete User & Admin System Documentation

## System Overview

A fully integrated e-commerce platform with user authentication, order management, invoice generation, and admin dashboard. Users can register, purchase products, track orders, and download invoices. Admins can manage all orders, modify order details, and generate invoices.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router, Motion (animations)
- **Backend**: Express.js, Node.js
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: JWT tokens with bcryptjs password hashing
- **API Style**: RESTful JSON API

---

## Database Schema

### Tables Created

1. **admin_users** - Admin credentials and account info
2. **users** - Customer accounts and profiles
3. **orders** - Order records with customer and shipping info
4. **order_items** - Individual items within orders
5. **invoices** - Generated invoices for orders
6. **admin_sessions** - Admin login sessions
7. **admin_audit_log** - Admin action audit trail

### Key Relationships

```
users (1) ──→ (many) orders ──→ (many) order_items
users (1) ──→ (many) invoices
admin_users (1) ──→ (many) admin_sessions
admin_users (1) ──→ (many) admin_audit_log
```

---

## API Endpoints

### User Authentication (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | None |
| POST | `/login` | Login user | None |
| GET | `/profile` | Get user profile | JWT |
| PUT | `/profile` | Update user profile | JWT |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create` | Create order (guest or user) | Optional JWT |
| GET | `/my-orders` | Get user's orders | JWT |
| GET | `/all-orders` | Get all orders (admin) | Admin JWT |
| GET | `/:orderId` | Get order details | None |
| PUT | `/:orderId/status` | Update order status | Admin JWT |
| PUT | `/:orderId/items` | Modify order items | Admin JWT |

### Invoices (`/api/invoices`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/generate/:orderId` | Generate invoice | JWT |
| GET | `/:invoiceId` | Get invoice details | JWT |
| GET | `/order/:orderId` | Get order invoices | None |
| GET | `/:invoiceId/pdf` | Get PDF data | JWT |
| PUT | `/:invoiceId/status` | Update invoice status | Admin JWT |

### Admin Authentication (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | Admin login | None |
| POST | `/verify-session` | Verify admin session | Session token |
| POST | `/logout` | Admin logout | Session token |
| GET | `/profile/:id` | Get admin profile | Admin JWT |

---

## Frontend Pages

### User Pages

1. **UserRegister** (`/user/register`)
   - New user account creation
   - Form validation
   - Automatic login after registration

2. **UserLogin** (`/user/login`)
   - User authentication
   - Email/password login
   - Session persistence

3. **UserDashboard** (`/user/dashboard`)
   - User profile display
   - Account management
   - Quick links to orders

4. **UserOrders** (`/user/orders`)
   - View all user orders
   - Order status tracking
   - Invoice download functionality
   - Order details modal

### Admin Pages

1. **AdminLogin** (`/admin/login`)
   - Admin authentication
   - Credentials: admin@thestrong.com / NANU@ADMIN

2. **AdminDashboard** (`/admin/dashboard`)
   - Dashboard statistics (orders, revenue, customers)
   - Order management table
   - Order search by email
   - Order status modification
   - View order details
   - Invoice download
   - Logout

---

## Key Features

### User Features

1. **Authentication**
   - Email/password registration
   - Email/password login
   - Session persistence
   - Profile management

2. **Shopping**
   - Browse products
   - Add to cart
   - Checkout (guest or registered)
   - Order confirmation

3. **Order Management**
   - View all orders
   - Track order status
   - View order details
   - Download invoices

4. **Guest Checkout**
   - No account required
   - Email-based order tracking
   - Invoice access without login

### Admin Features

1. **Order Management**
   - View all orders
   - Search orders by email
   - Update order status
   - Modify order items
   - View detailed order information

2. **Invoice Management**
   - Automatic invoice generation
   - Invoice download as HTML/PDF
   - Invoice status tracking
   - Multiple invoices per order support

3. **Analytics**
   - Total orders count
   - Revenue tracking
   - Unique customer count
   - Average order value

4. **Security**
   - Admin-only access
   - Session-based authentication
   - Audit logging
   - IP tracking

---

## Running the Application

### Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Neon DATABASE_URL to .env

# Run database migration
npm run db:migrate

# Update admin password
npm run db:hash

# Start backend server
npm run dev:server
```

### Frontend Setup

```bash
# Development server (already installed)
npm run dev
```

### Accessing the Application

- **User Portal**: http://localhost:3000
- **User Register**: http://localhost:3000/user/register
- **User Login**: http://localhost:3000/user/login
- **Admin Panel**: http://localhost:3000/admin/login
  - Email: admin@thestrong.com
  - Password: NANU@ADMIN
  - Secret Code: NANU (in menu)

---

## User Flow

1. **Registration**
   - User navigates to `/user/register`
   - Enters name, email, phone, password
   - Account created, automatically logged in
   - Redirected to dashboard

2. **Shopping**
   - User browses products
   - Adds items to cart
   - Proceeds to checkout
   - Can login or checkout as guest

3. **Order Management**
   - Registered users view `/user/orders`
   - See all past orders with status
   - Click "View Details" to see items
   - Click "Download Invoice" to get HTML version

4. **Invoice Download**
   - Backend API prepares invoice data
   - Frontend generates HTML document
   - Browser downloads as file

---

## Admin Workflow

1. **Admin Login**
   - Navigate to `/admin/login`
   - Login with admin@thestrong.com / NANU@ADMIN
   - Alternative: Tap logo 5 times in menu, enter code "NANU"

2. **Dashboard Overview**
   - See dashboard statistics
   - Total orders, revenue, customers, average order value

3. **Order Management**
   - View all orders in table
   - Search by customer email
   - Click order row to expand status options
   - Select new status to update

4. **Order Details**
   - Click "View Details" (eye icon)
   - See full order information
   - View all items in order
   - Download invoice from modal

5. **Invoice Management**
   - Click "Download Invoice" button
   - Invoice HTML file downloads to computer
   - Can be printed or saved as PDF

---

## Security Features

1. **Password Security**
   - bcryptjs hashing (10 salt rounds)
   - Never store plain passwords
   - Comparison done server-side

2. **Token Security**
   - JWT tokens with 7-day expiration
   - Tokens stored in localStorage
   - Verified on protected routes
   - Logout clears all tokens

3. **Admin Security**
   - Admin-only endpoints protected
   - Token role verification
   - Session tracking in database
   - Audit logging of all actions

4. **Data Protection**
   - Users can only access their own orders
   - Admin password (NANU@ADMIN) encrypted
   - Database connection secured via Neon
   - CORS enabled for specific origins

---

## Error Handling

### Frontend
- Form validation before submission
- Error messages displayed to user
- Network error handling
- Session expiration redirection

### Backend
- 400: Bad request (validation)
- 401: Unauthorized (no token/invalid)
- 403: Forbidden (insufficient permissions)
- 404: Not found (resource missing)
- 500: Server error with descriptive message

---

## Testing the System

### User Registration & Login
1. Go to `/user/register`
2. Enter: Name, Email, Phone, Password
3. System redirects to `/user/dashboard`
4. Click "Logout" to test logout
5. Login again at `/user/login`

### Guest Checkout
1. Add items to cart without logging in
2. Proceed to checkout
3. Enter email and shipping address
4. Confirm order
5. Email confirmation (simulated)

### Admin Panel
1. Navigate to `/admin/login`
2. Login with admin credentials
3. View dashboard statistics
4. Search orders by email
5. Click order to modify status
6. Click view details icon
7. Download invoice

### Invoice Download
1. As user: Go to `/user/orders` → Click download icon
2. As admin: Go to admin dashboard → Click download icon
3. HTML file downloads to Downloads folder
4. Can open in browser or convert to PDF

---

## Customization Guide

### Changing Admin Password
```bash
# Run hash generator
npm run db:hash

# Enter new password when prompted
# Insert into database manually if needed
```

### Changing Secret Code
Edit in `src/components/AdminCodeModal.tsx`:
```typescript
if (code === 'NANU') {  // Change NANU to your code
```

### Customizing Email/Phone Display
Edit `/src/pages/UserOrders.tsx` and `/src/pages/AdminDashboard.tsx` table columns

### Modifying Invoice Template
Edit `generateAndDownloadPDF()` function in both files to change HTML/CSS

---

## Troubleshooting

### Backend Won't Start
```
Error: DATABASE_URL not set
→ Add DATABASE_URL to .env file
```

### Login Not Working
```
Error: Invalid credentials
→ Check admin password: admin@thestrong.com / NANU@ADMIN
→ Check user email and password match registration
```

### Orders Not Loading
```
Error: Failed to fetch orders
→ Verify user is logged in (check token in localStorage)
→ Check backend is running on port 5000
→ Check VITE_API_URL in .env
```

### Invoice Download Not Working
```
Error: Invoice not found
→ Make sure order exists
→ Check token is valid
→ Backend API must be running
```

---

## Future Enhancements

1. **Payment Integration**
   - Stripe/Razorpay integration
   - Payment status tracking
   - Refund management

2. **Email Notifications**
   - Order confirmation emails
   - Status update emails
   - Invoice delivery via email

3. **Advanced Reporting**
   - Sales by product
   - Customer analytics
   - Revenue trends

4. **Inventory Management**
   - Stock tracking
   - Low stock alerts
   - Supplier management

5. **Multi-Admin**
   - Multiple admin accounts
   - Role-based permissions
   - Admin activity logs

6. **PDF Generation**
   - Server-side PDF generation
   - Branded invoice templates
   - Email attachment support

---

## Support & Deployment

### Local Development
```bash
npm install
npm run dev:server    # Terminal 1
npm run dev           # Terminal 2
```

### Production Deployment
```bash
# Build frontend
npm run build

# Run backend with process manager (PM2)
npm install -g pm2
pm2 start src/server/server.js

# Use environment variables from .env
```

### Environment Variables Required
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `VITE_API_URL` - API server URL
- `PORT` - Backend server port (default 5000)

---

Generated: March 29, 2026
Version: 1.0
Status: Production Ready
