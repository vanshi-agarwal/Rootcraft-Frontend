"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Minus,
  Plus,
  Heart,
  Share2,
  Box,
  ChevronRight,
  MessageCircle,
  Send,
  CheckCircle2,
  Rotate3d,
  Truck,
  ShieldCheck,
  Award,
  ShoppingCartIcon,
  Smartphone,
  BoxIcon,
} from "lucide-react";
import Link from "next/link";

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ModelViewer from "@/app/components/ModelViewer";
import ProductCard from "@/app/components/ProductCard";
import Testimonials from "@/app/components/Home/Testimonials";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useToast } from "@/app/context/ToastContext";
import { Product } from "@/types/product";
import { formatINR } from "@/lib/pricing";

type ProductDetailClientProps = {
  product: Product;
  relatedProducts: Product[];
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

type ModelViewerElement = HTMLElement & {
  activateAR?: () => void;
};

const REVIEWS_DATA = [
  {
    id: 1,
    user: "Sarah M.",
    rating: 5,
    comment: "Absolutely stunning! The velvet feels incredible.",
    date: "2 days ago",
  },
  {
    id: 2,
    user: "John D.",
    rating: 4,
    comment: "Great chair, but delivery took a bit longer than expected.",
    date: "1 week ago",
  },
];

const FALLBACK_GALLERY = [
  "/product/pd-1.jpg",
  "/product/pd-2.jpg",
  "/product/pd-3.jpg",
  "/product/pd-4.jpg",
];

const FALLBACK_COLORS = [
  { name: "Teal", value: "#2F4F4F" },
  { name: "Charcoal", value: "#333333" },
  { name: "Sand", value: "#D2B48C" },
];

type Review = (typeof REVIEWS_DATA)[number];

const QUESTIONS_DATA = [
  {
    id: 1,
    question: "Does this product arrive assembled?",
    answer:
      "It comes 90% assembled. You only need to attach the legs using the tool provided in the box.",
  },
  {
    id: 2,
    question: "Can the covers be removed for washing?",
    answer:
      "Yes, the cushions include concealed zippers so you can dry-clean the covers with ease.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};


export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const modelViewerRef = useRef<ModelViewerElement | null>(null);

  const gallery = useMemo(() => {
    const normalized =
      product.gallery?.length && Array.isArray(product.gallery)
        ? (product.gallery
            .map((item) => (typeof item === "string" ? item : item?.url || ""))
            .filter(Boolean) as string[])
        : [];

    const images = normalized.length ? normalized : [product.image];
    if (images.length >= 4) {
      return images.slice(0, 4);
    }
    const merged = Array.from(new Set([...images, ...FALLBACK_GALLERY])).slice(
      0,
      4
    );
    return merged;
  }, [product.gallery, product.image]);

  const colors =
    product.colors?.length && product.colors.length > 0
      ? product.colors
      : FALLBACK_COLORS;

  const [activeImage, setActiveImage] = useState(0);
  const [viewMode, setViewMode] = useState<"image" | "3d">("image");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [activeTab, setActiveTab] = useState<"desc" | "reviews" | "qa">("desc");
  const [isAdded, setIsAdded] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [questionValue, setQuestionValue] = useState("");
  const [isQuestionSubmitting, setIsQuestionSubmitting] = useState(false);
  const [questions, setQuestions] = useState(QUESTIONS_DATA);
  const [arReady, setArReady] = useState(false);
  const [arMessage, setArMessage] = useState<string | null>(null);
  const [arLaunching, setArLaunching] = useState(false);
  const ModelViewerTag = "model-viewer" as any;
  const [imageFallback, setImageFallback] = useState<string | null>(null);

  const isWishlisted = isInWishlist(product.id);
  const customerReviews: Review[] =
    (product as any).customerReviews?.length > 0
      ? ((product as any).customerReviews as Review[])
      : REVIEWS_DATA;
  const reviewCount =
    product.reviews ?? customerReviews?.length ?? REVIEWS_DATA.length;
  const ratingValue =
    product.rating ??
    (customerReviews.length
      ? customerReviews.reduce(
          (total: number, review: { rating: number }) => total + review.rating,
          0
        ) / customerReviews.length
      : 4.5);
  const productTags = product.tags?.length ? product.tags : [product.category];
  const sku = product.sku ?? product.id;
  const modelSrc = product.modelSrc ?? "/chair.glb";
  const displayImage = imageFallback || gallery[activeImage] || product.image;

  // Load Google model-viewer web component for AR support (mobile-friendly)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).customElements?.get("model-viewer")) {
      setArReady(true);
      return;
    }

    const existing = document.getElementById("model-viewer-script");
    if (existing) {
      existing.addEventListener("load", () => setArReady(true), { once: true });
      existing.addEventListener(
        "error",
        () => setArMessage("AR component failed to load."),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "model-viewer-script";
    script.type = "module";
    script.src =
      "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => setArReady(true);
    script.onerror = () =>
      setArMessage(
        "AR component failed to load. Please refresh and try again."
      );
    document.head.appendChild(script);
  }, []);

  const addProductToCart = (item: Product, qty = 1) => {
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        tag: item.tag,
      });
    }
  };

  const handleAddCurrentToCart = () => {
    setIsAdded(true);
    addProductToCart(product, quantity);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleViewInSpace = () => {
    if (!arReady || !modelViewerRef.current) {
      setArMessage("AR is not available on this device.");
      showToast({
        type: "error",
        action: "auth_error",
        message: "AR is not available on this device.",
      });
      return;
    }
    try {
      setArLaunching(true);
      modelViewerRef.current.activateAR?.();
      setTimeout(() => setArLaunching(false), 800);
    } catch (err) {
      console.error("AR launch failed", err);
      setArLaunching(false);
      setArMessage("Could not launch AR. Please try again.");
      showToast({
        type: "error",
        action: "auth_error",
        message: "Could not launch AR. Please try again.",
      });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    if (target.hasAttribute("data-processing")) {
      return;
    }
    target.setAttribute("data-processing", "true");

    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      oldPrice: product.oldPrice,
      tag: product.tag,
    });

    setTimeout(() => {
      if (target && target.hasAttribute("data-processing")) {
        target.removeAttribute("data-processing");
      }
    }, 300);
  };

  const handleShare = async () => {
    const basePath =
      typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${basePath}/product/${product.slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReviewSubmitting) return;
    if (!reviewRating || reviewComment.trim().length < 10) {
      showToast({
        type: "error",
        action: "contact_form_submit",
        message: "Please add a rating and at least 10 characters.",
      });
      return;
    }
    setIsReviewSubmitting(true);
    setTimeout(() => {
      showToast({
        type: "success",
        action: "contact_form_submit",
        message: "Thanks for sharing your review!",
      });
      setReviewRating(0);
      setReviewComment("");
      setIsReviewSubmitting(false);
    }, 600);
  };

  const handleQuestionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isQuestionSubmitting) return;
    if (!questionValue.trim()) {
      showToast({
        type: "error",
        action: "contact_form_submit",
        message: "Please type your question first.",
      });
      return;
    }
    setIsQuestionSubmitting(true);
    setTimeout(() => {
      showToast({
        type: "success",
        action: "contact_form_submit",
        message: "Question submitted! We will reply shortly.",
      });
      setQuestions((prev) => [
        {
          id: prev.length + 1,
          question: questionValue.trim(),
          answer:
            "Thanks for asking! Our support team will respond within 24 hours.",
        },
        ...prev,
      ]);
      setQuestionValue("");
      setIsQuestionSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className=" w-full" />

      {/* Hidden AR model-viewer for native AR triggers (mobile) */}
      <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
        {arReady && (
          <ModelViewerTag
            ref={(node: Element | null) => {
              modelViewerRef.current = (node as ModelViewerElement) ?? null;
            }}
            src={modelSrc}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            autoplay
            shadow-intensity="1"
            exposure="1"
            alt={`${product.name} 3D model`}
          />
        )}
      </div>

      {/* Breadcrumb */}
      <div className="bg-[#F9F1E7] py-4 pt-18">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px] flex items-center gap-3 text-base font-poppins">
          <Link href="/">
            <span className="text-[#9F9F9F]">Home</span>
          </Link>
          <ChevronRight size={16} className="text-black" />
          <Link href="/shop">
            <span className="text-[#9F9F9F]">Shop</span>
          </Link>
          <ChevronRight size={16} className="text-black" />
          <div className="w-[2px] h-[24px] bg-[#9F9F9F] mx-2 hidden sm:block" />
          <span className="font-medium text-black">{product.name}</span>
        </div>
      </div>

      <main className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px] py-10 lg:py-12">
          {/* Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-8 lg:sticky lg:top-[110px] h-fit">
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0">
              {gallery.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => {
                    setActiveImage(idx);
                    setViewMode("image");
                    setImageFallback(null);
                  }}
                  className={`relative w-[70px] h-[70px] md:w-[80px] md:h-[80px] bg-[#F9F1E7] rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-300 cursor-pointer ${
                    activeImage === idx && viewMode === "image"
                      ? "border-[#B88E2F] shadow-md"
                      : "border-transparent hover:border-[#B88E2F]/50"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`View ${idx}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
              <button
                onClick={() => setViewMode("3d")}
                className={`relative w-[70px] h-[70px] md:w-[80px] md:h-[80px] bg-[#FFF9F0] rounded-lg flex flex-col items-center justify-center text-[10px] md:text-xs font-medium border-2 transition-all duration-300 cursor-pointer ${
                  viewMode === "3d"
                    ? "border-[#B88E2F] text-[#B88E2F] shadow-md"
                    : "border-[#F9F1E7] text-gray-500 hover:border-[#B88E2F]/50"
                }`}
              >
                <Box size={24} className="mb-1" />
                3D View
              </button>
            </div>

            <div className="flex-1 relative bg-[#F9F1E7] rounded-[10px] overflow-hidden aspect-square lg:aspect-auto lg:h-[550px] 2xl:h-[600px]">
              <AnimatePresence mode="wait">
                {viewMode === "3d" ? (
                  <motion.div
                    key="3d-model"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <ModelViewer
                      src={modelSrc}
                      scale={1.9}
                      shadows={false}
                      shadowIntensity={0}
                      preset="city"
                      autoRotate={false}
                      enableZoom
                      className="w-full h-full"
                      position={[0, -0.6, 0]}
                      rotation={[0, -0.3, 0]}
                      cameraPosition={[0, 0, 7]}
                      intensity={0.5}
                      float
                      viewAllAngles
                      priority
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-xs font-medium flex items-center gap-2 pointer-events-none text-[#666]">
                      <Rotate3d size={16} className="text-[#B88E2F]" />
                      Drag to rotate
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="static-image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full relative group flex items-center justify-center"
                  >
                    <Image
                      src={displayImage}
                      alt={product.name}
                      fill
                      className="object-contain p-6"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      priority
                      onError={() => setImageFallback(FALLBACK_GALLERY[0])}
                    />
                    <button
                      onClick={() => setViewMode("3d")}
                      className="absolute top-4 right-4 bg-white hover:bg-[#B88E2F] hover:text-white text-black p-2.5 rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 cursor-pointer"
                      title="Switch to 3D"
                    >
                      <Box size={22} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Product Details */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex flex-col"
          >
            <h1 className="font-poppins font-medium text-[32px] md:text-[42px] text-black leading-tight mb-2 line-clamp-2 overflow-hidden">
              {product.name}
            </h1>
            <p className="font-poppins font-medium text-2xl text-[#9F9F9F] mb-4">
              {formatINR(product.price)}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-[#FFC700]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.floor(ratingValue) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <div className="w-px h-[30px] bg-[#9F9F9F]" />
              <span className="font-poppins text-sm text-[#9F9F9F]">
                {reviewCount} Customer Reviews
              </span>
            </div>

            <p className="font-poppins text-[14px] text-black leading-relaxed mb-6 max-w-lg">
              {product.description}
            </p>

            <ul className="space-y-2 mb-8">
              {(product.features ?? []).map((feature, i) => (
                <li
                  key={`${feature}-${i}`}
                  className="flex items-center gap-3 text-sm font-poppins text-[#666]"
                >
                  <CheckCircle2 size={16} className="text-[#B88E2F]" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mb-8">
              <span className="font-poppins text-[#9F9F9F] text-sm block mb-3">
                Select Color
              </span>
              <div className="flex gap-4">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-[32px] h-[32px] rounded-full transition-all duration-200 hover:scale-110 cursor-pointer ${
                      selectedColor.name === color.name
                        ? "ring-2 ring-offset-2 ring-[#B88E2F] scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <div className="flex items-center justify-between w-[120px] h-[55px] border border-[#9F9F9F] px-4 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="hover:text-[#B88E2F] transition-colors p-1 cursor-pointer"
                >
                  <Minus size={16} />
                </button>
                <span className="font-poppins font-medium text-base">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="hover:text-[#B88E2F] transition-colors p-1 cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddCurrentToCart}
                disabled={isAdded}
                className="flex item-center gap-3 px-8 py-4 bg-[#333333] text-white font-poppins font-medium hover:bg-[#B88E2F] transition-all duration-300 rounded-sm shadow-lg hover:shadow-[#B88E2F]/30 cursor-pointer"
              >
                {isAdded ? (
                  <>
                    Added <CheckCircle2 size={20} />
                  </>
                ) : (
                  <>
                    Add to Cart <ShoppingCartIcon size={20} />
                  </>
                )}
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleWishlistToggle(e)}
                className={`flex item-center gap-3 px-8 py-4 font-poppins font-medium transition-all duration-300 rounded-sm shadow-lg cursor-pointer ${
                  isWishlisted
                    ? "bg-[#E97171] text-white hover:bg-[#d85a5a] hover:shadow-[#E97171]/30"
                    : "bg-[#333333] text-white hover:bg-[#B88E2F] hover:shadow-[#B88E2F]/30"
                }`}
              >
                <Heart
                  size={22}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </motion.button>

              {/* AR Button */}
              <motion.button
                whileHover={{ scale: arLaunching ? 1 : 1.04 }}
                whileTap={{ scale: arLaunching ? 1 : 0.96 }}
                onClick={handleViewInSpace}
                disabled={arLaunching}
                className="flex items-center gap-3 px-8 py-4 font-poppins font-medium transition-all duration-300 rounded-sm shadow-lg cursor-pointer bg-white text-[#B88E2F] border border-[#B88E2F] hover:bg-[#B88E2F] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <BoxIcon size={20} />
                {arLaunching ? "Opening AR..." : "View in your space"}
                <Smartphone size={18} className="opacity-70" />
              </motion.button>
            </div>

            {arMessage && (
              <p className="text-xs text-[#9F9F9F] mb-6" aria-live="polite">
                {arMessage}
              </p>
            )}

            <div className="border-t border-[#D9D9D9] pt-8 space-y-3 font-poppins text-[15px] text-[#9F9F9F]">
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-normal">SKU</span>
                <span className="text-[#666]">: {sku}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-normal">Category</span>
                <span className="text-[#666]">: {product.category}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="font-normal">Tags</span>
                <span className="text-[#666]">: {productTags.join(", ")}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center">
                <span className="font-normal">Share</span>
                <div className="flex gap-4 text-black">
                  <span className="text-[#666]">:</span>
                  <button
                    onClick={handleShare}
                    className="text-black hover:text-[#B88E2F] transition-colors"
                    aria-label="Copy product link"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-20 pt-10 border-t border-[#D9D9D9] max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px] py-10 lg:py-12">
          <div className="flex flex-wrap justify-center gap-4 md:gap-10 mb-12">
            {[
              { id: "desc", label: "Description" },
              { id: "reviews", label: `Reviews (${reviewCount})` },
              { id: "qa", label: `Questions (${questions.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`font-poppins text-lg sm:text-xl transition-all relative pb-2 cursor-pointer min-w-[140px] text-center ${
                  activeTab === tab.id
                    ? "font-semibold text-black"
                    : "text-[#9F9F9F] hover:text-black"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-black"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="max-w-[1024px] mx-auto px-4">
            <AnimatePresence mode="wait">
              {activeTab === "desc" && (
                <motion.div
                  key="desc"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6 text-[#9F9F9F] font-poppins leading-relaxed"
                >
                  <p className="mb-4">
                    Embodying the raw, wayward spirit of rock n roll, the
                    Kilburn portable active stereo speaker takes the
                    unmistakable look and sound of Marshall, unplugs the chords,
                    and takes the show on the road.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-[#F9F1E7] p-6 rounded-lg text-center">
                      <Truck
                        size={32}
                        className="mx-auto mb-3 text-[#B88E2F]"
                      />
                      <h4 className="text-black font-medium mb-1">
                        Free Delivery
                      </h4>
                      <p className="text-xs">For all orders over Rs 5000</p>
                    </div>
                    <div className="bg-[#F9F1E7] p-6 rounded-lg text-center">
                      <ShieldCheck
                        size={32}
                        className="mx-auto mb-3 text-[#B88E2F]"
                      />
                      <h4 className="text-black font-medium mb-1">
                        Secure Payment
                      </h4>
                      <p className="text-xs">100% secure payment</p>
                    </div>
                    <div className="bg-[#F9F1E7] p-6 rounded-lg text-center">
                      <Award
                        size={32}
                        className="mx-auto mb-3 text-[#B88E2F]"
                      />
                      <h4 className="text-black font-medium mb-1">
                        Quality Guarantee
                      </h4>
                      <p className="text-xs">Premium materials only</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-2 gap-12"
                >
                  <div className="space-y-6">
                    {customerReviews.map(
                      (review: (typeof REVIEWS_DATA)[number]) => (
                        <div
                          key={review.id ?? review.user}
                          className="border-b border-gray-100 pb-6 last:border-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                {review.user[0]}
                              </div>
                              <h4 className="font-semibold text-black">
                                {review.user}
                              </h4>
                            </div>
                            <span className="text-xs text-[#9F9F9F]">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex text-[#FFC700] mb-2 pl-12">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={
                                  i < review.rating ? "currentColor" : "none"
                                }
                              />
                            ))}
                          </div>
                          <p className="text-[#666] text-sm pl-12">
                            {review.comment}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                  <div className="bg-[#F9F1E7] p-8 rounded-[10px] h-fit">
                    <h3 className="font-poppins font-medium text-xl mb-4">
                      Add a Review
                    </h3>
                    <form className="space-y-4" onSubmit={handleReviewSubmit}>
                      <div>
                        <label className="block text-sm text-[#9F9F9F] mb-1">
                          Your Rating
                        </label>
                        <div className="flex gap-1 text-[#FFC700]">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewRating(s)}
                              className="cursor-pointer"
                            >
                              <Star
                                size={24}
                                className="hover:scale-110 transition-transform"
                                fill={
                                  s <= reviewRating ? "currentColor" : "none"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        placeholder="Write your experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full h-[100px] p-4 rounded-md border border-[#D9D9D9] focus:outline-none focus:border-[#B88E2F] bg-white"
                      />
                      <button
                        type="submit"
                        disabled={isReviewSubmitting}
                        className="px-8 py-3 bg-[#B88E2F] text-white font-poppins font-medium rounded-md hover:bg-black transition-colors w-full disabled:opacity-60"
                      >
                        {isReviewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "qa" && (
                <motion.div
                  key="qa"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white border border-gray-200 p-6 rounded-lg flex gap-4"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                        <MessageCircle size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-black text-sm mb-1">
                          Q: {q.question}
                        </h4>
                        <p className="text-[#666] text-sm">A: {q.answer}</p>
                      </div>
                    </div>
                  ))}
                  <form
                    className="relative mt-6"
                    onSubmit={handleQuestionSubmit}
                  >
                    <input
                      type="text"
                      value={questionValue}
                      onChange={(e) => setQuestionValue(e.target.value)}
                      placeholder="Ask a question about this product..."
                      className="w-full p-4 pr-12 rounded-lg border border-[#9F9F9F] focus:border-[#B88E2F] outline-none bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isQuestionSubmitting}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9F9F] hover:text-[#B88E2F] disabled:opacity-60"
                    >
                      {isQuestionSubmitting ? (
                        <Send size={20} className="animate-pulse" />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Testimonials */}
        <Testimonials />

        {/* Related */}
        <section className="mt-24 mb-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px] py-10 lg:py-12">
          <h2 className="font-poppins font-medium text-3xl text-center mb-10">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={(selected) => addProductToCart(selected, 1)}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
