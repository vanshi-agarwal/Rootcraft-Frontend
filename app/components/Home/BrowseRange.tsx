"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useInView,
} from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

// --- Constants & Data ---
const CATEGORIES = [
  // Row 1
  {
    id: "living",
    title: "Living",
    subtitle: "Comfort & Style",
    description: "Engineered for relaxation, designed for life.",
    src: "/home/living.jpg", // Local Image
    shopRoute: "/shop?category=living",
  },
  {
    id: "dining",
    title: "Dining",
    subtitle: "Gather & Feast",
    description: "Centerpieces for your most memorable conversations.",
    src: "/home/dining.jpg", // Local Image
    shopRoute: "/shop?category=dining",
  },
  {
    id: "bedroom",
    title: "Bedroom",
    subtitle: "Rest & Retreat",
    description: "Sanctuaries crafted for the perfect night's sleep.",
    src: "/home/bedroom.jpg", // Local Image
    shopRoute: "/shop?category=bedroom",
  },
  // Row 2 (New Categories with Unsplash Images)
  {
    id: "office",
    title: "Home Office",
    subtitle: "Focus & Flow",
    description: "Ergonomic workspaces that inspire productivity.",
    src: "/home/home-office.jpg",
    shopRoute: "/shop?category=office",
  },
  {
    id: "outdoor",
    title: "Outdoor",
    subtitle: "Nature & Leisure",
    description: "Weather-resistant luxury for your open-air haven.",
    src: "/home/outdoor.jpg",
    shopRoute: "/shop?category=outdoor",
  },
  {
    id: "decor",
    title: "Decor & Lighting",
    subtitle: "Details & Ambience",
    description: "The finishing touches that turn a house into a home.",
    src: "/home/decor.jpg",
    shopRoute: "/shop?category=decor",
  },
];

// --- Utility Components ---

/**
 * GrainOverlay
 * Adds a subtle noise texture to background for a premium, non-digital feel.
 */
const GrainOverlay = () => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.04]">
    <div className="h-[300%] w-[300%] animate-grain bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
  </div>
);

/**
 * RevealText
 * Animate text sliding up from a masked container.
 */
const RevealText = ({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: "0%" } : { y: "100%" }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="inline-block"
      >
        {text}
      </motion.div>
    </div>
  );
};

// --- Main Component ---

const BrowseRange = () => {
  return (
    <section className="relative w-full overflow-x-hidden bg-[#FDFCF8] py-24 lg:py-32">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-[800px] bg-linear-to-b from-[#EAE5D9]/50 via-[#EAE5D9]/20 to-transparent blur-3xl pointer-events-none" />
      <GrainOverlay />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* --- Section Header --- */}
        <div className="mb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#8B7355]/20 bg-[#8B7355]/5 px-4 py-1.5 text-sm font-medium text-[#8B7355] backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated Collection 2025</span>
          </motion.div>

          <h2 className="mb-6 font-poppins text-4xl font-bold leading-[1.1] tracking-tight text-[#1A1A1A] sm:text-5xl lg:text-7xl flex flex-col items-center">
            <RevealText text="Crafted for Every" />
            <RevealText
              text="Space in Life"
              delay={0.1}
              className="text-[#8B7355]"
            />
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-2xl font-sans text-lg leading-relaxed text-neutral-500 md:text-xl"
          >
            From the centerpiece of your living room to the sanctuary of your
            bedroom. Discover furniture engineered for relaxation and designed
            for modern living.
          </motion.p>
        </div>

        {/* --- 6-Grid Layout --- */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {CATEGORIES.map((category, index) => (
            <MagneticCard key={category.id} data={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- The "Magnetic" Card Component ---

const MagneticCard = ({
  data,
  index,
}: {
  data: (typeof CATEGORIES)[0];
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="relative min-h-[320px] h-[360px] w-full sm:h-[420px] lg:h-[500px]"
    >
      <Link href={data.shopRoute} className="block h-full w-full group">
        <div className="relative h-full w-full overflow-hidden rounded-4xl bg-[#F0F0F0] shadow-xl ring-1 ring-black/5">
          {/* --- Image Layer --- */}
          <div className="absolute inset-0 overflow-hidden rounded-4xl bg-neutral-200">
            <motion.div
              className="h-full w-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Image
                src={data.src}
                alt={data.title}
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:grayscale-0 grayscale-0"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </motion.div>
          </div>

          {/* --- Overlays --- */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

          {/* --- Content --- */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="transform-gpu transition-transform duration-500 group-hover:-translate-y-2">
              {/* Badge Icon */}
              <div className="absolute -top-12 right-0 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 hidden md:block">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                  <ArrowUpRight className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Text Content */}
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-[#B88E2F] transition-transform duration-300 group-hover:translate-x-1">
                {data.subtitle}
              </span>

              <h3 className="font-poppins mb-3 text-3xl font-bold text-white">
                {data.title}
              </h3>

              <div className="overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-[100px] group-hover:opacity-100">
                <p className="max-w-[90%] text-sm leading-relaxed text-gray-200 pb-2">
                  {data.description}
                </p>
              </div>

              {/* Progress Line */}
              <div className="mt-5 h-[2px] bg-white/40 w-[20%] transition-all duration-500 group-hover:w-full" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BrowseRange;
