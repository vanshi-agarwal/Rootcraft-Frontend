"use client";

/**
 * Icon Category Row Component
 * 
 * Displays categories with icons and product counts from the database
 * Fetches real categories from the API instead of hardcoded data
 */

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Armchair,
  BedDouble,
  UtensilsCrossed,
  Briefcase,
  Lamp,
  Archive,
  ArrowRight,
  Package,
} from "lucide-react";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

// ==================== TYPES ====================

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  productCount?: number;
}

// ==================== CONFIGURATION ====================

const THEME_GOLD = "#B88E2F";

/**
 * Map category names to icons
 * Falls back to Package icon if category not found
 */
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  const iconMap: Record<string, any> = {
    living: Armchair,
    "living room": Armchair,
    bedroom: BedDouble,
    dining: UtensilsCrossed,
    "home office": Briefcase,
    office: Briefcase,
    decor: Lamp,
    storage: Archive,
    outdoor: Archive,
  };

  // Try exact match first
  if (iconMap[name]) {
    return iconMap[name];
  }

  // Try partial match
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.includes(key) || key.includes(name)) {
      return icon;
    }
  }

  // Default icon
  return Package;
};

/**
 * Format product count display
 */
const formatProductCount = (count: number = 0): string => {
  if (count === 0) return "0 Items";
  if (count < 10) return `${count} Items`;
  return `${count}+ Items`;
};

// ==================== ANIMATION VARIANTS ====================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
} as const;

// ==================== MAIN COMPONENT ====================

const IconCategoryRow = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch categories from API
   */
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/categories");
      setCategories(data || []);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch categories on mount
   */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <section className="w-full bg-white py-16 sm:py-20 border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-3">
              Browse by Category
            </h2>
            <p className="text-gray-500 text-base sm:text-lg">
              Explore our wide range of premium furniture curated for every
              corner.
            </p>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 font-medium text-[#1A1A1A] hover:text-[#B88E2F] transition-colors whitespace-nowrap shrink-0"
          >
            View Full Catalog
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#B88E2F]" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-gray-500">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-4 px-6 py-2 bg-[#B88E2F] text-white rounded hover:bg-[#9c7826] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && categories.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
          >
            {categories.slice(0, 6).map((category) => (
              <CategoryItem key={category._id} category={category} />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// ==================== INDIVIDUAL CARD COMPONENT ====================

const CategoryItem = ({ category }: { category: Category }) => {
  const Icon = getCategoryIcon(category.name);
  const productCount = formatProductCount(category.productCount || 0);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/shop?category=${encodeURIComponent(category.name)}`} className="block h-full">
        <motion.div
          className="group relative h-[180px] sm:h-[220px] w-full rounded-2xl bg-[#F9F9F9] border border-transparent overflow-hidden cursor-pointer"
          whileHover="hover"
          initial="rest"
        >
          {/* Background Fill Animation */}
          <motion.div
            variants={{
              rest: { scaleY: 0, originY: 1 },
              hover: { scaleY: 1, originY: 1 },
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[#B88E2F] z-0"
          />

          {/* Content Container */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
            {/* Icon Wrapper */}
            <motion.div
              variants={{
                rest: { scale: 1, y: 0 },
                hover: { scale: 1.1, y: -5 },
              }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-4 rounded-full bg-white shadow-sm group-hover:bg-white/20 group-hover:backdrop-blur-md transition-colors"
            >
              <Icon
                strokeWidth={1.5}
                className="w-8 h-8 sm:w-10 sm:h-10 text-[#1A1A1A] group-hover:text-white transition-colors duration-300"
              />
            </motion.div>

            {/* Title */}
            <motion.h3 className="font-poppins font-semibold text-base sm:text-lg text-[#1A1A1A] group-hover:text-white transition-colors duration-300">
              {category.name}
            </motion.h3>

            {/* Subtitle (Item Count) */}
            <motion.p
              variants={{
                rest: { opacity: 0.5, y: 0 },
                hover: { opacity: 0.9, y: 0 },
              }}
              className="text-xs sm:text-sm text-gray-500 group-hover:text-white/80 mt-1 transition-colors duration-300"
            >
              {productCount}
            </motion.p>
          </div>

          {/* Border Hover Effect */}
          <div className="absolute inset-0 rounded-2xl border border-gray-100 group-hover:border-[#B88E2F]/50 transition-colors duration-300 pointer-events-none" />
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default IconCategoryRow;
