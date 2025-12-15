"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Minus, Trash2, ShoppingBag, Home, ChevronRight } from "lucide-react";
import Link from "next/link";
import SplitText from "../components/SplitText";
import { calculateShipping, formatINR } from "@/lib/pricing";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const subtotal = getTotalPrice();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

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
            Cart
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
            <span className="text-gray-500">Cart</span>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16">
        {items.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-32 h-32 bg-[#F4F5F7] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={64} className="text-[#898989]" />
            </div>
            <div className="mb-2">
              <SplitText
                tag="h2"
                text="Your cart is empty"
                textAlign="center"
                className="font-poppins font-semibold text-2xl text-[#3A3A3A]"
                splitType="words"
                delay={80}
                duration={0.5}
                rootMargin="-100px"
              />
            </div>
            <p className="font-poppins text-base text-[#898989] mb-8">
              Add items to your cart to see them here
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-[#B88E2F] text-white font-poppins font-semibold text-base hover:bg-[#9A7624] transition-colors rounded"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Table Header (Desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[#D9D9D9]">
                <div className="col-span-5 font-poppins font-medium text-base text-[#3A3A3A]">
                  Product
                </div>
                <div className="col-span-2 font-poppins font-medium text-base text-[#3A3A3A] text-center">
                  Price
                </div>
                <div className="col-span-2 font-poppins font-medium text-base text-[#3A3A3A] text-center">
                  Quantity
                </div>
                <div className="col-span-2 font-poppins font-medium text-base text-[#3A3A3A] text-center">
                  Subtotal
                </div>
                <div className="col-span-1"></div>
              </div>

              {/* Cart Items */}
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-12 gap-4 p-4 bg-[#F4F5F7] rounded-lg items-center"
                >
                  {/* Product Image & Name */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-base md:text-lg text-[#3A3A3A] mb-1 line-clamp-1 overflow-hidden text-ellipsis">
                        {item.name}
                      </h3>
                      <p className="font-poppins text-sm text-[#898989] hidden md:block">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-6 md:col-span-2 text-center">
                    <p className="font-poppins font-semibold text-base text-[#3A3A3A]">
                      {formatINR(item.price)}
                    </p>
                    {item.oldPrice && (
                      <p className="font-poppins text-sm text-[#B0B0B0] line-through">
                        {formatINR(item.oldPrice)}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-6 md:col-span-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-[#9F9F9F] rounded hover:bg-[#B88E2F] hover:text-white hover:border-[#B88E2F] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-poppins font-medium text-base text-[#3A3A3A] min-w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center border border-[#9F9F9F] rounded hover:bg-[#B88E2F] hover:text-white hover:border-[#B88E2F] transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-12 md:col-span-2 text-center">
                    <p className="font-poppins font-semibold text-base text-[#3A3A3A]">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-12 md:col-span-1 flex justify-center md:justify-end">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#F4F5F7] rounded-lg p-6 sticky top-[120px]">
                <div className="mb-6">
                  <SplitText
                    tag="h2"
                    text="Order Summary"
                    textAlign="left"
                    className="font-poppins font-semibold text-2xl text-[#3A3A3A]"
                    splitType="words"
                    delay={50}
                    duration={0.4}
                    rootMargin="-50px"
                  />
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-poppins font-normal text-base text-[#3A3A3A]">
                      Subtotal
                    </span>
                    <span className="font-poppins font-semibold text-lg text-[#3A3A3A]">
                      {formatINR(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-poppins font-normal text-base text-[#3A3A3A]">
                      Shipping
                    </span>
                    <span className="font-poppins font-semibold text-lg text-[#3A3A3A]">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatINR(shipping)
                      )}
                    </span>
                  </div>
                  <div className="border-t border-[#D9D9D9] pt-4 flex justify-between items-center">
                    <span className="font-poppins font-semibold text-xl text-[#3A3A3A]">
                      Total
                    </span>
                    <span className="font-poppins font-bold text-2xl text-[#B88E2F]">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-[#B88E2F] text-white font-poppins font-semibold text-lg py-4 rounded-lg hover:bg-[#9A7624] transition-colors text-center mb-4"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block w-full text-[#B88E2F] font-poppins font-medium text-base py-2 text-center hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
