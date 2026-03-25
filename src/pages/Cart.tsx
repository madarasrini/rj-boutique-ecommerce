import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ArrowRight, ShoppingBag, Shield } from 'lucide-react';
import { useStore } from '../store';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => {
    const price = item.discount_price || item.price;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 5000 ? 0 : 500;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Your cart is empty</h2>
        <p className="text-zinc-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-zinc-900 text-white px-8 py-3 rounded-full font-medium hover:bg-zinc-800 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <h1 className="text-3xl font-bold text-zinc-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {cart.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.2 }}
                key={item.id}
                className="flex gap-6 p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm"
              >
                <Link to={`/product/${item.id}`} className="w-32 h-32 bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </Link>
                
                <div className="flex flex-col flex-grow justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/product/${item.id}`} className="text-lg font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-sm text-zinc-500 mt-1">{item.category}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-zinc-200 rounded-full bg-zinc-50 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-zinc-600 transition-colors"
                      >
                        -
                      </button>
                      <motion.span 
                        key={item.quantity}
                        initial={{ scale: 1.2, color: '#18181b' }}
                        animate={{ scale: 1, color: '#52525b' }}
                        className="w-10 text-center font-medium text-sm"
                      >
                        {item.quantity}
                      </motion.span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-zinc-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                        <motion.div 
                          layout
                          className="text-lg font-bold text-zinc-900"
                        >
                          ₹{((item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}
                        </motion.div>
                        {item.discount_price && (
                          <div className="text-xs text-zinc-400 line-through">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <div className="bg-zinc-50 p-8 rounded-3xl shadow-sm border border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <motion.span layout key={subtotal}>₹{subtotal.toLocaleString('en-IN')}</motion.span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}</span>
              </div>
              {shipping > 0 && (
                <div className="text-xs text-zinc-500 text-right">
                  Add ₹{(5000 - subtotal).toLocaleString('en-IN')} more for free shipping
                </div>
              )}
            </div>
            
            <div className="border-t border-zinc-200 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-zinc-900">Total</span>
                <motion.span 
                  layout
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-zinc-900"
                >
                  ₹{total.toLocaleString('en-IN')}
                </motion.span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-zinc-900 text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Shield className="w-4 h-4" /> Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
