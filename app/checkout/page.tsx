"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Check, CreditCard, Loader2, MapPin, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SplitText from "../components/SplitText";
import { useToast } from "../context/ToastContext";
import { calculateShipping, formatINR } from "@/lib/pricing";
import api from "@/lib/axios";
import { useAuth } from "../context/AuthContext";

type CheckoutStep = "address" | "payment" | "confirmation";

// Animation variants for consistent animations across the page
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 100 },
  },
} as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { showToast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [orderId, setOrderId] = useState<string>("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  // Auto-redirect to home page after successful order
  useEffect(() => {
    if (currentStep === "confirmation") {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, router]);

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [payment, setPayment] = useState({
    method: "card" as "card" | "cash",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Calculate order totals
  const subtotal = getTotalPrice();
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  /**
   * Handle address form submission
   * Validates all required fields before proceeding to payment step
   */
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !address.firstName ||
      !address.lastName ||
      !address.email ||
      !address.phone ||
      !address.address ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      showToast({
        type: "error",
        action: "checkout_error",
        message: "Please fill in all required address fields.",
      });
      return;
    }

    setCurrentStep("payment");
  };

  /**
   * Handle payment form submission
   * Validates payment details and processes the order
   */
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPlacingOrder) return;

    if (payment.method === "card") {
      if (
        !payment.cardNumber ||
        !payment.cardName ||
        !payment.expiryDate ||
        !payment.cvv
      ) {
        showToast({
          type: "error",
          action: "checkout_error",
          message: "Please fill in all payment details.",
        });
        return;
      }
    }

    try {
      setIsPlacingOrder(true);

      // Prepare order data for backend API
      const orderData = {
        orderItems: items.map((item) => ({
          name: item.name,
          qty: item.quantity,
          image: item.image || "",
          price: item.price,
          product: item.id, // Product ID
        })),
        shippingAddress: {
          address: `${address.address}, ${address.city}`,
          city: address.city,
          postalCode: address.zipCode,
          country: address.country || "India",
          state: address.state,
          firstName: address.firstName,
          lastName: address.lastName,
          email: address.email,
          phone: address.phone,
        },
        paymentMethod: payment.method === "card" ? "Card" : "Cash on Delivery",
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: shipping,
        totalPrice: total,
      };

      // Call backend API directly to create order
      const { data } = await api.post("/orders", orderData);

      if (!data || !data._id) {
        throw new Error("Failed to create order");
      }

      setOrderId(data._id);
      setCurrentStep("confirmation");

      showToast({
        type: "success",
        action: "checkout_success",
        message: "Order placed successfully!",
      });

      setTimeout(() => {
        clearCart();
      }, 1000);
    } catch (error: any) {
      let message = "Unable to process order";
      
      if (error.response) {
        if (error.response.status === 401) {
          message = "Please log in to place an order";
          router.push("/signin?redirect=/checkout");
        } else {
          message = error.response.data?.message || "Unable to process order";
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      showToast({
        type: "error",
        action: "checkout_error",
        message,
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const steps = [
    { id: "address", label: "Address", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "confirmation", label: "Confirmation", icon: Package },
  ];

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 pt-[100px] pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#B88E2F]" />
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect, but show message)
  if (!user) {
    return null; // Will redirect
  }

  if (items.length === 0 && currentStep !== "confirmation") {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 pt-[100px] pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <SplitText
                tag="h1"
                text="Your cart is empty"
                textAlign="center"
                className="font-poppins font-bold text-2xl text-[#3A3A3A]"
                splitType="words"
                delay={80}
                duration={0.5}
                rootMargin="-100px"
              />
            </div>
            <Link
              href="/shop"
              className="px-8 py-3 bg-[#B88E2F] text-white font-poppins font-semibold text-base hover:bg-[#9A7624] transition-colors rounded inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-[100px] pb-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px]">
          {/* Progress Steps Indicator */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive =
                  steps.findIndex((s) => s.id === currentStep) >= index;
                const isCurrent = step.id === currentStep;

                return (
                  <React.Fragment key={step.id}>
                    <motion.div
                      className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive
                            ? "bg-[#B88E2F] border-[#B88E2F] text-white"
                            : "bg-white border-[#D9D9D9] text-[#9F9F9F]"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {isActive && !isCurrent ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Check size={24} />
                          </motion.div>
                        ) : (
                          <StepIcon size={24} />
                        )}
                      </motion.div>
                      <span
                        className={`font-poppins font-medium text-sm ${
                          isActive ? "text-[#3A3A3A]" : "text-[#9F9F9F]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                    {index < steps.length - 1 && (
                      <motion.div
                        className={`h-[2px] w-16 md:w-24 ${
                          isActive ? "bg-[#B88E2F]" : "bg-[#D9D9D9]"
                        }`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isActive ? 1 : 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className={`grid gap-8 ${
              currentStep === "confirmation"
                ? "grid-cols-1 max-w-2xl mx-auto"
                : "grid-cols-1 lg:grid-cols-3"
            }`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Content - Address and Payment Forms */}
            <div
              className={
                currentStep === "confirmation" ? "w-full" : "lg:col-span-2"
              }
            >
              <AnimatePresence mode="wait">
                {currentStep === "address" && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg p-6 md:p-8 border border-[#D9D9D9]"
                  >
                    {/* Section Header */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <SplitText
                        tag="h2"
                        text="Shipping Address"
                        textAlign="left"
                        className="font-poppins font-semibold text-2xl text-[#3A3A3A]"
                        splitType="words"
                        delay={50}
                        duration={0.4}
                        rootMargin="-50px"
                      />
                    </motion.div>

                    {/* Address Form */}
                    <motion.form
                      onSubmit={handleAddressSubmit}
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Name Fields Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div variants={itemVariants}>
                          <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                            First Name *
                          </label>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileFocus={{ scale: 1.02 }}
                          >
                            <input
                              type="text"
                              value={address.firstName}
                              onChange={(e) =>
                                setAddress({
                                  ...address,
                                  firstName: e.target.value,
                                })
                              }
                              placeholder="John"
                              className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                              required
                            />
                          </motion.div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                            Last Name *
                          </label>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileFocus={{ scale: 1.02 }}
                          >
                            <input
                              type="text"
                              value={address.lastName}
                              onChange={(e) =>
                                setAddress({
                                  ...address,
                                  lastName: e.target.value,
                                })
                              }
                              placeholder="Doe"
                              className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                              required
                            />
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Email Field */}
                      <motion.div variants={itemVariants}>
                        <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                          Email Address *
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileFocus={{ scale: 1.02 }}
                        >
                          <input
                            type="email"
                            value={address.email}
                            onChange={(e) =>
                              setAddress({ ...address, email: e.target.value })
                            }
                            placeholder="john.doe@example.com"
                            className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                            required
                          />
                        </motion.div>
                      </motion.div>

                      {/* Phone Field */}
                      <motion.div variants={itemVariants}>
                        <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                          Phone Number *
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileFocus={{ scale: 1.02 }}
                        >
                          <input
                            type="tel"
                            value={address.phone}
                            onChange={(e) =>
                              setAddress({ ...address, phone: e.target.value })
                            }
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                            required
                          />
                        </motion.div>
                      </motion.div>

                      {/* Street Address Field */}
                      <motion.div variants={itemVariants}>
                        <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                          Street Address *
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileFocus={{ scale: 1.02 }}
                        >
                          <input
                            type="text"
                            value={address.address}
                            onChange={(e) =>
                              setAddress({
                                ...address,
                                address: e.target.value,
                              })
                            }
                            placeholder="123 Main Street, Apartment 4B"
                            className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                            required
                          />
                        </motion.div>
                      </motion.div>

                      {/* City, State, ZIP Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div variants={itemVariants}>
                          <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                            City *
                          </label>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileFocus={{ scale: 1.02 }}
                          >
                            <input
                              type="text"
                              value={address.city}
                              onChange={(e) =>
                                setAddress({ ...address, city: e.target.value })
                              }
                              placeholder="Mumbai"
                              className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                              required
                            />
                          </motion.div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                            State *
                          </label>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileFocus={{ scale: 1.02 }}
                          >
                            <input
                              type="text"
                              value={address.state}
                              onChange={(e) =>
                                setAddress({
                                  ...address,
                                  state: e.target.value,
                                })
                              }
                              placeholder="Maharashtra"
                              className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                              required
                            />
                          </motion.div>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                            ZIP Code *
                          </label>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileFocus={{ scale: 1.02 }}
                          >
                            <input
                              type="text"
                              value={address.zipCode}
                              onChange={(e) =>
                                setAddress({
                                  ...address,
                                  zipCode: e.target.value,
                                })
                              }
                              placeholder="400001"
                              className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                              required
                            />
                          </motion.div>
                        </motion.div>
                      </div>

                      {/* Country Field */}
                      <motion.div variants={itemVariants}>
                        <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                          Country
                        </label>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileFocus={{ scale: 1.02 }}
                        >
                          <input
                            type="text"
                            value={address.country}
                            onChange={(e) =>
                              setAddress({
                                ...address,
                                country: e.target.value,
                              })
                            }
                            placeholder="India"
                            className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                          />
                        </motion.div>
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div variants={itemVariants} className="pt-2">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full md:w-auto px-12 py-4 bg-[#B88E2F] text-white font-poppins font-semibold text-lg rounded-lg hover:bg-[#9A7624] transition-colors cursor-pointer"
                        >
                          Continue to Payment
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  </motion.div>
                )}

                {currentStep === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg p-6 md:p-8 border border-[#D9D9D9]"
                  >
                    {/* Section Header */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <SplitText
                        tag="h2"
                        text="Payment Method"
                        textAlign="left"
                        className="font-poppins font-semibold text-2xl text-[#3A3A3A]"
                        splitType="words"
                        delay={50}
                        duration={0.4}
                        rootMargin="-50px"
                      />
                    </motion.div>

                    {/* Payment Form */}
                    <motion.form
                      onSubmit={handlePaymentSubmit}
                      className="space-y-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Payment Method Selection */}
                      <motion.div variants={itemVariants}>
                        <label className="block font-poppins font-medium text-base text-[#3A3A3A] mb-4">
                          Select Payment Method
                        </label>
                        <div className="space-y-3">
                          <motion.label
                            className="flex items-center gap-3 p-4 border-2 border-[#D9D9D9] rounded-lg cursor-pointer hover:border-[#B88E2F] transition-colors"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={payment.method === "card"}
                              onChange={(e) =>
                                setPayment({ ...payment, method: "card" })
                              }
                              className="w-5 h-5 text-[#B88E2F]"
                            />
                            <CreditCard size={24} className="text-[#3A3A3A]" />
                            <span className="font-poppins font-medium text-base text-[#3A3A3A]">
                              Credit/Debit Card
                            </span>
                          </motion.label>
                          <motion.label
                            className="flex items-center gap-3 p-4 border-2 border-[#D9D9D9] rounded-lg cursor-pointer hover:border-[#B88E2F] transition-colors"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cash"
                              checked={payment.method === "cash"}
                              onChange={(e) =>
                                setPayment({ ...payment, method: "cash" })
                              }
                              className="w-5 h-5 text-[#B88E2F]"
                            />
                            <span className="font-poppins font-medium text-base text-[#3A3A3A]">
                              Cash on Delivery
                            </span>
                          </motion.label>
                        </div>
                      </motion.div>

                      {/* Card Payment Details - Only shown when card method is selected */}
                      <AnimatePresence>
                        {payment.method === "card" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 pt-4 border-t border-[#D9D9D9]"
                          >
                            {/* Card Number */}
                            <motion.div variants={itemVariants}>
                              <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                                Card Number *
                              </label>
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileFocus={{ scale: 1.02 }}
                              >
                                <input
                                  type="text"
                                  value={payment.cardNumber
                                    .replace(/(.{4})/g, "$1 ")
                                    .trim()}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      .replace(/\D/g, "")
                                      .slice(0, 16);
                                    setPayment({
                                      ...payment,
                                      cardNumber: value,
                                    });
                                  }}
                                  placeholder="4532 1234 5678 9012"
                                  className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                                  required
                                />
                              </motion.div>
                            </motion.div>

                            {/* Cardholder Name */}
                            <motion.div variants={itemVariants}>
                              <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                                Cardholder Name *
                              </label>
                              <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileFocus={{ scale: 1.02 }}
                              >
                                <input
                                  type="text"
                                  value={payment.cardName}
                                  onChange={(e) =>
                                    setPayment({
                                      ...payment,
                                      cardName: e.target.value,
                                    })
                                  }
                                  placeholder="John Doe"
                                  className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                                  required
                                />
                              </motion.div>
                            </motion.div>

                            {/* Expiry Date and CVV Row */}
                            <div className="grid grid-cols-2 gap-4">
                              <motion.div variants={itemVariants}>
                                <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                                  Expiry Date *
                                </label>
                                <motion.div
                                  whileHover={{ scale: 1.01 }}
                                  whileFocus={{ scale: 1.02 }}
                                >
                                  <input
                                    type="text"
                                    value={payment.expiryDate}
                                    onChange={(e) =>
                                      setPayment({
                                        ...payment,
                                        expiryDate: e.target.value
                                          .replace(/\D/g, "")
                                          .replace(/(\d{2})(\d)/, "$1/$2")
                                          .slice(0, 5),
                                      })
                                    }
                                    placeholder="12/25"
                                    className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                                    required
                                  />
                                </motion.div>
                              </motion.div>
                              <motion.div variants={itemVariants}>
                                <label className="block font-poppins font-medium text-sm text-[#3A3A3A] mb-2">
                                  CVV *
                                </label>
                                <motion.div
                                  whileHover={{ scale: 1.01 }}
                                  whileFocus={{ scale: 1.02 }}
                                >
                                  <input
                                    type="text"
                                    value={payment.cvv}
                                    onChange={(e) =>
                                      setPayment({
                                        ...payment,
                                        cvv: e.target.value
                                          .replace(/\D/g, "")
                                          .slice(0, 3),
                                      })
                                    }
                                    placeholder="123"
                                    className="w-full px-4 py-3 border border-[#9F9F9F] rounded-lg font-poppins text-base focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                                    required
                                  />
                                </motion.div>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action Buttons */}
                      <motion.div
                        className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4"
                        variants={itemVariants}
                      >
                        <motion.button
                          type="button"
                          onClick={() => setCurrentStep("address")}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto px-8 py-4 border-2 border-[#B88E2F] text-[#B88E2F] font-poppins font-semibold text-base sm:text-lg rounded-lg hover:bg-[#B88E2F] hover:text-white transition-colors cursor-pointer"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={isPlacingOrder}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full sm:w-auto min-w-[200px] px-8 py-4 bg-[#B88E2F] text-white font-poppins font-semibold text-base sm:text-lg rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                            isPlacingOrder
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:bg-[#9A7624] cursor-pointer"
                          }`}
                        >
                          {isPlacingOrder ? (
                            <>
                              <Loader2 className="animate-spin" size={20} />
                              Processing...
                            </>
                          ) : (
                            "Place Order"
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.form>
                  </motion.div>
                )}

                {currentStep === "confirmation" && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl border border-[#EDE7F6] text-center w-full max-w-3xl mx-auto overflow-hidden relative"
                  >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#B88E2F] via-[#D4AF37] to-[#B88E2F]" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B88E2F]/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#B88E2F]/10 rounded-full blur-3xl" />

                    <motion.div
                      className="w-24 h-24 bg-linear-to-br from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-200"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2,
                      }}
                    >
                      <Check size={48} className="text-white stroke-3" />
                    </motion.div>

                    <div className="mb-2">
                      <SplitText
                        tag="h2"
                        text="Order Placed Successfully!"
                        textAlign="center"
                        className="font-poppins font-bold text-3xl md:text-4xl text-[#3A3A3A]"
                        splitType="words"
                        delay={80}
                        duration={0.5}
                        rootMargin="-100px"
                      />
                    </div>

                    <p className="font-poppins text-lg text-[#898989] mb-8">
                      Thank you for your purchase. Your order is being
                      processed.
                    </p>

                    <div className="bg-linear-to-r from-[#F9F9F9] to-[#F4F5F7] rounded-xl p-6 mb-8 border border-[#E0E0E0] relative overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="relative z-10">
                        <p className="font-poppins text-sm text-[#898989] mb-1 uppercase tracking-wider">
                          Order ID
                        </p>
                        <p className="font-poppins font-bold text-2xl text-[#B88E2F] tracking-wide">
                          {orderId}
                        </p>
                      </div>
                      <div className="absolute right-0 top-0 h-full w-1 bg-[#B88E2F]" />
                    </div>

                    <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 mb-8 text-left shadow-sm">
                      <h3 className="font-poppins font-semibold text-lg text-[#3A3A3A] mb-4 border-b border-[#E0E0E0] pb-2">
                        Order Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-poppins text-[#666]">
                            Items ({items.length})
                          </span>
                          <span className="font-poppins font-medium text-[#3A3A3A]">
                            {formatINR(subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-poppins text-[#666]">
                            Shipping
                          </span>
                          <span className="font-poppins font-medium text-[#2E7D32]">
                            {shipping === 0 ? "Free" : formatINR(shipping)}
                          </span>
                        </div>
                        <div className="border-t border-[#E0E0E0] pt-3 mt-1 flex justify-between items-center">
                          <span className="font-poppins font-bold text-lg text-[#3A3A3A]">
                            Total Amount
                          </span>
                          <span className="font-poppins font-bold text-2xl text-[#B88E2F]">
                            {formatINR(total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Redirect Countdown */}
                    <div className="mb-8">
                      <p className="font-poppins text-sm text-[#898989] mb-2">
                        Redirecting to home page in{" "}
                        <span className="text-[#B88E2F] font-bold">
                          3 seconds
                        </span>
                        ...
                      </p>
                      <div className="h-1 w-full bg-[#E0E0E0] rounded-full overflow-hidden max-w-xs mx-auto">
                        <motion.div
                          className="h-full bg-[#B88E2F]"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "linear" }}
                        />
                      </div>
                    </div>

                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link
                        href="/shop"
                        className="w-full sm:w-auto min-w-[180px] px-6 py-3 bg-[#3A3A3A] text-white font-poppins font-medium rounded-lg hover:bg-black transition-colors shadow-md"
                      >
                        Continue Shopping
                      </Link>
                      <Link
                        href="/"
                        className="w-full sm:w-auto min-w-[180px] px-6 py-3 border border-[#B88E2F] text-[#B88E2F] font-poppins font-medium rounded-lg hover:bg-[#B88E2F] hover:text-white transition-colors"
                      >
                        Back to Home Now
                      </Link>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar - Only shown during address and payment steps */}
            {currentStep !== "confirmation" && (
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="bg-[#F4F5F7] rounded-lg p-6 sticky top-[120px]"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Section Header */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SplitText
                      tag="h3"
                      text="Order Summary"
                      textAlign="left"
                      className="font-poppins font-semibold text-xl text-[#3A3A3A]"
                      splitType="words"
                      delay={50}
                      duration={0.4}
                      rootMargin="-50px"
                    />
                  </motion.div>

                  {/* Cart Items List */}
                  <motion.div
                    className="space-y-4 mb-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="flex gap-3"
                        variants={itemVariants}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </motion.div>
                        <div className="flex-1">
                          <p className="font-poppins font-medium text-sm text-[#3A3A3A] line-clamp-1 overflow-hidden text-ellipsis">
                            {item.name}
                          </p>
                          <p className="font-poppins text-xs text-[#898989]">
                            Qty: {item.quantity}
                          </p>
                          <p className="font-poppins font-semibold text-sm text-[#3A3A3A]">
                        {formatINR(item.price * item.quantity)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Price Breakdown */}
                  <motion.div
                    className="border-t border-[#D9D9D9] pt-4 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <motion.div
                      className="flex justify-between"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="font-poppins text-base text-[#898989]">
                        Subtotal
                      </span>
                      <span className="font-poppins font-semibold text-base text-[#3A3A3A]">
                        {formatINR(subtotal)}
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex justify-between"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="font-poppins text-base text-[#898989]">
                        Shipping
                      </span>
                      <span className="font-poppins font-semibold text-base text-[#3A3A3A]">
                        {shipping === 0 ? "Free" : formatINR(shipping)}
                      </span>
                    </motion.div>
                    <motion.div
                      className="border-t border-[#D9D9D9] pt-2 flex justify-between"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="font-poppins font-semibold text-lg text-[#3A3A3A]">
                        Total
                      </span>
                      <span className="font-poppins font-bold text-xl text-[#B88E2F]">
                        {formatINR(total)}
                      </span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
