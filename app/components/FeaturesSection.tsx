"use client";

import React, { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import {
  Trophy,
  ShieldCheck,
  Truck,
  Headphones,
  LucideIcon,
} from "lucide-react";

// --- Animation Variants ---

// Controls the staggering of the children (cards)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay between each card appearing
      delayChildren: 0.1,
    },
  },
};

// Controls the animation of each individual card
const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring", // Bounce effect
      stiffness: 100,
      damping: 20,
      mass: 1,
    },
  },
};

// --- Components ---

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const FeatureCard = ({ icon: Icon, title, subtitle }: FeatureItemProps) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -10,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        boxShadow: "0px 20px 40px rgba(0,0,0,0.05)",
      }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-6 rounded-2xl transition-colors duration-300 cursor-default"
    >
      {/* Icon Container with Animation */}
      <motion.div
        className="relative flex items-center justify-center w-16 h-16 rounded-full bg-black/5 text-black group-hover:bg-black group-hover:text-[#FAF3EA] transition-colors duration-300"
        whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }} // Subtle shake on hover
        transition={{ duration: 0.5 }}
      >
        <Icon size={32} strokeWidth={1.5} />
      </motion.div>

      {/* Text Content */}
      <div className="flex flex-col justify-center">
        <h3 className="text-[#242424] font-bold text-xl mb-1 tracking-tight group-hover:text-black transition-colors">
          {title}
        </h3>
        <p className="text-[#898989] text-sm font-medium group-hover:text-[#666] transition-colors">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  // Use ref to detect when the section enters the viewport
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Trophy,
      title: "High Quality",
      subtitle: "Crafted from top materials",
    },
    {
      icon: ShieldCheck,
      title: "Warranty Protection",
      subtitle: "Over 2 years",
    },
    {
      icon: Truck,
      title: "Free Shipping",
      subtitle: "Orders over ₹5,00,000",
    },
    {
      icon: Headphones,
      title: "24 / 7 Support",
      subtitle: "Dedicated support",
    },
  ];

  return (
    <section className="bg-[#FAF3EA] py-[80px] lg:py-[100px] border-t border-[#E8E8E8] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[50px]">
        {/* Animated Grid Container */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              subtitle={feature.subtitle}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
