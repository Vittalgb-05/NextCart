"use client"
import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const Banner = () => {
  const { products, router } = useAppContext();

  const handleProductRedirect = () => {
    if (products && products.length > 0) {
      const match = products.find(p => p.name.toLowerCase().includes("playstation"));
      if (match) {
        router.push(`/product/${match._id}`);
        return;
      }
    }
    // Fallback if not loaded
    router.push('/all-products?search=playstation');
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between md:pl-20 py-14 md:py-0 bg-[#E6E9F2] my-16 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">
      <Image
        className="max-w-56 hover:scale-105 transition duration-500 cursor-pointer"
        onClick={handleProductRedirect}
        src={assets.jbl_soundbox_image}
        alt="jbl_soundbox_image"
      />
      <div className="flex flex-col items-center justify-center text-center space-y-2.5 px-4 md:px-0 py-8 md:py-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 max-w-[290px]">
          Level Up Your Gaming Experience
        </h2>
        <p className="max-w-[343px] font-semibold text-gray-500 text-sm">
          From immersive sound to precise controls—everything you need to win
        </p>
        <button 
          onClick={handleProductRedirect} 
          className="group flex items-center justify-center gap-1.5 px-12 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-lg shadow-orange-600/10 transition active:scale-95"
        >
          Buy now
          <Image className="group-hover:translate-x-1 transition w-3.5 h-3.5" src={assets.arrow_icon_white} alt="arrow_icon_white" />
        </button>
      </div>
      <Image
        className="hidden md:block max-w-80 cursor-pointer hover:translate-x-1 transition duration-500"
        onClick={handleProductRedirect}
        src={assets.md_controller_image}
        alt="md_controller_image"
      />
      <Image
        className="md:hidden cursor-pointer"
        onClick={handleProductRedirect}
        src={assets.sm_controller_image}
        alt="sm_controller_image"
      />
    </div>
  );
};

export default Banner;