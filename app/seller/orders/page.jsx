'use client';
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const STATUSES = ['pending','paid','processing','shipped','delivered','cancelled'];

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700',
  paid:       'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

const Orders = () => {
  const { currency, getToken, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/order/seller-orders', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) { setOrders(data.orders.reverse()); setLoading(false); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const token = await getToken();
      const { data } = await axios.put('/api/order/update-status', { orderId, status }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      } else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
    finally { setUpdatingId(null); }
  };

  useEffect(() => { if (user) fetchOrders(); }, [user]);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || o._id.toLowerCase().includes(q) || o.address?.fullName?.toLowerCase().includes(q) || o.status.includes(q);
  });

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50 dark:bg-[#0a0a0a]">
      {loading ? <Loading /> : (
        <div className="md:p-10 p-4 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">All Orders <span className="text-sm font-normal text-gray-400">({orders.length})</span></h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage and update order statuses</p>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name, status..."
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm outline-none dark:bg-gray-800 dark:text-gray-100 w-64" />
          </div>

          <div className="space-y-4 max-w-5xl">
            {filtered.map(order => (
              <div key={order._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-mono text-xs text-gray-400">#{order._id.slice(-10).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</p>
                    {order.address && (
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{order.address.fullName} · {order.address.phoneNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                    <span className="text-xs text-gray-500">{order.paymentMethod} · <span className={order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.paymentStatus}</span></span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{currency}{order.amount?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Items */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 py-1.5 text-xs">
                        {item.image && <img src={item.image} alt={item.name} className="w-7 h-7 object-cover rounded" />}
                        <span className="text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{item.name}</span>
                        <span className="text-gray-400">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  {order.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{order.address.area}, {order.address.city}, {order.address.state} — {order.address.pincode}</p>
                  )}

                  {/* Status Update */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Update Status:</label>
                    <select
                      value={order.status}
                      disabled={updatingId === order._id}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 cursor-pointer"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    {updatingId === order._id && <span className="text-xs text-orange-500 animate-pulse">Updating...</span>}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No orders found.</p>}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Orders;