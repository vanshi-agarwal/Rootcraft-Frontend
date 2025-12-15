"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

// --- DATA ---
const SLIDES = [
  {
    id: 1,
    category: "Bed Room",
    title: "Inner Peace",
    image: "/inspiration/ins-1.jpg",
  },
  {
    id: 2,
    category: "Dining",
    title: "Gathering Spot",
    image: "/inspiration/ins-2.jpg",
  },
  {
    id: 3,
    category: "Kitchen",
    title: "Culinary Art",
    image: "/inspiration/ins-3.jpg",
  },
  {
    id: 4,
    category: "Living",
    title: "Cozy Corner",
    image: "/inspiration/ins-4.jpg",
  },
  {
    id: 5,
    category: "Office",
    title: "Work Flow",
    image: "/inspiration/ins-5.jpg",
  },
];

const Inspirations = () => {
  const [index, setIndex] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    setViewportWidth(window.innerWidth);
    let timeoutId: NodeJS.Timeout;
    const update = () => {
      // Throttle resize events for better performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewportWidth(window.innerWidth);
      }, 150);
    };
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      clearTimeout(timeoutId);
    };
  }, []);

  // Clear reset flag after ensuring render cycle is complete
  useEffect(() => {
    if (isResetting) {
      const timer = setTimeout(() => {
        setIsResetting(false);
      }, 50); // Small delay to ensure the instant jump renders
      return () => clearTimeout(timer);
    }
  }, [isResetting]);

  const isMobile = viewportWidth <= 640;
  const isTablet = viewportWidth > 640 && viewportWidth < 1024;
  const baseCardWidth = isMobile
    ? Math.max(260, viewportWidth - 48)
    : isTablet
      ? 340
      : 372;
  const activeCardWidth = isMobile ? baseCardWidth : baseCardWidth + 28;
  const baseCardHeight = isMobile ? 420 : isTablet ? 520 : 486;
  const activeCardHeight = isMobile ? 460 : 582;
  const cardGap = 24;

  const handleNext = () => {
    setIndex((prev) => prev + 1);
  };

  const handleDotClick = (idx: number) => {
    setIndex(idx);
  };

  return (
    <section className="bg-[#FCF8F3] py-20 lg:py-24 w-full overflow-hidden">
      {/* 
        Container: Flexbox
        - lg:flex-row : Side by side on desktop
        - items-center : Vertically centered
        - gap-8 : Space between text and slider
      */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* 
          --- LEFT SIDE (Text) --- 
          - w-[35%] : Takes up roughly 1/3
          - shrink-0 : PREVENTS getting squashed by images
        */}
        <div className="w-full lg:w-[35%] shrink-0 flex flex-col items-start z-10 text-left">
          <h2 className="font-poppins font-bold text-3xl md:text-[40px] leading-[1.2] text-[#3A3A3A] mb-4">
            50+ Beautiful rooms inspiration
          </h2>
          <p className="font-poppins text-[#616161] text-base leading-relaxed mb-8">
            Our designer already made a lot of beautiful prototypes of rooms
            that inspire you.
          </p>
          <Link href="/shop" className="bg-[#B88E2F] text-white px-8 py-3 font-semibold text-sm hover:bg-[#9c7826] transition-all duration-300 shadow-md">
            Explore More
          </Link>
        </div>

        {/* 
          --- RIGHT SIDE (Carousel) ---
          - w-[65%] : Takes up remaining space
          - overflow-hidden : CRITICAL. Cuts off images that go off-screen.
          - min-w-0 : CRITICAL. Allows flex child to shrink properly.
        */}
        <div className="w-full lg:w-[65%] relative overflow-hidden min-w-0 h-[520px] sm:h-[560px] lg:h-[600px] flex items-center">
          {/* 
             TRACK CONTAINER 
             Moves left based on index.
             Calculation: index * (Card Width + Gap)
          */}
          {/* 
             TRACK CONTAINER 
             Moves left based on index.
             Calculation: index * (Card Width + Gap)
          */}
          <motion.div
            className="flex absolute left-0 pl-1 cursor-grab active:cursor-grabbing"
            style={{ gap: `${cardGap}px` }}
            animate={{
              x: -index * (baseCardWidth + cardGap),
            }}
            transition={isResetting ? { duration: 0 } : { type: "tween", ease: "easeOut", duration: 0.5 }}
            onAnimationComplete={() => {
              if (index >= SLIDES.length) {
                setIsResetting(true);
                setIndex(index % SLIDES.length);
              }
            }}
            drag="x"
            dragConstraints={{ right: 0, left: -((SLIDES.length * 2 - 1) * (baseCardWidth + cardGap)) }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000 || offset.x < -100) {
                // Swipe Left -> Next
                setIndex((prev) => Math.min(prev + 1, SLIDES.length * 2 - 1));
              } else if (swipe > 10000 || offset.x > 100) {
                // Swipe Right -> Prev
                setIndex((prev) => Math.max(prev - 1, 0));
              }
            }}
          >
            {[...SLIDES, ...SLIDES].map((slide, i) => {
              // Determine if this specific card clone is "active"
              // Adjust logic so both the original and its clone highlight correctly during transitions
              const realIndex = i % SLIDES.length;
              const isActive = i === index;

              return (
                <motion.div
                  key={`${slide.id}-${i}`}
                  // Animate Width/Height based on active state
                  animate={{
                    width: isActive ? activeCardWidth : baseCardWidth,
                    height: isActive ? activeCardHeight : baseCardHeight,
                    opacity: isActive ? 1 : 0.7,
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={`
                    relative shrink-0 transition-all duration-300
                    ${isActive ? "self-start" : "self-center"} 
                  `}
                  style={{
                    maxWidth: "100%",
                  }}
                >
                  <div className="relative w-full h-full overflow-hidden shadow-lg bg-gray-200">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 400px"
                      priority={i < 2} // Prioritize first 2 images
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                    {/* Dark overlay for inactive slides */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-white/20" />
                    )}
                  </div>

                  {/* ACTIVE INFO BOX */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                        className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-6 min-w-[217px] z-20 shadow-md pointer-events-none"
                      >
                        <div className="flex items-center gap-2 mb-2 text-[#616161]">
                          <span className="text-sm font-medium">
                            0{slide.id}
                          </span>
                          <span className="w-6 h-px bg-[#616161]"></span>
                          <span className="text-sm font-medium">
                            {slide.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-semibold text-[#3A3A3A]">
                          {slide.title}
                        </h3>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          {/* NEXT ARROW BUTTON (Floating relative to container) */}
          <button
            onClick={handleNext}
            className="absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white text-[#B88E2F] shadow-lg hidden lg:flex lg:items-center lg:justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
            style={{ left: `calc(${activeCardWidth}px + 12px)` }}
          >
            <ChevronRight size={24} />
          </button>

          {/* PAGINATION DOTS */}
          <div
            className="absolute bottom-8 hidden lg:flex lg:gap-3"
            style={{ left: `calc(${activeCardWidth}px + 36px)` }}
          >
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`transition-all duration-300 rounded-full flex items-center justify-center ${idx === index
                  ? "w-7 h-7 border border-[#B88E2F]"
                  : "w-3 h-3 bg-[#D8D8D8] hover:bg-[#B88E2F]/50"
                  }`}
              >
                {idx === index && (
                  <div className="w-2.5 h-2.5 bg-[#B88E2F] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Inspirations;
