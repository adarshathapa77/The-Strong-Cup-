import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from code modal
  const isFromCodeModal = location.state?.fromCodeModal || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-tea-cream flex flex-col">
      {/* Navigation Bar (simple) */}
      <div className="border-b border-tea-brown/10 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-tea-brown hover:text-tea-gold transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-tea-brown mb-2">
              Admin <span className="text-tea-gold italic">Login</span>
            </h1>
            <p className="text-tea-brown/70 text-sm md:text-base">
              Access the admin dashboard to manage your business
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-tea-brown/10 p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-tea-brown mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  placeholder="admin@thestrong.com"
                  className="w-full px-4 py-2.5 border border-tea-brown/20 rounded-lg focus:outline-none focus:border-tea-gold focus:ring-2 focus:ring-tea-gold/20 bg-tea-cream/40 text-tea-brown placeholder-tea-brown/40 disabled:opacity-50"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-tea-brown mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-tea-brown/20 rounded-lg focus:outline-none focus:border-tea-gold focus:ring-2 focus:ring-tea-gold/20 bg-tea-cream/40 text-tea-brown placeholder-tea-brown/40 disabled:opacity-50"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 font-medium text-center bg-red-50 rounded-lg p-3"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-tea-brown text-tea-cream px-4 py-3 rounded-lg font-semibold hover:bg-tea-gold hover:text-tea-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-tea-cream border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            {/* Demo Credentials (for testing) */}
            <div className="mt-8 pt-6 border-t border-tea-brown/10">
              <p className="text-xs text-tea-brown/60 text-center font-medium mb-3">
                Default Admin Credentials
              </p>
              <div className="space-y-2 text-xs text-tea-brown/50">
                <p>Email: <span className="font-mono">admin@thestrong.com</span></p>
                <p>Password: <span className="font-mono">NANU@ADMIN</span></p>
              </div>
            </div>
          </motion.div>

          {/* Info Text */}
          <p className="text-center text-sm text-tea-brown/60 mt-6">
            Use the secret code from the menu to access this page
          </p>
        </motion.div>
      </div>
    </div>
  );
}
