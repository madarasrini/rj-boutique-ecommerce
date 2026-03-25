import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  'Electronics',
  'Home',
  'Fashion',
  'Books'
];

export default function Navbar() {
  const { cart, user } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">R</span>
              </div>
              <span className="font-bold text-xl tracking-tight">RJ Boutique</span>
            </Link>
            <div className="hidden lg:flex items-center ml-8 gap-6">
              <Link to="/products" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">All Products</Link>
              <div className="relative group">
                <button className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900 flex items-center gap-1 py-4">
                  Categories
                </button>
                <div className="absolute top-full left-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
                  {CATEGORIES.map(cat => (
                    <Link 
                      key={cat} 
                      to={`/products?category=${encodeURIComponent(cat)}`}
                      className="block px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/offers" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1">
                Deals <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">Hot</span>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-full leading-5 bg-zinc-50 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 sm:text-sm transition-all"
                placeholder="Search products..."
              />
            </form>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-zinc-900 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center gap-2">
                {user.is_admin && (
                  <Link to="/admin" className="hidden lg:flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors mr-2">
                    Admin
                  </Link>
                )}
                <Link to="/track" className="hidden lg:flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors mr-2">
                  Track Orders
                </Link>
                <Link to="/profile" className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors">
                  <User className="h-6 w-6" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/track" className="hidden lg:block text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                  Track Order
                </Link>
                <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                  Sign In
                </Link>
              </div>
            )}

            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-zinc-600 hover:text-zinc-900"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-[70] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-zinc-100">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-8">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </form>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Navigation</h3>
                  <div className="grid gap-2">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 font-medium">
                      Home <ChevronRight className="w-4 h-4 text-zinc-300" />
                    </Link>
                    <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 font-medium">
                      All Products <ChevronRight className="w-4 h-4 text-zinc-300" />
                    </Link>
                    <Link to="/offers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 font-medium">
                      Hot Deals <ChevronRight className="w-4 h-4 text-zinc-300" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Categories</h3>
                  <div className="grid gap-2">
                    {CATEGORIES.map(cat => (
                      <Link 
                        key={cat} 
                        to={`/products?category=${encodeURIComponent(cat)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 font-medium"
                      >
                        {cat} <ChevronRight className="w-4 h-4 text-zinc-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-100 bg-zinc-50">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{user.name}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-3 rounded-xl bg-white border border-zinc-200 font-medium">
                      My Profile
                    </Link>
                    {user.is_admin && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/track" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-3 rounded-xl bg-white border border-zinc-200 font-medium">
                      Track Orders
                    </Link>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center py-4 rounded-2xl bg-zinc-900 text-white font-bold">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
