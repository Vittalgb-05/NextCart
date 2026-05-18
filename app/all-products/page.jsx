'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";

import { ProductSkeleton } from "@/components/Skeleton";

const AllProductsContent = () => {
    const { products, wishlist, isLoading } = useAppContext();
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchTerm = searchParams.get('search') || '';
    const filterType = searchParams.get('filter') || '';
    const [localQuery, setLocalQuery] = useState(searchTerm);
    
    // Filter & Sort State
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortOption, setSortOption] = useState('newest');

    const categories = Array.from(new Set(products.map(p => p.category)));

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const filteredAndSortedProducts = products
        .filter(product => {
            // Wishlist filter
            if (filterType === 'wishlist' && !wishlist.includes(product._id)) return false;
            
            // Search filter
            const query = searchTerm.toLowerCase();
            const matchesSearch = product.name.toLowerCase().includes(query) || 
                                product.category.toLowerCase().includes(query) || 
                                product.description.toLowerCase().includes(query);
            
            // Category filter
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortOption === 'price-low') return a.offerPrice - b.offerPrice;
            if (sortOption === 'price-high') return b.offerPrice - a.offerPrice;
            if (sortOption === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
            return b.date - a.date; // Newest
        });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.push(`/all-products?search=${encodeURIComponent(localQuery)}`);
    };

    return (
        <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 min-h-[80vh] w-full pb-20">
            
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full pt-12 pb-8 gap-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col items-start">
                    <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {filterType === 'wishlist' ? "Your Wishlist" : searchTerm ? `Results for "${searchTerm}"` : "Product Catalog"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{filteredAndSortedProducts.length} items found</p>
                </div>

                <form onSubmit={handleSearchSubmit} className="flex items-center w-full md:w-96 h-12 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 px-4 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition shadow-sm">
                    <input
                        type="text"
                        placeholder="Search products, categories..."
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        className="outline-none text-sm text-gray-700 dark:text-gray-300 w-full bg-transparent"
                    />
                    <button type="submit" className="text-gray-400 hover:text-orange-600 font-bold ml-2 transition">
                        🔍
                    </button>
                </form>
            </div>

            <div className="flex flex-col md:flex-row w-full gap-10 pt-8">
                
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Categories</p>
                        <div className="space-y-2.5">
                            {categories.map(cat => (
                                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="peer hidden" 
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => handleCategoryToggle(cat)}
                                        />
                                        <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 rounded-md peer-checked:bg-orange-600 peer-checked:border-orange-600 transition group-hover:border-orange-500"></div>
                                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 transition pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                    </div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 transition capitalize">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Sort By</p>
                        <select 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer"
                        >
                            <option value="newest">🆕 Newest Arrivals</option>
                            <option value="rating">⭐️ Top Rated</option>
                            <option value="price-low">📉 Price: Low to High</option>
                            <option value="price-high">📈 Price: High to Low</option>
                        </select>
                    </div>

                    {(selectedCategories.length > 0 || sortOption !== 'newest') && (
                        <button 
                            onClick={() => { setSelectedCategories([]); setSortOption('newest'); }}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 transition underline underline-offset-4"
                        >
                            Clear All Filters
                        </button>
                    )}
                </aside>
                
                {/* Products Grid */}
                <div className="flex-grow">
                    {isLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 w-full">
                            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : filteredAndSortedProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center w-full py-20 text-center space-y-4 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                            <span className="text-6xl">{filterType === 'wishlist' ? "❤️" : "🔍"}</span>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                {filterType === 'wishlist' ? "Your Wishlist is Empty" : "No Matches Found"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                                {filterType === 'wishlist'
                                    ? "Start exploring our catalog and save your favorites here!"
                                    : "We couldn't find anything matching your current filters. Try broadening your search or resetting categories."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 w-full">
                            {filteredAndSortedProducts.map((product, index) => <ProductCard key={index} product={product} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AllProducts = () => {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading product catalog...</div>}>
                <AllProductsContent />
            </Suspense>
            <Footer />
        </>
    );
};

export default AllProducts;
