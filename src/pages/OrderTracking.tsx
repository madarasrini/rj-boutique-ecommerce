import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle2, ArrowLeft, Clock } from 'lucide-react';
import { useStore } from '../store';

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

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id, user, token, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found.</div>;

  const steps = [
    { label: 'Order Placed', icon: Package, completed: true },
    { label: 'Processing', icon: Clock, completed: order.status !== 'Pending' },
    { label: 'Shipped', icon: Truck, completed: order.status === 'Shipped' || order.status === 'Delivered' },
    { label: 'Delivered', icon: CheckCircle2, completed: order.status === 'Delivered' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="bg-white border border-zinc-100 rounded-3xl p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8 pb-8 border-b border-zinc-100">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 mb-2">Order #{order.id}</h1>
            <p className="text-zinc-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm font-medium text-zinc-500 mb-1 uppercase tracking-wider">Tracking Number</p>
            <p className="font-mono text-lg font-bold text-zinc-900">{order.tracking_number}</p>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 z-0 hidden sm:block" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white ${step.completed ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium text-sm ${step.completed ? 'text-zinc-900' : 'text-zinc-400'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Shipping Address</h3>
            <p className="text-zinc-600 whitespace-pre-line">{order.shipping_address}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Payment Method</h3>
            <p className="text-zinc-600">{order.payment_method}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Items</h2>
        <div className="space-y-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center">
              <Link to={`/product/${item.product_id}`} className="w-20 h-20 bg-zinc-50 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-100">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </Link>
              <div className="flex-grow">
                <Link to={`/product/${item.product_id}`} className="font-semibold text-zinc-900 hover:text-zinc-600 transition-colors">
                  {item.name}
                </Link>
                <p className="text-sm text-zinc-500 mt-1">Qty: {item.quantity}</p>
              </div>
              <div className="font-bold text-zinc-900">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-100 mt-6 pt-6 flex justify-between items-center">
          <span className="text-lg font-bold text-zinc-900">Total</span>
          <span className="text-2xl font-bold text-zinc-900">₹{order.total_amount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </motion.div>
  );
}
