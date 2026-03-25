import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Truck, Shield, ArrowLeft, Maximize2, X, ChevronRight, Check } from 'lucide-react';
import { Product, Variant, useStore } from '../store';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, user, token } = useStore();
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  
  // Variant state
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [parsedVariants, setParsedVariants] = useState<Variant[]>([]);

  // Zoom and Modal states
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        if (data.variants) {
          try {
            const variants = JSON.parse(data.variants);
            setParsedVariants(variants);
            if (variants.length > 0) {
              setSelectedVariant(variants[0]);
            }
          } catch (e) {
            console.error("Failed to parse variants", e);
          }
        }
        // Fetch related products
        fetch(`/api/products?category=${encodeURIComponent(data.category)}`)
          .then(res => res.json())
          .then(related => {
            // Filter out current product and limit to 4
            setRelatedProducts(related.filter((p: Product) => p.id !== Number(id)).slice(0, 4));
          });
      });

    fetch(`/api/products/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data));
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    const res = await fetch(`/api/products/${id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newReview),
    });

    if (res.ok) {
      setNewReview({ rating: 5, comment: '' });
      fetch(`/api/products/${id}/reviews`)
        .then((res) => res.json())
        .then((data) => setReviews(data));
    }
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const currentImage = selectedVariant?.image_url || product.image_url;
  const currentPrice = selectedVariant?.price_override || product.price;
  const currentDiscountPrice = selectedVariant?.price_override ? null : product.discount_price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div 
            className="aspect-square bg-zinc-100 rounded-3xl overflow-hidden relative cursor-zoom-in group"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsModalOpen(true)}
          >
            {currentDiscountPrice && (
              <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                SALE
              </div>
            )}
            
            <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-zinc-900 shadow-sm">
                <Maximize2 className="w-5 h-5" />
              </div>
            </div>

            <img
              src={currentImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? 'scale-150' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="aspect-square bg-zinc-100 rounded-xl overflow-hidden cursor-pointer border-2 border-zinc-900 transition-colors">
              <img src={currentImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {parsedVariants.filter(v => v.id !== selectedVariant?.id).slice(0, 3).map((v, i) => (
              <div key={v.id} onClick={() => setSelectedVariant(v)} className="aspect-square bg-zinc-100 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-zinc-900 transition-colors">
                <img src={v.image_url} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Fullscreen Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={currentImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm font-medium text-zinc-500 uppercase tracking-wider">{product.category}</div>
          <h1 className="text-4xl font-bold text-zinc-900 mb-4 tracking-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm text-zinc-500 underline cursor-pointer">{reviews.length} Reviews</span>
          </div>

          <div className="flex items-baseline gap-4 mb-8">
            {currentDiscountPrice ? (
              <>
                <span className="text-4xl font-bold text-zinc-900">₹{(currentDiscountPrice).toFixed(2)}</span>
                <span className="text-xl text-zinc-400 line-through">₹{(currentPrice).toFixed(2)}</span>
              </>
            ) : (
              <span className="text-4xl font-bold text-zinc-900">₹{(currentPrice).toFixed(2)}</span>
            )}
          </div>

          <p className="text-zinc-600 text-lg leading-relaxed mb-10">
            {product.description}
          </p>

          {/* Variant Selection */}
          {parsedVariants.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Select Option</h3>
              <div className="flex flex-wrap gap-3">
                {parsedVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-6 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                      selectedVariant?.id === v.id
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {v.name}
                    {selectedVariant?.id === v.id && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 mb-10">
            <div className="flex items-center border border-zinc-200 rounded-full bg-white p-1">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center font-medium text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
              >
                +
              </button>
            </div>
            
            <button
              onClick={() => addToCart({
                ...product,
                price: currentPrice,
                discount_price: currentDiscountPrice,
                image_url: currentImage,
                name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name
              }, quantity)}
              className="flex-1 bg-zinc-100 text-zinc-900 py-4 px-8 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            
            <button
              onClick={() => {
                addToCart({
                  ...product,
                  price: currentPrice,
                  discount_price: currentDiscountPrice,
                  image_url: currentImage,
                  name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name
                }, quantity);
                navigate('/checkout');
              }}
              className="flex-1 bg-zinc-900 text-white py-4 px-8 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Buy Now
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-900">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm">Free Delivery</div>
                <div className="text-xs text-zinc-500">2-4 business days</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-900">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-sm">2 Year Warranty</div>
                <div className="text-xs text-zinc-500">Full coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Related Products</h2>
            <Link to={`/products?category=${product.category}`} className="text-sm font-bold text-zinc-900 flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link 
                key={p.id} 
                to={`/product/${p.id}`}
                onClick={() => window.scrollTo(0, 0)}
                className="group"
              >
                <div className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden mb-4 border border-zinc-100 group-hover:shadow-md transition-all">
                  <img 
                    src={p.image_url} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-bold text-zinc-900 line-clamp-1 group-hover:text-zinc-600 transition-colors">{p.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {p.discount_price ? (
                    <>
                      <span className="font-bold text-zinc-900">₹{p.discount_price.toFixed(2)}</span>
                      <span className="text-sm text-zinc-400 line-through">₹{p.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="font-bold text-zinc-900">₹{p.price.toFixed(2)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="border-t border-zinc-200 pt-16">
        <h2 className="text-2xl font-bold text-zinc-900 mb-8">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {reviews.length === 0 ? (
              <p className="text-zinc-500 italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-zinc-100 pb-8 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-zinc-900">{review.user_name}</div>
                    <div className="text-sm text-zinc-500">{new Date(review.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-zinc-200 text-zinc-200'}`} />
                    ))}
                  </div>
                  <p className="text-zinc-600">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-zinc-50 p-8 rounded-3xl h-fit">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Rating</label>
                  <select 
                    value={newReview.rating} 
                    onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Comment</label>
                  <textarea 
                    required
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                    placeholder="Share your thoughts..."
                  />
                </div>
                <button type="submit" className="w-full bg-zinc-900 text-white font-medium py-3 rounded-xl hover:bg-zinc-800 transition-colors">
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-600 mb-4">Please sign in to write a review.</p>
                <button onClick={() => navigate('/login')} className="bg-white border border-zinc-200 text-zinc-900 font-medium py-2 px-6 rounded-full hover:bg-zinc-50 transition-colors">
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
