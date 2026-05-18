"use client"
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 mb-20 space-y-16">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-sm font-medium tracking-wider text-orange-600 uppercase">Our Journey</p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 tracking-tight">
            Redefining Quick Commerce for <span className="text-orange-600">Electronics</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            Welcome to NextCart, India's premium destination for next-generation electronic items. We bridge the gap between premium tech dreams and instant fulfillment.
          </p>
        </div>

        {/* Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="bg-[#E6E9F2] rounded-2xl p-8 md:p-12 flex flex-col justify-center space-y-6 h-full min-h-[320px] shadow-sm">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              The NextCart Vision
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              At NextCart, we believe you shouldn't have to wait days to experience cutting-edge technology. Whether it's the crisp bass of new wireless headphones or the immersive performance of a MacBook Pro, we bring the future directly to your doorstep in hours.
            </p>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              Founded in 2025, our goal has been simple: premium authenticity, realistic and fair pricing, and absolute delivery speed that sets the benchmark globally.
            </p>
          </div>
          
          <div className="flex flex-col justify-center space-y-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800">Why Shop With Us?</h3>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl p-3 font-bold text-lg min-w-[48px]">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">100% Genuine Brands</h4>
                  <p className="text-gray-500 text-sm mt-1">Every item listed in our catalog comes straight from verified distributors with original warranties.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl p-3 font-bold text-lg min-w-[48px]">
                  ⚡
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">Ultra-Fast Safe Shipping</h4>
                  <p className="text-gray-500 text-sm mt-1">Our dynamic fulfillment system dispatches and delivers your favorite gadgets in pristine condition.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl p-3 font-bold text-lg min-w-[48px]">
                  🛡️
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">Instant Support & Secure Pay</h4>
                  <p className="text-gray-500 text-sm mt-1">Secure payment processes paired with instantaneous order-to-WhatsApp updates for full confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default About;
