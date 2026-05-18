"use client"
import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import { useClerk } from "@clerk/nextjs";

const Product = () => {

    const { id } = useParams();

    const { products, router, addToCart, user, currency } = useAppContext()
    const { openSignIn } = useClerk()

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);

    const fetchProductData = async () => {
        const product = products.find(product => product._id === id);
        setProductData(product);
    }

    useEffect(() => {
        fetchProductData();
    }, [id, products.length])

    return productData ? (<>
        <Navbar />
        <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="px-5 lg:px-16 xl:px-20">
                    <div className="rounded-lg overflow-hidden bg-gray-500/10 dark:bg-gray-800/30 mb-4 flex items-center justify-center">
                        <Image
                            src={mainImage || productData.image[0]}
                            alt="alt"
                            className="w-full h-auto object-cover mix-blend-multiply dark:mix-blend-normal"
                            width={1280}
                            height={720}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {productData.image.map((image, index) => (
                            <div
                                key={index}
                                onClick={() => setMainImage(image)}
                                className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 dark:bg-gray-800/30 flex items-center justify-center"
                            >
                                <Image
                                    src={image}
                                    alt="alt"
                                    className="w-full h-auto object-cover mix-blend-multiply dark:mix-blend-normal"
                                    width={1280}
                                    height={720}
                                />
                            </div>

                        ))}
                    </div>
                </div>

                <div className="flex flex-col">
                    <h1 className="text-3xl font-medium text-gray-800/90 dark:text-gray-100 mb-4">
                        {productData.name}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image className="h-4 w-4" src={assets.star_icon} alt="star_icon" />
                            <Image
                                className="h-4 w-4"
                                src={assets.star_dull_icon}
                                alt="star_dull_icon"
                            />
                        </div>
                        <p className="dark:text-gray-300">(4.5)</p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-3">
                        {productData.description}
                    </p>
                    <p className="text-3xl font-medium mt-6 dark:text-white">
                        {currency}{productData.offerPrice}
                        <span className="text-base font-normal text-gray-800/60 dark:text-gray-500 line-through ml-2">
                            {currency}{productData.price}
                        </span>
                    </p>
                    <hr className="bg-gray-600 my-6" />
                    <div className="overflow-x-auto">
                        <table className="table-auto border-collapse w-full max-w-72">
                            <tbody>
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium">Brand</td>
                                    <td className="text-gray-800/50 dark:text-gray-500">Generic</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium">Color</td>
                                    <td className="text-gray-800/50 dark:text-gray-500">Multi</td>
                                </tr>
                                <tr>
                                    <td className="text-gray-600 dark:text-gray-400 font-medium">Category</td>
                                    <td className="text-gray-800/50 dark:text-gray-500">
                                        {productData.category}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center mt-10 gap-4">
                        <button onClick={() => { if (!user) { openSignIn(); } else { addToCart(productData._id); } }} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-800/80 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            Add to Cart
                        </button>
                        <button onClick={async () => { if (!user) { openSignIn(); } else { await addToCart(productData._id); router.push('/cart'); } }} className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition">
                            Buy now
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center mb-4 mt-16">
                    <p className="text-3xl font-medium dark:text-gray-100">Featured <span className="font-medium text-orange-600">Products</span></p>
                    <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                    {products.slice(0, 5).map((product, index) => <ProductCard key={index} product={product} />)}
                </div>
                <button className="px-8 py-2 mb-16 border dark:border-gray-800 rounded text-gray-500/70 dark:text-gray-400 hover:bg-slate-50/90 dark:hover:bg-gray-900 transition">
                    See more
                </button>
            </div>
        </div>
        <Footer />
    </>
    ) : <Loading />
};

export default Product;