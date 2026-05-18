"use client"
import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const featuredProductsData = [
  {
    id: 1,
    image: assets.girl_with_headphone_image,
    title: "Unparalleled Sound",
    description: "Experience crystal-clear audio with premium headphones.",
    keyword: "bose" // targets Bose QuietComfort 45
  },
  {
    id: 2,
    image: assets.girl_with_earphone_image,
    title: "Stay Connected",
    description: "Compact and stylish earphones for every occasion.",
    keyword: "sony" // targets Sony WF-1000XM5
  },
  {
    id: 3,
    image: assets.boy_with_laptop_image,
    title: "Power in Every Pixel",
    description: "Shop the latest laptops for work, gaming, and more.",
    keyword: "macbook" // targets MacBook Pro 16
  },
];

const FeaturedProduct = () => {
  const { products: dbProducts, router } = useAppContext();

  const handleProductRedirect = (keyword) => {
    if (dbProducts && dbProducts.length > 0) {
      const match = dbProducts.find(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
      if (match) {
        router.push(`/product/${match._id}`);
        return;
      }
    }
    // Fallback to catalog search page
    router.push(`/all-products?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium text-gray-800">Featured Products</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {featuredProductsData.map(({ id, image, title, description, keyword }) => (
          <div key={id} className="relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">
            <Image
              src={image}
              alt={title}
              className="group-hover:scale-105 group-hover:brightness-75 transition duration-500 w-full h-auto object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2.5">
              <p className="font-bold text-xl lg:text-2xl drop-shadow-md">{title}</p>
              <p className="text-xs lg:text-sm leading-5 max-w-60 text-gray-100 font-medium drop-shadow">
                {description}
              </p>
              <button 
                onClick={() => handleProductRedirect(keyword)} 
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 font-semibold px-4.5 py-2 text-xs rounded-full shadow-lg shadow-orange-600/20 transition active:scale-95"
              >
                Buy now <Image className="h-3 w-3" src={assets.redirect_icon} alt="Redirect Icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
