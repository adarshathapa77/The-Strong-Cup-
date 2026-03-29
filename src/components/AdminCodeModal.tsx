import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';

interface AdminCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCodeModal({ isOpen, onClose }: AdminCodeModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const { validateAdminCode } = useAdmin();
  const navigate = useNavigate();

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle lockout after 3 failed attempts
  useEffect(() => {
    if (failedAttempts >= 3) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
        setCode('');
      }, 30000); // 30 second lockout
      return () => clearTimeout(timer);
    }
  }, [failedAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Too many failed attempts. Please try again in 30 seconds.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      if (validateAdminCode(code)) {
        setIsLoading(false);
        setCode('');
        setFailedAttempts(0);
        onClose();
        // Redirect to admin login
        navigate('/admin/login');
      } else {
        setIsLoading(false);
        setFailedAttempts((prev) => prev + 1);
        setError('Invalid Code');
        setCode('');

        // Auto-close modal after 3 failed attempts
        if (failedAttempts + 1 >= 3) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    }, 600);
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setFailedAttempts(0);
    setIsLocked(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-tea-cream rounded-2xl shadow-2xl w-full max-w-sm border border-tea-brown/10">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-tea-brown/10">
                <h2 className="text-xl font-serif font-bold text-tea-brown">Enter Admin Code</h2>
                <button
                  onClick={handleClose}
                  className="text-tea-brown hover:text-tea-gold transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-tea-brown mb-2">
                    Admin Code
                  </label>
                  <input
                    id="code"
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isLocked || isLoading}
                    placeholder="Enter code"
                    className="w-full px-4 py-2.5 border border-tea-brown/20 rounded-lg focus:outline-none focus:border-tea-gold focus:ring-2 focus:ring-tea-gold/20 bg-white text-tea-brown placeholder-tea-brown/40 disabled:opacity-50 disabled:bg-tea-brown/5 font-mono"
                    autoComplete="off"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 font-medium text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Attempt Counter */}
                {failedAttempts > 0 && !isLocked && (
                  <div className="text-xs text-tea-brown/60 text-center">
                    Attempts: {failedAttempts}/3
                  </div>
                )}

                {/* Lockout Message */}
                {isLocked && (
                  <div className="text-xs text-red-600 text-center font-medium">
                    Too many attempts. Try again in 30 seconds.
                  </div>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={isLocked || isLoading || code.length === 0}
                  className="w-full bg-tea-brown text-tea-cream px-4 py-2.5 rounded-lg font-medium hover:bg-tea-gold hover:text-tea-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-tea-cream border-t-transparent rounded-full animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Unlock'
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
