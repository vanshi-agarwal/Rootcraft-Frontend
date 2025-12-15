"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, Variant } from "framer-motion";
import { Home, ArrowLeft, Search, Package } from "lucide-react";

/**
 * 404 Not Found Page Component
 *
 * This component displays when users navigate to a non-existent page.
 * Features:
 * - Elegant error message with animations
 * - Helpful navigation options
 * - Floating decorative elements
 * - Responsive design matching Rootcraft theme
 *
 * @returns {JSX.Element} The 404 error page
 */
export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants for stagger effect
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  } as const;

  // Floating decoration elements
  const floatingElements = [
    { size: 80, delay: 0, duration: 3, x: "10%", y: "20%" },
    { size: 60, delay: 0.5, duration: 4, x: "80%", y: "15%" },
    { size: 100, delay: 1, duration: 3.5, x: "85%", y: "70%" },
    { size: 70, delay: 0.3, duration: 4.5, x: "15%", y: "75%" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAF3EA] via-white to-[#F5EDE0] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Background Elements */}
      {mounted &&
        floatingElements.map((el, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full opacity-10"
            style={{
              width: el.size,
              height: el.size,
              left: el.x,
              top: el.y,
              background: "linear-gradient(135deg, #8B7355 0%, #A0826D 100%)",
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: el.duration,
              delay: el.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Main Content */}
      <motion.div
        className="max-w-2xl w-full text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Number */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-[150px] sm:text-[200px] lg:text-[250px] font-bold leading-none tracking-tight">
            <span className="bg-linear-to-br from-[#8B7355] via-[#A0826D] to-[#6B5444] bg-clip-text text-transparent">
              404
            </span>
          </h1>
        </motion.div>

        {/* Error Message */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off. Like a
            piece of furniture in the wrong room.
          </p>
        </motion.div>

        {/* Decorative Divider */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 my-8"
        >
          <div className="h-px w-16 bg-linear-to-r from-transparent to-[#8B7355]" />
          <Package className="w-6 h-6 text-[#8B7355]" strokeWidth={1.5} />
          <div className="h-px w-16 bg-linear-to-l from-transparent to-[#8B7355]" />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          {/* Home Button */}
          <Link href="/">
            <motion.button
              className="group relative px-8 py-4 bg-linear-to-r from-[#8B7355] to-[#A0826D] text-white rounded-full font-semibold text-base sm:text-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Go Home</span>
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-[#6B5444] to-[#8B7355]"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </Link>

          {/* Back Button */}
          <motion.button
            onClick={() => window.history.back()}
            className="group px-8 py-4 bg-white text-gray-800 rounded-full font-semibold text-base sm:text-lg border-2 border-[#8B7355] hover:bg-[#FAF3EA] transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center shadow-md hover:shadow-lg cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </motion.button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          variants={itemVariants}
          className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#8B7355]/20 shadow-lg"
        >
          <p className="text-sm text-gray-600 mb-4 font-medium">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="text-[#8B7355] hover:text-[#6B5444] font-semibold text-sm transition-colors duration-200 flex items-center gap-2 group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Home
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/cart"
              className="text-[#8B7355] hover:text-[#6B5444] font-semibold text-sm transition-colors duration-200 flex items-center gap-2 group"
            >
              <Package className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Cart
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/blogs"
              className="text-[#8B7355] hover:text-[#6B5444] font-semibold text-sm transition-colors duration-200 flex items-center gap-2 group"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Blogs
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact"
              className="text-[#8B7355] hover:text-[#6B5444] font-semibold text-sm transition-colors duration-200 group"
            >
              Contact
            </Link>
          </div>
        </motion.div>

        {/* Fun Fact */}
        <motion.p
          variants={itemVariants}
          className="mt-8 text-sm text-gray-500 italic"
        >
          "Even the best furniture designers misplace things sometimes." 😊
        </motion.p>
      </motion.div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0 opacity-20">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 48L60 56C120 64 240 80 360 80C480 80 600 64 720 58.7C840 53 960 59 1080 64C1200 69 1320 75 1380 77.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V48Z"
            fill="#8B7355"
          />
        </svg>
      </div>
    </div>
  );
}
