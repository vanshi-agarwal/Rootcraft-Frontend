"use client";

import React, { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// --- Curated Design Quotes ---
const QUOTES = [
  "Defining luxury in every detail...",
  "Curating your perfect space...",
  "Crafting modern silhouettes...",
  "Rootcraft: Where comfort meets art...",
];

// Singleton to ensure loader only runs once per session refresh
let hasShownGlobalLoader = false;

export default function GlobalLoader() {
  const { active, progress } = useProgress(); // Real 3D loading progress
  const [displayProgress, setDisplayProgress] = useState(0);
  const [show, setShow] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Set quote index only on client side after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  // 1. Session Logic: If already shown, don't render anything
  useEffect(() => {
    if (hasShownGlobalLoader) {
      setShow(false);
    }
  }, []);

  // 2. Intelligent Progress Logic (Fast & Smooth)
  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        // A. If real loading is done (!active), sprint to 100% immediately
        if (!active) {
          const jump = 100 - prev;
          return prev + Math.ceil(jump / 2); // Fast finish
        }

        // B. If real progress is ahead, catch up smoothly
        if (progress > prev) {
          return prev + Math.ceil((progress - prev) / 5);
        }

        // C. If waiting, slowly trickle up to 90% (never 100% until done)
        if (prev < 90) {
          return prev + 1;
        }

        return prev;
      });
    }, 40); // 40ms tick for smoothness

    return () => clearInterval(interval);
  }, [progress, active, show]);

  // 3. Exit Logic
  useEffect(() => {
    if (displayProgress >= 100) {
      // Mark as shown so it doesn't appear again on this navigation
      hasShownGlobalLoader = true;

      // Short delay for user to register "100%", then lift curtain
      const timer = setTimeout(() => {
        setShow(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [displayProgress]);

  if (!show) return null;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="loader"
          initial={{ y: 0 }}
          exit={{
            y: "-100%", // Curtain lift effect
            transition: {
              duration: 1.1,
              ease: [0.76, 0, 0.24, 1], // "Expo" ease for dramatic premium feel
            },
          }}
          className="fixed inset-0 z-9999 bg-[#F9F1E7] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* --- A. Background Watermark (Rootcraft) --- */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
            <span className="font-playfair font-bold text-[18vw] sm:text-[15vw] text-black tracking-tighter leading-none">
              Rootcraft
            </span>
          </div>

          {/* --- B. Main Content --- */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-6">

            {/* 1. Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-28 h-28 mb-10"
            >
              {/* Replace with your actual logo path */}
              <Image
                src="/logo.png"
                alt="Rootcraft Furniture"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* 2. The Big Number */}
            <div className="relative mb-2 overflow-hidden">
              <motion.h1
                className="font-playfair font-medium font-serif text-[80px] sm:text-[110px] text-[#B88E2F] leading-none tracking-tight"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                {Math.round(displayProgress)}%
              </motion.h1>
            </div>

            {/* 3. Quote / Status */}
            {isMounted && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-poppins text-[#666] text-xs uppercase tracking-[0.3em] text-center mb-8 min-h-[20px]"
              >
                {QUOTES[quoteIndex]}
              </motion.p>
            )}
            {!isMounted && (
              <div className="font-poppins text-[#666] text-xs uppercase tracking-[0.3em] text-center mb-8 min-h-[20px]" />
            )}

            {/* 4. Elegant Progress Bar */}
            <div className="w-full max-w-[240px] h-[2px] bg-[#B88E2F]/20 relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-[#B88E2F]"
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              />
            </div>
          </div>

          {/* --- C. Decorative Borders --- */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-px h-12 bg-[#B88E2F]/30" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}