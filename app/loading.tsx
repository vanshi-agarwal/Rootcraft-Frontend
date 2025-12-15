"use client";

import { motion } from "framer-motion";

/**
 * Loading Component
 *
 * This component displays a premium loading animation while page content is being fetched.
 * Features:
 * - Elegant wood-themed loader animation
 * - Smooth pulsing effects
 * - Brand colors matching Rootcraft theme
 * - Responsive design
 *
 * @returns {JSX.Element} The loading page
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAF3EA] via-white to-[#F5EDE0] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #8B7355 2%, transparent 0%), 
                              radial-gradient(circle at 75px 75px, #8B7355 2%, transparent 0%)`,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      {/* Main Loading Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo/Brand Text with Loading Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-2">
            <span className="bg-linear-to-r from-[#8B7355] via-[#A0826D] to-[#6B5444] bg-clip-text text-transparent">
              Rootcraft
            </span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base font-light tracking-wider">
            Crafting your experience...
          </p>
        </motion.div>

        {/* Animated Loader - Wood Planks Style */}
        <div className="relative w-64 h-20 mb-8">
          {/* Three planks representing loading bars */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute left-0 right-0 h-4 rounded-full bg-linear-to-r from-[#8B7355] to-[#A0826D] shadow-md"
              style={{
                top: `${index * 28}px`,
              }}
              initial={{ width: "0%" }}
              animate={{
                width: ["0%", "100%", "0%"],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                delay: index * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Spinning Circle Loader Alternative */}
        <div className="relative w-24 h-24 mb-8">
          {/* Outer Circle */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[#8B7355]/20"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Spinning Arc */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8B7355] border-r-[#A0826D]"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Inner Dot */}
          <motion.div
            className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-linear-to-br from-[#8B7355] to-[#A0826D]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Pulsing Dots */}
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 rounded-full bg-linear-to-br from-[#8B7355] to-[#A0826D]"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                delay: index * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-8 text-gray-600 text-sm font-medium tracking-wide"
        >
          Loading premium furniture...
        </motion.p>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#8B7355]/30" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-[#A0826D]/20" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-[#8B7355]/25" />
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-[#A0826D]/30" />
      </div>

      {/* Animated Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-linear-to-tr from-[#8B7355]/5 via-transparent to-[#A0826D]/5"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
