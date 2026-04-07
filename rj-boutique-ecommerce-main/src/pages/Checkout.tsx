import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { CheckCircle2, CreditCard, Wallet } from 'lucide-react';

export default function Checkout() {
  const { cart, user, clearCart } = useStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ id: number; tracking: string } | null>(null);

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.discount_price || item.price) * item.quantity,
    0
  );
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
      const res = await fetch('https://rj-boutique-ecommerce.onrender.com/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          totalAmount: total,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderSuccess({
          id: data.orderId,
          tracking: data.trackingNumber,
        });
        clearCart();
      } else {
        alert('Checkout failed. Please try again.');
      }
    } catch (error) {
      alert('Error placing order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-20"
      >
        <CheckCircle2 className="mx-auto text-green-500 w-16 h-16" />
        <h1 className="text-3xl font-bold mt-4">Order Successful 🎉</h1>
        <p>Order ID: {orderSuccess.id}</p>
        <p>Tracking: {orderSuccess.tracking}</p>

        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-black text-white px-6 py-3 rounded"
        >
          Go Home
        </button>
      </motion.div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleCheckout} className="space-y-4">
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Address"
          required
          className="w-full border p-3 rounded"
        />

        <div>
          <label>
            <input
              type="radio"
              value="Credit Card"
              checked={paymentMethod === 'Credit Card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Credit Card
          </label>

          <label className="ml-4">
            <input
              type="radio"
              value="PayPal"
              checked={paymentMethod === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            PayPal
          </label>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="bg-black text-white px-6 py-3 rounded"
        >
          {isProcessing ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}