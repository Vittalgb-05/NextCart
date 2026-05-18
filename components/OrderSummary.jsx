"use client"
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount, getToken, user, cartItems, setCartItems } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);

  // Order recipient type: 'myself' or 'someone_else'
  const [orderType, setOrderType] = useState('myself');
  const [recipient, setRecipient] = useState({
    fullName: '',
    phoneNumber: '',
    pincode: '',
    area: '',
    city: '',
    state: ''
  });

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-address', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const handlePromoApply = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'NEXT20') {
      setDiscountPercent(20);
      setIsPromoApplied(true);
      toast.success("Promo code NEXT20 applied! 20% off your items! 🎫");
    } else if (promoCode.trim() === '') {
      toast.error("Please enter a promo code");
    } else {
      toast.error("Invalid Promo Code");
    }
  };

  const createOrder = async () => {
    try {
      if (!user) {
        return toast('Please login to place order', {
          icon: '⚠️',
        });
      }

      let cartItemsArray = Object.keys(cartItems).map((key) => ({ product: key, quantity: cartItems[key] }));
      cartItemsArray = cartItemsArray.filter(item => item.quantity > 0);

      if (cartItemsArray.length === 0) {
        return toast.error('Cart is empty');
      }

      let finalAddressId = null;
      const token = await getToken();

      // If ordering for someone else, create recipient address first
      if (orderType === 'someone_else') {
        if (!recipient.fullName || !recipient.phoneNumber || !recipient.pincode || !recipient.area || !recipient.city || !recipient.state) {
          return toast.error("Please fill in all recipient delivery details!");
        }

        const { data: addressRes } = await axios.post('/api/user/add-address', { address: recipient }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (addressRes.success) {
          finalAddressId = addressRes.newAddress._id;
        } else {
          return toast.error(addressRes.message);
        }
      } else {
        if (!selectedAddress) {
          return toast.error('Please select an address');
        }
        finalAddressId = selectedAddress._id;
      }

      // Create Order
      const { data } = await axios.post('/api/order/create', {
        address: finalAddressId,
        items: cartItemsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message);
        setCartItems({});
        router.push('/order-placed');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserAddresses();
    }
  }, [user]);

  // Price calculations with promo discount
  const subtotal = getCartAmount();
  const discountAmount = Math.floor((subtotal * discountPercent) / 100);
  const taxedAmount = Math.floor((subtotal - discountAmount) * 0.02);
  const totalAmount = subtotal - discountAmount + taxedAmount;

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5 rounded-2xl border border-gray-500/10">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-4" />
      
      <div className="space-y-5">
        {/* Order Type Toggle */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2.5">
            Who is this order for?
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType('myself')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                orderType === 'myself'
                  ? 'bg-orange-55 bg-orange-600 text-white border-orange-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              👤 For Myself
            </button>
            <button
              onClick={() => setOrderType('someone_else')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                orderType === 'someone_else'
                  ? 'bg-orange-55 bg-orange-600 text-white border-orange-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎁 Someone Else
            </button>
          </div>
        </div>

        {/* Address selection based on order type */}
        {orderType === 'myself' ? (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
              Select Delivery Address
            </label>
            <div className="relative inline-block w-full text-xs border rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                className="peer w-full text-left px-3.5 py-2.5 bg-white text-gray-700 focus:outline-none flex justify-between items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="truncate pr-4">
                  {selectedAddress
                    ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                    : "Select Address"}
                </span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-0" : "-rotate-90"}`}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#6B7280"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <ul className="absolute w-full bg-white border-t shadow-md z-10 py-1 max-h-48 overflow-y-auto">
                  {userAddresses.map((address, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition text-gray-700 truncate"
                      onClick={() => handleAddressSelect(address)}
                    >
                      {address.fullName}, {address.area}, {address.city}, {address.state}
                    </li>
                  ))}
                  <li
                    onClick={() => router.push("/add-address")}
                    className="px-4 py-2 bg-orange-50/50 hover:bg-orange-50 cursor-pointer text-center text-orange-600 font-bold border-t border-orange-100"
                  >
                    + Add New Address
                  </li>
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 bg-white p-3.5 border rounded-xl shadow-sm transition duration-300">
            <p className="text-xs font-bold text-gray-800 border-b pb-1.5 mb-2.5 flex items-center gap-1">
              <span>🎁</span> Recipient Delivery Details
            </p>
            <input
              className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-gray-700 placeholder-gray-400"
              type="text"
              placeholder="Recipient Full Name"
              value={recipient.fullName}
              onChange={(e) => setRecipient({...recipient, fullName: e.target.value})}
            />
            <input
              className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-gray-700 placeholder-gray-400"
              type="text"
              placeholder="Recipient Phone Number"
              value={recipient.phoneNumber}
              onChange={(e) => setRecipient({...recipient, phoneNumber: e.target.value})}
            />
            <input
              className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-gray-700 placeholder-gray-400"
              type="text"
              placeholder="Pin Code"
              value={recipient.pincode}
              onChange={(e) => setRecipient({...recipient, pincode: e.target.value})}
            />
            <textarea
              className="w-full text-xs px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-gray-700 placeholder-gray-400 resize-none"
              rows={2}
              placeholder="Area, Street and House Number"
              value={recipient.area}
              onChange={(e) => setRecipient({...recipient, area: e.target.value})}
            />
            <div className="flex gap-2">
              <input
                className="w-1/2 text-xs px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-gray-700 placeholder-gray-400"
                type="text"
                placeholder="City"
                value={recipient.city}
                onChange={(e) => setRecipient({...recipient, city: e.target.value})}
              />
              <input
                className="w-1/2 text-xs px-3 py-2 border rounded-lg outline-none focus:border-orange-500 text-gray-700 placeholder-gray-400"
                type="text"
                placeholder="State"
                value={recipient.state}
                onChange={(e) => setRecipient({...recipient, state: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* Promo code field */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
            Promo Code
          </label>
          <form onSubmit={handlePromoApply} className="flex gap-2 shadow-sm border rounded-lg overflow-hidden bg-white">
            <input
              type="text"
              placeholder="e.g. NEXT20"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={isPromoApplied}
              className="flex-grow text-xs outline-none px-3.5 py-2 text-gray-700 uppercase placeholder-gray-400 bg-transparent disabled:bg-gray-50"
            />
            <button 
              type="submit"
              disabled={isPromoApplied}
              className="bg-orange-600 text-white px-5 py-2 text-xs font-bold hover:bg-orange-700 transition disabled:bg-green-600"
            >
              {isPromoApplied ? "Applied ✓" : "Apply"}
            </button>
          </form>
        </div>

        <hr className="border-gray-500/20 my-3" />

        {/* Dynamic Billing Calculations */}
        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between font-medium text-gray-600">
            <p>Items ({getCartCount()})</p>
            <p className="text-gray-800">{currency}{subtotal}</p>
          </div>
          
          {isPromoApplied && (
            <div className="flex justify-between font-semibold text-green-600">
              <p>Promo Discount (20%)</p>
              <p>-{currency}{discountAmount}</p>
            </div>
          )}

          <div className="flex justify-between font-medium text-gray-600">
            <p>Shipping Fee</p>
            <p className="text-green-600 font-bold">FREE</p>
          </div>
          <div className="flex justify-between font-medium text-gray-600">
            <p>Tax (2%)</p>
            <p className="text-gray-800">{currency}{taxedAmount}</p>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-800 border-t border-gray-500/20 pt-3">
            <p>Total Amount</p>
            <p className="text-orange-600">{currency}{totalAmount}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={createOrder} 
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 mt-6 transition transform active:scale-[0.98]"
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;