'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import axios from 'axios'

const OrderPlaced = () => {

  const { router, getToken, currency } = useAppContext()
  const [latestOrder, setLatestOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchLatestOrder = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/order/list', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success && data.orders.length > 0) {
        setLatestOrder(data.orders[data.orders.length - 1])
        return true
      }
    } catch (error) {
      console.error("Error fetching latest order:", error)
    }
    return false
  }

  useEffect(() => {
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      const success = await fetchLatestOrder()
      if (success || attempts >= 8) {
        clearInterval(interval)
        setLoading(false)
      }
    }, 1500)

    fetchLatestOrder().then((success) => {
      if (success) {
        clearInterval(interval)
        setLoading(false)
      }
    })

    return () => clearInterval(interval)
  }, [])

  const getWhatsAppUrl = () => {
    if (!latestOrder) return '#'

    const storePhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+918105670560'
    const cleanPhone = storePhone.replace(/[^0-9]/g, '')

    let message = `*🛒 NEW ORDER PLACED ON QUICKCART!* 🛒\n\n`;
    message += `*Order ID:* _${latestOrder._id}_\n`;
    message += `*Date:* ${new Date(latestOrder.date).toLocaleString()}\n`;
    message += `*Customer:* ${latestOrder.address.fullName}\n`;
    message += `*Phone:* ${latestOrder.address.phoneNumber}\n`;
    message += `*Shipping Address:* ${latestOrder.address.area}, ${latestOrder.address.city}, ${latestOrder.address.state} - ${latestOrder.address.pincode}\n\n`;
    message += `*📦 Items Ordered:*\n`;

    latestOrder.items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}* (Qty: ${item.quantity}) - ${currency}${(item.product.offerPrice * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*💵 Total Amount:* *${currency}${latestOrder.amount.toFixed(2)}*\n\n`;
    message += `Please confirm my order and share delivery details! 🙏`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-50/50 p-6'>
      <div className="max-w-md w-full bg-white border rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
        <div className="flex justify-center items-center relative">
          <Image className="absolute p-4 w-16 h-16 object-contain" src={assets.checkmark} alt='Check' width={64} height={64} />
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-500 border-gray-100"></div>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h1>
          <p className="text-sm text-gray-500 mt-2">Thank you for shopping with QuickCart.</p>
        </div>

        {latestOrder && (
          <div className="w-full bg-gray-50 rounded-xl p-4 border text-sm text-gray-700 space-y-2">
            <p className="font-semibold text-gray-900 border-b pb-1.5 mb-2">Order Summary</p>
            <p><span className="text-gray-500">Order ID:</span> <span className="font-mono text-xs">{latestOrder._id}</span></p>
            <p><span className="text-gray-500">Total Items:</span> {latestOrder.items.reduce((acc, curr) => acc + curr.quantity, 0)}</p>
            <p><span className="text-gray-500">Total Price:</span> <span className="font-bold text-green-600">{currency}{latestOrder.amount.toFixed(2)}</span></p>
            <p><span className="text-gray-500">Delivery to:</span> {latestOrder.address.fullName}</p>
          </div>
        )}

        <div className="w-full flex flex-col gap-3 mt-4">
          <a 
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (loading || !latestOrder) {
                e.preventDefault()
              }
            }}
            className={`w-full bg-green-600 text-white font-medium py-3.5 px-6 rounded-xl hover:bg-green-700 active:bg-green-800 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:scale-[1.01] duration-150 ${(loading || !latestOrder) ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.977 14.113.953 11.488.953c-5.442 0-9.866 4.372-9.87 9.802 0 1.777.472 3.511 1.37 5.042l-1.01 3.687 3.77-.988zm12.38-7.795c-.328-.163-1.94-.945-2.24-1.053-.298-.11-.517-.163-.736.163-.218.327-.847 1.053-1.037 1.27-.19.218-.38.245-.707.082-.328-.163-1.385-.504-2.638-1.609-.974-.86-1.63-1.923-1.821-2.25-.19-.328-.02-.505.143-.668.148-.147.328-.382.492-.573.164-.19.219-.327.328-.545.11-.219.055-.409-.028-.573-.082-.164-.736-1.745-1.009-2.399-.266-.642-.538-.553-.736-.563-.19-.01-.409-.01-.628-.01-.219 0-.573.082-.873.409-.3.327-1.147 1.118-1.147 2.727 0 1.61 1.173 3.163 1.336 3.38.164.218 2.3 3.475 5.58 4.89.78.336 1.387.537 1.861.685.783.246 1.497.212 2.06.128.629-.094 1.94-.784 2.215-1.543.275-.758.275-1.408.193-1.543-.081-.136-.298-.218-.627-.382z"/>
            </svg>
            Send Invoice on WhatsApp
          </a>

          
          <button 
            onClick={() => router.push('/my-orders')}
            className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition text-center text-sm"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderPlaced