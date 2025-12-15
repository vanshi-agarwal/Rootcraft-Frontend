"use client";

/**
 * Shop Page Component
 *
 * Displays a filtered and sortable product grid with:
 * - Real-time product fetching from API
 * - Advanced filtering (search, category, price range)
 * - Sorting options (price, name, rating)
 * - Pagination support
 * - Responsive design with mobile filter drawer
 * - Loading states and error handling
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import FeaturesSection from "../components/FeaturesSection";
import api from "@/lib/axios";
import { useToast } from "../context/ToastContext";
import { Product } from "@/types/product";

// ==================== TYPES ====================

/**
 * API Product type (from backend)
 */
interface ApiProduct {
  _id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  tag?: {
    type: "discount" | "new";
    value: string;
  };
  [key: string]: any;
}

/**
 * Filter Content Props
 */
interface FilterContentProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  priceRange: [number | "", number | ""];
  setPriceRange: (val: [number | "", number | ""]) => void;
  categories: string[];
  minPrice: number;
  maxPrice: number;
}

// ==================== ANIMATION VARIANTS ====================

const drawerVariants = {
  hidden: { x: "100%", opacity: 0.5 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 200 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { ease: "easeInOut", duration: 0.3 },
  },
} as const;

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

// ==================== FILTER CONTENT COMPONENT ====================

/**
 * Reusable Filter Content Component
 * Memoized to prevent unnecessary re-renders
 */
const FilterContent = React.memo(
  ({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    categories,
  }: FilterContentProps) => (
    <div className="flex flex-col gap-8">
      {/* Search Input */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] outline-none transition-all font-poppins text-sm"
          />
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-poppins font-medium text-black mb-3 text-sm uppercase tracking-wider">
          Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-poppins transition-all duration-200 border cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#B88E2F] text-white border-[#B88E2F] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#B88E2F] hover:text-[#B88E2F]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="font-poppins font-medium text-black mb-3 text-sm uppercase tracking-wider">
          Price Range
        </h4>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ₹
            </span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([
                  e.target.value === "" ? "" : Number(e.target.value),
                  priceRange[1],
                ])
              }
              className="w-full h-11 pl-7 pr-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] outline-none text-sm"
            />
          </div>
          <span className="text-gray-400 font-medium">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ₹
            </span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([
                  priceRange[0],
                  e.target.value === "" ? "" : Number(e.target.value),
                ])
              }
              className="w-full h-11 pl-7 pr-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
);
FilterContent.displayName = "FilterContent";

// ==================== LOADING SKELETON ====================

/**
 * Product Card Skeleton Loader
 */
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="w-full aspect-4/3 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

