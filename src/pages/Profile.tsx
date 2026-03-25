import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { Package, MapPin, LogOut, ChevronRight } from 'lucide-react';

interface Order {
  id: number;
  total_amount: number;
  status: string;
  tracking_number: string;
  created_at: string;
}

export default function Profile() {
  const { user, token, logout, setUser } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
  // Structured address state
  const [addressFields, setAddressFields] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize address fields from user.address
    if (user.address) {
      const lines = user.address.split('\n');
      const street = lines[0] || '';
      const secondLine = lines[1] || '';
      
      // Try to parse "City, State Zip"
      const match = secondLine.match(/^(.+),\s*([A-Z]{2})\s*(\d{5})$/i);
      if (match) {
        setAddressFields({
          street,
          city: match[1],
          state: match[2],
          zip: match[3]
        });
      } else {
        // Fallback if format doesn't match
        setAddressFields({ street: user.address, city: '', state: '', zip: '' });
      }
    }

    fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, [user, token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveAddress = async () => {
    const formattedAddress = `${addressFields.street}\n${addressFields.city}, ${addressFields.state} ${addressFields.zip}`;
    
    const res = await fetch('/api/user/address', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ address: formattedAddress }),
    });

    if (res.ok) {
      setUser({ ...user!, address: formattedAddress }, token);
      setIsEditingAddress(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-zinc-900 text-white p-6 rounded-3xl mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold mb-1">{user.name}</h2>
            <p className="text-zinc-400 text-sm mb-6">{user.email}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <div className="bg-white border border-zinc-100 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-zinc-400" /> Saved Address
            </h3>
            {isEditingAddress ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={addressFields.street}
                  onChange={(e) => setAddressFields({ ...addressFields, street: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  placeholder="Street Address"
                />
                <input
                  type="text"
                  value={addressFields.city}
                  onChange={(e) => setAddressFields({ ...addressFields, city: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  placeholder="City"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={addressFields.state}
                    onChange={(e) => setAddressFields({ ...addressFields, state: e.target.value.toUpperCase().slice(0, 2) })}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    placeholder="State (e.g. CA)"
                  />
                  <input
                    type="text"
                    value={addressFields.zip}
                    onChange={(e) => setAddressFields({ ...addressFields, zip: e.target.value.slice(0, 5) })}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    placeholder="Zip Code"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveAddress} className="flex-1 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors">Save Address</button>
                  <button onClick={() => setIsEditingAddress(false)} className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-zinc-600 text-sm mb-3">
                  {user.address || 'No address saved yet.'}
                </p>
                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="text-sm font-medium text-zinc-900 underline hover:text-zinc-600 transition-colors"
                >
                  {user.address ? 'Edit Address' : 'Add Address'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Package className="w-6 h-6" /> Order History
          </h2>

          {orders.length === 0 ? (
            <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Package className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">No orders yet</h3>
              <p className="text-zinc-500 mb-6">When you place an order, it will appear here.</p>
              <Link to="/" className="bg-zinc-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-zinc-800 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-white border border-zinc-100 rounded-3xl p-6 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-zinc-900">Order #{order.id}</span>
                        <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-full">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-zinc-100">
                      <div className="text-right">
                        <p className="text-sm text-zinc-500 mb-0.5">Total</p>
                        <p className="font-bold text-zinc-900">₹{order.total_amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
