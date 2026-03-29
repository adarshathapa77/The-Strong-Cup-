import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { LogOut, BarChart3, ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { adminEmail, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    { icon: ShoppingCart, label: 'Total Orders', value: '1,234', color: 'bg-blue-100 text-blue-600' },
    { icon: TrendingUp, label: 'Revenue', value: '$45,678', color: 'bg-green-100 text-green-600' },
    { icon: Users, label: 'Customers', value: '892', color: 'bg-purple-100 text-purple-600' },
    { icon: BarChart3, label: 'Growth', value: '+12.5%', color: 'bg-orange-100 text-orange-600' },
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
            <p className="text-tea-brown/60 text-sm mt-1">Welcome back, {adminEmail}</p>
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

        {/* Admin Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-tea-brown/10 p-8"
        >
          <h2 className="text-2xl font-serif font-bold text-tea-brown mb-6">Quick Access</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Manage Products', desc: 'Add, edit, or remove products' },
              { title: 'View Orders', desc: 'See all customer orders' },
              { title: 'Manage Inventory', desc: 'Track stock levels' },
              { title: 'Customer Management', desc: 'View and manage customers' },
              { title: 'Analytics', desc: 'View detailed analytics' },
              { title: 'Settings', desc: 'Configure store settings' },
            ].map((feature, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-left p-4 rounded-lg bg-tea-cream/30 hover:bg-tea-gold/20 border border-tea-brown/10 transition-all group"
              >
                <p className="font-semibold text-tea-brown group-hover:text-tea-gold transition-colors">
                  {feature.title}
                </p>
                <p className="text-sm text-tea-brown/60 mt-1">{feature.desc}</p>
              </motion.button>
            ))}
          </div>
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
    </div>
  );
}
