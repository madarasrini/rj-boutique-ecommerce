import React from 'react';
import { motion } from 'motion/react';
import { Tag, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const months = [
  { name: 'January', offer: 'Winter Clearance', discount: '40% OFF', theme: 'bg-blue-50 text-blue-900 border-blue-100' },
  { name: 'February', offer: 'Valentine Specials', discount: 'BOGO 50%', theme: 'bg-rose-50 text-rose-900 border-rose-100' },
  { name: 'March', offer: 'Spring Tech Fest', discount: '25% OFF', theme: 'bg-emerald-50 text-emerald-900 border-emerald-100' },
  { name: 'April', offer: 'Easter Weekend', discount: 'Extra ₹20 Off', theme: 'bg-amber-50 text-amber-900 border-amber-100' },
  { name: 'May', offer: 'Summer Kickoff', discount: '30% OFF', theme: 'bg-orange-50 text-orange-900 border-orange-100' },
  { name: 'June', offer: 'Father\'s Day Deals', discount: '15% OFF', theme: 'bg-indigo-50 text-indigo-900 border-indigo-100' },
  { name: 'July', offer: 'Mid-Year Sale', discount: 'UP TO 70%', theme: 'bg-red-50 text-red-900 border-red-100' },
  { name: 'August', offer: 'Back to School', discount: '20% OFF', theme: 'bg-violet-50 text-violet-900 border-violet-100' },
  { name: 'September', offer: 'Labor Day Weekend', discount: '₹50 Off ₹200', theme: 'bg-teal-50 text-teal-900 border-teal-100' },
  { name: 'October', offer: 'Halloween Flash', discount: '31% OFF', theme: 'bg-orange-100 text-orange-950 border-orange-200' },
  { name: 'November', offer: 'Black Friday Prep', discount: 'Early Access', theme: 'bg-zinc-900 text-white border-zinc-800' },
  { name: 'December', offer: 'Holiday Magic', discount: 'FREE SHIPPING', theme: 'bg-green-50 text-green-900 border-green-100' },
];

export default function Offers() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-sm font-medium mb-6"
          >
            <Tag className="w-4 h-4" />
            <span>Exclusive Weekend Offers</span>
          </motion.div>
          <h1 className="text-5xl font-bold text-zinc-900 tracking-tight mb-4">
            Weekend Savings Calendar
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            Every weekend, we bring you exclusive deals across our entire catalog. 
            Mark your calendars for these monthly highlights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {months.map((m, index) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative overflow-hidden rounded-3xl border p-8 flex flex-col h-full transition-all hover:shadow-xl hover:-translate-y-1 ${m.theme}`}
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-4xl font-black opacity-20 uppercase tracking-tighter">
                  {m.name.substring(0, 3)}
                </span>
                <Calendar className="w-6 h-6 opacity-40" />
              </div>

              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-2">{m.name}</h3>
                <p className="text-lg font-medium opacity-80 mb-4">{m.offer}</p>
                <div className="text-4xl font-black tracking-tighter mb-6">
                  {m.discount}
                </div>
              </div>

              <div className="pt-6 border-t border-current border-opacity-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Clock className="w-4 h-4" />
                  <span>SAT - SUN ONLY</span>
                </div>
                <Link 
                  to="/products" 
                  className="flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all"
                >
                  SHOP NOW <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Decorative Background Element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl" />
            </motion.div>
          ))}
        </div>

        <div className="mt-24 bg-zinc-900 rounded-[3rem] p-12 text-center text-white overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Never Miss a Weekend Deal</h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter and get notified every Friday morning about the upcoming weekend offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-8 py-4 bg-white text-zinc-900 rounded-full font-bold hover:bg-zinc-200 transition-colors">
                Notify Me
              </button>
            </form>
          </div>
          
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
