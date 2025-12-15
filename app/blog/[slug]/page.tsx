"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import {
  Calendar,
  User,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  ChevronRight,
  Copy,
  CheckCircle2,
  Home,
  Book,
  Loader2,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useToast } from "@/app/context/ToastContext";
import api from "@/lib/axios";

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
  content: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  views: number;
  readTime: number;
}

// Animation variants
// Animation variants
// const containerVariants = { ... } (removed unused)

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);

  const slug = params?.slug as string;

  // Fetch blog by slug
  const fetchBlog = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get(`/blogs/${slug}`);

      if (!data) {
        throw new Error("Blog not found");
      }

      setBlog(data);

      // Fetch latest blogs for sidebar (excluding current blog)
      const { data: latestData } = await api.get("/blogs", {
        params: {
          published: true,
          sortBy: "newest",
          limit: 3,
        },
      });

      setLatestBlogs(
        (latestData || []).filter((b: Blog) => b._id !== data._id).slice(0, 3)
      );
    } catch (err: any) {
      console.error("Error fetching blog:", err);
      setError(err.response?.data?.message || "Blog not found");
      showToast({
        type: "error",
        action: "checkout_error",
        message: "Failed to load blog",
      });
    } finally {
      setLoading(false);
    }
  }, [slug, showToast]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  // Scroll Progress Logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Handle share functionality
  const handleShare = async (platform: string) => {
    if (!blog) return;
    const url = window.location.href;
    const title = blog.title;

    try {
      switch (platform) {
        case "copy":
          await navigator.clipboard.writeText(url);
          setCopied(true);
          showToast({
            type: "success",
            action: "share",
            message: "Link copied to clipboard",
          });
          setTimeout(() => setCopied(false), 2000);
          break;
        case "facebook":
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              url
            )}`,
            "_blank"
          );
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              url
            )}&text=${encodeURIComponent(title)}`,
            "_blank"
          );
          break;
        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              url
            )}`,
            "_blank"
          );
          break;
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white font-poppins selection:bg-[#B88E2F] selection:text-white">
      {/* --- Reading Progress Bar --- */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[4px] bg-[#B88E2F] origin-left z-100"
        style={{ scaleX }}
      />

      <Header />
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#B88E2F]" />
        </div>
      ) : error || !blog ? (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <p className="text-red-600 mb-4">{error || "Blog not found"}</p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/blog")}
              className="px-4 py-2 bg-[#B88E2F] text-white rounded-lg hover:bg-[#9A7624] transition-colors"
            >
              Back to Blogs
            </button>
            <button
              onClick={fetchBlog}
              className="px-4 py-2 border border-[#B88E2F] text-[#B88E2F] rounded-lg hover:bg-[#B88E2F] hover:text-white transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* --- CREATIVE COMPACT HERO SECTION --- */}
          <section className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center overflow-hidden px-4">
            {/* Background Image with Parallax-like feel */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
              style={{
                backgroundImage: "url('/shop-bg.jpg')",
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
                className="font-poppins font-bold text-3xl sm:text-5xl text-[#3A3A3A] tracking-tight px-4"
              >
                {blog.title}
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
                <Link
                  href="/blog"
                  className="flex items-center gap-1.5 text-black hover:text-[#B88E2F] transition-colors"
                >
                  <Book size={14} />
                  Blogs
                </Link>
                <ChevronRight size={14} className="text-gray-500" />
                <span className="text-gray-500 line-clamp-1 max-w-xs">
                  {blog.title}
                </span>
              </motion.div>
            </div>
          </section>

          <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px] py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* --- LEFT COLUMN: Article --- */}
              <article className="lg:col-span-9">
                {/* Featured Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full aspect-video rounded-[10px] overflow-hidden mb-8 shadow-lg group"
                  whileHover={{ scale: 1.02 }}
                >
                  <Image
                    src={blog.image || "/product/pd-1.jpg"}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    priority
                  />
                </motion.div>

                {/* Meta Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap items-center gap-6 text-[#9F9F9F] text-sm mb-6"
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
                      <User size={18} />
                    </motion.div>
                    <span>{blog.author || "Admin"}</span>
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
                      <Calendar size={18} />
                    </motion.div>
                    <span>
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
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
                      <Tag size={18} />
                    </motion.div>
                    <span>{blog.category}</span>
                  </motion.div>
                  {blog.readTime && (
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ x: 5, color: "#B88E2F" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span>{blog.readTime} min read</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[32px] md:text-[42px] font-medium text-black mb-8 leading-tight"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {blog.title}
                </motion.h1>

                {/* Content Body */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="prose prose-lg max-w-none font-poppins text-[#9F9F9F]
                    prose-headings:text-black prose-headings:font-medium 
                    prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                    prose-p:leading-relaxed prose-p:mb-6
                    prose-blockquote:border-l-4 prose-blockquote:border-[#B88E2F] 
                    prose-blockquote:bg-[#FAF3EA] prose-blockquote:py-4 prose-blockquote:px-6 
                    prose-blockquote:rounded-r-lg prose-blockquote:text-black prose-blockquote:italic
                    prose-blockquote:not-italic
                    prose-img:rounded-lg prose-img:shadow-md"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

            {/* Share & Tags Footer */}
            <motion.div
              className="mt-12 pt-8 border-t border-[#D9D9D9] flex flex-col sm:flex-row justify-between items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex gap-4 flex-wrap"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-black font-medium">Tags:</span>
                <span className="text-[#9F9F9F]">
                  {blog.tags && blog.tags.length > 0
                    ? blog.tags.join(", ")
                    : blog.category}
                </span>
              </motion.div>
              <div className="flex gap-4 items-center">
                <span className="text-black font-medium">Share:</span>
                <div className="flex gap-4 text-black">
                  <motion.button
                    onClick={() => handleShare("copy")}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="cursor-pointer"
                  >
                    <AnimatePresence mode="wait">
                      {copied ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          <CheckCircle2 size={20} className="text-[#B88E2F]" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="copy"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Copy size={20} className="hover:text-[#B88E2F]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  <motion.button
                    onClick={() => handleShare("facebook")}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="cursor-pointer"
                  >
                    <Facebook
                      size={20}
                      className="hover:text-[#B88E2F] transition-colors"
                    />
                  </motion.button>
                  <motion.button
                    onClick={() => handleShare("linkedin")}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="cursor-pointer"
                  >
                    <Linkedin
                      size={20}
                      className="hover:text-[#B88E2F] transition-colors"
                    />
                  </motion.button>
                  <motion.button
                    onClick={() => handleShare("twitter")}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="cursor-pointer"
                  >
                    <Twitter
                      size={20}
                      className="hover:text-[#B88E2F] transition-colors"
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </article>

          {/* --- RIGHT COLUMN: Simplified Sidebar --- */}
          <motion.aside
            className="lg:col-span-3 space-y-10 sticky top-[120px] h-fit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* About Author Card */}
            <motion.div
              className="bg-[#FAF3EA] p-8 rounded-[10px] text-center"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.h3
                className="text-xl font-medium text-black mb-2"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                About Author
              </motion.h3>
              <motion.div
                className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="/logo.png"
                  alt="Author"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </motion.div>
              <p className="text-sm text-[#9F9F9F] mb-4">
                Passionate about sustainable furniture design and modern
                interior aesthetics.
              </p>
            </motion.div>

            {/* Latest Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.h3
                className="text-xl font-medium text-black mb-6"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Latest
              </motion.h3>
              <div className="flex flex-col gap-6">
                {latestBlogs.length > 0 ? (
                  latestBlogs.map((latestBlog, i) => {
                    const blogDate = new Date(latestBlog.createdAt);
                    const formattedDate = blogDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <Link
                        key={latestBlog._id}
                        href={`/blog/${latestBlog.slug}`}
                      >
                        <motion.div
                          className="flex gap-4 group cursor-pointer"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ x: 5, scale: 1.02 }}
                        >
                          <motion.div
                            className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Image
                              src={latestBlog.image || "/product/pd-1.jpg"}
                              alt={latestBlog.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </motion.div>
                          <div>
                            <motion.h4
                              className="text-sm font-medium text-black group-hover:text-[#B88E2F] transition-colors line-clamp-2"
                              whileHover={{ x: 3 }}
                            >
                              {latestBlog.title}
                            </motion.h4>
                            <span className="text-xs text-[#9F9F9F] mt-1 block">
                              {formattedDate}
                            </span>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No recent posts</p>
                )}
              </div>
            </motion.div>
          </motion.aside>
        </div>
      </main>

          <Footer />
        </>
      )}
    </div>
  );
}
