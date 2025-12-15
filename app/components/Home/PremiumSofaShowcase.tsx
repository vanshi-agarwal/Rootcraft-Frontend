"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, Variants, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Feather,
  Maximize2,
  Move,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";

// Lazy load ModelViewer to improve initial load
const ModelViewer = dynamic(() => import("../ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100/50">
      <div className="w-12 h-12 border-4 border-[#B88E2F]/20 border-t-[#B88E2F] rounded-full animate-spin" />
    </div>
  ),
});
// Assuming ModelViewer is your custom component or from a library like 'react-model-viewer'
// If you don't have the component definition, ensure this import path is correct or replace with your actual component

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const cardLeftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

const cardRightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 120 },
  },
};

// --- Feature Data ---
const features = [
  {
    id: 1,
    title: "Premium Velvet",
    desc: "Ultra-soft, stain-resistant fabric designed for luxury.",
    icon: Feather,
    side: "left",
  },
  {
    id: 2,
    title: "Solid Wood Frame",
    desc: "Hand-crafted teak wood frame with 10-year warranty.",
    icon: ShieldCheck,
    side: "left",
  },
  {
    id: 3,
    title: "Ergonomic Design",
    desc: "High-density foam tailored for maximum lumbar support.",
    icon: Maximize2,
    side: "right",
  },
  {
    id: 4,
    title: "Easy Assembly",
    desc: "Set up in minutes with our tool-free assembly system.",
    icon: Sparkles,
    side: "right",
  },
];

