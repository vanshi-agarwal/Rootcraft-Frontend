"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  DollarSign,
  MoreVertical,
  Eye,
  Package,
  Trash2,
  AlertTriangle,
  X,
  MapPin,
  User,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  user: User;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  status: string;
}

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deleteTimer, setDeleteTimer] = useState(5);
  const [canConfirmDelete, setCanConfirmDelete] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders");
      setOrders(data);
      setFilteredOrders(data);
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error", // Using a known valid action key
        message: error.response?.data?.message || "Failed to fetch orders",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = orders;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          (order._id ?? "").toLowerCase().includes(query) ||
          (order.user?.name?.toLowerCase?.() ?? "").includes(query) ||
          (order.user?.email?.toLowerCase?.() ?? "").includes(query)
      );
    }

    // Status Filter
    if (statusFilter !== "all") {
      if (statusFilter === "paid") {
        result = result.filter((order) => order.isPaid);
      } else if (statusFilter === "unpaid") {
        result = result.filter((order) => !order.isPaid);
      } else if (statusFilter === "delivered") {
        result = result.filter((order) => order.isDelivered);
      } else if (statusFilter === "pending") {
        result = result.filter((order) => !order.isDelivered);
      }
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length, rowsPerPage]);

  // Timer Logic for Delete Modal
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDeleteModalOpen && deleteTimer > 0) {
      interval = setInterval(() => {
        setDeleteTimer((prev) => prev - 1);
      }, 1000);
    } else if (deleteTimer === 0) {
      setCanConfirmDelete(true);
    }
    return () => clearInterval(interval);
  }, [isDeleteModalOpen, deleteTimer]);

  const openDeleteModal = (id: string) => {
    setOrderToDelete(id);
    setDeleteTimer(5);
    setCanConfirmDelete(false);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await api.delete(`/orders/${orderToDelete}`);
      showToast({
        type: "success",
        action: "register_success",
        message: "Order deleted successfully",
      });
      fetchOrders();
      closeDeleteModal();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to delete order",
      });
    }
  };

  // Actions
  const markAsDelivered = async (orderId: string) => {
    try {
      await api.put(`/orders/${orderId}/deliver`);
      showToast({
        type: "success",
        action: "checkout_success",
        message: "Order marked as delivered",
      });
      fetchOrders();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to update order",
      });
    }
  };

  // Stats
  const totalRevenue = orders.reduce(
    (acc, order) => acc + (order.isPaid ? order.totalPrice : 0),
    0
  );
  const pendingOrders = orders.filter((o) => !o.isDelivered).length;
  const deliveredOrders = orders.filter((o) => o.isDelivered).length;

  const totalPages = Math.max(
    1,
    Math.ceil((filteredOrders.length || 0) / rowsPerPage)
  );
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedOrders = filteredOrders.slice(start, end);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 border-4 border-[#B88E2F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#FAF9F6] rounded-xl text-[#B88E2F]">
              <Package size={24} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-lg">
              +12%
            </span>
          </div>
          <p className="text-gray-600 text-sm font-poppins">Total Orders</p>
          <h3 className="text-2xl font-bold text-[#1A1A1A] font-poppins">
            {orders.length}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#FAF9F6] rounded-xl text-blue-600">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-poppins">Pending</p>
          <h3 className="text-2xl font-bold text-[#1A1A1A] font-poppins">
            {pendingOrders}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#FAF9F6] rounded-xl text-green-600">
              <Truck size={24} />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-poppins">Delivered</p>
          <h3 className="text-2xl font-bold text-[#1A1A1A] font-poppins">
            {deliveredOrders}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E5E0D8] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#FAF9F6] rounded-xl text-purple-600">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-poppins">Total Revenue</p>
          <h3 className="text-2xl font-bold text-[#1A1A1A] font-poppins">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h3>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {["all", "paid", "unpaid", "delivered", "pending"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === filter
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#FAF9F6] text-gray-600 hover:bg-[#E5E0D8]"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FAF9F6] border-b border-[#E5E0D8]">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins hidden md:table-cell">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins">
                  Total
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins">
                  Payment
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500 font-poppins"
                  >
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-[#FAF9F6] transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#1A1A1A] font-poppins">
                          {order.user?.name || "Guest"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.user?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600 font-poppins">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#1A1A1A] font-poppins">
                        ₹{order.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          <CheckCircle size={12} />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                          <XCircle size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.isDelivered ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <Truck size={12} />
                          Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                          <Clock size={12} />
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-[#E5E0D8] hover:text-[#1A1A1A] transition-colors relative group/btn cursor-pointer"
                        >
                          <Eye size={18} />
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            View Details
                          </span>
                        </button>

                        {!order.isDelivered && (
                          <button
                            onClick={() => markAsDelivered(order._id)}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors relative group/btn cursor-pointer"
                          >
                            <Truck size={18} />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                              Mark Delivered
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => openDeleteModal(order._id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors relative group/btn cursor-pointer"
                        >
                          <Trash2 size={18} />
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            Delete Order
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E0D8] shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600 font-poppins">
          <span>
            Showing {filteredOrders.length === 0 ? 0 : start + 1}-
            {Math.min(end, filteredOrders.length)} of {filteredOrders.length}
          </span>
          <span className="hidden sm:inline text-gray-400">|</span>
          <label className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="border border-[#E5E0D8] rounded-lg px-2 py-1 bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-[#B88E2F] cursor-pointer"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] text-sm font-medium text-gray-700 hover:bg-[#E5E0D8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Prev
          </button>
          <span className="text-sm font-poppins text-gray-700">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={safePage === totalPages}
            className="px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] text-sm font-medium text-gray-700 hover:bg-[#E5E0D8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-[#E5E0D8] overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#E5E0D8] bg-[#FAF9F6] shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-[#1A1A1A] font-poppins">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500 font-poppins mt-1">
                    Placed on{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString()} at{" "}
                    {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-lg hover:bg-[#E5E0D8] transition-colors text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div
                className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#E5E0D8 transparent",
                }}
              >
                {/* Status Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-xl border ${
                      selectedOrder.isPaid
                        ? "bg-green-50 border-green-100"
                        : "bg-red-50 border-red-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          selectedOrder.isPaid
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {selectedOrder.isPaid ? (
                          <CheckCircle size={20} />
                        ) : (
                          <XCircle size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-poppins">
                          Payment Status
                        </p>
                        <p
                          className={`text-sm ${
                            selectedOrder.isPaid
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {selectedOrder.isPaid
                            ? `Paid on ${new Date(
                                selectedOrder.paidAt!
                              ).toLocaleDateString()}`
                            : "Not Paid"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      selectedOrder.isDelivered
                        ? "bg-blue-50 border-blue-100"
                        : "bg-yellow-50 border-yellow-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          selectedOrder.isDelivered
                            ? "bg-blue-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {selectedOrder.isDelivered ? (
                          <Truck size={20} />
                        ) : (
                          <Clock size={20} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-poppins">
                          Delivery Status
                        </p>
                        <p
                          className={`text-sm ${
                            selectedOrder.isDelivered
                              ? "text-blue-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {selectedOrder.isDelivered
                            ? `Delivered on ${new Date(
                                selectedOrder.deliveredAt!
                              ).toLocaleDateString()}`
                            : "Processing"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] font-poppins border-b border-[#E5E0D8] pb-2 flex items-center gap-2">
                      <User size={20} className="text-[#B88E2F]" />
                      Customer Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-600">
                        <div className="h-10 w-10 rounded-full bg-[#FAF9F6] flex items-center justify-center border border-[#E5E0D8]">
                          <span className="font-bold text-[#B88E2F] text-lg">
                            {selectedOrder.user?.name?.[0]?.toUpperCase() ||
                              "G"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            {selectedOrder.user?.name || "Guest User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedOrder.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] font-poppins border-b border-[#E5E0D8] pb-2 flex items-center gap-2">
                      <MapPin size={20} className="text-[#B88E2F]" />
                      Shipping Information
                    </h3>
                    <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E0D8]">
                      <div className="text-sm text-gray-600 space-y-1 font-poppins">
                        <p className="font-medium text-[#1A1A1A]">
                          {selectedOrder.shippingAddress.address}
                        </p>
                        <p>
                          {selectedOrder.shippingAddress.city},{" "}
                          {selectedOrder.shippingAddress.postalCode}
                        </p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A] font-poppins mb-4 flex items-center gap-2">
                    <Package size={20} className="text-[#B88E2F]" />
                    Order Items
                  </h3>
                  <div className="bg-[#FAF9F6] rounded-xl p-4 space-y-4 border border-[#E5E0D8]">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 bg-white p-3 rounded-lg border border-[#E5E0D8] shadow-sm"
                      >
                        <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden shrink-0 border border-[#E5E0D8]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1A1A] font-poppins truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Qty: {item.qty} x ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="font-medium text-[#B88E2F] font-poppins">
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-[#E5E0D8] pt-4 mt-4 flex justify-between items-center">
                      <span className="font-semibold text-[#1A1A1A] font-poppins">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-[#1A1A1A] font-poppins">
                        ₹{selectedOrder.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#E5E0D8] bg-gray-50 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 rounded-xl border border-[#E5E0D8] text-gray-700 font-medium hover:bg-white transition-colors cursor-pointer"
                  type="button"
                >
                  Close
                </button>
                {!selectedOrder.isDelivered && (
                  <button
                    onClick={() => {
                      markAsDelivered(selectedOrder._id);
                      setSelectedOrder(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <Truck size={18} />
                    Mark as Delivered
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#E5E0D8] overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] font-poppins">
                    Delete Order?
                  </h3>
                  <p className="text-gray-500 mt-2 font-poppins">
                    Are you sure you want to delete this order? This action
                    cannot be undone.
                  </p>
                </div>

                <div className="flex w-full gap-3 pt-2">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 px-4 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={!canConfirmDelete}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${
                      canConfirmDelete
                        ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 cursor-pointer"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {canConfirmDelete ? (
                      <>
                        <Trash2 size={16} />
                        Delete
                      </>
                    ) : (
                      `Confirm in ${deleteTimer}s`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
