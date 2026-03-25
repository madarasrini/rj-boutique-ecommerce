import React from 'react';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-zinc-100 text-center relative overflow-hidden"
      >
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-zinc-900/20">
          <Lock className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">Secure Payment</h1>
        <p className="text-zinc-500 mb-10 leading-relaxed">
          This is a placeholder for the final payment processing step. 
          In a production environment, you would integrate with Stripe, PayPal, or another secure provider here.
        </p>
        
        <div className="bg-zinc-50 rounded-[2rem] p-8 mb-10 text-left border border-zinc-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-500 font-medium">Order Summary</span>
            <span className="text-xs bg-zinc-200 text-zinc-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">Pending</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-zinc-400 text-sm">Total Amount</span>
            <span className="text-3xl font-black text-zinc-900">₹---.--</span>
          </div>
          <div className="mt-6 pt-6 border-t border-zinc-200 flex items-center gap-3 text-sm text-emerald-600 font-bold">
            <ShieldCheck className="w-5 h-5" />
            256-bit SSL Encrypted
          </div>
        </div>

        <button 
          onClick={() => alert('This is a demo. In a real app, this would process your payment and redirect to a success page.')}
          className="w-full py-5 bg-zinc-900 text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-xl hover:shadow-zinc-900/30 flex items-center justify-center gap-3"
        >
          <CreditCard className="w-5 h-5" />
          Complete Purchase
        </button>
        
        <p className="mt-8 text-xs text-zinc-400 font-medium uppercase tracking-widest">
          Trusted by 10,000+ Customers
        </p>
      </motion.div>
    </div>
  );
}
