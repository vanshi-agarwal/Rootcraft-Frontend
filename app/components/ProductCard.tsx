"use client";

import { memo, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Share2, Heart, ShoppingCart, Star, ArrowDown } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";

// --- Types ---
import { Product } from "@/types/product";

const FALLBACK_IMAGE = "/product/pd-1.jpg";
const BROKEN_IMAGE_MAP: Record<string, string> = {
  "bookshelf-with-ladder": "/product/pd-5.jpg",
  "executive-leather-chair": "/product/pd-2.jpg",
  "handcrafted-wooden-photo-frame-set": "/product/pd-6.jpg",
  "corner-display-cabinet": "/product/pd-4.jpg",
  "wall-mounted-shelves-set": "/product/pd-4.jpg",
  "l-shaped-office-desk": "/product/pd-2.jpg",
  "sliding-door-wardrobe": "/product/pd-7.jpg",
  "single-bed-with-trundle": "/product/pd-7.jpg",
  "sheesham-wood-dining-table": "/product/pd-9.jpg",
  "upholstered-dining-chairs-set-4": "/product/pd-3.jpg",
  "extendable-dining-table": "/product/pd-9.jpg",
  "wooden-crockery-cabinet": "/product/pd-4.jpg",
  "round-dining-table-for-4": "/product/pd-9.jpg",
};

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

const ProductCard = memo(({ product, onAddToCart }: ProductCardProps) => {
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const isWishlisted = isInWishlist(product.id);

  // Use ref for intersection observer
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, {
    once: true,
    margin: "-80px",
    amount: 0.2,
  });

  // --- Helpers ---

  // Format Currency: INR
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate Discount Percentage
  const discountPercentage = useMemo(() => {
    if (product.oldPrice && product.oldPrice > product.price) {
      return Math.round(
        ((product.oldPrice - product.price) / product.oldPrice) * 100
      );
    }
    return 0;
  }, [product.price, product.oldPrice]);

  // Generate Dummy Rating if not present (for visual completeness based on ref)
  const rating = product.rating || 4.5;

  // Deterministic review count to avoid hydration mismatch
  const reviewCount = useMemo(() => {
    if (product.reviews) return product.reviews;
    // Simple hash from product ID
    let hash = 0;
    for (let i = 0; i < product.id.length; i++) {
      hash = product.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 50) + 10; // Range 10-60
  }, [product.reviews, product.id]);

  // --- Handlers ---

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    if (target.dataset.processing === "true") return;
    target.dataset.processing = "true";

    toggleWishlist({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image || "/placeholder.jpg",
      tag: product.tag,
    });

    setTimeout(() => {
      if (target) delete target.dataset.processing;
    }, 300);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const basePath =
      typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = product.slug
      ? `${basePath}/product/${product.slug}`
      : window.location.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast({
        type: "success",
        action: "share",
        message: "Link copied!",
      });
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <Link
      href={product.slug ? `/product/${product.slug}` : "/product"}
      className="block h-full"
    >
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full will-change-transform cursor-pointer"
      >
        {/* --- Image Section --- */}
        <div className="relative w-full aspect-4/3 overflow-hidden bg-[#F4F5F7]">
          <Image
            src={fallbackSrc || BROKEN_IMAGE_MAP[product.slug] || product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => {
              if (!fallbackSrc)
                setFallbackSrc(
                  BROKEN_IMAGE_MAP[product.slug] || FALLBACK_IMAGE
                );
            }}
          />

          {/* Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

          {/* --- Floating Action Buttons (Top Right) --- */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlistClick}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
              title="Add to Wishlist"
            >
              <Heart
                size={18}
                fill={isWishlisted ? "#ef4444" : "none"}
                className={isWishlisted ? "text-red-500" : ""}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShareClick}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md text-gray-600 hover:text-[#B88E2F] transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 size={18} />
            </motion.button>
          </div>

          {/* --- Badges --- */}
          {product.tag && (
            <div
              className={`
              absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-sm z-10 pointer-events-none
              ${product.tag.type === "discount" ? "bg-red-500" : "bg-[#2EC1AC]"}
            `}
            >
              {product.tag.value}
            </div>
          )}
        </div>

        {/* --- Content Section --- */}
        <div className="p-4 flex flex-col gap-2 grow">
          {/* Title */}
          <h3 className="font-poppins font-medium text-base text-gray-800 line-clamp-2 leading-snug group-hover:text-[#B88E2F] transition-colors">
            {product.name}
          </h3>

          {/* Description (Optional - Hidden on small cards to save space, or kept brief) */}
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-1">
              {product.description}
            </p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex text-orange-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(rating) ? "currentColor" : "none"}
                  className={i < Math.floor(rating) ? "" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-medium ml-1">
              ({reviewCount})
            </span>
          </div>

          {/* Price Section */}
          <div className="mt-auto pt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Discount Indicator */}
              {discountPercentage > 0 && (
                <div className="flex items-center text-green-600 font-bold text-sm">
                  <ArrowDown size={14} strokeWidth={3} />
                  <span>{discountPercentage}%</span>
                </div>
              )}

              {/* Current Price */}
              <span className="font-poppins font-semibold text-lg text-gray-900">
                {formatCurrency(product.price)}
              </span>

              {/* Old Price */}
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="font-poppins text-sm text-gray-400 line-through decoration-gray-400/60">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Add to Cart Icon Button */}
            <motion.button
              whileHover={{
                scale: 1.1,
                backgroundColor: "#B88E2F",
                color: "#fff",
              }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:shadow-md transition-all duration-300 cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingCart size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
