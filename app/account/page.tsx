"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../lib/axios";
import { useToast } from "../context/ToastContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

type Tab = "profile" | "orders" | "address" | "payment";

// Address Schema
const addressSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(4, "ZIP Code is required"),
  country: z.string().min(2, "Country is required"),
});
type AddressFormData = z.infer<typeof addressSchema>;

// Payment Schema (Placeholder for now as we don't handle real card data directly this way usually)
const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "MM/YY format"),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
  cardHolder: z.string().min(3, "Card holder name required"),
});
type PaymentFormData = z.infer<typeof paymentSchema>;

export default function AccountPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 animate-spin text-[#B88E2F]" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "address", label: "Addresses", icon: MapPin },
    { id: "payment", label: "Payment Methods", icon: CreditCard },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAF9F6] py-4 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              My Account
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#B88E2F]">
                Home
              </Link>
              <ChevronRight size={14} />
              <span className="text-[#B88E2F]">Account</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#FAF9F6] mb-4 flex items-center justify-center text-[#B88E2F]">
                  <User size={32} />
                </div>
                <h2 className="font-poppins font-semibold text-lg text-gray-900">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.role === "admin" && (
                  <div className="mt-3 px-3 py-1 bg-[#B88E2F]/10 text-[#B88E2F] text-xs font-bold rounded-full uppercase tracking-wider">
                    Admin
                  </div>
                )}
              </div>

              <nav className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium cursor-pointer ${
                        isActive
                          ? "bg-[#B88E2F] text-white shadow-md shadow-[#B88E2F]/20"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}

                <div className="my-2 border-b border-gray-100" />

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    <LayoutDashboard size={18} />
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px]"
              >
                {activeTab === "profile" && <ProfileTab user={user} />}
                {activeTab === "orders" && <OrdersTab />}
                {activeTab === "address" && <AddressTab user={user} />}
                {activeTab === "payment" && <PaymentTab user={user} />}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// --- SUB COMPONENTS ---

