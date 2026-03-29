# Complete Backend Integration Guide

## System Architecture

Your application now has a fully integrated backend system with:
- **Neon PostgreSQL database** with 7 production tables
- **Node.js Express API** with JWT authentication
- **User registration, login, and profile management**
- **Complete order management system (guest + registered users)**
- **Invoice generation and management**
- **Admin dashboard with order tracking and status updates**

## Database Schema

### Tables Created:
1. **admin_users** - Admin accounts
2. **users** - Customer accounts
3. **orders** - Order headers
4. **order_items** - Order line items
5. **invoices** - Invoice records
6. **admin_sessions** - Active admin sessions
7. **admin_audit_log** - Admin action logs

## API Endpoints

### User Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (requires token)
- `PUT /api/users/profile` - Update user profile (requires token)

### Order Management
- `POST /api/orders/create` - Create order (guest or user)
- `GET /api/orders/my-orders` - Get user's orders (requires token)
- `GET /api/orders/all-orders` - Get all orders (admin only)
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId/status` - Update order status (admin only)
- `PUT /api/orders/:orderId/items` - Update order items (admin only)

### Invoice Management
- `POST /api/invoices/generate/:orderId` - Generate invoice for order
- `GET /api/invoices/:invoiceId` - Get invoice details
- `GET /api/invoices/order/:orderId` - Get invoices for order
- `GET /api/invoices/:invoiceId/pdf` - Get invoice PDF data
- `PUT /api/invoices/:invoiceId/status` - Update invoice status (admin)

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/verify-session` - Verify admin session
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile/:id` - Get admin profile

## Environment Variables

The following environment variables are required:

```env
# Database
DATABASE_URL=your-neon-connection-string

# JWT
JWT_SECRET=your-secret-key-here

# API
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

## Admin Credentials

**Email:** admin@thestrong.com  
**Password:** NANU@ADMIN  
**Secret Code:** NANU (for 5-tap logo trigger)

## Frontend Routes

### User Routes
- `/user/register` - User registration page
- `/user/login` - User login page
- `/user/dashboard` - User dashboard (protected)
- `/user/orders` - View user orders (protected)

### Admin Routes
- `/admin/login` - Admin login page (with secret code)
- `/admin/dashboard` - Admin dashboard (protected)

## How to Use

### For Users:
1. Register at `/user/register` or checkout as guest
2. Login at `/user/login`
3. View dashboard at `/user/dashboard`
4. View orders at `/user/orders`
5. Download invoices for each order

### For Admins:
1. On homepage, tap logo 5 times quickly
2. Enter secret code "NANU"
3. Login with admin@thestrong.com / NANU@ADMIN
4. View all orders and customer data
5. Modify order status
6. Generate and manage invoices
7. Download invoices

## Testing Flows

### Guest Checkout Flow:
1. Add items to cart
2. Go to checkout
3. Fill email, name, phone
4. Complete payment
5. Order created without registration
6. User can check order status via email

### Registered User Flow:
1. Register account
2. Login
3. Add items to cart
4. Checkout (email pre-filled)
5. View all orders in dashboard
6. Download invoices

### Admin Flow:
1. Tap logo 5 times → "NANU" → Login
2. See all orders in dashboard
3. Click status to change order state
4. Click download icon to view invoice
5. Generate invoice if needed
6. Logout when done

## Security Features

✅ Password hashing with bcryptjs  
✅ JWT token-based authentication  
✅ Rate limiting on admin login (3 attempts, 30-sec lockout)  
✅ Protected routes with token verification  
✅ Admin-only endpoints with role checking  
✅ Audit logging for admin actions  
✅ Session management with database tracking  
✅ Secret code requirement for admin access  

## Database Connection

The system uses Neon PostgreSQL with the connection string from your environment variables. Make sure:
1. Neon database is created and running
2. DATABASE_URL is set in environment
3. Migration scripts have been executed

## Common Issues & Solutions

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Verify Neon database is accessible
- Check network/firewall settings

### "Invalid token"
- Token expired - need to re-login
- Check Authorization header format: "Bearer {token}"
- Verify JWT_SECRET matches across app

### "Order not found"
- Check orderId is correct UUID format
- Verify order belongs to user/admin
- Check if order was deleted

## Next Steps

1. Test all user flows in the app
2. Add payment gateway integration
3. Setup email notifications
4. Implement inventory management
5. Add analytics dashboard
6. Setup production environment

## Support

For issues or questions:
1. Check database connection first
2. Review server logs for errors
3. Verify environment variables
4. Test API endpoints with Postman/curl
