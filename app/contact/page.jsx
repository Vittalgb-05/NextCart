"use client"
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";

import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const loadToast = toast.loading("Sending your message...");

    try {
      const { data } = await axios.post("/api/contact", formData);
      toast.dismiss(loadToast);

      if (data.success) {
        toast.success("Thank you! Your message has been received successfully.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.dismiss(loadToast);
      toast.error(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 mb-20 space-y-16">
        
        {/* Header Title */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-sm font-medium tracking-wider text-orange-600 uppercase">Get In Touch</p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 tracking-tight">
            We’d Love to Hear From <span className="text-orange-600">You</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            Have questions about a product, order status, or seller details? Reach out to us and our support team will respond instantly.
          </p>
        </div>

        {/* Contact Body */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Contact Details Card (2/5 cols) */}
          <div className="lg:col-span-2 space-y-8 h-full bg-[#E6E9F2] rounded-2xl p-8 md:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800">Contact Information</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Reach out directly via phone or email, or drop by our technical headquarters. We typically respond within 1-2 hours.
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center bg-white text-orange-600 rounded-xl p-3 text-xl w-12 h-12 shadow-sm">
                  📞
                </div>
                <div>
                  <p className="text-xs text-gray-500/80 font-medium uppercase tracking-wider">Phone</p>
                  <p className="font-semibold text-gray-850 text-base">{process.env.NEXT_PUBLIC_CONTACT_PHONE || '+91-98765-43210'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center bg-white text-orange-600 rounded-xl p-3 text-xl w-12 h-12 shadow-sm">
                  ✉️
                </div>
                <div>
                  <p className="text-xs text-gray-500/80 font-medium uppercase tracking-wider">Email Address</p>
                  <p className="font-semibold text-gray-850 text-base">{process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@nextcart.in'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center bg-white text-orange-600 rounded-xl p-3 text-xl w-12 h-12 shadow-sm">
                  📍
                </div>
                <div>
                  <p className="text-xs text-gray-500/80 font-medium uppercase tracking-wider">Headquarters</p>
                  <p className="font-semibold text-gray-850 text-sm">
                    NextCart Tech Tower, Indiranagar, Bengaluru, KA 560038, India
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-400/20 pt-6 mt-6">
              <p className="text-xs text-gray-500/80 font-medium uppercase tracking-wider mb-3">Work Hours</p>
              <p className="text-sm font-semibold text-gray-700">Monday - Saturday: 09:00 AM - 07:00 PM IST</p>
              <p className="text-xs text-orange-600 mt-1">Order deliveries run 24/7!</p>
            </div>
          </div>

          {/* Interactive Form Card (3/5 cols) */}
          <div className="lg:col-span-3 border border-gray-500/20 rounded-2xl p-8 md:p-10 bg-white shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="name">Your Name <span className="text-orange-600">*</span></label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Enter your name"
                    className="border border-gray-500/20 rounded-lg py-3 px-4 outline-none focus:border-orange-500 transition text-gray-700"
                    required
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="email">Email Address <span className="text-orange-600">*</span></label>
                  <input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Enter your email"
                    className="border border-gray-500/20 rounded-lg py-3 px-4 outline-none focus:border-orange-500 transition text-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  type="text"
                  placeholder="How can we help you?"
                  className="border border-gray-500/20 rounded-lg py-3 px-4 outline-none focus:border-orange-500 transition text-gray-700"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="message">Message <span className="text-orange-600">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you need..."
                  rows="5"
                  className="border border-gray-500/20 rounded-lg py-3 px-4 outline-none focus:border-orange-500 transition text-gray-700 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-10 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>

      </div>
      <Footer />
    </>
  );
};

export default Contact;
