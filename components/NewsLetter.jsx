"use client"
import React, { useState } from "react";
import toast from "react-hot-toast";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      return toast.error("Please enter a valid email address!");
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      toast.success(
        <div>
          <span className="font-bold">Subscription Successful! 🎉</span>
          <br />
          We've sent your 20% discount code to <span className="font-semibold text-orange-600">{email}</span>!
        </div>,
        { duration: 5000 }
      );
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-3 pt-12 pb-20 max-w-4xl mx-auto">
      <h1 className="md:text-4xl text-2xl font-bold text-gray-800 tracking-tight">
        {subscribed ? "Welcome to the Family! 🎁" : "Subscribe now & get 20% off"}
      </h1>
      <p className="md:text-base text-gray-500 max-w-lg leading-relaxed">
        {subscribed
          ? "Check your inbox shortly for your exclusive 20% welcome discount code and early access to upcoming product launches!"
          : "Join our newsletter today! Get authentic tech reviews, premium gadget guides, and a 20% discount code sent straight to your inbox."}
      </p>

      {!subscribed ? (
        <form onSubmit={handleSubscribe} className="flex items-center justify-between w-full max-w-xl h-12 md:h-14 mt-4 shadow-sm border border-gray-300 rounded-xl overflow-hidden focus-within:border-orange-500 transition bg-white">
          <input
            className="outline-none w-full px-5 text-sm text-gray-700 bg-transparent"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="md:px-10 px-6 h-full text-white bg-orange-600 hover:bg-orange-700 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
      ) : (
        <div className="mt-4 px-6 py-2.5 bg-orange-50 text-orange-600 text-sm font-semibold rounded-xl border border-orange-200">
          Discount Code: <span className="font-mono text-base tracking-wider select-all ml-1 bg-white px-2 py-0.5 rounded shadow-sm border border-orange-100">NEXT20</span>
        </div>
      )}
    </div>
  );
};

export default NewsLetter;
