import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck, Truck, CreditCard, CheckCircle2, User, MapPin } from 'lucide-react';
import { usePincodeSearch } from '../hooks/usePincodeSearch';
import PincodeAutocomplete from '../components/PincodeAutocomplete';
import DeliveryInfo from '../components/DeliveryInfo';

const Checkout: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [paymentMethod, setPaymentMethod] = useState('card');

  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const {
    query: pincodeQuery,
    setQuery: setPincodeQuery,
    suggestions: pincodeSuggestions,
    isLoading: isPincodeLoading,
    error: pincodeError,
    selectedPincode,
    selectPincode,
    deliveryInfo,
    clearSelection: clearPincodeSelection,
  } = usePincodeSearch();

  useEffect(() => {
    if (selectedPincode) {
      setFormData(prev => ({
        ...prev,
        pincode: selectedPincode.pincode,
        city: selectedPincode.city,
        state: selectedPincode.state,
      }));

      if (errors.pincode) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.pincode;
          delete newErrors.city;
          delete newErrors.state;
          return newErrors;
        });
      }
    }
  }, [selectedPincode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextField?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextField) {
        const nextInput = formRef.current?.querySelector(`[name="${nextField}"]`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';

    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone (10 digits)';

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';

    if (deliveryInfo && !deliveryInfo.is_serviceable) {
      newErrors.pincode = 'Delivery not available for this pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isNavigating = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProcessing(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    
    isNavigating.current = true;
    
    const orderData = {
      orderId: `TSC-${Math.floor(Math.random() * 1000000)}`,
      items: [...cartItems],
      total: cartTotal,
      shipping: { ...formData }
    };

    // Navigate to success
    navigate('/success', { state: { orderData } });
    clearCart();
  };

  if (cartItems.length === 0 && !isNavigating.current) {
    navigate('/cart');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-tea-brown hover:text-tea-gold transition-colors mb-8 font-bold"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-tea-brown mb-8">Secure <span className="text-tea-gold italic">Checkout</span></h2>
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              
              {/* User Identity Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-tea-brown/5">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-tea-brown mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-tea-brown/40 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 'phone')}
                        placeholder="your@email.com"
                        className={`w-full bg-tea-cream/30 border-2 ${errors.email ? 'border-red-400' : 'border-tea-brown/5'} p-3 rounded-xl focus:border-tea-gold outline-none transition-all`}
                      />
                      {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-tea-brown/40 uppercase tracking-widest">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 'fullName')}
                        placeholder="10-digit mobile"
                        className={`w-full bg-tea-cream/30 border-2 ${errors.phone ? 'border-red-400' : 'border-tea-brown/5'} p-3 rounded-xl focus:border-tea-gold outline-none transition-all`}
                      />
                      {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-tea-brown/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-tea-brown">Shipping Address</h3>
                </div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-tea-brown/40 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onKeyDown={(e) => handleKeyDown(e, 'address')}
                      placeholder="John Doe"
                      className={`w-full bg-tea-cream/30 border-2 ${errors.fullName ? 'border-red-400' : 'border-tea-brown/5'} p-3 rounded-xl focus:border-tea-gold outline-none transition-all`}
                    />
                    {errors.fullName && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.fullName}</p>}
                  </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-tea-brown/40 uppercase tracking-widest">Address Line</label>
                      <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 'city')}
                        placeholder="House No, Street, Area"
                        className={`w-full bg-tea-cream/30 border-2 ${errors.address ? 'border-red-400' : 'border-tea-brown/5'} p-3 rounded-xl focus:border-tea-gold outline-none transition-all`}
                      />
                      {errors.address && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-tea-brown/40 uppercase tracking-widest">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          onKeyDown={(e) => handleKeyDown(e, 'state')}
                          placeholder="City"
                          readOnly={!!selectedPincode}
                          className={`w-full bg-tea-cream/30 border-2 ${errors.city ? 'border-red-400' : 'border-tea-brown/5'} p-3 rounded-xl focus:border-tea-gold outline-none transition-all ${selectedPincode ? 'bg-tea-green/5 cursor-not-allowed' : ''}`}
                        />
                        {errors.city && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.city}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-tea-brown/40 uppercase tracking-widest">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          onKeyDown={(e) => handleKeyDown(e, 'pincode')}
                          placeholder="State"
                          readOnly={!!selectedPincode}
                          className={`w-full bg-tea-cream/30 border-2 ${errors.state ? 'border-red-400' : 'border-tea-brown/5'} p-3 rounded-xl focus:border-tea-gold outline-none transition-all ${selectedPincode ? 'bg-tea-green/5 cursor-not-allowed' : ''}`}
                        />
                        {errors.state && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{errors.state}</p>}
                      </div>
                      <div className="space-y-2 md:col-span-3">
                        <label className="text-xs font-bold text-tea-brown/40 uppercase tracking-widest">Pincode</label>
                        <PincodeAutocomplete
                          value={pincodeQuery}
                          onChange={setPincodeQuery}
                          suggestions={pincodeSuggestions}
                          isLoading={isPincodeLoading}
                          error={errors.pincode || pincodeError}
                          onSelect={selectPincode}
                          onClear={clearPincodeSelection}
                          placeholder="Enter pincode or city name"
                        />
                      </div>

                      {deliveryInfo && (
                        <div className="md:col-span-3">
                          <DeliveryInfo
                            deliveryInfo={deliveryInfo}
                            city={formData.city}
                            state={formData.state}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
              </div>

              {/* Payment Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-tea-brown/5">
                <h3 className="text-lg font-bold text-tea-brown mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex items-center space-x-4 ${paymentMethod === 'card' ? 'border-tea-gold bg-tea-gold/5' : 'border-tea-brown/5 hover:border-tea-gold/30'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-tea-gold' : 'border-tea-brown/20'}`}>
                      {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-tea-gold rounded-full" />}
                    </div>
                    <CreditCard size={20} className={paymentMethod === 'card' ? 'text-tea-gold' : 'text-tea-brown/40'} />
                    <span className="font-bold text-tea-brown text-sm">Card / UPI</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border-2 transition-all text-left flex items-center space-x-4 ${paymentMethod === 'cod' ? 'border-tea-gold bg-tea-gold/5' : 'border-tea-brown/5 hover:border-tea-gold/30'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-tea-gold' : 'border-tea-brown/20'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-tea-gold rounded-full" />}
                    </div>
                    <Truck size={20} className={paymentMethod === 'cod' ? 'text-tea-gold' : 'text-tea-brown/40'} />
                    <span className="font-bold text-tea-brown text-sm">Cash on Delivery</span>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-tea-brown text-tea-cream py-3 rounded-xl font-medium text-base hover:bg-tea-gold transition-all shadow-xl active:scale-95 group flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-tea-brown/5 sticky top-32">
              <h3 className="text-xl font-serif font-bold text-tea-brown mb-6">Order Summary</h3>
              <div className="space-y-6 mb-8">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-tea-brown/5 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute -top-2 -right-2 bg-tea-brown text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-tea-brown text-base">{item.name}</p>
                        <p className="text-tea-brown/40">₹{item.price} each</p>
                      </div>
                    </div>
                    <span className="font-bold text-tea-brown text-base">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                
                <div className="h-px bg-tea-brown/5 my-6" />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-tea-brown/60">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-tea-brown/60">
                    <span>Shipping</span>
                    <span className="text-tea-green font-bold">FREE</span>
                  </div>
                </div>

                <div className="h-px bg-tea-brown/5 my-6" />
                
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-tea-brown">Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-tea-brown">₹{cartTotal}</span>
                    <p className="text-[10px] text-tea-brown/40 uppercase tracking-widest mt-1">Including all taxes</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-tea-cream/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center text-xs text-tea-brown/60 gap-3">
                  <ShieldCheck size={16} className="text-tea-green" />
                  <span>Secure SSL Encrypted Checkout</span>
                </div>
                <div className="flex items-center text-xs text-tea-brown/60 gap-3">
                  <Truck size={16} className="text-tea-gold" />
                  <span>Free Delivery on all orders</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
