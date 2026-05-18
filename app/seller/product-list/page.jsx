'use client'
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const CATEGORIES = ['Earphone', 'Headphone', 'Watch', 'Smartphone', 'Laptop', 'Camera', 'Accessories'];

// ─── Inline Edit Modal ─────────────────────────────────────────────────────────
const EditModal = ({ product, onClose, onSave, currency }) => {
  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    offerPrice: product.offerPrice,
    stock: product.stock ?? 0,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(product._id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold dark:text-gray-100">Edit Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dark:text-gray-300">Product Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dark:text-gray-300">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none resize-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-gray-300">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-gray-300">Stock Qty</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-gray-300">Price ({currency})</label>
              <input name="price" type="number" value={form.price} onChange={handleChange} className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dark:text-gray-300">Offer Price ({currency})</label>
              <input name="offerPrice" type="number" value={form.offerPrice} onChange={handleChange} className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition">Save Changes</button>
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Stock Badge ────────────────────────────────────────────────────────────────
const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full font-medium">Out of Stock</span>;
  if (stock <= 5) return <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-full font-medium">Low ({stock})</span>;
  return <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full font-medium">In Stock ({stock})</span>;
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const ProductList = () => {
  const { router, getToken, user, currency } = useAppContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/product/seller-list', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setProducts(data.products);
        setLoading(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    setDeletingId(productId);
    try {
      const token = await getToken();
      const { data } = await axios.delete('/api/product/delete', {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId }
      });
      if (data.success) {
        toast.success(data.message);
        setProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEdit = async (productId, form) => {
    try {
      const token = await getToken();
      const { data } = await axios.put('/api/product/update', { productId, ...form }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success("Product updated!");
        setProducts(prev => prev.map(p => p._id === productId ? { ...p, ...form } : p));
        setEditingProduct(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) fetchSellerProduct();
  }, [user]);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50 dark:bg-[#0a0a0a]">
      {editingProduct && (
        <EditModal
          product={editingProduct}
          currency={currency}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveEdit}
        />
      )}
      {loading ? <Loading /> : (
        <div className="w-full md:p-10 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">All Products <span className="text-sm font-normal text-gray-400">({products.length})</span></h2>
            <button onClick={() => router.push('/seller')} className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition">+ Add Product</button>
          </div>
          <div className="flex flex-col items-center max-w-5xl w-full overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider text-left">
                <tr>
                  <th className="w-2/5 px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium max-sm:hidden">Category</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600 dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5 flex-shrink-0">
                        <Image src={product.image[0]} alt={product.name} className="w-12 h-12 object-cover rounded" width={48} height={48} />
                      </div>
                      <span className="truncate font-medium dark:text-gray-100">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                    <td className="px-4 py-3"><StockBadge stock={product.stock ?? 0} /></td>
                    <td className="px-4 py-3 font-medium">{currency}{product.offerPrice}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition font-medium disabled:opacity-50"
                        >
                          {deletingId === product._id ? '...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No products found. Add your first product!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;