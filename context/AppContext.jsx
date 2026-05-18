'use client'
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser()
    const { getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})
    const [wishlist, setWishlist] = useState([])

    const toggleWishlist = async (productId) => {
        if (!user) {
            return toast('Please login to manage wishlist', { icon: '⚠️' });
        }
        try {
            const token = await getToken();
            const { data } = await axios.post('/api/user/wishlist', { productId }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                setWishlist(data.wishlist);
                if (data.wishlist.includes(productId)) {
                    toast('Added to Wishlist', { icon: '❤️' });
                } else {
                    toast('Removed from Wishlist', { icon: '💔' });
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchProductData = async () => {
        try {
            setIsLoading(true)
            const { data } = await axios.get('/api/product/list')

            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUserData = async () => {
        try {

            const token = await getToken()
            const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
                setCartItems(data.user.cartItems)
                setWishlist(data.user.wishlist || [])
                
                if (data.user.role === 'admin' || data.user.role === 'seller' || user.publicMetadata.role === 'seller') {
                    setIsSeller(true)
                }
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const addToCart = async (itemId) => {

        if (!user) {
            return toast('Please login', { icon: '⚠️' })
        }

        const product = products.find(p => p._id === itemId);
        const currentQty = cartItems[itemId] || 0;

        if (product && currentQty >= product.stock) {
            return toast.error(`Only ${product.stock} units available in stock`);
        }

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', { cartData }, { headers: { Authorization: `Bearer ${token}` } })
                toast.success('Item added to cart')
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {

        const product = products.find(p => p._id === itemId);
        if (product && quantity > product.stock) {
            return toast.error(`Only ${product.stock} units available in stock`);
        }

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)
        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', {cartData}, {headers:{Authorization: `Bearer ${token}`}} )
                toast.success('Cart Updated')
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        wishlist, toggleWishlist,
        isLoading
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}