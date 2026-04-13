import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShieldCheck, ArrowLeft, Lock, Smartphone, Globe, Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';

type PaymentMethod = 'UPI' | 'Card' | 'Net Banking' | 'Wallet';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, user, token, clearCart } = useStore();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [orderId, setOrderId] = useState<number | null>(null);

  // Form States
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);
  const total = subtotal + (subtotal > 5000 ? 0 : 500);
  const shippingAddress = location.state?.address || user?.address || '';

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
    } else if (cart.length === 0 && paymentStatus !== 'success') {
      navigate('/cart');
    }
  }, [cart, user, token, navigate, paymentStatus]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentStatus('idle');

    try {
      // Simulate payment gateway processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress,
          paymentMethod: selectedMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderId(data.orderId);
        setPaymentStatus('success');
        clearCart();
        
        // Redirect to admin dashboard after 3 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 3000);
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-zinc-100 text-center"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">✅ Payment successfull !!</h1>
          <p className="text-zinc-500 mb-2">thanks for buying hope you are satisfied ^_^</p>
          <p className="text-zinc-500 mb-2">Your order is confirmed. Order ID: #{orderId}</p>
          <p className="text-sm text-zinc-400 mb-10">Redirecting to Admin Dashboard in a few seconds...</p>
          <button 
            onClick={() => navigate('/admin')}
            className="w-full py-5 bg-zinc-900 text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all"
          >
            Go to Admin Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left: Payment Options */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-zinc-900">Payment Method</h1>
              <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {[
                { id: 'Card', icon: CreditCard, label: 'Card' },
                { id: 'UPI', icon: Smartphone, label: 'UPI' },
                { id: 'Net Banking', icon: Globe, label: 'Bank' },
                { id: 'Wallet', icon: Wallet, label: 'Wallet' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    selectedMethod === method.id 
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' 
                    : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200'
                  }`}
                >
                  <method.icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">{method.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <AnimatePresence mode="wait">
                {selectedMethod === 'Card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Card Number</label>
                      <div className="relative">
                        <input 
                          type="text"
                          className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-mono tracking-widest"
                          value={cardData.number}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                            const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                            setCardData({...cardData, number: formatted});
                          }}
                        />
                        <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Expiry Date</label>
                        <input 
                          type="text"
                          className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none"
                          value={cardData.expiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            const formatted = val.length >= 3 ? `${val.slice(0, 2)}/${val.slice(2)}` : val;
                            setCardData({...cardData, expiry: formatted});
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">CVV</label>
                        <input 
                          type="password"
                          className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Cardholder Name</label>
                      <input 
                        type="text"
                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none"
                        value={cardData.name}
                        onChange={(e) => setCardData({...cardData, name: e.target.value})}
                      />
                    </div>
                  </motion.div>
                )}

                {selectedMethod === 'UPI' && (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">UPI ID</label>
                      <input 
                        type="text"
                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      {['@okaxis', '@okicici', '@paytm'].map(suffix => (
                        <button 
                          key={suffix}
                          type="button"
                          onClick={() => setUpiId(prev => prev.split('@')[0] + suffix)}
                          className="px-3 py-1.5 bg-zinc-100 rounded-lg text-[10px] font-bold text-zinc-500 hover:bg-zinc-200 transition-colors"
                        >
                          {suffix}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {(selectedMethod === 'Net Banking' || selectedMethod === 'Wallet') && (
                  <motion.div
                    key="other"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200"
                  >
                    <p className="text-zinc-500 text-sm">Please select your provider on the next screen.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {paymentStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 p-4 rounded-2xl">
                  <AlertCircle className="w-5 h-5" />
                  ⚠️ Payment failed. Please try again.
                </div>
              )}

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full py-5 bg-zinc-900 text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-xl hover:shadow-zinc-900/30 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Confirm Payment
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-zinc-100 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                🔒 256-bit SSL Secure
              </div>
              <div className="flex gap-6 opacity-30 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100 sticky top-8">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-14 h-14 bg-zinc-50 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-100">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold text-zinc-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-bold text-zinc-900">
                    ₹{((item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-zinc-100">
              <div className="flex justify-between text-zinc-500 text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-500 text-sm">
                <span>Shipping</span>
                <span>{subtotal > 5000 ? 'Free' : '₹500.00'}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="font-bold text-zinc-900">Total Amount</span>
                <span className="text-3xl font-black text-zinc-900">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Shipping To</div>
              <p className="text-xs text-zinc-600 leading-relaxed">{shippingAddress}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
