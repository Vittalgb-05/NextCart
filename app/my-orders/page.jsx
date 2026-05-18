'use client';
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  shipped:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const PAYMENT_COLORS = {
  pending: 'text-yellow-600',
  paid:    'text-green-600',
  failed:  'text-red-600',
};

const TIMELINE_STEPS = ['pending','paid','processing','shipped','delivered'];

const OrderTimeline = ({ currentStatus }) => {
  const idx = TIMELINE_STEPS.indexOf(currentStatus);
  if (currentStatus === 'cancelled') return (
    <div className="flex items-center gap-2 text-xs text-red-500 mt-3">
      <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
      Order Cancelled
    </div>
  );
  return (
    <div className="flex items-center gap-1 mt-3 overflow-x-auto">
      {TIMELINE_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-1 min-w-[52px]">
            <div className={`w-3 h-3 rounded-full border-2 transition-all ${i <= idx ? 'bg-orange-500 border-orange-500' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`} />
            <span className={`text-[9px] font-medium capitalize text-center ${i <= idx ? 'text-orange-600' : 'text-gray-400'}`}>{step}</span>
          </div>
          {i < TIMELINE_STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-3 min-w-[12px] transition-all ${i < idx ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const MyOrders = () => {
  const { currency, getToken, user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/order/list', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) { setOrders(data.orders.reverse()); setLoading(false); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { if (user) fetchOrders(); }, [user]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col px-6 md:px-16 lg:px-32 py-10 min-h-screen dark:bg-[#0a0a0a]">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">My Orders</h2>
        {loading ? <Loading /> : (
          <div className="space-y-4 max-w-4xl">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-4">📦</p>
                <p>No orders yet. Start shopping!</p>
              </div>
            ) : orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                {/* Order header */}
                <div className="flex flex-wrap items-start justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-10).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <span className={`text-xs font-medium capitalize ${PAYMENT_COLORS[order.paymentStatus] || 'text-gray-500'}`}>
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-5">
                  <div className="flex flex-wrap gap-3 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                        {item.image && <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />}
                        <div>
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{item.name}</p>
                          <p className="text-xs text-gray-400">x{item.quantity} · {currency}{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <OrderTimeline currentStatus={order.status} />

                  {/* Total + expand */}
                  <div className="flex items-center justify-between mt-4">
                    <p className="font-bold text-gray-800 dark:text-gray-100">{currency}{order.amount?.toFixed(2)}</p>
                    <button onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      className="text-xs text-orange-600 hover:underline">
                      {expandedOrder === order._id ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {expandedOrder === order._id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 text-sm">
                      {order.address && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Delivery Address</p>
                          <p className="text-gray-700 dark:text-gray-300">
                            {order.address.fullName}<br />
                            {order.address.area}, {order.address.city}, {order.address.state} — {order.address.pincode}<br />
                            {order.address.phoneNumber}
                          </p>
                        </div>
                      )}
                      {order.statusHistory?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status History</p>
                          <div className="space-y-1">
                            {[...order.statusHistory].reverse().map((s, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                                <span className="capitalize font-medium">{s.status}</span>
                                {s.note && <span className="text-gray-400">— {s.note}</span>}
                                <span className="ml-auto text-gray-400">{new Date(s.updatedAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;