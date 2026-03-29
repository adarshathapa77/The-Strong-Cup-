import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { LogOut, BarChart3, ShoppingCart, Users, TrendingUp, Download, Eye, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface OrderItem {
  id: string;
  product_name: string;
  product_id: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  created_at: string;
  item_count: number;
}

export default function AdminDashboard() {
  const { adminUser, logout, token } = useAdmin();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/all-orders`, {
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        setEditingStatus(null);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setSelectedOrderDetails(data.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
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
      alert('Invoice not found');
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

  const filteredOrders = orders.filter(order =>
    order.customer_email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;

  const stats = [
    { icon: ShoppingCart, label: 'Total Orders', value: orders.length.toString(), color: 'bg-blue-100 text-blue-600' },
    { icon: TrendingUp, label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'bg-green-100 text-green-600' },
    { icon: Users, label: 'Unique Customers', value: uniqueCustomers.toString(), color: 'bg-purple-100 text-purple-600' },
    { icon: BarChart3, label: 'Avg Order Value', value: orders.length > 0 ? `₹${(totalRevenue / orders.length).toFixed(0)}` : '₹0', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-tea-cream to-white">
      {/* Header */}
      <div className="border-b border-tea-brown/10 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-tea-brown">
              Admin <span className="text-tea-gold italic">Dashboard</span>
            </h1>
            <p className="text-tea-brown/60 text-sm mt-1">
              Welcome back, {adminUser?.name || adminUser?.email}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 bg-tea-brown text-tea-cream px-4 py-2.5 rounded-lg font-medium hover:bg-tea-gold hover:text-tea-brown transition-colors"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md border border-tea-brown/10 p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <p className="text-tea-brown/60 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-tea-brown">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Orders Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-tea-brown/10 p-8 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-tea-brown">Orders Management</h2>
            <input
              type="email"
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="px-4 py-2 border border-tea-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-gold"
            />
          </div>

          {loading ? (
            <p className="text-center text-tea-brown/70 py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-tea-brown/70 py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-tea-brown/10">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-tea-brown">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-tea-brown">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-tea-brown">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-tea-brown">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-tea-brown">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-tea-brown">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tea-brown/10">
                  {filteredOrders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-tea-cream/30">
                      <td className="px-4 py-3 text-tea-brown font-medium">{order.customer_name || 'Guest'}</td>
                      <td className="px-4 py-3 text-tea-brown/70">{order.customer_email}</td>
                      <td className="px-4 py-3 text-tea-brown font-semibold">₹{order.total_amount}</td>
                      <td className="px-4 py-3">
                        {editingStatus === order.id ? (
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="border border-tea-brown/20 rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span
                            onClick={() => setEditingStatus(order.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                              order.status === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'confirmed'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-tea-brown/70">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => fetchOrderDetails(order.id)}
                          className="text-tea-gold hover:text-tea-brown transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="text-tea-gold hover:text-tea-brown transition-colors"
                          title="Download Invoice"
                        >
                          <Download size={18} />
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800"
        >
          <p className="font-medium mb-1">🔒 Security Notice</p>
          <p>This admin panel is protected. Your session will remain active for the current browser session. Log out before leaving your device.</p>
        </motion.div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-tea-brown">Order Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-tea-brown/60 hover:text-tea-brown text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-tea-brown/60 text-sm">Order ID</p>
                  <p className="text-lg font-semibold text-tea-brown">#{selectedOrderDetails.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-tea-brown/60 text-sm">Status</p>
                  <p className="text-lg font-semibold text-tea-brown">{selectedOrderDetails.status}</p>
                </div>
                <div>
                  <p className="text-tea-brown/60 text-sm">Customer</p>
                  <p className="text-lg font-semibold text-tea-brown">{selectedOrderDetails.customer_name || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-tea-brown/60 text-sm">Total Amount</p>
                  <p className="text-lg font-semibold text-tea-brown">₹{selectedOrderDetails.total_amount}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-tea-brown mb-3">Items</h4>
                <div className="bg-tea-cream/30 rounded-lg p-4">
                  {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-tea-brown/20">
                          <th className="text-left pb-2 text-tea-brown font-semibold">Product</th>
                          <th className="text-center pb-2 text-tea-brown font-semibold">Qty</th>
                          <th className="text-right pb-2 text-tea-brown font-semibold">Price</th>
                          <th className="text-right pb-2 text-tea-brown font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrderDetails.items.map((item: OrderItem, idx: number) => (
                          <tr key={idx} className="border-b border-tea-brown/10">
                            <td className="py-2 text-tea-brown">{item.product_name}</td>
                            <td className="py-2 text-center text-tea-brown">{item.quantity}</td>
                            <td className="py-2 text-right text-tea-brown">₹{item.price}</td>
                            <td className="py-2 text-right font-semibold text-tea-brown">₹{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-tea-brown/70">No items found</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleDownloadInvoice(selectedOrderDetails.id);
                    setShowDetails(false);
                  }}
                  className="flex-1 bg-tea-gold text-tea-brown px-4 py-2 rounded font-semibold hover:bg-tea-gold/90 transition-colors"
                >
                  Download Invoice
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 bg-tea-brown/20 text-tea-brown px-4 py-2 rounded font-semibold hover:bg-tea-brown/30 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
