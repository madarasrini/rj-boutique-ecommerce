import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image_url: string;
}

interface Order {
  id: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  tracking_number: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderLookup() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track/${trackingNumber.trim()}`);
      if (!res.ok) {
        throw new Error('Order not found. Please check your tracking number.');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = order ? [
    { label: 'Order Placed', icon: Package, completed: true },
    { label: 'Processing', icon: Clock, completed: order.status !== 'Pending' },
    { label: 'Shipped', icon: Truck, completed: order.status === 'Shipped' || order.status === 'Delivered' },
    { label: 'Delivered', icon: CheckCircle2, completed: order.status === 'Delivered' },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">Track Your Order</h1>
        <p className="text-zinc-500 max-w-lg mx-auto">
          Enter your tracking number below to see the current status of your shipment.
        </p>
      </div>

      <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm mb-12">
        <form onSubmit={handleLookup} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter Tracking Number (e.g., TRK...)"
              className="block w-full pl-12 pr-4 py-4 border border-zinc-200 rounded-2xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-lg"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20"
          >
            {loading ? 'Searching...' : 'Track Order'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-medium"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}
      </div>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Status Card */}
          <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-8 mb-12 relative z-10">
              <div>
                <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Order Status</p>
                <h2 className="text-3xl font-bold">{order.status}</h2>
              </div>
              <div className="text-left md:text-right">
                <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Estimated Delivery</p>
                <h2 className="text-xl font-bold">3-5 Business Days</h2>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative z-10">
              <div className="absolute top-6 left-0 w-full h-1 bg-white/10 -translate-y-1/2 hidden sm:block" />
              <div className="flex flex-col sm:flex-row justify-between gap-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-4 group">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-zinc-900 shadow-lg transition-all duration-500 ${step.completed ? 'bg-white text-zinc-900 scale-110' : 'bg-zinc-800 text-zinc-500'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-left sm:text-center">
                        <p className={`font-bold text-sm ${step.completed ? 'text-white' : 'text-zinc-500'}`}>{step.label}</p>
                        {step.completed && index === 0 && <p className="text-[10px] text-zinc-400 font-medium">{new Date(order.created_at).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Order Items</h3>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-zinc-900">{item.name}</h4>
                      <p className="text-sm text-zinc-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-zinc-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-zinc-100 flex justify-between items-center">
                <span className="text-zinc-500 font-bold">Total Paid</span>
                <span className="text-2xl font-black text-zinc-900">₹{order.total_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Shipping To</h3>
                <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">
                  {order.shipping_address}
                </p>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-8">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Need Help?</h3>
                <p className="text-zinc-500 text-sm mb-4">If you have any questions about your order, our support team is here to help.</p>
                <Link to="/support" className="text-zinc-900 font-bold text-sm underline">Contact Support</Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
