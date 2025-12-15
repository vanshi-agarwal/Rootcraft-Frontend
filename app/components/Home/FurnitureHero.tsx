"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Ruler, Leaf, Move, X } from "lucide-react";
import ModelViewer from "../ModelViewer";
// --- Configuration ---
const ASSETS = {
  chairModel: "/chair.glb",
};

const STATS = [
  { value: "25y", label: "Warranty", icon: Star },
  { value: "100%", label: "Solid Oak", icon: Leaf },
  { value: "Ergo", label: "Certified", icon: Ruler },
];

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const textRevealVariants: Variants = {
  hidden: { y: "110%", opacity: 0 }, // Increased slightly to fully hide with padding
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 1.2, ease: [0.6, 0.01, 0.05, 0.9] },
  },
};

const fadeUpVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function FurnitureHero() {
  const ref = useRef(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouchDevice(mediaQuery.matches);
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

  // Parallax Background
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[80vh] lg:min-h-[75vh] bg-beige-100 flex items-center overflow-hidden py-16 sm:py-20"
    >
      {/* --- Ambient Background --- */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-beige-200 blur-[150px] rounded-full opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#D4C3A3] blur-[120px] rounded-full opacity-40" />
      </motion.div>

      {/* --- Grid Pattern --- */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size:[100px_100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-[60px] ">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-0">
          {/* --- LEFT COLUMN --- */}
          <motion.div
            className="w-full lg:w-[45%] flex flex-col gap-8 lg:pr-10 text-center lg:text-left items-center lg:items-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Tagline */}
            <div className="overflow-hidden">
              <motion.div
                variants={textRevealVariants}
                className="flex items-center gap-3"
              >
                <div className="h-px w-12 bg-wood-dark" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#555]">
                  Premium Collection 2025
                </span>
              </motion.div>
            </div>

            {/* Headline Section */}
            <div className="space-y-0">
              {" "}
              {/* Reduced space-y since we added padding inside */}
              {/* Line 1: Sculpted */}
              <div className="overflow-hidden pb-3 -mb-3">
                {" "}
                {/* FIX: Padding added to show 'p' */}
                <motion.h1
                  variants={textRevealVariants}
                  className="text-[48px] sm:text-[64px] lg:text-[80px] leading-[0.95] font-serif text-wood-dark"
                >
                  Sculpted for
                </motion.h1>
              </div>
              {/* Line 2: Modern Living */}
              <div className="overflow-hidden pb-3">
                {" "}
                {/* FIX: Padding added to show 'g' */}
                <motion.h1
                  variants={textRevealVariants}
                  className="text-[48px] sm:text-[64px] lg:text-[80px] leading-[0.95] font-serif italic text-wood-dark"
                >
                  Modern Living.
                </motion.h1>
              </div>
            </div>

            {/* Description */}
            <motion.p
              variants={fadeUpVariants}
              className="text-base sm:text-lg text-[#666] leading-relaxed max-w-[520px] font-medium"
            >
              Where ergonomic engineering meets artisanal woodcraft. The{" "}
              <span className="text-wood-dark font-bold">Lounge Chair 01</span>{" "}
              redefines comfort with a silhouette designed to last generations.
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={fadeUpVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 pt-4 w-full max-w-md"
            >
              {/* Primary Button */}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={"/shop"}
                className="relative bg-wood-dark text-beige-100 px-8 py-4 rounded-full font-medium text-sm tracking-wide overflow-hidden group shadow-xl shadow-black/10 cursor-pointer w-full sm:w-auto text-center justify-center items-center mx-auto"
              >
                <span className="relative z-10 flex items-center gap-2 text-center">
                  Configure Yours <ArrowRight size={16} />
                </span>
                <div className="absolute inset-0 bg-[#3a3a3a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </motion.a>

              {/* Secondary Button */}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={"/shop"}
                className="flex items-center gap-2 text-wood-dark font-semibold text-sm hover:opacity-70 transition-opacity cursor-pointer w-full sm:w-auto justify-center sm:justify-start"
              >
                <div className="w-10 h-10 rounded-full border border-wood-dark/20 flex items-center justify-center">
                  <span className="block w-2 h-2 bg-wood-dark rounded-full animate-pulse" />
                </div>
                View in AR
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUpVariants}
              className="grid grid-cols-3 gap-8 pt-10 mt-6 border-t border-wood-dark/10"
            >
              {STATS.map((stat, i) => (
                <div key={i} className="flex flex-col gap-1 justify-center items-center">
                  <stat.icon
                    size={20}
                    className="text-wood-dark mb-2"
                    strokeWidth={1.5}
                  />
                  <span className="text-xl font-bold text-wood-dark font-serif">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-[#888]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* --- RIGHT COLUMN --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.6, 0.01, 0.05, 0.9] }}
            className="w-full lg:w-[55%] h-[360px] sm:h-[460px] lg:h-[780px] relative z-20"
          >
            <div className="w-full h-full relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.0 }}
                className="w-full h-[320px] sm:h-[420px] lg:h-[700px] flex items-center justify-center relative z-20"
                role="img"
                aria-label="Interactive 3D model of the featured chair"
              >
                <ModelViewer
                  src="/chair.glb"
                  scale={1.2}
                  rotation={[0, -1, 0]}
                  cameraPosition={[0, 2, 3.5]}
                  preset="city"
                  className="w-full h-full"
                  position={[0, -1, 0]}
                  enableZoom={false}
                  viewAllAngles={true}
                  priority={true}
                  shadows={false}
                  singleFingerRotate={!isTouchDevice || isInteracting}
                  enableRotate={!isTouchDevice || isInteracting}
                />

                {/* Mobile Interaction Controls */}
                {isTouchDevice && (
                  <>
                    <AnimatePresence>
                      {!isInteracting && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => setIsInteracting(true)}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-wood-dark/10 px-5 py-2.5 rounded-full shadow-lg z-30 group"
                        >
                          <Move size={18} className="text-wood-dark group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-bold uppercase tracking-wider text-wood-dark">
                            Interactive 3D
                          </span>
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {isInteracting && (
                        <div className="absolute inset-x-0 bottom-6 flex justify-center items-center gap-4 z-30 pointer-events-none">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="bg-wood-dark/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-xl"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-beige-100">
                              Swipe to Rotate
                            </span>
                          </motion.div>

                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsInteracting(false);
                            }}
                            className="bg-white text-wood-dark p-2 rounded-full shadow-lg border border-wood-dark/10 pointer-events-auto active:scale-90 transition-transform"
                          >
                            <X size={20} />
                          </motion.button>
                        </div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute top-[20%] right-[5%] lg:right-[10%] bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white shadow-lg max-w-[180px] hidden sm:block"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                  <span className="text-wood-dark font-bold font-serif">
                    $850
                  </span>
                </div>
                <p className="text-xs text-[#555] leading-tight">
                  <span className="font-semibold text-black">Teak Wood</span>{" "}
                  finish with premium linen upholstery.
                </p>
              </motion.div>

              {/* Rotating Badge */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[10%] left-[5%] w-24 h-24 hidden lg:flex items-center justify-center rounded-full border border-wood-dark/10"
              >
                <svg
                  viewBox="0 0 100 100"
                  width="100"
                  height="100"
                  className="absolute top-0 left-0 w-full h-full"
                >
                  <path
                    id="circlePath"
                    d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    fill="none"
                  />
                  <text
                    fontSize="11"
                    fontWeight="bold"
                    fill="#242424"
                    letterSpacing="2px"
                  >
                    <textPath xlinkHref="#circlePath">
                      SCROLL TO EXPLORE • SCROLL TO EXPLORE •
                    </textPath>
                  </text>
                </svg>
                <ArrowRight size={16} className="text-wood-dark rotate-90" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
