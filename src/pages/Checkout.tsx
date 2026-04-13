import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { CheckCircle2, CreditCard, Wallet, ArrowRight } from 'lucide-react';

export default function Checkout() {
  const { cart, user, token, clearCart } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{id: number, tracking: string} | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);
  const total = subtotal + (subtotal > 5000 ? 0 : 500);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cart.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress: address,
          paymentMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderSuccess({ id: data.orderId, tracking: data.trackingNumber });
        clearCart();
      } else {
        alert('Checkout failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-zinc-600 mb-2">Thank you for your purchase, {user.name}.</p>
        <p className="text-zinc-500 mb-8">
          Your order #{orderSuccess.id} is being processed.<br/>
          Tracking Number: <span className="font-mono font-medium text-zinc-900">{orderSuccess.tracking}</span>
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(`/orders/${orderSuccess.id}`)}
            className="bg-zinc-900 text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors"
          >
            Track Order
          </button>
          <button 
            onClick={() => navigate('/')}
            className="bg-white border border-zinc-200 text-zinc-900 px-8 py-3 rounded-full font-medium hover:bg-zinc-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <form onSubmit={handleCheckout} className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Shipping Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                  <input type="text" value={user.name} disabled className="w-full border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                  <input type="email" value={user.email} disabled className="w-full border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 text-zinc-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Shipping Address</label>
                  <textarea 
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                    placeholder="Enter your full shipping address"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Payment Method</h2>
              <div className="space-y-4">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Credit Card' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                  <input type="radio" name="payment" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <CreditCard className={`w-6 h-6 mr-4 ${paymentMethod === 'Credit Card' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                  <span className="font-medium">Credit Card (Mock)</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'PayPal' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                  <input type="radio" name="payment" value="PayPal" checked={paymentMethod === 'PayPal'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                  <Wallet className={`w-6 h-6 mr-4 ${paymentMethod === 'PayPal' ? 'text-zinc-900' : 'text-zinc-400'}`} />
                  <span className="font-medium">PayPal (Mock)</span>
                </label>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => navigate('/checkout-payment', { state: { address } })}
              disabled={!address}
              className="w-full bg-zinc-900 text-white py-4 rounded-full font-semibold text-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Proceed to Payment <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div>
          <div className="bg-zinc-50 p-8 rounded-3xl sticky top-24">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-zinc-900 line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-zinc-900">
                    ₹{((item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-zinc-200 pt-6 space-y-3">
              <div className="flex justify-between text-zinc-600 text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-600 text-sm">
                <span>Shipping</span>
                <span>{subtotal > 5000 ? 'Free' : '₹500.00'}</span>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-zinc-200 mt-3">
                <span className="font-bold text-zinc-900">Total</span>
                <span className="text-2xl font-bold text-zinc-900">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
