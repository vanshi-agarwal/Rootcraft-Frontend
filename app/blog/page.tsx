"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, User, Tag, ChevronRight, ArrowRight, Home, Loader2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";

// Blog interface matching backend model
interface Blog {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
  views: number;
  readTime: number;
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
} as const;

const sidebarVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
} as const;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  // Fetch blogs from backend
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get("/blogs", {
        params: {
          published: true,
          sortBy: "newest",
        },
      });

      setBlogs(data || []);
      
      // Set recent blogs (first 5)
      setRecentBlogs((data || []).slice(0, 5));
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
      setError(err.response?.data?.message || "Failed to load blogs. Please try again.");
      showToast({
        type: "error",
        action: "checkout_error",
        message: "Failed to load blogs",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Filter blogs by search query
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const blogsPerPage = 4;
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + blogsPerPage);

  return (
    <div className="min-h-screen bg-white font-poppins">
      <Header />

      {/* --- CREATIVE COMPACT HERO SECTION --- */}
      <section className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center overflow-hidden px-4">
        {/* Background Image with Parallax-like feel */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage:
              "url('/shop-bg.jpg')",
          }}
        />

        {/* Heavy Blur Overlay for Contrast */}
        <div className="absolute inset-0 bg-white/20 z-10" />

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center gap-3 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-poppins font-bold text-3xl sm:text-5xl text-[#3A3A3A] tracking-tight"
          >
            The Latest Journel's
          </motion.h1>

          {/* Glassmorphic Breadcrumb Pill */}
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
            <span className="text-gray-500">Blogs</span>
          </motion.div>
        </div>
      </section>

      {/* --- Main Content --- */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px] py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* --- LEFT COLUMN: Blog Posts --- */}
          <motion.div
            className="lg:col-span-8 space-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#B88E2F]" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchBlogs}
                  className="text-[#B88E2F] hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : paginatedBlogs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">No blogs found.</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[#B88E2F] hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              paginatedBlogs.map((post, index) => {
                const postDate = new Date(post.createdAt);
                const formattedDate = postDate.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const day = postDate.getDate();
                const month = postDate.toLocaleDateString("en-US", { month: "short" });

                return (
                  <motion.article
                    key={post._id}
                    variants={itemVariants}
                    className="group"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Image Wrapper */}
                    <motion.div
                      className="relative w-full aspect-video rounded-[10px] overflow-hidden mb-6"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <Image
                          src={post.image || "/product/pd-1.jpg"}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>
                      {/* Date Badge (Floating) */}
                      <motion.div
                        className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-md text-center shadow-lg"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <span className="block font-bold text-xl text-black">
                          {day}
                        </span>
                        <span className="block text-xs text-[#9F9F9F] uppercase">
                          {month}
                        </span>
                      </motion.div>
                    </motion.div>

                    {/* Meta Data */}
                    <motion.div
                      className="flex items-center gap-6 text-[#9F9F9F] text-sm mb-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ x: 5, color: "#B88E2F" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <User size={16} />
                        </motion.div>
                        <span>{post.author || "Admin"}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ x: 5, color: "#B88E2F" }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Tag size={16} />
                        </motion.div>
                        <span>{post.category}</span>
                      </motion.div>
                    </motion.div>

                    {/* Content */}
                    <Link href={`/blog/${post.slug}`}>
                      <motion.h2
                        className="text-[28px] lg:text-[32px] font-medium text-black mb-3 hover:text-[#B88E2F] transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {post.title}
                      </motion.h2>
                    </Link>
                    <motion.p
                      className="text-[#9F9F9F] text-base leading-relaxed mb-6 line-clamp-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      {post.excerpt}
                    </motion.p>

                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-black text-base border-b border-black pb-1 hover:text-[#B88E2F] hover:border-[#B88E2F] transition-all group/link"
                      >
                        Read more
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <ArrowRight size={16} />
                        </motion.div>
                      </Link>
                    </motion.div>
                  </motion.article>
                );
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                className="flex justify-center gap-4 pt-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <motion.button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-[60px] h-[60px] rounded-[10px] text-xl transition-colors cursor-pointer ${currentPage === num
                      ? "bg-[#B88E2F] text-white"
                      : "bg-[#F9F1E7] hover:bg-[#B88E2F] hover:text-white"
                      }`}
                  >
                    {num}
                  </motion.button>
                ))}
                {currentPage < totalPages && (
                  <motion.button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-[98px] h-[60px] rounded-[10px] bg-[#F9F1E7] hover:bg-[#B88E2F] hover:text-white transition-colors text-xl font-light cursor-pointer"
                  >
                    Next
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* --- RIGHT COLUMN: Sidebar --- */}
          <motion.aside
            className="lg:col-span-4 space-y-10 sticky top-[120px] h-fit"
            variants={sidebarVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Search Widget */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full h-[58px] pl-4 pr-12 border border-[#9F9F9F] rounded-[10px] focus:border-[#B88E2F] outline-none transition-colors bg-white"
                placeholder="Search blogs..."
                whileFocus={{ scale: 1.02 }}
              />
              <motion.div
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black cursor-pointer"
                whileHover={{ rotate: 90, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Search size={24} />
              </motion.div>
            </motion.div>

            {/* Recent Posts Widget */}
            <motion.div
              className="pl-4 lg:pl-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.h3
                className="text-[24px] font-medium text-black mb-8"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Recent Posts
              </motion.h3>
              <ul className="space-y-6">
                {recentBlogs.length > 0 ? (
                  recentBlogs.map((post, index) => {
                    const postDate = new Date(post.createdAt);
                    const formattedDate = postDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <motion.li
                        key={post._id}
                        className="flex gap-4 group cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5, scale: 1.02 }}
                      >
                        <Link href={`/blog/${post.slug}`} className="flex gap-4 w-full">
                          <motion.div
                            className="w-[80px] h-[80px] relative rounded-[10px] overflow-hidden shrink-0"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Image
                              src={post.image || "/product/pd-1.jpg"}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </motion.div>
                          <div className="flex flex-col justify-center">
                            <motion.h4
                              className="text-sm font-medium text-black leading-tight mb-1 group-hover:text-[#B88E2F] transition-colors line-clamp-2"
                              whileHover={{ x: 3 }}
                            >
                              {post.title}
                            </motion.h4>
                            <span className="text-xs text-[#9F9F9F]">
                              {formattedDate}
                            </span>
                          </div>
                        </Link>
                      </motion.li>
                    );
                  })
                ) : (
                  <li className="text-sm text-gray-500">No recent posts</li>
                )}
              </ul>
            </motion.div>
          </motion.aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
