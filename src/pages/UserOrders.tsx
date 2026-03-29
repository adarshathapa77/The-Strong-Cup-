import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Download, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Order {
  id: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  item_count: number;
}

interface OrderDetails {
  items: Array<{ product_name: string; price: number; quantity: number; total: number }>;
}

export default function UserOrders() {
  const navigate = useNavigate();
  const { user, token, isLoading } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user || !token) {
      navigate('/user/login');
      return;
    }

    fetchOrders();
  }, [user, token, isLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrderDetails(data.data);
        setSelectedOrderId(orderId);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const generatePDF = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/invoices/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const invoiceId = data.data[0].id;
        downloadInvoicePDF(invoiceId);
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      alert('Invoice not found. Please try again.');
    }
  };

  const downloadInvoicePDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        generateAndDownloadPDF(data.data);
      }
    } catch (error) {
      console.error('Failed to get PDF data:', error);
    }
  };

  const generateAndDownloadPDF = (invoiceData: any) => {
    // Create HTML for PDF
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #6B4423; text-align: center; }
            .invoice-number { text-align: center; color: #999; margin-bottom: 20px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #6B4423; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #6B4423; color: white; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>THE STRONG CUP</h1>
          <div class="invoice-number">Invoice #${invoiceData.invoiceNumber}</div>
          
          <div class="section">
            <div class="label">Invoice Date:</div>
            <div>${invoiceData.invoiceDate}</div>
          </div>

          <div class="section">
            <div class="label">Customer Details:</div>
            <div>Name: ${invoiceData.customerName || 'Guest'}</div>
            <div>Email: ${invoiceData.customerEmail}</div>
            <div>Phone: ${invoiceData.customerPhone || 'N/A'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map((item: any) => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>₹${item.price}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">Total Amount: ₹${invoiceData.totalAmount}</div>
          <div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceData.invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-tea-cream p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-tea-brown">My Orders</h1>
          <button
            onClick={() => navigate('/user/dashboard')}
            className="bg-tea-brown text-tea-cream px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-tea-brown/70 mb-4">No orders yet</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-tea-gold text-tea-brown px-6 py-2 rounded font-semibold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-tea-brown text-tea-cream">
                <tr>
                  <th className="px-6 py-3 text-left">Order ID</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-tea-cream/30">
                    <td className="px-6 py-3 font-semibold text-tea-brown">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-3">{order.item_count} items</td>
                    <td className="px-6 py-3 font-semibold text-tea-brown">₹{order.total_amount}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-tea-brown/70">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        className="text-tea-gold hover:text-tea-brown transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => generatePDF(order.id)}
                        className="text-tea-gold hover:text-tea-brown transition-colors"
                        title="Download Invoice"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
