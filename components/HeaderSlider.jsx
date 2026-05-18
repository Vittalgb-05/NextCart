"use client"
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const HeaderSlider = () => {
  const router = useRouter();
  const { products } = useAppContext();

  const sliderData = [
    {
      id: 1,
      title: "Experience Pure Sound - Your Perfect Headphones Awaits!",
      offer: "Limited Time Offer 30% Off",
      buttonText1: "Buy now",
      buttonText2: "Find more",
      imgSrc: assets.header_headphone_image,
      keyword: "Bose" // links directly to Bose QuietComfort over-ear headphones
    },
    {
      id: 2,
      title: "Next-Level Gaming Starts Here - Discover PlayStation 5 Today!",
      offer: "Hurry up only few lefts!",
      buttonText1: "Shop Now",
      buttonText2: "Explore Deals",
      imgSrc: assets.header_playstation_image,
      keyword: "playstation" // links directly to PlayStation 5
    },
    {
      id: 3,
      title: "Power Meets Elegance - Apple MacBook Pro is Here for you!",
      offer: "Exclusive Deal 40% Off",
      buttonText1: "Order Now",
      buttonText2: "Learn More",
      imgSrc: assets.header_macbook_image,
      keyword: "macbook" // links directly to MacBook Pro 16
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const handleProductRedirect = (keyword) => {
    if (products && products.length > 0) {
      const match = products.find(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
      if (match) {
        router.push(`/product/${match._id}`);
        return;
      }
    }
    // Fallback if the database is still loading or product isn't added yet
    router.push('/all-products');
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1 font-semibold">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-bold text-gray-800">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6 ">
                <button 
                  onClick={() => handleProductRedirect(slide.keyword)} 
                  className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium hover:bg-orange-700 transition shadow-md shadow-orange-600/10 active:scale-95"
                >
                  {slide.buttonText1}
                </button>
                <button 
                  onClick={() => router.push('/all-products')} 
                  className="group flex items-center gap-2 px-6 py-2.5 font-medium hover:text-orange-600 transition"
                >
                  {slide.buttonText2}
                  <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon} alt="arrow_icon" />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48 object-contain hover:scale-105 transition duration-500 cursor-pointer"
                onClick={() => handleProductRedirect(slide.keyword)}
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2.5 w-2.5 rounded-full cursor-pointer transition ${
              currentSlide === index ? "bg-orange-600 w-6" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
