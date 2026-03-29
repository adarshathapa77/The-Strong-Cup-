import express from 'express';
import { query } from '../db.js';
import { verifyUserToken } from './userAuth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware: Verify Admin Token
const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Optional token verification (guest checkout allowed)
const optionalVerifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.userId) {
        req.userId = decoded.userId;
      }
    }
  } catch (error) {
    // Token invalid or missing, continue as guest
  }
  next();
};

// Route: Create Order (User or Guest)
router.post('/create', optionalVerifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, email, phone, guestName } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items required' });
    }

    const userId = req.userId || null;
    const customerEmail = email || req.userEmail || null;
    const customerPhone = phone || null;
    const customerName = guestName || null;

    if (!customerEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Calculate total
    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Start transaction by creating order
    const orderResult = await query(
      `INSERT INTO orders (
        user_id, customer_name, customer_email, customer_phone, 
        shipping_address, total_amount, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP)
      RETURNING id, user_id, customer_email, total_amount, status, created_at`,
      [userId, customerName, customerEmail, customerPhone, JSON.stringify(shippingAddress), totalAmount]
    );

    const order = orderResult.rows[0];
    const orderId = order.id;

    // Insert order items
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_name, product_id, price, quantity, total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.name, item.id, item.price, item.quantity, item.price * item.quantity]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.id,
        status: order.status,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Order creation failed', error: error.message });
  }
});

// Route: Get User Orders
router.get('/my-orders', verifyUserToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT o.id, o.customer_email, o.total_amount, o.status, o.created_at,
              COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Route: Get All Orders (Admin Only)
router.get('/all-orders', verifyAdminToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT o.id, o.user_id, o.customer_name, o.customer_email, o.customer_phone,
              o.total_amount, o.status, o.created_at,
              COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Route: Get Order Details
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderResult = await query(
      'SELECT id, user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, status, created_at FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const itemsResult = await query(
      'SELECT id, product_id, product_name, price, quantity, total FROM order_items WHERE order_id = $1',
      [orderId]
    );

    const order = orderResult.rows[0];
    res.json({
      success: true,
      data: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// Route: Update Order Status (Admin Only)
router.put('/:orderId/status', verifyAdminToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status, updated_at',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// Route: Update Order Items (Admin Only)
router.put('/:orderId/items', verifyAdminToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items required' });
    }

    // Delete old items
    await query('DELETE FROM order_items WHERE order_id = $1', [orderId]);

    // Calculate new total
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
      await query(
        `INSERT INTO order_items (order_id, product_name, product_id, price, quantity, total)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.name, item.id, item.price, item.quantity, item.price * item.quantity]
      );
    }

    // Update order total
    await query(
      'UPDATE orders SET total_amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [totalAmount, orderId]
    );

    res.json({
      success: true,
      message: 'Order items updated',
      data: { orderId, totalAmount, itemCount: items.length },
    });
  } catch (error) {
    console.error('Update items error:', error);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

export default router;
