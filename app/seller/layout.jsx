'use client'
import Navbar from '@/components/seller/Navbar'
import Sidebar from '@/components/seller/Sidebar'
import React, { useEffect } from 'react'
import { useAppContext } from "@/context/AppContext"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

const Layout = ({ children }) => {
  const { isSeller, user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user && isSeller === false) {
      toast.error("Unauthorized: Admin Access Required");
      router.push('/');
    }
  }, [user, isSeller, router]);

  if (!user || isSeller === false) {
    return null;
  }

  return (
    <div>
      <Navbar />
      <div className='flex w-full'>
        <Sidebar />
        {children}
      </div>
    </div>
  )
}

export default Layout