"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Assuming you use Next.js Image
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronRight,
  Phone,
  Truck,
  HelpCircle,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import api, { publicApi } from "@/lib/axios";

// --- DUMMY DATA ---
const ANNOUNCEMENT_LINKS = [
  { label: "Furniture", href: "/shop", active: true },
  { label: "Home Interiors", href: "/shop" },
  { label: "Bulk Order", href: "/shop" },
];

const CATEGORIES = [
  {
    id: "living",
    label: "Living Room",
    href: "/shop",
    image: "/shop-bg.jpg", // Replace with real image path
    subcategories: [
      { name: "Sofas & Couches", href: "/shop?category=living&focus=sofas" },
      {
        name: "Coffee Tables",
        href: "/shop?category=living&focus=coffee-tables",
      },
      { name: "TV Units", href: "/shop?category=living&focus=tv-units" },
      {
        name: "Lounge Chairs",
        href: "/shop?category=living&focus=lounge-chairs",
      },
    ],
  },
  {
    id: "bedroom",
    label: "Bedroom",
    href: "/shop",
    image: "/home/bedroom.jpg",
    subcategories: [
      { name: "King Size Beds", href: "/shop?category=bedroom&focus=beds" },
      { name: "Wardrobes", href: "/shop?category=bedroom&focus=wardrobes" },
      {
        name: "Bedside Tables",
        href: "/shop?category=bedroom&focus=bedside",
      },
      { name: "Mattresses", href: "/shop?category=bedroom&focus=mattress" },
    ],
  },
  {
    id: "dining",
    label: "Dining",
    href: "/shop",
    image: "/home/dining.jpg",
    subcategories: [
      { name: "Dining Sets", href: "/shop?category=dining&focus=sets" },
      { name: "Dining Tables", href: "/shop?category=dining&focus=tables" },
      { name: "Chairs & Benches", href: "/shop?category=dining&focus=chairs" },
      { name: "Crockery Units", href: "/shop?category=dining&focus=crockery" },
    ],
  },
  {
    id: "office",
    label: "Home Office",
    href: "/shop",
    image: "/home/hero-bg.png",
    subcategories: [
      { name: "Study Tables", href: "/shop?category=office&focus=desks" },
      { name: "Ergonomic Chairs", href: "/shop?category=office&focus=chairs" },
      { name: "Bookshelves", href: "/shop?category=office&focus=storage" },
      { name: "Laptop Stands", href: "/shop?category=office&focus=stands" },
    ],
  },
  {
    id: "decor",
    label: "Decor",
    href: "/shop",
    image: "/product/pd-4.jpg",
    subcategories: [
      { name: "Wall Art", href: "/shop?category=decor&focus=wall-art" },
      { name: "Mirrors", href: "/shop?category=decor&focus=mirrors" },
      { name: "Carpets", href: "/shop?category=decor&focus=carpets" },
      { name: "Lighting", href: "/shop?category=decor&focus=lighting" },
    ],
  },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTouchNav, setIsTouchNav] = useState(false);
  const { scrollY } = useScroll();
  const { toggleCart, getTotalItems } = useCart();
  const { getWishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [topBlogs, setTopBlogs] = useState<any[]>([]);

  const cartItemCount = getTotalItems();
  const wishlistItemCount = getWishlistCount();

  // Fetch categories, trending products, and top blogs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories (public endpoint)
        const { data: categoriesData } = await publicApi.get("/categories");
        setCategories(categoriesData || []);

        // Fetch trending products (sorted by rating, limit 2) - public endpoint
        const { data: productsData } = await publicApi.get("/products", {
          params: {
            pageSize: 2,
            sortBy: "rating",
          },
        });
        setTrendingProducts(productsData?.products || []);

        // Fetch top blogs (newest, limit 2) - public endpoint
        const { data: blogsData } = await publicApi.get("/blogs", {
          params: {
            limit: 2,
            sortBy: "newest",
            published: true,
          },
        });
        setTopBlogs(blogsData || []);
        console.log(blogsData);
      } catch (error) {
        console.error("Error fetching header data:", error);
        // Fallback to static categories if API fails
        setCategories([]);
        setTopBlogs([]);
      }
    };

    fetchData();
  }, []);

  // Map category names to IDs for mega menu
  const getCategoryId = (categoryName: string) => {
    return categoryName.toLowerCase().replace(/\s+/g, "-");
  };

  // Get category image based on name
  const getCategoryImage = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    const imageMap: Record<string, string> = {
      "living room": "/home/living.jpg",
      living: "/home/living.jpg",
      bedroom: "/home/bedroom.jpg",
      dining: "/home/dining.jpg",
      "home office": "/home/home-office.jpg",
      office: "/home/home-office.jpg",
      decor: "/home/decor.jpg",
      outdoor: "/home/outdoor.jpg",
    };
    return imageMap[name] || "/shop-bg.jpg";
  };

  // Generate subcategories based on category name (or use defaults)
  const getSubcategories = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    const subcategoryMap: Record<
      string,
      Array<{ name: string; href: string }>
    > = {
      "living room": [
        {
          name: "Sofas & Couches",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Coffee Tables",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "TV Units",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Lounge Chairs",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
      ],
      living: [
        {
          name: "Sofas & Couches",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Coffee Tables",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "TV Units",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Lounge Chairs",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
      ],
      bedroom: [
        {
          name: "King Size Beds",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Wardrobes",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Bedside Tables",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Mattresses",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
      ],
      dining: [
        {
          name: "Dining Sets",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Dining Tables",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Chairs & Benches",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Crockery Units",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
      ],
      "home office": [
        {
          name: "Study Tables",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Ergonomic Chairs",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Bookshelves",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Laptop Stands",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
      ],
      office: [
        {
          name: "Study Tables",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Ergonomic Chairs",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Bookshelves",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Laptop Stands",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
      ],
      decor: [
        {
          name: "Wall Art",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Mirrors",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Carpets",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
        {
          name: "Lighting",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
      ],
    };
    return (
      subcategoryMap[name] || [
        {
          name: "View All",
          href: `/shop?category=${encodeURIComponent(categoryName)}`,
        },
      ]
    );
  };

  // Merge fetched categories with static structure
  const displayCategories =
    categories.length > 0
      ? categories.slice(0, 6).map((cat) => ({
          id: getCategoryId(cat.name),
          label: cat.name,
          href: `/shop?category=${encodeURIComponent(cat.name)}`,
          image: cat.image || getCategoryImage(cat.name),
          subcategories: getSubcategories(cat.name),
        }))
      : CATEGORIES; // Fallback to static if API fails

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    const html = document.documentElement;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyTouch = body.style.touchAction;
    const originalHtmlOverflow = html.style.overflow;

    if (isMobileMenuOpen) {
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
      html.style.overflow = "hidden";
    } else {
      body.style.overflow = originalBodyOverflow || "";
      body.style.touchAction = originalBodyTouch || "";
      html.style.overflow = originalHtmlOverflow || "";
    }

    return () => {
      body.style.overflow = originalBodyOverflow;
      body.style.touchAction = originalBodyTouch;
      html.style.overflow = originalHtmlOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouchNav(mediaQuery.matches);
    update();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
    } else {
      mediaQuery.addListener(update);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", update);
      } else {
        mediaQuery.removeListener(update);
      }
    };
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push("/shop");
    }
  };

  // --- SCROLL LOGIC ---
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 10);
  });

  return (
    <>
      {/* 
        ========================================
        1. ANNOUNCEMENT BAR (Slides up on scroll)
        ========================================
      */}
      {/* 
        ========================================
        0. LAYOUT SPACER (Prevents Content Jump)
        ========================================
      */}
      <div
        className="h-[120px] md:h-[128px] w-full bg-white"
        aria-hidden="true"
      />

      {/* 
        ========================================
        1. FIXED WRAPPER (Handles Scroll Slide)
        ========================================
      */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-transform duration-300 ease-in-out will-change-transform ${
          isMobileMenuOpen ? "translate-y-0" : ""
        }`}
        style={{
          transform:
            !isMobileMenuOpen && isScrolled
              ? "translateY(-40px)"
              : "translateY(0)",
        }}
      >
        {/* 
          ========================================
          2. ANNOUNCEMENT BAR (Static Height)
          ========================================
        */}
        <div className="h-[40px] bg-[#FAF9F6] border-b border-[#E5E0D8] overflow-hidden relative z-60">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between text-[11px] sm:text-xs font-medium tracking-wide text-gray-600">
            {/* Left Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              {ANNOUNCEMENT_LINKS.map((item, idx) => (
                <React.Fragment key={idx}>
                  <Link
                    href={item.href}
                    className={`transition-colors hover:text-[#B88E2F] ${
                      item.active ? "text-[#B88E2F] font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                  {idx !== ANNOUNCEMENT_LINKS.length - 1 && (
                    <div className="h-3 w-px bg-gray-300" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Right Utilities */}
            <div className="hidden md:flex items-center gap-6">
              <span className="flex items-center gap-1.5 hover:text-[#B88E2F] cursor-pointer transition-colors">
                <Phone size={12} /> +1 (555) 012-3456
              </span>
              <span className="flex items-center gap-1.5 hover:text-[#B88E2F] cursor-pointer transition-colors">
                <Truck size={12} /> Track Order
              </span>
              <span className="flex items-center gap-1.5 hover:text-[#B88E2F] cursor-pointer transition-colors">
                <HelpCircle size={12} /> Help Center
              </span>
            </div>
          </div>
        </div>

        {/* 
          ========================================
          3. MAIN HEADER 
          ========================================
        */}
        <header
          className={`w-full transition-colors duration-300 ${
            isScrolled
              ? "bg-white/90 backdrop-blur-xl shadow-md"
              : "bg-white border-b border-gray-100"
          }`}
          onMouseLeave={!isTouchNav ? () => setActiveCategory(null) : undefined} // Close menu when leaving header
        >
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* MOBILE HEADER (logo + icons + hamburger) */}
            <div className="flex md:hidden items-center justify-between h-16 gap-4">
              <Link href="/" className="shrink-0 flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-full bg-[#B88E2F] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                  <Image src="/logo.png" alt="Logo" width={40} height={40} />
                </div>
                <span className="font-poppins font-semibold text-lg text-[#1A1A1A] leading-none">
                  Rootcraft
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/shop")}
                  className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
                <button
                  className="p-2 text-gray-800"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>

            {/* DESKTOP EXPANDED HEADER (initial/top state) */}
            {!isScrolled && (
              <div className="hidden md:block">
                {/* Top row: logo + large search + actions */}
                <div className="flex items-center justify-between h-[88px] gap-6">
                  {/* LOGO */}
                  <Link
                    href="/"
                    className="shrink-0 flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#B88E2F] flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        width={50}
                        height={50}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-poppins font-bold text-2xl text-[#1A1A1A] leading-none">
                        Rootcraft
                      </span>
                      <span className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mt-0.5 group-hover:text-[#B88E2F] transition-colors">
                        Premium Furniture
                      </span>
                    </div>
                  </Link>

                  {/* SEARCH BAR */}
                  <div className="flex-1 max-w-[600px] mx-auto">
                    <div className="relative w-full group">
                      <input
                        type="text"
                        placeholder="Search for sofas, beds, decor..."
                        onKeyDown={handleSearch}
                        className="w-full h-[46px] pl-6 pr-12 rounded-full bg-[#F3F4F6] text-gray-700 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B88E2F] transition-all duration-300"
                      />
                      <button
                        onClick={() => router.push("/shop")}
                        className="absolute right-1 top-1 h-[38px] w-[38px] rounded-full bg-[#B88E2F] text-white flex items-center justify-center hover:bg-[#967223] transition-colors shadow-sm"
                      >
                        <Search size={18} />
                      </button>
                    </div>
                  </div>

                  {/* ACTION ICONS */}
                  <div className="flex items-center gap-3 sm:gap-5">
                    {/* User Icon / Menu */}
                    <div
                      className="relative"
                      onMouseEnter={() => setIsUserMenuOpen(true)}
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <button
                        onClick={() => !user && router.push("/signin")}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group cursor-pointer flex items-center justify-center"
                      >
                        <User
                          size={22}
                          className={`group-hover:text-[#B88E2F] ${
                            user ? "text-[#B88E2F]" : "text-gray-600"
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isUserMenuOpen && user && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                          >
                            <div className="p-4 border-b border-gray-50 bg-[#FAF9F6]">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className="p-2">
                              <Link
                                href="/account"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <User size={16} /> My Account
                              </Link>
                              {user.role === "admin" && (
                                <Link
                                  href="/admin"
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                  onClick={() => setIsUserMenuOpen(false)}
                                >
                                  <LayoutDashboard size={16} /> Dashboard
                                </Link>
                              )}
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button
                                onClick={() => {
                                  logout();
                                  setIsUserMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <LogOut size={16} /> Sign Out
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Link
                      href="/wishlist"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative"
                    >
                      <Heart
                        size={22}
                        className="text-gray-600 group-hover:text-[#B88E2F]"
                      />
                      {wishlistItemCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-0 right-0 h-4 w-4 bg-[#B88E2F] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white"
                        >
                          {wishlistItemCount}
                        </motion.span>
                      )}
                    </Link>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative cursor-pointer"
                      onClick={toggleCart}
                    >
                      <ShoppingCart
                        size={22}
                        className="text-gray-600 group-hover:text-[#B88E2F]"
                      />
                      {cartItemCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-0 right-0 h-4 w-4 bg-[#B88E2F] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white"
                        >
                          {cartItemCount}
                        </motion.span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Categories row under header */}
                <nav className="border-t border-gray-100/50 mt-1">
                  <ul className="flex items-center justify-center gap-12 h-12">
                    {displayCategories.map((cat) => (
                      <li
                        key={cat.id}
                        className="h-full"
                        onMouseEnter={
                          !isTouchNav
                            ? () => setActiveCategory(cat.id)
                            : undefined
                        }
                        onClick={() => {
                          if (isTouchNav) {
                            setActiveCategory((prev) =>
                              prev === cat.id ? null : cat.id
                            );
                          }
                        }}
                      >
                        <Link
                          href={cat.href}
                          className={`relative h-full flex items-center text-[15px] font-medium transition-colors duration-200 ${
                            activeCategory === cat.id
                              ? "text-[#B88E2F]"
                              : "text-gray-600 hover:text-[#B88E2F]"
                          }`}
                        >
                          {cat.label}

                          {activeCategory === cat.id && (
                            <motion.div
                              layoutId="nav-underline"
                              className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#B88E2F] rounded-t-sm"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                    {/* Blogs Tab */}
                    <li
                      className="h-full"
                      onMouseEnter={
                        !isTouchNav
                          ? () => setActiveCategory("blogs")
                          : undefined
                      }
                      onClick={() => {
                        if (isTouchNav) {
                          setActiveCategory((prev) =>
                            prev === "blogs" ? null : "blogs"
                          );
                        }
                      }}
                    >
                      <Link
                        href="/blog"
                        className={`relative h-full flex items-center text-[15px] font-medium transition-colors duration-200 ${
                          activeCategory === "blogs"
                            ? "text-[#B88E2F]"
                            : "text-gray-600 hover:text-[#B88E2F]"
                        }`}
                      >
                        Blogs
                        {activeCategory === "blogs" && (
                          <motion.div
                            layoutId="nav-underline-blogs"
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#B88E2F] rounded-t-sm"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            )}

            {/* DESKTOP CONDENSED HEADER (on scroll) */}
            {isScrolled && (
              <>
                <div className="hidden md:flex items-center justify-between h-[76px] gap-8">
                  {/* LOGO */}
                  <Link
                    href="/"
                    className="shrink-0 flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#B88E2F] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-poppins font-semibold text-xl text-[#1A1A1A] leading-none">
                        Rootcraft
                      </span>
                      <span className="text-[9px] tracking-[0.25em] text-gray-500 uppercase mt-0.5 group-hover:text-[#B88E2F] transition-colors">
                        Premium Furniture
                      </span>
                    </div>
                  </Link>

                  {/* NAV CENTER */}
                  <nav className="flex-1 flex justify-center">
                    <ul className="flex items-center gap-10 h-full">
                      {displayCategories.map((cat) => (
                        <li
                          key={cat.id}
                          className="h-full"
                          onMouseEnter={
                            !isTouchNav
                              ? () => setActiveCategory(cat.id)
                              : undefined
                          }
                          onClick={() => {
                            if (isTouchNav) {
                              setActiveCategory((prev) =>
                                prev === cat.id ? null : cat.id
                              );
                            }
                          }}
                        >
                          <Link
                            href={cat.href}
                            className={`relative h-full flex items-center text-[15px] font-medium transition-colors duration-200 ${
                              activeCategory === cat.id
                                ? "text-[#B88E2F]"
                                : "text-gray-600 hover:text-[#B88E2F]"
                            }`}
                          >
                            {cat.label}

                            {activeCategory === cat.id && (
                              <motion.div
                                layoutId="nav-underline"
                                className="absolute -bottom-[10px] left-0 right-0 h-[3px] bg-[#B88E2F] rounded-t-sm"
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                }}
                              />
                            )}
                          </Link>
                        </li>
                      ))}
                      {/* Blogs Tab (Scrolled) */}
                      <li
                        className="h-full"
                        onMouseEnter={
                          !isTouchNav
                            ? () => setActiveCategory("blogs")
                            : undefined
                        }
                        onClick={() => {
                          if (isTouchNav) {
                            setActiveCategory((prev) =>
                              prev === "blogs" ? null : "blogs"
                            );
                          }
                        }}
                      >
                        <Link
                          href="/blog"
                          className={`relative h-full flex items-center text-[15px] font-medium transition-colors duration-200 ${
                            activeCategory === "blogs"
                              ? "text-[#B88E2F]"
                              : "text-gray-600 hover:text-[#B88E2F]"
                          }`}
                        >
                          Blogs
                          {activeCategory === "blogs" && (
                            <motion.div
                              layoutId="nav-underline-blogs-scrolled"
                              className="absolute -bottom-[10px] left-0 right-0 h-[3px] bg-[#B88E2F] rounded-t-sm"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </Link>
                      </li>
                    </ul>
                  </nav>

                  {/* ICONS RIGHT (with search dot) */}
                  <div className="flex items-center gap-3 sm:gap-5">
                    <button
                      type="button"
                      onClick={() => router.push("/shop")}
                      className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#B88E2F] text-white hover:bg-[#967223] transition-colors shadow-sm cursor-pointer"
                      aria-label="Open search"
                    >
                      <Search size={18} />
                    </button>
                    {/* User Icon / Menu (Scrolled) */}
                    <div
                      className="relative"
                      onMouseEnter={() => setIsUserMenuOpen(true)}
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <button
                        onClick={() => !user && router.push("/signin")}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group cursor-pointer flex items-center justify-center"
                      >
                        <User
                          size={22}
                          className={`group-hover:text-[#B88E2F] ${
                            user ? "text-[#B88E2F]" : "text-gray-600"
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isUserMenuOpen && user && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                          >
                            <div className="p-4 border-b border-gray-50 bg-[#FAF9F6]">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className="p-2">
                              <Link
                                href="/account"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <User size={16} /> My Account
                              </Link>
                              {user.role === "admin" && (
                                <Link
                                  href="/admin"
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                  onClick={() => setIsUserMenuOpen(false)}
                                >
                                  <LayoutDashboard size={16} /> Dashboard
                                </Link>
                              )}
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button
                                onClick={() => {
                                  logout();
                                  setIsUserMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <LogOut size={16} /> Sign Out
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Link
                      href="/wishlist"
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative"
                    >
                      <Heart
                        size={22}
                        className="text-gray-600 group-hover:text-[#B88E2F]"
                      />
                      {wishlistItemCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-0 right-0 h-4 w-4 bg-[#B88E2F] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white"
                        >
                          {wishlistItemCount}
                        </motion.span>
                      )}
                    </Link>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative cursor-pointer"
                      onClick={toggleCart}
                    >
                      <ShoppingCart
                        size={22}
                        className="text-gray-600 group-hover:text-[#B88E2F]"
                      />
                      {cartItemCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-0 right-0 h-4 w-4 bg-[#B88E2F] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white"
                        >
                          {cartItemCount}
                        </motion.span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="hidden md:block border-t border-gray-100/60" />
              </>
            )}
          </div>

          {/* 
          ========================================
          3. MEGA MENU OVERLAY
          ========================================
        */}
          <AnimatePresence>
            {activeCategory && (
              <motion.div
                initial={{ opacity: 0, y: -12, scaleY: 0.96 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -12, scaleY: 0.96 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformOrigin: "top" }}
                className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.25)] z-40 overflow-hidden"
                onMouseEnter={() => setActiveCategory(activeCategory)} // Keep open on hover
              >
                <div className="h-1 bg-linear-to-r from-transparent via-[#B88E2F]/40 to-transparent" />
                <div className="max-w-[1440px] mx-auto p-8">
                  {/* Categories Mega Menu */}
                  {activeCategory !== "blogs" &&
                    displayCategories.map(
                      (cat) =>
                        cat.id === activeCategory && (
                          <div key={cat.id} className="flex gap-12">
                            {/* Left: Subcategories */}
                            <div className="w-1/4">
                              <h3 className="font-poppins font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">
                                Explore {cat.label}
                              </h3>
                              <ul className="space-y-3">
                                {cat.subcategories.map((sub) => (
                                  <li key={sub.name}>
                                    <Link
                                      href={sub.href}
                                      className="text-gray-500 hover:text-[#B88E2F] hover:translate-x-1 transition-all duration-200 flex items-center gap-2 text-sm"
                                    >
                                      <ChevronRight
                                        size={14}
                                        className="text-[#B88E2F] opacity-0 -ml-4 transition-all group-hover:opacity-100 hover:ml-0"
                                      />
                                      {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <Link
                                href={cat.href}
                                className="inline-flex items-center gap-2 text-[#B88E2F] font-semibold text-sm mt-6 group"
                              >
                                View All Products{" "}
                                <ArrowRight
                                  size={16}
                                  className="group-hover:translate-x-1 transition-transform"
                                />
                              </Link>
                            </div>

                            {/* Middle: Featured Image */}
                            <div className="flex-1 relative h-[300px] rounded-xl overflow-hidden group">
                              <div className="absolute inset-0 bg-gray-200" />
                              <Image
                                src={cat.image}
                                alt={cat.label}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                                <span className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
                                  New Arrival
                                </span>
                                <h2 className="text-white font-poppins font-bold text-3xl mb-4">
                                  {cat.label} Collection
                                </h2>
                                <Link
                                  href={"/shop"}
                                  className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold w-fit hover:bg-[#B88E2F] hover:text-white transition-colors cursor-pointer"
                                >
                                  Shop Now
                                </Link>
                              </div>
                            </div>

                            {/* Right: Trending Products */}
                            <div className="w-1/5 pt-2">
                              <h4 className="font-bold text-gray-900 mb-4">
                                Trending Now
                              </h4>
                              <div className="space-y-4">
                                {trendingProducts.length > 0
                                  ? trendingProducts
                                      .slice(0, 2)
                                      .map((product) => (
                                        <Link
                                          key={product._id}
                                          href={`/product/${product.slug}`}
                                          className="flex gap-3 group cursor-pointer"
                                        >
                                          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative">
                                            <Image
                                              src={
                                                product.image ||
                                                "/product/pd-1.jpg"
                                              }
                                              alt={product.name}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-gray-800 group-hover:text-[#B88E2F] transition-colors line-clamp-1">
                                              {product.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                              ₹
                                              {product.price.toLocaleString(
                                                "en-IN"
                                              )}
                                            </p>
                                          </div>
                                        </Link>
                                      ))
                                  : [1, 2].map((i) => (
                                      <Link
                                        key={i}
                                        href={"/shop"}
                                        className="flex gap-3 group cursor-pointer"
                                      >
                                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative">
                                          <Image
                                            src={
                                              i % 2 === 0
                                                ? "/product/pd-2.jpg"
                                                : "/product/pd-1.jpg"
                                            }
                                            alt="Product"
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-800 group-hover:text-[#B88E2F] transition-colors">
                                            Modern Chair {i}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            ₹129.00
                                          </p>
                                        </div>
                                      </Link>
                                    ))}
                              </div>
                            </div>
                          </div>
                        )
                    )}

                  {/* Blogs Mega Menu */}
                  {activeCategory === "blogs" && (
                    <div className="flex gap-12">
                      {/* Left: Top Blogs List */}
                      <div className="w-2/5">
                        <h3 className="font-poppins font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-2">
                          Top Blogs
                        </h3>
                        <ul className="space-y-4">
                          {topBlogs.length > 0 ? (
                            topBlogs.map((blog) => (
                              <li key={blog._id}>
                                <Link
                                  href={`/blog/${blog.slug}`}
                                  className="flex gap-4 group cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all"
                                >
                                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden relative shrink-0">
                                    <Image
                                      src={blog.image || "/product/pd-1.jpg"}
                                      alt={blog.title}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-[#B88E2F] transition-colors line-clamp-2 mb-1">
                                      {blog.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                      {blog.excerpt}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(
                                        blog.createdAt
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-500">
                              No blogs available
                            </li>
                          )}
                        </ul>
                        <Link
                          href="/blog"
                          className="inline-flex items-center gap-2 text-[#B88E2F] font-semibold text-sm mt-6 group"
                        >
                          View All Blogs{" "}
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </Link>
                      </div>

                      {/* Middle: Featured Blog Image */}
                      <div className="flex-1 relative h-[300px] rounded-xl overflow-hidden group">
                        {topBlogs.length > 0 ? (
                          <>
                            <div className="absolute inset-0 bg-gray-200" />
                            <Image
                              src={topBlogs[0]?.image || "/shop-bg.jpg"}
                              alt={topBlogs[0]?.title || "Featured Blog"}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                              <span className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
                                Latest Article
                              </span>
                              <h2 className="text-white font-poppins font-bold text-2xl mb-4 line-clamp-2">
                                {topBlogs[0]?.title || "Latest Blog Post"}
                              </h2>
                              <Link
                                href={`/blog/${topBlogs[0]?.slug}`}
                                className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold w-fit hover:bg-[#B88E2F] hover:text-white transition-colors cursor-pointer"
                              >
                                Read More
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <p className="text-gray-400">No blogs available</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Blog Categories */}
                      <div className="w-1/5 pt-2">
                        <h4 className="font-bold text-gray-900 mb-4">
                          Categories
                        </h4>
                        <div className="space-y-3">
                          {["Design", "Furniture", "Interior", "Tips"].map(
                            (category) => (
                              <Link
                                key={category}
                                href={`/blog?category=${encodeURIComponent(
                                  category
                                )}`}
                                className="block text-sm text-gray-600 hover:text-[#B88E2F] transition-colors"
                              >
                                {category}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      </div>

      {/* 
        ========================================
        4. MOBILE DRAWER (Responsive Fallback)
        ========================================
      */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-70 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white z-80 shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {displayCategories.map((cat) => (
                  <div key={cat.id} className="py-2 border-b border-gray-50">
                    <p className="font-medium text-gray-800 mb-2">
                      {cat.label}
                    </p>
                    <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block text-sm text-gray-500"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
