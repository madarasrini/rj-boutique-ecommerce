import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { Product, useStore } from '../store';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useStore();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-900 text-white min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/tech/1920/1080?blur=2"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-medium tracking-wide mb-6 backdrop-blur-sm">
                NEW ARRIVALS 2026
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                Elevate Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">
                  Everyday Tech.
                </span>
              </h1>
              <p className="text-lg text-zinc-300 mb-10 max-w-xl leading-relaxed">
                Discover premium electronics and accessories designed for the modern professional. Uncompromising quality meets minimalist design.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="px-8 py-4 bg-white text-zinc-900 font-semibold rounded-full hover:bg-zinc-100 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Shop Collection <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/offers" className="px-8 py-4 bg-transparent border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm">
                  View Offers
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Trending Now</h2>
              <p className="text-zinc-500">Our most popular premium products.</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-zinc-900 font-medium hover:text-zinc-600 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-100"
              >
                <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-zinc-100">
                  {product.discount_price && (
                    <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      SALE
                    </div>
                  )}
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </Link>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">{product.category}</div>
                  <Link to={`/product/${product.id}`} className="text-lg font-semibold text-zinc-900 mb-2 line-clamp-1 hover:text-zinc-600 transition-colors">
                    {product.name}
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-zinc-500 ml-1">(128)</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.discount_price ? (
                        <>
                          <span className="text-sm text-zinc-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                          <span className="text-lg font-bold text-zinc-900">₹{product.discount_price.toLocaleString('en-IN')}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-zinc-900">₹{product.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Value Proposition */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Free Global Shipping</h3>
              <p className="text-zinc-500">On all orders over ₹1500. Tracked and insured delivery to your door.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
              <p className="text-zinc-500">Your transactions are protected with enterprise-grade encryption.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">30-Day Returns</h3>
              <p className="text-zinc-500">Not completely satisfied? Return it within 30 days for a full refund.</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