function ProfileTab({ user }: { user: any }) {
  const { showToast } = useToast();
  const router = useRouter(); // To refresh data if needed

  // This is simple form handling without react-hook-form for brevity on simple updates,
  // or we could upgrade it.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      name: formData.get("name"),
      mobile: formData.get("mobile"),
    };

    try {
      await api.put("/users/profile", updates);
      showToast({
        type: "success",
        action: "login_success", // Reusing success icon
        message: "Profile updated successfully!",
      });
      // Force reload to get fresh data or invalidate cache if we were using React Query
      window.location.reload();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to update profile",
      });
    }
  };

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Details</h3>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            name="name"
            type="text"
            defaultValue={user.name}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#B88E2F] focus:ring-4 focus:ring-[#B88E2F]/10 outline-none transition-all bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            defaultValue={user.email}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Mobile Number
          </label>
          <input
            name="mobile"
            type="tel"
            defaultValue={user.mobile}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#B88E2F] focus:ring-4 focus:ring-[#B88E2F]/10 outline-none transition-all bg-gray-50"
          />
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            className="bg-[#B88E2F] text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:bg-black transition-all duration-200 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/orders/myorders");
        setOrders(data || []);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        showToast({
          type: "error",
          action: "auth_error",
          message: "Failed to load orders",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [showToast]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#B88E2F]" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Package size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
        <p className="text-gray-500 max-w-xs mx-auto mb-6">
          Looks like you haven't placed any orders yet. Start exploring our
          collections!
        </p>
        <Link
          href="/shop"
          className="text-[#B88E2F] font-semibold hover:underline cursor-pointer"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">My Orders</h3>
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.isDelivered
                        ? "bg-green-50 text-green-700"
                        : order.isPaid
                        ? "bg-blue-50 text-blue-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {order.isDelivered
                      ? "Delivered"
                      : order.isPaid
                      ? "Processing"
                      : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    {order.orderItems.length} item
                    {order.orderItems.length !== 1 ? "s" : ""}
                  </span>
                  <span>•</span>
                  <span>
                    Payment: {order.isPaid ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#B88E2F]">
                  ₹{order.totalPrice.toLocaleString("en-IN")}
                </p>
                <Link
                  href={`/account?order=${order._id}`}
                  className="text-sm text-[#B88E2F] hover:underline mt-1 inline-block"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AddressTab({ user }: { user: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();

  // Ideally, address might be an array in future, currently User model allows one address object?
  // User model: address: { street, city... }
  // So we assume one address for now based on Schema shown earlier.

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: user.address || {},
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      await api.put("/users/profile", { address: data });
      showToast({
        type: "success",
        action: "login_success",
        message: "Address saved successfully!",
      });
      setIsAdding(false);
      window.location.reload();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: "Failed to save address",
      });
    }
  };

  const hasAddress = user.address && user.address.street;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Saved Addresses</h3>
        {!hasAddress && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm font-medium text-[#B88E2F] hover:underline cursor-pointer"
          >
            <Plus size={16} /> Add New Address
          </button>
        )}
        {hasAddress && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm font-medium text-[#B88E2F] hover:underline cursor-pointer"
          >
            <Edit2 size={16} /> Edit Address
          </button>
        )}
      </div>

      {/* Address LIST View */}
      {!isAdding && hasAddress && (
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 group hover:border-[#B88E2F]/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-[#B88E2F]">
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Home/Default</h4>
              <p className="text-gray-600 text-sm mt-1">
                {user.address?.street}
              </p>
              <p className="text-gray-600 text-sm">
                {user.address?.city}, {user.address?.state} {user.address?.zip}
              </p>
              <p className="text-gray-600 text-sm">{user.address?.country}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAdding && !hasAddress && (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <MapPin size={32} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm mb-4">No addresses saved yet.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-[#B88E2F] transition-colors cursor-pointer"
          >
            Add Address
          </button>
        </div>
      )}

      {/* Add/Edit Form Modal/Section */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900">Address Details</h4>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    {...register("street")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                    placeholder="123 Main St"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs">
                      {errors.street.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      {...register("city")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                      placeholder="New York"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      State/Province
                    </label>
                    <input
                      {...register("state")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                      placeholder="NY"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-xs">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      {...register("zip")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                      placeholder="10001"
                    />
                    {errors.zip && (
                      <p className="text-red-500 text-xs">
                        {errors.zip.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      {...register("country")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                      placeholder="United States"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-xs">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#B88E2F] text-white font-medium rounded-xl shadow-lg hover:bg-black transition-colors cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaymentTab({ user }: { user: any }) {
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormData) => {
    // Extract card info
    const last4 = data.cardNumber.slice(-4);
    let brand = "Card";
    if (data.cardNumber.startsWith("4")) brand = "Visa";
    else if (data.cardNumber.startsWith("5")) brand = "Mastercard";
    else if (data.cardNumber.startsWith("3")) brand = "Amex";

    try {
      await api.put("/users/profile", {
        paymentDetails: {
          cardLast4: last4,
          brand: brand,
        },
      });
      showToast({
        type: "success",
        action: "login_success",
        message: "Payment method saved!",
      });
      setIsAdding(false);
      reset();
      window.location.reload();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: "Failed to save card",
      });
    }
  };

  const hasCard = user.paymentDetails && user.paymentDetails.cardLast4;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Payment Methods</h3>
        {!hasCard && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm font-medium text-[#B88E2F] hover:underline cursor-pointer"
          >
            <Plus size={16} /> Add New Card
          </button>
        )}
        {hasCard && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-sm font-medium text-[#B88E2F] hover:underline cursor-pointer"
          >
            <Edit2 size={16} /> Update Card
          </button>
        )}
      </div>

      {/* Existing Card Display */}
      {!isAdding && hasCard && (
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 group hover:border-[#B88E2F]/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm text-[#1A1A1A]">
              <CreditCard size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">
                {user.paymentDetails.brand} ending in{" "}
                {user.paymentDetails.cardLast4}
              </h4>
              <p className="text-gray-600 text-sm mt-1">Expiry: **/20**</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAdding && !hasCard && (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <CreditCard size={32} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No payment methods saved.</p>
        </div>
      )}

      {/* Payment Form Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-6"
          >
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900">Card Details</h4>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-1 hover:bg-gray-200 rounded-full cursor-pointer"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Cardholder Name
                  </label>
                  <input
                    {...register("cardHolder")}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                    placeholder="John Doe"
                  />
                  {errors.cardHolder && (
                    <p className="text-red-500 text-xs">
                      {errors.cardHolder.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      {...register("cardNumber")}
                      type="text"
                      maxLength={16}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  {errors.cardNumber && (
                    <p className="text-red-500 text-xs">
                      {errors.cardNumber.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      {...register("expiry")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                      placeholder="MM/YY"
                    />
                    {errors.expiry && (
                      <p className="text-red-500 text-xs">
                        {errors.expiry.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      CVC
                    </label>
                    <input
                      {...register("cvc")}
                      type="password"
                      maxLength={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#B88E2F] bg-white"
                      placeholder="123"
                    />
                    {errors.cvc && (
                      <p className="text-red-500 text-xs">
                        {errors.cvc.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#B88E2F] text-white font-medium rounded-xl shadow-lg hover:bg-black transition-colors cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? "Processing..." : "Save Card"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
