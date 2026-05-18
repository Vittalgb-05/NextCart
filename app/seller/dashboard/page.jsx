'use client'
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Footer from "@/components/seller/Footer";

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex items-center gap-4 shadow-sm`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { getToken, user, currency } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setStats(data.stats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="md:p-10 p-4 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your store's performance</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Products" value={stats.totalProducts} icon="📦" color="bg-orange-100 dark:bg-orange-900/30" />
              <StatCard title="Total Users" value={stats.totalUsers} icon="👤" color="bg-blue-100 dark:bg-blue-900/30" />
              <StatCard title="Total Orders" value={stats.totalOrders} icon="🛒" color="bg-green-100 dark:bg-green-900/30" />
              <StatCard title="Total Revenue" value={`${currency}${stats.totalRevenue.toLocaleString()}`} icon="💰" color="bg-purple-100 dark:bg-purple-900/30" />
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockProducts?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <h2 className="text-base font-semibold text-red-700 dark:text-red-400 mb-3">⚠️ Low Stock Alert</h2>
                <div className="space-y-2">
                  {stats.lowStockProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${p.stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div>
              <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <a href="/seller" className="px-5 py-2.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition">+ Add Product</a>
                <a href="/seller/product-list" className="px-5 py-2.5 bg-gray-800 dark:bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-900 transition">Manage Products</a>
                <a href="/seller/orders" className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">View Orders</a>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No data available.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
