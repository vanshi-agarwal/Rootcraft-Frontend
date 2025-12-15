"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";

/**
 * Product Interface
 */
interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  imagePublicId?: string;
  category: string;
  countInStock: number;
  sku?: string;
  tags?: string[];
  features?: string[];
}

/**
 * Product Management Page Component
 */
export default function ProductsPage() {
  // ==================== STATE MANAGEMENT ====================

  /** All products */
  const [products, setProducts] = useState<Product[]>([]);

  /** Filtered products */
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  /** Categories for filter */
  const [categories, setCategories] = useState<string[]>([]);

  /** Loading state */
  const [loading, setLoading] = useState(true);

  /** Search term */
  const [searchTerm, setSearchTerm] = useState("");

  /** Category filter */
  const [categoryFilter, setCategoryFilter] = useState("all");

  /** Stock filter */
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /** Delete modal */
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({ isOpen: false, product: null });

  /** Toast hook */
  const { showToast } = useToast();

  // ==================== LIFECYCLE HOOKS ====================

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, stockFilter]);

  // ==================== API FUNCTIONS ====================

  /**
   * Fetch all products
   */
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/products", {
                params: { pageNumber: 1, pageSize: 500 },
            });
            setProducts(data.products || []);
        } catch (error: any) {
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to fetch products",
            });
        } finally {
            setLoading(false);
        }
    };

  /**
   * Fetch categories
   */
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      const categoryNames = data.map((cat: any) => cat.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  /**
   * Filter products
   */
  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        (product.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Stock filter
    if (stockFilter === "in-stock") {
      filtered = filtered.filter((product) => (product.countInStock || 0) > 0);
    } else if (stockFilter === "out-of-stock") {
      filtered = filtered.filter(
        (product) => (product.countInStock || 0) === 0
      );
    }

    setFilteredProducts(filtered);
  };

  // reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts.length, rowsPerPage]);

  const totalPages = Math.max(
    1,
    Math.ceil((filteredProducts.length || 0) / rowsPerPage)
  );
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const start = (safePage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedProducts = filteredProducts.slice(start, end);

  /**
   * Delete product
   */
  const handleDeleteProduct = async () => {
    if (!deleteModal.product?._id) return;

    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      showToast({
        type: "success",
        action: "checkout_success",
        message: "Product deleted successfully",
      });
      setDeleteModal({ isOpen: false, product: null });
      fetchProducts();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to delete product",
      });
    }
  };

  // ==================== STATS CALCULATION ====================

  const stats = {
    total: products.length,
    inStock: products.filter((p) => (p.countInStock || 0) > 0).length,
    outOfStock: products.filter((p) => (p.countInStock || 0) === 0).length,
    avgPrice:
      products.length > 0
        ? (
            products.reduce((sum, p) => sum + (p.price || 0), 0) /
            products.length
          ).toFixed(2)
        : "0",
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* ========== STATS CARDS ========== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#B88E2F]/10 p-3">
              <Package className="h-6 w-6 text-[#B88E2F]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">
                Total Products
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        {/* In Stock */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-50 p-3">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">
                In Stock
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                {stats.inStock}
              </p>
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-50 p-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">
                Out of Stock
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                {stats.outOfStock}
              </p>
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-purple-50 p-3">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">
                Avg. Price
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                ${stats.avgPrice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== FILTERS AND CREATE BUTTON ========== */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Search and Create */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins text-sm cursor-text"
                  autoFocus
                />
              </div>
            </div>

            {/* Create Button */}
            <Link
              href="/admin/products/create"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#B88E2F] to-[#967223] text-white font-poppins font-medium hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              <span>Create Product</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-5 w-5 text-gray-600" />

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins text-sm cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins text-sm cursor-pointer"
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========== PRODUCTS TABLE ========== */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAF9F6] border-b border-[#E5E0D8]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Stock
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 border-4 border-[#B88E2F] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-600 font-poppins"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-[#FAF9F6] transition-colors"
                  >
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-lg bg-[#FAF9F6] border border-[#E5E0D8] overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A1A1A] font-poppins">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 font-poppins">
                            SKU: {product.sku || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#B88E2F]/10 text-[#B88E2F] font-poppins">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#1A1A1A] font-poppins">
                          ${product.price}
                        </span>
                        {product.oldPrice &&
                          product.oldPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through font-poppins">
                              ${product.oldPrice}
                            </span>
                          )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-poppins ${
                          (product.countInStock || 0) > 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {(product.countInStock || 0) > 0
                          ? `${product.countInStock} in stock`
                          : "Out of stock"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-2 rounded-lg text-[#B88E2F] hover:bg-[#B88E2F]/10 transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() =>
                            setDeleteModal({ isOpen: true, product })
                          }
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* ========== PAGINATION ========== */}
      {!loading && filteredProducts.length > 0 && (
        <div className="rounded-2xl border border-[#E5E0D8] bg-white shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600 font-poppins flex items-center gap-3">
            <span>
              Showing {filteredProducts.length === 0 ? 0 : start + 1}-
              {Math.min(end, filteredProducts.length)} of{" "}
              {filteredProducts.length}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FAF9F6] text-sm font-medium text-gray-700 hover:bg-[#E5E0D8] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ========== DELETE MODAL ========== */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setDeleteModal({ isOpen: false, product: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1A1A1A] font-poppins">
                    Confirm Delete
                  </h3>
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: false, product: null })
                    }
                    className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 font-poppins mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-[#1A1A1A]">
                    {deleteModal.product?.name}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: false, product: null })
                    }
                    className="flex-1 px-4 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-poppins font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-poppins font-medium hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
