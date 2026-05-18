'use client'
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";

const AllProductsContent = () => {
    const { products, wishlist } = useAppContext();
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchTerm = searchParams.get('search') || '';
    const filterType = searchParams.get('filter') || '';
    const [localQuery, setLocalQuery] = useState(searchTerm);

    const filteredProducts = products.filter(product => {
        if (filterType === 'wishlist' && !wishlist.includes(product._id)) {
            return false;
        }
        const query = searchTerm.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.push(`/all-products?search=${encodeURIComponent(localQuery)}`);
    };

    return (
        <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 min-h-[60vh] w-full">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full pt-12 gap-6">
                <div className="flex flex-col items-start">
                    <p className="text-2xl font-medium">
                        {filterType === 'wishlist' ? "Your Wishlist" : searchTerm ? `Search Results for "${searchTerm}"` : "All products"}
                    </p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1"></div>
                </div>

                {/* Local Search Input */}
                <form onSubmit={handleSearchSubmit} className="flex items-center w-full md:w-80 h-10 border border-gray-300 rounded-lg overflow-hidden bg-white px-3 focus-within:border-orange-500 transition">
                    <input
                        type="text"
                        placeholder="Search product catalog..."
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        className="outline-none text-sm text-gray-700 w-full"
                    />
                    <button type="submit" className="text-gray-500 hover:text-orange-600 font-bold ml-2">
                        🔍
                    </button>
                </form>
            </div>
            
            {/* Products Grid / Empty Fallback */}
            {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full py-20 text-center space-y-4">
                    <span className="text-5xl">{filterType === 'wishlist' ? "❤️" : "🔍"}</span>
                    <h3 className="text-xl font-semibold text-gray-800">
                        {filterType === 'wishlist' ? "Your Wishlist is Empty" : "No Products Found"}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-md">
                        {filterType === 'wishlist'
                            ? "You haven't liked any items yet. Browse our product catalog and tap the heart icon to save products here!"
                            : `We couldn't find any products matching "${searchTerm}". Try adjusting your spelling or searching for a different category.`}
                    </p>
                    {filterType === 'wishlist' && (
                        <button onClick={() => router.push('/all-products')} className="mt-4 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg text-sm transition">
                            Browse All Products
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-12 pb-14 w-full">
                    {filteredProducts.map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
            )}
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
