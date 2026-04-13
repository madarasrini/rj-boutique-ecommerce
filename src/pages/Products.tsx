import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingBag, Filter, X } from 'lucide-react';
import { Product, useStore } from '../store';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || 'All';

  useEffect(() => {
    if (categoryQuery !== 'All') {
      setSelectedCategory(categoryQuery);
    }
  }, [categoryQuery]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = products;

    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter(p => {
        const price = p.discount_price || p.price;
        return selectedPriceRanges.some(range => {
          if (range === 'under-10k') return price < 10000;
          if (range === '10k-50k') return price >= 10000 && price <= 50000;
          if (range === '50k-150k') return price > 50000 && price <= 150000;
          if (range === 'above-150k') return price > 150000;
          return true;
        });
      });
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, selectedPriceRanges]);

  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const categories = ['All', ...new Set(products.map(p => p.category))].filter(cat => cat !== 'Fashion' && cat !== 'Books');

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-zinc-500 mt-1">{filteredProducts.length} items found</p>
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-full text-sm font-medium"
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category 
                        ? 'bg-zinc-900 text-white font-medium' 
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Price Range</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer hover:text-zinc-900">
                  <input 
                    type="checkbox" 
                    checked={selectedPriceRanges.includes('under-10k')}
                    onChange={() => handlePriceRangeChange('under-10k')}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" 
                  />
                  Under ₹10,000
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer hover:text-zinc-900">
                  <input 
                    type="checkbox" 
                    checked={selectedPriceRanges.includes('10k-50k')}
                    onChange={() => handlePriceRangeChange('10k-50k')}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" 
                  />
                  ₹10,000 to ₹50,000
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer hover:text-zinc-900">
                  <input 
                    type="checkbox" 
                    checked={selectedPriceRanges.includes('50k-150k')}
                    onChange={() => handlePriceRangeChange('50k-150k')}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" 
                  />
                  ₹50,000 to ₹1,50,000
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer hover:text-zinc-900">
                  <input 
                    type="checkbox" 
                    checked={selectedPriceRanges.includes('above-150k')}
                    onChange={() => handlePriceRangeChange('above-150k')}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" 
                  />
                  ₹1,50,000 & Above
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-zinc-50 rounded-3xl border border-zinc-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <X className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">No products found</h3>
              <p className="text-zinc-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={() => {setSelectedCategory('All'); navigate('/products')}}
                className="text-zinc-900 font-medium underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
          )}
        </div>
      </div>
    </div>
  );
}
