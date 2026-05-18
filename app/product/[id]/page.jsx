"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import { useClerk } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

const Product = () => {

    const { id } = useParams();

    const { products, router, addToCart, user, currency, getToken } = useAppContext()
    const { openSignIn } = useClerk()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProductData = async () => {
        const product = products.find(product => product._id === id);
        setProductData(product);
    }

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`/api/product/review?productId=${id}`);
            if (data.success) setReviews(data.reviews);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return openSignIn();
        
        setIsSubmitting(true);
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/product/review', 
                { productId: id, ...newReview }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success("Review submitted! 🎉");
                setNewReview({ rating: 5, comment: '' });
                fetchReviews();
                // Optionally refresh product data to update avg rating
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        fetchProductData();
        fetchReviews();
    }, [id, products.length])

    const relatedProducts = products.filter(p => p.category === productData?.category && p._id !== id).slice(0, 5);

    return productData ? (<>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
            {/* ... product detail grid ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Rest of the detail UI remains same, adding it back correctly */}
                <div className="px-5 lg:px-16 xl:px-20">
                    <div className="rounded-lg overflow-hidden bg-gray-500/10 dark:bg-gray-800/30 mb-4 flex items-center justify-center h-[400px]">
                        <Image
                            src={mainImage || productData.image[0]}
                            alt="alt"
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                            width={1280}
                            height={720}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {productData.image.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(image)}
                                className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 dark:bg-gray-800/30 flex items-center justify-center h-24 border-2 transition ${mainImage === image ? 'border-orange-500' : 'border-transparent'}`}
                            >
                                <Image
                                    src={image}
                                    alt="alt"
                                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal p-2"
                                    width={1280}
                                    height={720}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h1 className="text-3xl font-medium text-gray-800/90 dark:text-gray-100 mb-4">
                        {productData.name}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, index) => (
                                <Image 
                                    key={index}
                                    className="h-4 w-4" 
                                    src={index < Math.round(productData.averageRating) ? assets.star_icon : assets.star_dull_icon} 
                                    alt="star_icon" 
                                />
                            ))}
                        </div>
                        <p className="dark:text-gray-300 text-sm font-medium">({productData.averageRating || 0}) <span className="text-gray-500 font-normal ml-1">· {productData.reviewCount || 0} Reviews</span></p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm leading-relaxed">
                        {productData.description}
                    </p>
                    <p className="text-3xl font-medium mt-6 dark:text-white">
                        {currency}{productData.offerPrice}
                        <span className="text-base font-normal text-gray-800/60 dark:text-gray-500 line-through ml-2">
                            {currency}{productData.price}
                        </span>
                    </p>
                    <hr className="bg-gray-600/20 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody className="text-sm">
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium py-1.5">Brand</td>
                                    <td className="text-gray-800/50 dark:text-gray-500">Generic</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium py-1.5">Category</td>
                                    <td className="text-gray-800/50 dark:text-gray-500">{productData.category}</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium py-1.5">Stock</td>
                                    <td className={productData.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                        {productData.stock > 0 ? "In Stock" : "Out of Stock"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center mt-10 gap-4">
                        <button onClick={() => { if (!user) { openSignIn(); } else { addToCart(productData._id); } }} disabled={productData.stock <= 0} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-800/80 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium rounded-lg disabled:opacity-50">
                            Add to Cart
                        </button>
                        <button onClick={async () => { if (!user) { openSignIn(); } else { await addToCart(productData._id); router.push('/cart'); } }} disabled={productData.stock <= 0} className="w-full py-4 bg-orange-600 text-white hover:bg-orange-700 transition font-medium rounded-lg shadow-lg shadow-orange-500/20 disabled:opacity-50">
                            Buy now
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="pt-16 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left: Review Summary & Form */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Customer Reviews</h2>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mb-8">
                            <div className="flex items-center gap-4 mb-4">
                                <p className="text-5xl font-bold text-gray-800 dark:text-gray-100">{productData.averageRating || 0}</p>
                                <div>
                                    <div className="flex gap-0.5 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Image key={i} className="h-4 w-4" src={i < Math.round(productData.averageRating) ? assets.star_icon : assets.star_dull_icon} alt="star" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Based on {productData.reviewCount || 0} reviews</p>
                                </div>
                            </div>
                        </div>

                        {user ? (
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Write a Review</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button key={num} type="button" onClick={() => setNewReview({ ...newReview, rating: num })} className={`p-2 rounded-lg border transition ${newReview.rating === num ? 'bg-orange-600 text-white border-orange-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 hover:border-orange-500'}`}>
                                                {num} ⭐
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Your Review</label>
                                    <textarea 
                                        rows="4" 
                                        className="w-full p-3 rounded-xl border dark:bg-gray-900 dark:border-gray-800 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm" 
                                        placeholder="Share your thoughts about this product..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition disabled:opacity-50">
                                    {isSubmitting ? "Submitting..." : "Post Review"}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30 text-center">
                                <p className="text-gray-700 dark:text-orange-200 text-sm mb-4">Please login to write a review</p>
                                <button onClick={() => openSignIn()} className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm hover:bg-orange-700 transition">Sign In</button>
                            </div>
                        )}
                    </div>

                    {/* Right: Reviews List */}
                    <div className="lg:col-span-2">
                        {reviews.length > 0 ? (
                            <div className="space-y-8">
                                {reviews.map((review, i) => (
                                    <div key={i} className="pb-8 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <Image src={review.userImage} alt={review.userName} width={40} height={40} className="rounded-full" />
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-100">{review.userName}</p>
                                                    <div className="flex gap-0.5 mt-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Image key={i} className="h-3 w-3" src={i < review.rating ? assets.star_icon : assets.star_dull_icon} alt="star" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-3xl">
                                <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="flex flex-col items-center pt-20">
                <div className="flex flex-col items-center mb-8">
                    <p className="text-3xl font-bold dark:text-gray-100">You May Also <span className="text-orange-600">Like</span></p>
                    <div className="w-20 h-1 bg-orange-600 mt-2 rounded-full"></div>
                </div>
                {relatedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full mb-20">
                        {relatedProducts.map((product, index) => <ProductCard key={index} product={product} />)}
                    </div>
                ) : (
                    <p className="text-gray-500 mb-20">No related products found in this category.</p>
                )}
            </div>
        </div>
        <Footer />
    </>
    ) : <Loading />
};

export default Product;