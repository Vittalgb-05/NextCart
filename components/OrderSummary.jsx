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
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isLoading, setIsLoading] = useState(false);

  const [orderType, setOrderType] = useState('myself');
  const [recipient, setRecipient] = useState({ fullName: '', phoneNumber: '', pincode: '', area: '', city: '', state: '' });
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  const fetchUserAddresses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-address', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setUserAddresses(data.addresses);
        if (data.addresses.length > 0) setSelectedAddress(data.addresses[0]);
      } else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const handlePromoApply = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'NEXT20') {
      setDiscountPercent(20); setIsPromoApplied(true);
      toast.success("Promo code NEXT20 applied! 20% off! 🎫");
    } else if (!promoCode.trim()) toast.error("Please enter a promo code");
    else toast.error("Invalid Promo Code");
  };

  const getAddressId = async (token) => {
    if (orderType === 'someone_else') {
      if (!recipient.fullName || !recipient.phoneNumber || !recipient.pincode || !recipient.area || !recipient.city || !recipient.state) {
        toast.error("Please fill in all recipient delivery details!"); return null;
      }
      const { data } = await axios.post('/api/user/add-address', { address: recipient }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) return data.newAddress._id;
      toast.error(data.message); return null;
    }
    if (!selectedAddress) { toast.error('Please select an address'); return null; }
    return selectedAddress._id;
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleRazorpayPayment = async (cartItemsArray, addressId, token) => {
    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Failed to load Razorpay. Please try again.'); return; }

    const { data } = await axios.post('/api/payment/razorpay/create-order', { items: cartItemsArray }, { headers: { Authorization: `Bearer ${token}` } });
    if (!data.success) { toast.error(data.message); return; }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: 'NextCart',
      description: 'Purchase',
      order_id: data.razorpayOrderId,
      handler: async (response) => {
        try {
          const verifyRes = await axios.post('/api/payment/razorpay/verify', {
            ...response,
            addressId,
            items: cartItemsArray,
          }, { headers: { Authorization: `Bearer ${token}` } });

          if (verifyRes.data.success) {
            toast.success('Payment successful! 🎉');
            setCartItems({});
            router.push('/order-placed');
          } else {
            toast.error(verifyRes.data.message);
          }
        } catch { toast.error('Verification failed. Contact support.'); }
      },
      prefill: { name: user?.fullName || '', email: user?.primaryEmailAddress?.emailAddress || '' },
      theme: { color: '#ea580c' },
      modal: { ondismiss: () => { toast('Payment cancelled.'); setIsLoading(false); } }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const createOrder = async () => {
    if (!user) return toast('Please login to place order', { icon: '⚠️' });
    const cartItemsArray = Object.keys(cartItems).map(k => ({ product: k, quantity: cartItems[k] })).filter(i => i.quantity > 0);
    if (!cartItemsArray.length) return toast.error('Cart is empty');

    setIsLoading(true);
    try {
      const token = await getToken();
      const addressId = await getAddressId(token);
      if (!addressId) { setIsLoading(false); return; }

      if (paymentMethod === 'Razorpay') {
        await handleRazorpayPayment(cartItemsArray, addressId, token);
      } else {
        const { data } = await axios.post('/api/order/create', { address: addressId, items: cartItemsArray }, { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          router.push('/order-placed');
        } else toast.error(data.message);
      }
    } catch (error) { toast.error(error.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { if (user) fetchUserAddresses(); }, [user]);

  const subtotal = getCartAmount();
  const discountAmount = Math.floor((subtotal * discountPercent) / 100);
  const taxedAmount = Math.floor((subtotal - discountAmount) * 0.02);
  const totalAmount = subtotal - discountAmount + taxedAmount;

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5 rounded-2xl border border-gray-500/10 dark:bg-gray-900/50 dark:border-gray-800">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">Order Summary</h2>
      <hr className="border-gray-500/30 my-4" />
      <div className="space-y-5">
        {/* Order Type */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2.5">Who is this for?</label>
          <div className="flex gap-2">
            {['myself', 'someone_else'].map(type => (
              <button key={type} onClick={() => setOrderType(type)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition ${orderType === type ? 'bg-orange-600 text-white border-orange-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {type === 'myself' ? '👤 For Myself' : '🎁 Someone Else'}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        {orderType === 'myself' ? (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">Delivery Address</label>
            <div className="relative w-full text-xs border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
              <button className="w-full text-left px-3.5 py-2.5 text-gray-700 dark:text-gray-300 flex justify-between items-center" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span className="truncate pr-4">{selectedAddress ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}` : 'Select Address'}</span>
                <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-0' : '-rotate-90'}`} viewBox="0 0 24 24" stroke="#6B7280" fill="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
              </button>
              {isDropdownOpen && (
                <ul className="absolute w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-md z-10 py-1 max-h-48 overflow-y-auto">
                  {userAddresses.map((addr, i) => (
                    <li key={i} className="px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer text-gray-700 dark:text-gray-300 truncate" onClick={() => { setSelectedAddress(addr); setIsDropdownOpen(false); }}>
                      {addr.fullName}, {addr.area}, {addr.city}
                    </li>
                  ))}
                  <li onClick={() => router.push('/add-address')} className="px-4 py-2 text-center text-orange-600 font-bold border-t dark:border-gray-700 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20">+ Add New Address</li>
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 bg-white dark:bg-gray-800 p-3.5 border dark:border-gray-700 rounded-xl">
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 border-b dark:border-gray-700 pb-1.5 mb-2.5">🎁 Recipient Details</p>
            {[['fullName','Full Name'],['phoneNumber','Phone Number'],['pincode','Pin Code'],['area','Area / Street'],['city','City'],['state','State']].map(([field, placeholder]) => (
              <input key={field} className="w-full text-xs px-3 py-2 border dark:border-gray-700 rounded-lg outline-none focus:border-orange-500 text-gray-700 dark:text-gray-300 dark:bg-gray-900 placeholder-gray-400"
                placeholder={placeholder} value={recipient[field]} onChange={e => setRecipient({...recipient,[field]:e.target.value})} />
            ))}
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2.5">Payment Method</label>
          <div className="flex gap-2">
            {['COD','Razorpay'].map(method => (
              <button key={method} onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold border transition ${paymentMethod === method ? 'bg-orange-600 text-white border-orange-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {method === 'COD' ? '💵 Cash on Delivery' : '💳 Pay Online'}
              </button>
            ))}
          </div>
        </div>

        {/* Promo */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2">Promo Code</label>
          <form onSubmit={handlePromoApply} className="flex gap-2 border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
            <input type="text" placeholder="e.g. NEXT20" value={promoCode} onChange={e => setPromoCode(e.target.value)} disabled={isPromoApplied}
              className="flex-grow text-xs outline-none px-3.5 py-2 text-gray-700 dark:text-gray-300 uppercase placeholder-gray-400 bg-transparent disabled:bg-gray-50 dark:disabled:bg-gray-900" />
            <button type="submit" disabled={isPromoApplied} className="bg-orange-600 text-white px-5 py-2 text-xs font-bold hover:bg-orange-700 transition disabled:bg-green-600">
              {isPromoApplied ? 'Applied ✓' : 'Apply'}
            </button>
          </form>
        </div>

        <hr className="border-gray-500/20" />

        {/* Totals */}
        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between font-medium text-gray-600 dark:text-gray-400"><p>Items ({getCartCount()})</p><p>{currency}{subtotal}</p></div>
          {isPromoApplied && <div className="flex justify-between font-semibold text-green-600"><p>Promo (20%)</p><p>-{currency}{discountAmount}</p></div>}
          <div className="flex justify-between font-medium text-gray-600 dark:text-gray-400"><p>Shipping</p><p className="text-green-600 font-bold">FREE</p></div>
          <div className="flex justify-between font-medium text-gray-600 dark:text-gray-400"><p>Tax (2%)</p><p>{currency}{taxedAmount}</p></div>
          <div className="flex justify-between text-base font-bold text-gray-800 dark:text-gray-100 border-t dark:border-gray-700 pt-3"><p>Total</p><p className="text-orange-600">{currency}{totalAmount}</p></div>
        </div>
      </div>

      <button onClick={createOrder} disabled={isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 mt-6 transition active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
        {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : (paymentMethod === 'Razorpay' ? '💳 Pay Now' : '📦 Place Order')}
      </button>
    </div>
  );
};

export default OrderSummary;