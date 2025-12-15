"use client";

/**
 * Our Products Section Component
 *
 * Displays featured products from the database on the home page
 * Fetches real products from the API instead of dummy data
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ProductCard from "../ProductCard";
import { useCart } from "../../context/CartContext";
import SplitText from "../SplitText";
import api from "@/lib/axios";
import { Product } from "@/types/product";
import { Loader2 } from "lucide-react";

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

// ==================== MAIN COMPONENT ====================

const OurProducts = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
   * Fetch products from API
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch first 9 products (sorted by newest first)
      const { data } = await api.get("/products", {
        params: {
          pageNumber: 1,
          pageSize: 9,
          sortBy: "default", // Newest first
        },
      });

      // Transform products
      const transformedProducts = data.products.map(transformProduct);
      setProducts(transformedProducts);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      // Don't show toast on home page, just log error
    } finally {
      setLoading(false);
    }
  }, [transformProduct]);

  /**
   * Fetch products on mount
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  return (
    <section className="py-16 lg:py-20 bg-white w-full">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px]">
        {/* Section Title */}
        <div className="text-center mb-8 md:mb-12">
          <SplitText
            tag="h2"
            text="Our Products"
            textAlign="center"
            className="font-poppins font-bold text-[32px] md:text-[40px] text-[#3A3A3A]"
            splitType="words"
            delay={80}
            duration={0.5}
            rootMargin="-100px"
          />
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
              onClick={fetchProducts}
              className="mt-4 px-6 py-2 bg-[#B88E2F] text-white rounded hover:bg-[#9c7826] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <motion.div
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1, // Makes cards cascade in nicely
                },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">
              No products available at the moment.
            </p>
          </div>
        )}

        {/* Show More Button */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-12 flex justify-center">
            <motion.a
              href={"/shop"}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "#B88E2F",
                color: "#FFFFFF",
                borderColor: "#B88E2F",
              }}
              className="px-[80px] py-[12px] border border-[#B88E2F] text-[#B88E2F] font-poppins font-semibold text-base transition-all duration-300"
            >
              Show More
            </motion.a>
          </div>
        )}
      </div>
    </section>
  );
};

export default OurProducts;
