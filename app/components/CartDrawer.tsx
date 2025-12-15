"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import Link from "next/link";

const CartDrawer = () => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-dvh w-full max-w-[500px] bg-white shadow-2xl z-100 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="font-poppins font-bold text-2xl text-[#3A3A3A]">
                Shopping Cart ({getTotalItems()})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors "
                aria-label="Close cart"
              >
                <X size={24} className="text-[#3A3A3A]" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="font-poppins font-medium text-lg text-[#898989] mb-2">
                    Your cart is empty
                  </p>
                  <p className="font-poppins text-sm text-[#9F9F9F]">
                    Add items to your cart to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-4 bg-[#F4F5F7] rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg
                              className="w-8 h-8 text-gray-400"
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
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-poppins font-semibold text-base text-[#3A3A3A] mb-1 line-clamp-1 overflow-hidden text-ellipsis">
                            {item.name}
                          </h3>
                          <p className="font-poppins text-sm text-[#898989] mb-2">
                            {item.description}
                          </p>
                          <p className="font-poppins font-semibold text-lg text-[#3A3A3A]">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors cursor-pointer"
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
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors  cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-poppins font-semibold text-xl text-[#3A3A3A]">
                    Subtotal:
                  </span>
                  <span className="font-poppins font-bold text-2xl text-[#B88E2F]">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>

                {/* View Cart Button */}
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full bg-white border-2 border-[#B88E2F] text-[#B88E2F] font-poppins font-semibold text-lg py-4 rounded-lg hover:bg-[#B88E2F] hover:text-white transition-colors text-center mb-3"
                >
                  View Cart
                </Link>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-[#B88E2F] text-white font-poppins font-semibold text-lg py-4 rounded-lg hover:bg-[#9A7624] transition-colors text-center mb-3 cursor-pointer"
                >
                  Checkout
                </Link>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full text-[#B88E2F] font-poppins font-medium text-base py-2 hover:underline cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