export default function PremiumSofaShowcase() {
  const sectionRef = useRef(null);
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isModelVisible, setIsModelVisible] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Check if model container is in view
  const isInView = useInView(modelContainerRef, {
    once: false,
    margin: "-100px",
  });

  useEffect(() => {
    setIsModelVisible(isInView);
  }, [isInView]);

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

  // Optimized parallax for the background Text
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Memoize transforms to prevent unnecessary recalculations
  const yText = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const allowManualRotate = !isTouchDevice || isInteracting;
  const responsiveScale = useMemo(
    () => (isTouchDevice ? 0.0012 : 0.0015),
    [isTouchDevice]
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[800px] bg-[#FCF8F3] overflow-hidden py-20 lg:py-24"
    >
      {/* --- Background Elements --- */}

      {/* 1. Giant Watermark Text (Parallax) - Optimized */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden">
        <motion.h1
          style={{ y: yText }}
          className="font-poppins font-bold text-[20vw] md:text-[15vw] lg:text-[18vw] text-[#B88E2F]/5 leading-none tracking-tighter whitespace-nowrap will-change-transform"
        >
          COMFORT
        </motion.h1>
      </div>

      {/* 2. Radial Gradient Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(252,248,243,0)_70%)] z-0" />

      {/* --- Main Content Grid --- */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 lg:mb-0 relative z-20"
        >
          <span className="text-[#B88E2F] font-poppins font-bold tracking-[4px] text-xs md:text-sm uppercase">
            Exclusive Edition
          </span>
          <h2 className="text-[#333333] font-poppins font-bold text-3xl md:text-5xl mt-2 md:mt-3">
            The Cloud Sofa
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mt-8 lg:mt-16 pb-12 lg:pb-0">
          {/* --- Left Column: Features --- */}
          <motion.div
            className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-6 lg:gap-16 order-2 lg:order-1"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features
              .filter((f) => f.side === "left")
              .map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  variant={cardLeftVariants}
                  align="left"
                />
              ))}
          </motion.div>

          {/* --- Center Column: 3D Model --- */}
          <div
            ref={modelContainerRef}
            className="lg:col-span-6 h-[320px] sm:h-[420px] md:h-[520px] lg:h-[600px] relative order-1 lg:order-2 w-full"
          >
            {/* Decorative Circle behind model */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] md:w-[500px] h-[280px] md:h-[500px] rounded-full border border-[#B88E2F]/20"
            />

            {/* The 3D Viewer - Only render when visible */}
            <motion.div
              className={`w-full h-full z-20 relative ${allowManualRotate ? "cursor-grab active:cursor-grabbing" : ""
                }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* FIXED MODEL VIEWER SETTINGS - Only render when in view */}
              {isModelVisible && (
                <ModelViewer
                  src="/sofa.glb"
                  scale={responsiveScale}
                  cameraPosition={[0, 1.5, 6]}
                  position={[0.1, -0.7, 0]}
                  rotation={[0, -0.4, 0]}
                  preset="night"
                  intensity={0.5}
                  float={true}
                  shadows={false}
                  enableZoom={false}
                  autoRotate={isModelVisible} // Only auto-rotate when visible
                  viewAllAngles={true}
                  priority={false} // Changed to false to prevent blocking
                  className="w-full h-full"
                  singleFingerRotate={allowManualRotate}
                  enableRotate={allowManualRotate}
                />

              )}

              {/* Mobile Interaction Controls - Toggle Pattern */}
              {isTouchDevice && (
                <>
                  <AnimatePresence>
                    {!isInteracting && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsInteracting(true)}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-[#B88E2F]/20 px-5 py-2.5 rounded-full shadow-lg z-30 group"
                      >
                        <Move size={18} className="text-[#B88E2F] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#333]">
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
                          className="bg-[#333]/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-xl"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
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
                          className="bg-white text-[#333] p-2 rounded-full shadow-lg border border-[#333]/10 pointer-events-auto active:scale-90 transition-transform"
                        >
                          <X size={20} />
                        </motion.button>
                      </div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Floating Interaction Hint - Only show on desktop */}
              {allowManualRotate && !isTouchDevice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-xs font-poppins text-[#9F9F9F] flex items-center gap-2 pointer-events-none whitespace-nowrap z-30"
                >
                  <div className="w-2 h-2 rounded-full bg-[#B88E2F] animate-pulse" />
                  Drag to rotate 360°
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* --- Right Column: Features --- */}
          <motion.div
            className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-6 lg:gap-16 order-3 lg:order-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features
              .filter((f) => f.side === "right")
              .map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  variant={cardRightVariants}
                  align="right"
                />
              ))}

            {/* CTA Button on the right side (or you can move to bottom) */}
            <motion.div
              variants={cardRightVariants}
              className="flex justify-center sm:justify-start lg:justify-end mt-4 sm:col-span-2 lg:col-span-1"
            >
              <motion.a
                href="/shop"
                className="group flex items-center gap-3 px-8 py-4 bg-[#333333] text-white font-poppins font-medium hover:bg-[#B88E2F] transition-all duration-300 rounded-sm shadow-lg hover:shadow-[#B88E2F]/30 cursor-pointer w-full sm:w-auto justify-center text-center"
              >
                <span>Buy Now </span>
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// --- Sub-Component: Feature Card ---
const FeatureCard = ({
  feature,
  variant,
  align,
}: {
  feature: any;
  variant: any;
  align: "left" | "right";
}) => {
  const Icon = feature.icon;
  const isRight = align === "right";

  return (
    <motion.div
      variants={variant}
      className={`flex flex-col ${isRight
        ? "items-center text-center sm:items-start sm:text-left lg:items-end lg:text-right"
        : "items-center text-center sm:items-start sm:text-left"
        } group w-full`}
    >
      <div className="mb-4 p-3 bg-white rounded-xl shadow-md group-hover:shadow-lg group-hover:bg-[#B88E2F] transition-all duration-300 group-hover:scale-110">
        <Icon
          size={24}
          className="text-[#B88E2F] group-hover:text-white transition-colors duration-300"
        />
      </div>
      <h3 className="font-poppins font-semibold text-xl text-[#333333] mb-2">
        {feature.title}
      </h3>
      <p className="font-poppins text-[#9F9F9F] text-sm leading-relaxed max-w-[280px] lg:max-w-[250px]">
        {feature.desc}
      </p>

      {/* Decorative Line */}
      <div
        className={`h-px w-12 bg-[#B88E2F]/30 mt-4 transition-all duration-500 group-hover:w-24 group-hover:bg-[#B88E2F]`}
      />
    </motion.div>
  );
};
