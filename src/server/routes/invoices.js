import express from 'express';
import { query } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware: Verify User or Admin Token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.adminId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Route: Generate Invoice for Order
router.post('/generate/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details
    const orderResult = await query(
      `SELECT id, user_id, customer_name, customer_email, customer_phone, 
              shipping_address, total_amount, status, created_at
       FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check authorization (user can only access their own orders, admin can access all)
    if (req.userId && order.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get order items
    const itemsResult = await query(
      'SELECT product_name, price, quantity, total FROM order_items WHERE order_id = $1',
      [orderId]
    );

    // Check if invoice already exists
    const existingInvoice = await query(
      'SELECT id FROM invoices WHERE order_id = $1',
      [orderId]
    );

    if (existingInvoice.rows.length > 0) {
      const invoiceId = existingInvoice.rows[0].id;
      return res.json({
        success: true,
        message: 'Invoice already exists',
        data: { invoiceId, orderId },
      });
    }

    // Create invoice
    const invoiceResult = await query(
      `INSERT INTO invoices (order_id, user_id, invoice_number, total_amount, status, created_at)
       VALUES ($1, $2, $3, $4, 'issued', CURRENT_TIMESTAMP)
       RETURNING id, invoice_number, created_at`,
      [orderId, order.user_id, `INV-${Date.now()}-${orderId}`, order.total_amount]
    );

    const invoice = invoiceResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Invoice generated',
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        orderId: orderId,
        totalAmount: order.total_amount,
        createdAt: invoice.created_at,
      },
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ success: false, message: 'Invoice generation failed' });
  }
});

// Route: Get Invoice Details
router.get('/:invoiceId', verifyToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoiceResult = await query(
      `SELECT i.id, i.order_id, i.invoice_number, i.total_amount, i.status, i.created_at,
              o.customer_name, o.customer_email, o.customer_phone, o.shipping_address, o.total_amount as order_total
       FROM invoices i
       JOIN orders o ON i.order_id = o.id
       WHERE i.id = $1`,
      [invoiceId]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Get invoice items
    const itemsResult = await query(
      'SELECT product_name, price, quantity, total FROM order_items WHERE order_id = $1',
      [invoice.order_id]
    );

    res.json({
      success: true,
      data: {
        ...invoice,
        items: itemsResult.rows,
      },
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
  }
});

// Route: Get Invoices by Order
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await query(
      'SELECT id, invoice_number, total_amount, status, created_at FROM invoices WHERE order_id = $1',
      [orderId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

// Route: Download Invoice as PDF (Backend prepares data, frontend generates PDF)
router.get('/:invoiceId/pdf', verifyToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Get invoice with details
    const invoiceResult = await query(
      `SELECT i.id, i.order_id, i.invoice_number, i.total_amount, i.status, i.created_at,
              o.customer_name, o.customer_email, o.customer_phone, o.shipping_address
       FROM invoices i
       JOIN orders o ON i.order_id = o.id
       WHERE i.id = $1`,
      [invoiceId]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Get items
    const itemsResult = await query(
      'SELECT product_name, price, quantity, total FROM order_items WHERE order_id = $1',
      [invoice.order_id]
    );

    // Prepare PDF data
    const pdfData = {
      invoiceNumber: invoice.invoice_number,
      invoiceDate: new Date(invoice.created_at).toLocaleDateString(),
      customerName: invoice.customer_name,
      customerEmail: invoice.customer_email,
      customerPhone: invoice.customer_phone,
      shippingAddress: invoice.shipping_address,
      items: itemsResult.rows,
      totalAmount: invoice.total_amount,
      status: invoice.status,
    };

    res.json({
      success: true,
      data: pdfData,
    });
  } catch (error) {
    console.error('Get PDF data error:', error);
    res.status(500).json({ success: false, message: 'Failed to get PDF data' });
  }
});

// Route: Update Invoice Status (Admin Only)
router.put('/:invoiceId/status', verifyToken, async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status } = req.body;

    if (req.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const validStatuses = ['issued', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await query(
      'UPDATE invoices SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status',
      [status, invoiceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({
      success: true,
      message: 'Invoice status updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

export default router;
