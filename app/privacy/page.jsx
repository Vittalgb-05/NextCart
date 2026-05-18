"use client"
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 mb-20 space-y-12">
        
        {/* Header Title */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-sm font-medium tracking-wider text-orange-600 uppercase">Legal & Protection</p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 tracking-tight">
            Privacy <span className="text-orange-600">Policy</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            At NextCart, we value your trust. This policy describes how we collect, protect, and use your personal information.
          </p>
        </div>

        {/* Content Body */}
        <div className="max-w-4xl mx-auto bg-white border border-gray-500/10 rounded-2xl p-8 md:p-12 shadow-sm space-y-8 text-gray-700">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">1. Information We Collect</h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-650">
              We collect information you provide directly to us when creating an account, making a purchase, subscribing to our coupon newsletter, or sending us a support message. This includes your name, email address, phone number, and physical billing/shipping addresses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">2. How We Use Your Information</h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-650">
              Your information is utilized solely to process your orders, maintain secure authenticated sessions via Clerk, improve search catalogs, manage your wishlist locally, and deliver order confirmation notifications or support responses.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">3. Data Security & Storage</h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-650">
              We store database logs securely via fully encrypted MongoDB Atlas clusters. We do not store or see credit card credentials directly. All transactions are routed through secure industry-standard endpoints.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">4. Your Control Over Data</h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-650">
              You maintain complete control over your data. You may update your user profile metadata, edit shipping configurations, or delete saved addresses at any time directly through the NextCart user dashboard settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">5. Updates to This Policy</h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-650">
              We reserve the right to modify this privacy policy as our storefront features expand. Any updates will be logged on this page with the corresponding revision timestamps.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-gray-500">
            <p>Last Revised: May 2026</p>
            <p>Compliance Officer: Vittal Bhajantri</p>
          </div>

        </div>

      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
