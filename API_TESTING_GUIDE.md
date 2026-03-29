# API Testing Guide

## Base URL
```
http://localhost:5000
```

## 1. USER AUTHENTICATION FLOW

### 1.1 Register User
```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "+91-9876543210"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "+91-9876543210"
    }
  }
}
```

### 1.2 Login User
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "+91-9876543210"
    }
  }
}
```

### 1.3 Get User Profile
```bash
GET /api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "created_at": "2026-03-29T07:35:06.499Z"
  }
}
```

## 2. ORDER MANAGEMENT FLOW

### 2.1 Create Order (Guest)
```bash
POST /api/orders/create
Content-Type: application/json

{
  "items": [
    {
      "id": "product-1",
      "name": "Premium Coffee",
      "price": 500,
      "quantity": 2
    },
    {
      "id": "product-2",
      "name": "Coffee Beans",
      "price": 300,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "MH",
    "zip": "400001"
  },
  "email": "guest@example.com",
  "phone": "+91-9876543210",
  "guestName": "Guest User"
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "pending",
    "totalAmount": 1300,
    "createdAt": "2026-03-29T07:35:06.499Z"
  }
}
```

### 2.2 Create Order (Registered User)
```bash
POST /api/orders/create
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "items": [
    {
      "id": "product-1",
      "name": "Premium Coffee",
      "price": 500,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "MH",
    "zip": "400001"
  },
  "email": "john@example.com",
  "phone": "+91-9876543210"
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "pending",
    "totalAmount": 1000,
    "createdAt": "2026-03-29T07:35:06.499Z"
  }
}
```

### 2.3 Get User Orders
```bash
GET /api/orders/my-orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "customer_email": "john@example.com",
      "total_amount": 1000,
      "status": "pending",
      "created_at": "2026-03-29T07:35:06.499Z",
      "item_count": 2
    }
  ]
}
```

### 2.4 Get All Orders (Admin)
```bash
GET /api/orders/all-orders
Authorization: Bearer admin_token

Response:
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "+91-9876543210",
      "total_amount": 1000,
      "status": "pending",
      "created_at": "2026-03-29T07:35:06.499Z",
      "item_count": 2
    }
  ]
}
```

### 2.5 Update Order Status (Admin)
```bash
PUT /api/orders/550e8400-e29b-41d4-a716-446655440001/status
Authorization: Bearer admin_token
Content-Type: application/json

{
  "status": "confirmed"
}

Response:
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "confirmed",
    "updated_at": "2026-03-29T07:40:06.499Z"
  }
}
```

## 3. INVOICE MANAGEMENT FLOW

### 3.1 Generate Invoice
```bash
POST /api/invoices/generate/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer user_or_admin_token

Response:
{
  "success": true,
  "message": "Invoice generated",
  "data": {
    "invoiceId": "550e8400-e29b-41d4-a716-446655440002",
    "invoiceNumber": "INV-1711767306499-550e8400",
    "orderId": "550e8400-e29b-41d4-a716-446655440001",
    "totalAmount": 1000,
    "createdAt": "2026-03-29T07:35:06.499Z"
  }
}
```

### 3.2 Get Invoice PDF Data
```bash
GET /api/invoices/550e8400-e29b-41d4-a716-446655440002/pdf
Authorization: Bearer user_or_admin_token

Response:
{
  "success": true,
  "data": {
    "invoiceNumber": "INV-1711767306499-550e8400",
    "invoiceDate": "3/29/2026",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+91-9876543210",
    "shippingAddress": "123 Main St, Mumbai, MH 400001",
    "items": [
      {
        "product_name": "Premium Coffee",
        "price": 500,
        "quantity": 2,
        "total": 1000
      }
    ],
    "totalAmount": 1000,
    "status": "issued"
  }
}
```

## 4. ADMIN AUTHENTICATION FLOW

### 4.1 Admin Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@thestrong.com",
  "password": "NANU@ADMIN"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "email": "admin@thestrong.com",
      "name": "Admin",
      "role": "admin"
    }
  }
}
```

### 4.2 Verify Session
```bash
POST /api/admin/verify-session
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "success": true,
  "data": {
    "admin": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "email": "admin@thestrong.com",
      "name": "Admin",
      "role": "admin"
    }
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error during login",
  "error": "error details"
}
```

## Testing with Postman

1. Create environment variable: `base_url` = `http://localhost:5000`
2. Create variable: `user_token` (from login response)
3. Create variable: `admin_token` (from admin login)
4. Use `{{base_url}}` and `{{user_token}}` in requests

## Rate Limiting

- Admin login: 3 failed attempts → 30 second lockout
- No rate limiting on other endpoints (can be added)

## Token Expiry

- User tokens: 30 days
- Admin tokens: Session-based in database
- Tokens stored in localStorage on frontend
