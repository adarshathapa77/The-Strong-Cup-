import { ShoppingCart, Search, Package, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AdminCodeModal from './AdminCodeModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const { cartCount } = useCart();
  const location = useLocation();
  const logoClickCountRef = useRef(0);
  const logoClickTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle 5-tap logo trigger for admin access
  const handleLogoClick = () => {
    logoClickCountRef.current += 1;

    // Clear timeout and reset counter after 2 seconds
    if (logoClickTimeoutRef.current) {
      clearTimeout(logoClickTimeoutRef.current);
    }

    if (logoClickCountRef.current === 5) {
      // 5 taps detected - show admin modal
      setIsAdminModalOpen(true);
      logoClickCountRef.current = 0;
    } else {
      // Reset counter after 2 seconds of inactivity
      logoClickTimeoutRef.current = setTimeout(() => {
        logoClickCountRef.current = 0;
      }, 2000);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass py-3 shadow-md' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo with Hidden Admin Trigger */}
        <div className="flex items-center cursor-pointer group" onClick={handleLogoClick}>
          <Link to="/" className="flex items-center cursor-pointer group">
            <div className="w-8 h-8 bg-tea-brown rounded-lg flex items-center justify-center mr-2 shadow-lg group-hover:bg-tea-gold transition-colors">
              <ShoppingCart className="text-tea-cream" size={16} />
            </div>
            <h1 className="text-base md:text-lg font-serif font-bold tracking-tight text-tea-brown">
              THE <span className="text-tea-gold italic">STRONG</span> CUP
            </h1>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-tea-brown font-medium text-sm hover:text-tea-gold transition-colors relative group ${location.pathname === link.path ? 'text-tea-gold' : ''}`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-tea-gold transition-all group-hover:w-full ${location.pathname === link.path ? 'w-full' : 'w-0'}`}></span>
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <button className="text-tea-brown hover:text-tea-gold transition-colors">
            <Search size={22} />
          </button>
          <Link to="/track-order" className="text-tea-brown hover:text-tea-gold transition-colors hidden sm:block" title="Track Order">
            <Package size={22} />
          </Link>
          <Link 
            to="/cart"
            className="text-tea-brown hover:text-tea-gold transition-colors relative"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-tea-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button 
            className="md:hidden text-tea-brown"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-tea-brown/10 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-left text-tea-brown font-medium py-2 border-b border-tea-brown/5 ${location.pathname === link.path ? 'text-tea-gold' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/track-order" className="flex items-center text-tea-brown font-medium py-2">
                <Package size={20} className="mr-2" /> Track Order
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Code Modal */}
      <AdminCodeModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
    </nav>
  );
}
