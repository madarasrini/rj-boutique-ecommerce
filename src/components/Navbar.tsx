import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  'Electronics',
  'Home'
];

export default function Navbar() {
  const { cart, user } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<'main' | 'categories'>('main');
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setActiveSubMenu('main');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setActiveSubMenu('main');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-zinc-200/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12">
          <div className="flex justify-between items-center h-24 gap-6 xl:gap-10">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-4 group flex-shrink-0">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-zinc-900/20">
              <span className="text-white font-bold text-3xl leading-none">R</span>
            </div>
            <span className="font-bold text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 hidden sm:block">RJ Boutique</span>
          </Link>

          {/* Navigation Section */}
          <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
            <Link to="/products" className="text-base font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">All Products</Link>
            <div className="relative group">
              <button className="text-base font-semibold text-zinc-500 group-hover:text-zinc-900 flex items-center gap-1.5 py-10 transition-colors">
                Categories
              </button>
              <div className="absolute top-full left-0 w-80 bg-white border border-zinc-100 shadow-2xl rounded-[2rem] py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
                {CATEGORIES.map(cat => (
                  <Link 
                    key={cat} 
                    to={`/products?category=${encodeURIComponent(cat)}`}
                    className="block px-8 py-4 text-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/offers" className="text-base font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors">
              Deals <span className="px-3 py-1 bg-red-500 text-white text-[11px] font-black rounded-full uppercase tracking-widest shadow-sm shadow-red-500/20">Hot</span>
            </Link>
          </div>

          {/* Search Section */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-14 pr-6 py-3.5 border border-zinc-200 rounded-[1.25rem] leading-5 bg-zinc-50/50 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-[6px] focus:ring-zinc-900/5 focus:border-zinc-900 text-base transition-all shadow-inner"
                placeholder="Search for products, brands and more..."
              />
            </form>
          </div>

          {/* Actions Section (Track, Profile, Cart) */}
          <div className="flex items-center gap-6 xl:gap-8 flex-shrink-0">
            
            {/* Track Order Section */}
            <Link to="/track" className="hidden lg:flex items-center gap-2 text-base font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
              Track Order
            </Link>

            {/* Admin Section */}
            {user?.is_admin && (
              <Link to="/admin" className="hidden lg:flex items-center gap-2 text-base font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                Admin
              </Link>
            )}

            {/* My Profile Section */}
            {user ? (
              <Link to="/profile" className="hidden lg:flex items-center gap-2 text-base font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
                <User className="w-5 h-5" /> My Profile
              </Link>
            ) : (
              <Link to="/login" className="hidden lg:flex items-center gap-2 text-base font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
                <User className="w-5 h-5" /> Sign In
              </Link>
            )}

            {/* Cart Section */}
            <Link to="/cart" className="relative p-3.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all">
              <ShoppingCart className="h-7 w-7" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 text-[11px] font-black leading-none text-white bg-zinc-900 rounded-full ring-4 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all"
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
      </nav>

      {/* Mobile Menu Overlay - Moved outside nav to prevent backdrop-filter containing block issues */}
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
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[70] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-zinc-100 bg-white">
                <div className="flex items-center gap-2">
                  {activeSubMenu !== 'main' && (
                    <button 
                      onClick={() => setActiveSubMenu('main')}
                      className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 flex items-center gap-1 text-sm font-bold uppercase tracking-wider"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" /> Back
                    </button>
                  )}
                  <span className="font-bold text-2xl">
                    {activeSubMenu === 'main' ? 'Menu' : 'Categories'}
                  </span>
                </div>
                <button onClick={closeMobileMenu} className="p-2 text-zinc-400 hover:text-zinc-900">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-10 bg-white">
                <AnimatePresence mode="wait">
                  {activeSubMenu === 'main' ? (
                    <motion.div
                      key="main-menu"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </form>

                      <div className="space-y-6">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Navigation</h3>
                        <div className="grid gap-3">
                          <Link to="/" onClick={closeMobileMenu} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 text-lg font-semibold">
                            Home <ChevronRight className="w-5 h-5 text-zinc-300" />
                          </Link>
                          <Link to="/products" onClick={closeMobileMenu} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 text-lg font-semibold">
                            All Products <ChevronRight className="w-5 h-5 text-zinc-300" />
                          </Link>
                          <button 
                            onClick={() => setActiveSubMenu('categories')}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 text-lg font-semibold w-full text-left"
                          >
                            Categories <ChevronRight className="w-5 h-5 text-zinc-300" />
                          </button>
                          <Link to="/offers" onClick={closeMobileMenu} className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 text-lg font-semibold">
                            Hot Deals <ChevronRight className="w-5 h-5 text-zinc-300" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="categories-menu"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Select Category</h3>
                      <div className="grid gap-3">
                        {CATEGORIES.map(cat => (
                          <Link 
                            key={cat} 
                            to={`/products?category=${encodeURIComponent(cat)}`}
                            onClick={closeMobileMenu}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 text-lg font-semibold"
                          >
                            {cat} <ChevronRight className="w-5 h-5 text-zinc-300" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-8 border-t border-zinc-100 bg-zinc-50">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-xl">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{user.name}</div>
                        <div className="text-sm text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                    <Link to="/profile" onClick={closeMobileMenu} className="block w-full text-center py-4 rounded-2xl bg-white border border-zinc-200 text-lg font-semibold">
                      My Profile
                    </Link>
                    {user.is_admin && (
                      <Link to="/admin" onClick={closeMobileMenu} className="block w-full text-center py-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-lg">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/track" onClick={closeMobileMenu} className="block w-full text-center py-4 rounded-2xl bg-white border border-zinc-200 text-lg font-semibold">
                      Track Orders
                    </Link>
                  </div>
                ) : (
                  <Link to="/login" onClick={closeMobileMenu} className="block w-full text-center py-5 rounded-2xl bg-zinc-900 text-white font-bold text-xl">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
