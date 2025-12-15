"use client";

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useWishlist } from "../context/WishlistContext";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, ChevronRightCircle, Heart, Home, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const WishlistPage = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {/* --- CREATIVE COMPACT HERO SECTION --- */}
      <section className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center overflow-hidden px-4">
        {/* Background Image with Parallax-like feel */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage:
              "url('/shop-bg.jpg')",
          }}
        />

        {/* Heavy Blur Overlay for Contrast */}
        <div className="absolute inset-0 bg-white/20 z-10" />

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center gap-3 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-poppins font-bold text-3xl sm:text-5xl text-[#3A3A3A] tracking-tight"
          >
            Wishlist
          </motion.h1>

          {/* Glassmorphic Breadcrumb Pill */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-2 bg-white/70 border border-white/60 px-5 py-2 rounded-full shadow-sm text-sm font-medium"
          >
            <Link
              href="/"
              className="flex items-center gap-1.5 text-black hover:text-[#B88E2F] transition-colors"
            >
              <Home size={14} />
              Home
            </Link>
            <ChevronRight size={14} className="text-gray-500" />
            <span className="text-gray-500">Wishlist</span>
          </motion.div>
        </div>
      </section>

      <main className="px-4  lg:px-[100px] py-16">
        {items.length === 0 ? (
          /* Empty Wishlist */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-32 h-32 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-6">
              <Heart size={64} className="text-[#898989]" />
            </div>
            <h2 className="font-poppins font-semibold text-2xl text-[#3A3A3A] mb-2">
              Your wishlist is empty
            </h2>
            <p className="font-poppins text-base text-[#898989] mb-8">
              Add items to your wishlist to see them here
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-[#B88E2F] text-white font-poppins font-semibold text-base hover:bg-[#9A7624] transition-colors rounded"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-8">
              <p className="font-poppins text-base text-[#898989]">
                {items.length} {items.length === 1 ? "item" : "items"} in your
                wishlist
              </p>
              {items.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearWishlist}
                  className="px-6 py-2 bg-red-500 text-white font-poppins font-medium text-sm rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Clear All
                </motion.button>
              )}
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="relative w-full bg-[#F4F5F7] overflow-hidden">
                    {/* Image Container */}
                    <div className="relative w-full aspect-285/301 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <svg
                            className="w-16 h-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Badges */}
                      {item.tag && (
                        <div
                          className={`
                              absolute top-5 right-5 w-12 h-12 rounded-full flex items-center justify-center 
                              text-white font-poppins font-medium text-base z-20
                              ${item.tag.type === "discount"
                              ? "bg-[#E97171]"
                              : "bg-[#2EC1AC]"
                            }
                            `}
                        >
                          {item.tag.value}
                        </div>
                      )}

                      {/* Remove from Wishlist Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromWishlist(item.id)}
                        className="absolute top-5 left-5 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-md cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={18} />
                      </motion.button>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col items-center justify-center p-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(item)}
                          className="bg-white text-[#B88E2F] font-poppins font-bold text-base py-3 px-10 min-w-[202px] mb-6 hover:bg-[#B88E2F] hover:text-white transition-colors duration-300 cursor-pointer"
                        >
                          Add to cart
                        </motion.button>
                      </div>
                    </div>

                    {/* Content Container */}
                    <Link
                      href={
                        item.slug ? `/product/${item.slug}` : "/product"
                      }
                      className="p-4 pb-8 flex flex-col gap-2"
                    >
                      <h3 className="font-poppins font-bold text-2xl text-[#3A3A3A] line-clamp-1 overflow-hidden text-ellipsis">
                        {item.name}
                      </h3>
                      <p className="font-poppins font-medium text-base text-[#898989] truncate">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-poppins font-semibold text-xl text-[#3A3A3A]">
                          {formatCurrency(item.price)}
                        </span>
                        {item.oldPrice && (
                          <span className="font-poppins font-normal text-base text-[#B0B0B0] line-through">
                            {formatCurrency(item.oldPrice)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;
