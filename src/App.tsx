import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { UserProvider } from './context/UserContext';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Success from './pages/Success';
import About from './pages/About';
import Contact from './pages/Contact';
import TrackOrder from './pages/TrackOrder';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserRegister from './pages/UserRegister';
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';
import UserOrders from './pages/UserOrders';

function AppContent() {
  const location = useLocation();
  const isProductPage = location.pathname.startsWith('/product/');
  const isAdminPage = location.pathname.startsWith('/admin/');

  return (
    <div className="min-h-screen bg-tea-cream selection:bg-tea-gold selection:text-tea-brown flex flex-col">
      <ScrollToTop />
      {!isProductPage && !isAdminPage && <Navbar />}
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/success" element={<Success />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/track-order" element={<TrackOrder />} />
            
            {/* User Routes */}
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/orders" element={<UserOrders />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>

      {!isProductPage && !isAdminPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AdminProvider>
        <UserProvider>
          <Router>
            <AppContent />
          </Router>
        </UserProvider>
      </AdminProvider>
    </CartProvider>
  );
}
