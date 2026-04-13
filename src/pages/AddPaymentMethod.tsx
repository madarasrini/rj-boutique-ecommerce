import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Smartphone, Globe, Wallet, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Lock, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

type PaymentType = 'Credit Card' | 'Debit Card' | 'UPI' | 'Net Banking' | 'Wallet';

interface CardDetails {
  holderName: string;
  number: string;
  expiry: string;
  cvv: string;
}

export default function AddPaymentMethod() {
  const navigate = useNavigate();
  const { token } = useStore();
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentType | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({ holderName: '', number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const methods: { type: PaymentType; icon: any; description: string }[] = [
    { type: 'Credit Card', icon: CreditCard, description: 'Visa, Mastercard, AMEX' },
    { type: 'Debit Card', icon: CreditCard, description: 'All major banks' },
    { type: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, BHIM' },
    { type: 'Net Banking', icon: Globe, description: 'Direct bank transfer' },
    { type: 'Wallet', icon: Wallet, description: 'Paytm, Amazon Pay' },
  ];

  const handleMethodSelect = (method: PaymentType) => {
    setSelectedMethod(method);
    setStep(2);
  };

  const validateCard = () => {
    if (!cardDetails.holderName || cardDetails.number.length < 16 || !cardDetails.expiry || cardDetails.cvv.length < 3) {
      setError('⚠️ Please check your details and try again');
      return false;
    }
    return true;
  };

  const validateUpi = () => {
    if (!upiId.includes('@')) {
      setError('⚠️ Please check your details and try again');
      return false;
    }
    return true;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (selectedMethod?.includes('Card')) {
      if (!validateCard()) return;
    } else if (selectedMethod === 'UPI') {
      if (!validateUpi()) return;
    }

    setLoading(true);
    // Simulate secure tokenization and OTP trigger
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('⚠️ Invalid OTP. Please try again');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        type: selectedMethod,
        provider: selectedMethod?.includes('Card') ? 'Visa' : 'UPI', // Mocked provider
        last4: selectedMethod?.includes('Card') ? cardDetails.number.slice(-4) : null,
        upi_id: selectedMethod === 'UPI' ? upiId : null,
        is_default: true
      };

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStep(4);
      } else {
        setError('⚠️ Secure connection failed. Please retry');
      }
    } catch (err) {
      setError('⚠️ Secure connection failed. Please retry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Secure Payment Assistant</h1>
        <p className="text-zinc-500">I'll help you add a payment method safely and efficiently.</p>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden min-h-[400px]">
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold mb-6">Choose a payment method</h2>
                <div className="grid gap-4">
                  {methods.map((m) => (
                    <button
                      key={m.type}
                      onClick={() => handleMethodSelect(m.type)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-100 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                        <m.icon className="w-6 h-6 text-zinc-600" />
                      </div>
                      <div className="flex-grow">
                        <div className="font-bold text-zinc-900">{m.type}</div>
                        <div className="text-xs text-zinc-500">{m.description}</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button onClick={() => setStep(1)} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 mb-6 flex items-center gap-2">
                  ← Back to methods
                </button>
                <h2 className="text-xl font-bold mb-6">Enter {selectedMethod} details</h2>
                
                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                  {selectedMethod?.includes('Card') ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cardholder Name</label>
                        <input
                          required
                          type="text"
                          placeholder="John Doe"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                          value={cardDetails.holderName}
                          onChange={e => setCardDetails({...cardDetails, holderName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Card Number</label>
                        <div className="relative">
                          <input
                            required
                            type="text"
                            maxLength={16}
                            placeholder="0000 0000 0000 0000"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-mono"
                            value={cardDetails.number}
                            onChange={e => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '')})}
                          />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Expiry Date</label>
                          <input
                            required
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                            value={cardDetails.expiry}
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                              setCardDetails({...cardDetails, expiry: val});
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">CVV</label>
                          <input
                            required
                            type="password"
                            maxLength={3}
                            placeholder="•••"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                            value={cardDetails.cvv}
                            onChange={e => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                          />
                        </div>
                      </div>
                    </>
                  ) : selectedMethod === 'UPI' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">UPI ID</label>
                      <input
                        required
                        type="text"
                        placeholder="username@bank"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                      />
                      <p className="text-[10px] text-zinc-400">Example: yourname@okaxis, yourname@paytm</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                      <p className="text-zinc-500">Net Banking and Wallet integration will open in a secure popup.</p>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Processing...' : 'Verify & Proceed'}
                      {!loading && <ArrowRight className="w-5 h-5" />}
                    </button>
                    <p className="text-center text-[10px] text-zinc-400 mt-4 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> Your data is encrypted and सुरक्षित
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold mb-2">OTP Verification</h2>
                <p className="text-zinc-500 mb-8">We've sent a 6-digit code to your registered mobile number.</p>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <input
                    required
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full px-4 py-4 text-center text-3xl font-bold tracking-[1em] rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  />

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-xl text-left">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Confirm Payment Method'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-bold text-zinc-400 hover:text-zinc-900"
                  >
                    Resend OTP
                  </button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-4">✅ Your payment method has been securely added</h2>
                <p className="text-zinc-500 mb-12">You can now use this method for faster checkouts.</p>
                
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all"
                  >
                    Go to Profile
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full py-4 bg-zinc-50 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-100 transition-all"
                  >
                    Back to Shopping
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
      </div>
    </div>
  );
}