export default function ShopPage() {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // ==================== STATE MANAGEMENT ====================

  /** Products from API */
  const [products, setProducts] = useState<Product[]>([]);

  /** Available categories */
  const [categories, setCategories] = useState<string[]>(["All"]);

  /** Loading state */
  const [loading, setLoading] = useState(true);

  /** Error state */
  const [error, setError] = useState<string | null>(null);

  /** Price range from API */
  const [priceRange, setPriceRangeState] = useState<{
    min: number;
    max: number;
  }>({
    min: 0,
    max: 100000,
  });

  /** User-selected price filter */
  const [userPriceRange, setUserPriceRange] = useState<
    [number | "", number | ""]
  >(["", ""]);

  /** UI State */
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showPerPage, setShowPerPage] = useState(16);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  /** Total products count */
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Transform API product to frontend product format
   */
  const transformProduct = useCallback((apiProduct: ApiProduct): Product => {
    return {
      id: apiProduct._id,
      slug: apiProduct.slug,
      name: apiProduct.name,
      description: apiProduct.description,
      price: apiProduct.price,
      oldPrice: apiProduct.oldPrice,
      image: apiProduct.image,
      category: apiProduct.category,
      rating: apiProduct.rating,
      reviews: apiProduct.reviews,
      tag: apiProduct.tag,
    };
  }, []);

  /**
   * Fetch products from API with filters
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params: Record<string, string | number> = {
        pageNumber: currentPage,
        pageSize: showPerPage,
      };

      if (searchQuery.trim()) {
        params.keyword = searchQuery.trim();
      }

      if (selectedCategory !== "All") {
        params.category = selectedCategory;
      }

      if (userPriceRange[0] !== "" && userPriceRange[0] !== 0) {
        params.minPrice = userPriceRange[0] as number;
      }

      if (userPriceRange[1] !== "" && userPriceRange[1] !== 0) {
        params.maxPrice = userPriceRange[1] as number;
      }

      if (sortBy !== "default") {
        params.sortBy = sortBy;
      }

      // Fetch products
      const { data } = await api.get("/products", { params });

      // Transform products
      const transformedProducts = data.products.map(transformProduct);
      setProducts(transformedProducts);

      const inferredTotal =
        typeof data.totalProducts === "number"
          ? data.totalProducts
          : typeof data.total === "number"
          ? data.total
          : typeof data.count === "number"
          ? data.count
          : Array.isArray(data.products)
          ? data.products.length
          : 0;

      const inferredPages =
        typeof data.pages === "number" && data.pages > 0
          ? data.pages
          : inferredTotal > 0
          ? Math.ceil(inferredTotal / showPerPage)
          : 1;

      setTotalProducts(inferredTotal);
      setTotalPages(inferredPages);

      // Update price range if available
      if (data.priceRange) {
        setPriceRangeState({
          min: data.priceRange.min || 0,
          max: data.priceRange.max || 100000,
        });
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load products. Please try again."
      );
      showToast({
        type: "error",
        action: "auth_error",
        message: "Failed to load products",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    showPerPage,
    searchQuery,
    selectedCategory,
    userPriceRange,
    sortBy,
    transformProduct,
    showToast,
  ]);

  /**
   * Fetch categories from API
   */
  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories");
      const categoryNames = data.map((cat: any) => cat.name);
      setCategories(["All", ...categoryNames]);
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Don't show error toast for categories, just use default
    }
  }, []);

  // ==================== EFFECTS ====================

  /**
   * Fetch products when filters change
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /**
   * Fetch categories on mount
   */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Reset to page 1 when filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, showPerPage, userPriceRange, sortBy]);

  /**
   * Prevent body scroll when mobile drawer is open
   */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const html = document.documentElement;
    const originalBodyOverflow = body.style.overflow;
    const originalHtmlOverflow = html.style.overflow;

    if (isMobileDrawerOpen) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    } else {
      body.style.overflow = originalBodyOverflow || "";
      html.style.overflow = originalHtmlOverflow || "";
    }

    return () => {
      body.style.overflow = originalBodyOverflow;
      html.style.overflow = originalHtmlOverflow;
    };
  }, [isMobileDrawerOpen]);

  // ==================== HANDLERS ====================

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        tag: product.tag,
      });
    },
    [addToCart]
  );

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("All");
    setUserPriceRange(["", ""]);
    setSortBy("default");
  }, []);

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF8F3]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center overflow-hidden px-4">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage: "url('/shop-bg.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-white/20 z-10" />
          <div className="relative z-20 flex flex-col items-center gap-3 text-center">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-poppins font-bold text-3xl sm:text-5xl text-[#3A3A3A] tracking-tight"
            >
              Shop
            </motion.h1>
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
              <span className="text-gray-500">Shop</span>
            </motion.div>
          </div>
        </section>

        {/* Control Bar */}
        <div className="bg-[#F9F1E7]/95 border-y border-[#B88E2F]/10 shadow-sm backdrop-blur-md sticky top-[65px] md:top-[73px] z-30">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px] py-3 sm:py-4 flex items-center justify-between">
            {/* Left: Filter Triggers */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => setIsDesktopFilterOpen(!isDesktopFilterOpen)}
                className="hidden md:flex items-center gap-2 text-black hover:text-[#B88E2F] transition-colors group cursor-pointer"
              >
                <div className="p-1.5 bg-transparent group-hover:bg-[#B88E2F]/10 rounded-md transition-colors">
                  <SlidersHorizontal size={20} />
                </div>
                <span className="font-poppins text-base font-medium">
                  Filter
                </span>
              </button>

              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="md:hidden p-2 bg-white rounded-lg shadow-sm text-black active:scale-95 transition-transform"
              >
                <SlidersHorizontal size={20} />
              </button>

              <div className="hidden sm:block h-6 border-l border-gray-400 mx-2 opacity-50" />

              <p className="hidden sm:block font-poppins text-sm text-gray-600">
                Showing{" "}
                <span className="text-black font-medium">
                  {loading
                    ? "..."
                    : products.length > 0
                    ? (currentPage - 1) * showPerPage + 1
                    : 0}
                  –
                  {loading
                    ? "..."
                    : Math.min(currentPage * showPerPage, totalProducts)}
                </span>{" "}
                of {loading ? "..." : totalProducts} results
              </p>
            </div>

            {/* Right: Sort & Layout */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-poppins text-sm text-gray-600">Show</span>
                <div className="relative">
                  <select
                    value={showPerPage}
                    onChange={(e) => setShowPerPage(Number(e.target.value))}
                    className="appearance-none bg-white py-1.5 pl-3 pr-2 text-sm text-gray-700 rounded-md focus:outline-none cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-poppins text-sm text-gray-600">
                  Sort by
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white h-9 pl-3 pr-8 text-sm text-gray-700 rounded-md focus:outline-none cursor-pointer border border-transparent hover:border-gray-200 min-w-[130px]"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="rating">Rating: High to Low</option>
                  </select>
                  <ArrowUpDown
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={12}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Filter Panel */}
          <AnimatePresence>
            {isDesktopFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="hidden md:block overflow-hidden bg-white border-b border-gray-100 shadow-inner"
              >
                <div className="max-w-[1440px] mx-auto px-[100px] py-6">
                  <FilterContent
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={userPriceRange}
                    setPriceRange={setUserPriceRange}
                    categories={categories}
                    minPrice={priceRange.min}
                    maxPrice={priceRange.max}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Products Grid */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px] py-10">
          {/* Loading State */}
          {loading && (
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            >
              {Array.from({ length: showPerPage }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </motion.div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-20">
              <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {error}
              </h3>
              <button
                onClick={fetchProducts}
                className="mt-6 px-6 py-2 bg-[#B88E2F] text-white rounded hover:bg-[#9c7826] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-medium text-gray-900">
                No products found
              </h3>
              <p className="text-gray-500 mt-2">
                Try changing your filters or search term.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 px-6 py-2 bg-[#B88E2F] text-white rounded hover:bg-[#9c7826] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <motion.div
              layout
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-16">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-5 h-[45px] bg-[#F9F1E7] rounded-lg text-black text-sm hover:bg-[#B88E2F] hover:text-white disabled:opacity-50 disabled:hover:bg-[#F9F1E7] disabled:hover:text-black transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                    className={`w-[45px] h-[45px] rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${
                      currentPage === page
                        ? "bg-[#B88E2F] text-white shadow-md"
                        : "bg-[#F9F1E7] text-black hover:bg-[#B88E2F] hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || loading}
                className="px-5 h-[45px] bg-[#F9F1E7] rounded-lg text-black text-sm hover:bg-[#B88E2F] hover:text-white disabled:opacity-50 disabled:hover:bg-[#F9F1E7] disabled:hover:text-black transition-colors font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </section>

        <FeaturesSection />
      </main>
      <Footer />

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-white z-50 shadow-2xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold font-poppins">
                  Filter & Sort
                </h2>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <FilterContent
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={userPriceRange}
                  setPriceRange={setUserPriceRange}
                  categories={categories}
                  minPrice={priceRange.min}
                  maxPrice={priceRange.max}
                />

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="font-poppins font-medium text-black mb-3">
                    Sort Order
                  </h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 px-4 bg-gray-50 rounded-lg text-sm border border-gray-200 outline-none focus:border-[#B88E2F]"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="rating">Rating: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-full py-3 bg-[#B88E2F] text-white rounded-lg font-medium shadow-md active:scale-95 transition-transform"
                >
                  Show Results ({totalProducts})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
