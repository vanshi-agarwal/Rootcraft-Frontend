"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

/**
 * Global Error Component
 *
 * This component displays when an unexpected error occurs in the application.
 * Features:
 * - User-friendly error message
 * - Options to retry or return home
 * - Animated design matching Rootcraft theme
 * - Error details in development mode
 *
 * @param {Object} props - Component props
 * @param {Error} props.error - The error that occurred
 * @param {Function} props.reset - Function to retry rendering the component
 * @returns {JSX.Element} The error page
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAF3EA] via-white to-[#F5EDE0] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-red-100 opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 10, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-[#8B7355]/10 opacity-30 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-24 h-24 bg-linear-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-xl"
            >
              <AlertTriangle className="w-12 h-12 text-white" strokeWidth={2} />
            </motion.div>
            {/* Pulsing Ring */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 border-4 border-red-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Error Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Oops! Something Went Wrong
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-2">
            We encountered an unexpected error while loading this page.
          </p>
          <p className="text-base text-gray-500 mb-8">
            Don't worry, it's not your fault. Our team has been notified.
          </p>
        </motion.div>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === "development" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl text-left"
          >
            <p className="text-sm font-mono text-red-900 break-all">
              <strong>Error:</strong> {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-red-700 mt-2">
                <strong>Digest:</strong> {error.digest}
              </p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          {/* Retry Button */}
          <motion.button
            onClick={reset}
            className="group relative px-8 py-4 bg-linear-to-r from-[#8B7355] to-[#A0826D] text-white rounded-full font-semibold text-base sm:text-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Try Again</span>
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-[#6B5444] to-[#8B7355]"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          {/* Home Button */}
          <Link href="/">
            <motion.button
              className="group px-8 py-4 bg-white text-gray-800 rounded-full font-semibold text-base sm:text-lg border-2 border-[#8B7355] hover:bg-[#FAF3EA] transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center shadow-md hover:shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Support Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#8B7355]/20 shadow-lg"
        >
          <p className="text-sm text-gray-600 mb-2">
            <strong>Need help?</strong>
          </p>
          <p className="text-sm text-gray-600">
            If this problem persists, please{" "}
            <Link
              href="/contact"
              className="text-[#8B7355] hover:text-[#6B5444] font-semibold underline"
            >
              contact our support team
            </Link>
            .
          </p>
        </motion.div>

        {/* Decorative Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-sm text-gray-500 italic"
        >
          "Even the finest craftsmanship encounters the occasional snag." 🛠️
        </motion.p>
      </motion.div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#8B7355] to-transparent opacity-30" />
    </div>
  );
}
