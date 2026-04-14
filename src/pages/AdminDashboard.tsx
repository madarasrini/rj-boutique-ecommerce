import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { motion } from 'motion/react';
import { Package, Users, IndianRupee, ShoppingBag, CheckCircle, Clock, Truck, ChevronRight, Plus, Trash2, Edit2, Save, X, Search, Download, Filter } from 'lucide-react';

import { generateAdminInsights } from '../lib/gemini';

interface Order {
  id: number;
  user_name: string;
  user_email: string;
  total_amount: number;
  status: string;
  tracking_number: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  category: string;
  image_url: string;
  stock: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  address: string | null;
  is_admin: number;
  blocked: number;
  created_at: string;
}

interface Stats {
  users: number;
  orders: number;
  revenue: number;
  topSelling: any[];
  mostSearched: any[];
}

export default function AdminDashboard() {
  const { token, user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'users' | 'analytics'>('orders');
  
  // Order Filtering and Export State
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('All');
  const [orderFilterStartDate, setOrderFilterStartDate] = useState<string>('');
  const [orderFilterEndDate, setOrderFilterEndDate] = useState<string>('');

  // Product Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    discount_price: null,
    category: 'Electronics',
    image_url: '',
    stock: 100
  });

  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const fetchAIInsights = async (topSelling: any[], allProducts: any[]) => {
    if (topSelling.length === 0 || allProducts.length === 0) return;
    setIsLoadingInsights(true);
    try {
      const insights = await generateAdminInsights(topSelling, allProducts);
      setAiInsights(insights || "No insights generated.");
    } catch (err) {
      setAiInsights("Unable to load AI insights.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const [isSeeding, setIsSeeding] = useState(false);

  const seedDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/admin/seed-demo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Demo data seeded successfully! Refreshing...');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (!user?.is_admin) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [ordersRes, analyticsRes, productsRes, usersRes] = await Promise.all([
          fetch('/api/admin/orders', { headers }),
          fetch('/api/admin/analytics', { headers }),
          fetch('/api/products?limit=1000'),
          fetch('/api/admin/users', { headers })
        ]);

        let fetchedProducts: any[] = [];
        let fetchedStats: any = null;

        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (analyticsRes.ok) {
          fetchedStats = await analyticsRes.json();
          setStats(fetchedStats);
        }
        if (productsRes.ok) {
          fetchedProducts = await productsRes.json();
          setProducts(fetchedProducts);
        }
        if (usersRes.ok) setUsers(await usersRes.json());

        if (fetchedStats?.topSelling && fetchedProducts.length > 0) {
          fetchAIInsights(fetchedStats.topSelling, fetchedProducts);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  const toggleBlockUser = async (userId: number, currentBlocked: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blocked: !currentBlocked })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, blocked: currentBlocked ? 0 : 1 } : u));
      }
    } catch (error) {
      console.error('Error toggling block:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  const handleAddProduct = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        const created = await res.json();
        setProducts([...products, created]);
        setIsAddingProduct(false);
        setNewProduct({ name: '', description: '', price: 0, discount_price: null, category: 'Electronics', image_url: '', stock: 100 });
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleExportCSV = () => {
    const filteredOrders = orders.filter(order => {
      const statusMatch = orderFilterStatus === 'All' || order.status === orderFilterStatus;
      const orderDate = new Date(order.created_at);
      const startMatch = !orderFilterStartDate || orderDate >= new Date(orderFilterStartDate);
      const endMatch = !orderFilterEndDate || orderDate <= new Date(orderFilterEndDate + 'T23:59:59');
      return statusMatch && startMatch && endMatch;
    });

    if (filteredOrders.length === 0) {
      alert('No orders found for the selected filters.');
      return;
    }

    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Amount (INR)', 'Status', 'Tracking Number', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(o => [
        o.id,
        `"${o.user_name.replace(/"/g, '""')}"`,
        o.user_email,
        o.total_amount,
        o.status,
        o.tracking_number || 'N/A',
        new Date(o.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-zinc-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.revenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Orders', value: stats?.orders || 0, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Admin Dashboard</h1>
        <p className="text-zinc-500">Manage orders, view stats, and monitor store performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
            <div className="text-sm text-zinc-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Section */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 text-white p-8 rounded-3xl mb-12 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">AI Business Insights</span>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{aiInsights}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-zinc-100 pb-px">
        {[
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: CheckCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters and Export */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status
              </label>
              <select
                value={orderFilterStatus}
                onChange={(e) => setOrderFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex-1 min-w-[150px] space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Start Date</label>
              <input
                type="date"
                value={orderFilterStartDate}
                onChange={(e) => setOrderFilterStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none text-sm"
              />
            </div>
            <div className="flex-1 min-w-[150px] space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">End Date</label>
              <input
                type="date"
                value={orderFilterEndDate}
                onChange={(e) => setOrderFilterEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none text-sm"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2 h-[42px]"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900">Recent Orders</h2>
              <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full">
                {orders.filter(order => {
                  const statusMatch = orderFilterStatus === 'All' || order.status === orderFilterStatus;
                  const orderDate = new Date(order.created_at);
                  const startMatch = !orderFilterStartDate || orderDate >= new Date(orderFilterStartDate);
                  const endMatch = !orderFilterEndDate || orderDate <= new Date(orderFilterEndDate + 'T23:59:59');
                  return statusMatch && startMatch && endMatch;
                }).length} Filtered
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {orders
                    .filter(order => {
                      const statusMatch = orderFilterStatus === 'All' || order.status === orderFilterStatus;
                      const orderDate = new Date(order.created_at);
                      const startMatch = !orderFilterStartDate || orderDate >= new Date(orderFilterStartDate);
                      const endMatch = !orderFilterEndDate || orderDate <= new Date(orderFilterEndDate + 'T23:59:59');
                      return statusMatch && startMatch && endMatch;
                    })
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">#{order.id}</div>
                          <div className="text-xs text-zinc-400 font-mono">{order.tracking_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{order.user_name}</div>
                          <div className="text-xs text-zinc-500">{order.user_email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-900">
                          ₹{order.total_amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {order.status === 'Delivered' ? <CheckCircle className="w-3 h-3" /> :
                             order.status === 'Shipped' ? <Truck className="w-3 h-3" /> :
                             <Clock className="w-3 h-3" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-zinc-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-900">Product Management</h2>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {isAddingProduct && (
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Product Name"
                  className="px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
                <input
                  placeholder="Category"
                  className="px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                />
                <input
                  type="number"
                  placeholder="Stock"
                  className="px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  value={newProduct.stock}
                  onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                />
                <input
                  placeholder="Image URL"
                  className="px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 md:col-span-2"
                  value={newProduct.image_url}
                  onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                />
                <textarea
                  placeholder="Description"
                  className="px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 md:col-span-2"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddingProduct(false)} className="px-4 py-2 text-sm font-bold text-zinc-500">Cancel</button>
                <button onClick={handleAddProduct} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold">Save Product</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-medium text-zinc-900">{p.name}</div>
                            <div className="text-xs text-zinc-500 truncate max-w-[200px]">{p.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{p.category}</td>
                      <td className="px-6 py-4 font-bold text-zinc-900">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-sm text-zinc-500">{p.stock}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="p-2 text-zinc-400 hover:text-blue-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-900">User Management</h2>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full">
              {users.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900">{u.name}</div>
                      <div className="text-xs text-zinc-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {u.is_admin ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.blocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!u.is_admin && (
                          <>
                            <button
                              onClick={() => toggleBlockUser(u.id, u.blocked)}
                              className={`p-2 rounded-lg transition-colors ${
                                u.blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-orange-600 hover:bg-orange-50'
                              }`}
                              title={u.blocked ? 'Unblock' : 'Block'}
                            >
                              {u.blocked ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Selling Products */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">Top Selling Products</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {stats?.topSelling.map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900">{item.name}</div>
                      <div className="text-xs text-zinc-500">{item.total_sold} units sold</div>
                    </div>
                  </div>
                  <div className="font-bold text-zinc-900">₹{(item.revenue || 0).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Searched Queries */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900">Most Searched Queries</h2>
              <button
                onClick={seedDemoData}
                disabled={isSeeding}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {isSeeding ? 'Seeding...' : 'Seed Demo Orders'}
              </button>
            </div>
            <div className="divide-y divide-zinc-100">
              {stats?.mostSearched.map((item, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Search className="w-4 h-4 text-zinc-400" />
                    <div className="font-medium text-zinc-900">{item.query}</div>
                  </div>
                  <div className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                    {item.count} searches
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-zinc-900">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Name</label>
                <input
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Category</label>
                <input
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Price (₹)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700">Stock</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                  value={editingProduct.stock}
                  onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-zinc-700">Image URL</label>
                <input
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                  value={editingProduct.image_url}
                  onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-zinc-700">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-zinc-900 outline-none"
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-6 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="flex-1 px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
