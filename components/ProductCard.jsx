import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {
    const { currency, router, wishlist, toggleWishlist } = useAppContext();

    const rating = product.averageRating || 0;
    const reviewsCount = product.reviewCount || 0;
    const starCount = Math.round(rating);
    
    const isLiked = wishlist ? wishlist.includes(product._id) : false;

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-1 max-w-[200px] w-full cursor-pointer group bg-white dark:bg-[#111111] border border-gray-100 dark:border-gray-800 p-2.5 rounded-xl hover:shadow-md transition duration-300"
        >
            <div className="cursor-pointer relative bg-gray-500/5 dark:bg-gray-800/30 rounded-lg w-full h-48 flex items-center justify-center overflow-hidden">
                <Image
                    src={product.image[0]}
                    alt={product.name}
                    className="group-hover:scale-105 transition duration-300 object-contain w-[90%] h-[90%]"
                    width={800}
                    height={800}
                />
                
                {/* Wishlist Toggle Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product._id);
                    }}
                    className="absolute top-2 right-2 bg-white/95 dark:bg-gray-800/90 p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition"
                >
                    {isLiked ? (
                        <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                    )}
                </button>
            </div>

            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 pt-1.5 w-full truncate">{product.name}</p>
            <p className="w-full text-xs text-gray-500/80 dark:text-gray-400 max-sm:hidden truncate">{product.description}</p>
            
            {/* Dynamic unique rating badges */}
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1 rounded">{rating}</span>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-2.5 w-2.5"
                            src={
                                index < starCount
                                    ? assets.star_icon
                                    : assets.star_dull_icon
                            }
                            alt="star_icon"
                        />
                    ))}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">({reviewsCount})</span>
            </div>

            {/* Dynamic original and offer prices */}
            <div className="flex items-center justify-between w-full mt-1.5 pt-1 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{currency}{product.offerPrice}</span>
                    {product.price > product.offerPrice && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 line-through font-normal">{currency}{product.price}</span>
                    )}
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/product/' + product._id);
                    }}
                    className="max-sm:hidden px-3 py-1 text-orange-600 border border-orange-500/20 rounded-full text-[10px] font-semibold hover:bg-orange-50 transition"
                >
                    Buy now
                </button>
            </div>
        </div>
    )
}

export default ProductCard