"use client";

import Image from "next/image";
import { Star, BadgeCheck, Quote } from "lucide-react";

// --- DUMMY DATA ---
const TESTIMONIALS = [
  {
    id: 1,
    name: "Briar Martin",
    handle: "@briar_design",
    role: "Interior Designer",
    image: "/testimonial/user-1.jpg",
    text: "Rootcraft has completely transformed the way I source for my clients. The craftsmanship is impeccable, and the wood quality is genuinely premium.",
  },
  {
    id: 2,
    name: "Avery Johnson",
    handle: "@avery_home",
    role: "Verified Buyer",
    image: "/testimonial/user-2.jpg",
    text: "I was skeptical about ordering furniture online, but the packaging was robust and the sofa is even more beautiful in person.",
  },
  {
    id: 3,
    name: "Jordan Lee",
    handle: "@jlee_arch",
    role: "Architect",
    image: "/testimonial/user-3.jpg",
    text: "Finding furniture that balances ergonomic engineering with such high-end aesthetics is rare. Highly recommended.",
  },
  {
    id: 4,
    name: "Sarah Miller",
    handle: "@sarah_m",
    role: "Verified Buyer",
    image: "/testimonial/user-4.jpg",
    text: "The delivery was seamless. The 'Modern Living' armchair is now the favorite spot in our house.",
  },
  {
    id: 5,
    name: "Michael Chen",
    handle: "@mike_chen",
    role: "Hotel Manager",
    image: "/testimonial/user-5.jpg",
    text: "We outfitted our lobby with this collection. Guests constantly ask where the pieces are from. It holds up incredibly well.",
  },
];

const Testimonials = () => {
  return (
    <section className="relative w-full bg-[#FAF9F6] py-20 lg:py-28 overflow-hidden font-sans">
      {/* 1. HEADER SECTION */}
      <div className="max-w-3xl mx-auto text-center px-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B88E2F]/10 text-[#B88E2F] text-xs font-bold tracking-widest uppercase mb-4">
          <Star size={12} fill="currentColor" />
          <span>Wall of Love</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-6">
          Loved by Designers & <br />
          <span className="text-[#B88E2F]">Homeowners Alike</span>
        </h2>
        <p className="text-gray-500 text-lg">
          Don't just take our word for it. Read what our community has to say
          about their Rootcraft experience.
        </p>
      </div>

      {/* 2. MARQUEE SECTION */}
      <div className="flex flex-col gap-8">
        {/* Row 1: Left to Right */}
        <MarqueeRow items={TESTIMONIALS} direction="normal" speed="80s" />

        {/* Row 2: Right to Left */}
        <MarqueeRow items={TESTIMONIALS} direction="reverse" speed="85s" />
      </div>

      {/* 3. GRADIENT MASKS (To fade edges) */}
      <div className="absolute top-0 left-0 h-full w-20 md:w-40 bg-linear-to-r from-[#FAF9F6] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-20 md:w-40 bg-linear-to-l from-[#FAF9F6] to-transparent z-10 pointer-events-none" />
    </section>
  );
};

// --- SUB-COMPONENTS ---

const MarqueeRow = ({
  items,
  direction = "normal",
  speed = "10s",
}: {
  items: typeof TESTIMONIALS;
  direction?: "normal" | "reverse";
  speed?: string;
}) => {
  return (
    <div className="marquee-container w-full overflow-hidden flex">
      <div
        className="animate-scroll flex gap-6 px-3"
        style={{
          animationDuration: speed,
          animationDirection: direction,
          width: "max-content", // Ensures the inner container is wide enough
        }}
      >
        {/* Render items twice to create seamless loop */}
        {[...items, ...items, ...items].map((item, idx) => (
          <ReviewCard key={`${item.id}-${idx}`} data={item} />
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({ data }: { data: (typeof TESTIMONIALS)[0] }) => {
  return (
    <div className="w-[350px] md:w-[400px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#B88E2F]/30 transition-all duration-300 shrink-0 cursor-default group">
      {/* User Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100">
            <Image
              src={data.image}
              alt={data.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-[#1A1A1A] text-sm">{data.name}</h4>
              <BadgeCheck
                size={14}
                className="text-[#B88E2F] fill-[#B88E2F]/10"
              />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400">{data.handle}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              {/* Role Badge */}
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {data.role}
              </span>
            </div>
          </div>
        </div>
        <Quote
          size={20}
          className="text-gray-200 group-hover:text-[#B88E2F]/40 transition-colors"
        />
      </div>

      {/* Review Text */}
      <p className="text-gray-600 text-sm leading-relaxed">"{data.text}"</p>

      {/* Stars (Visual decoration) */}
      <div className="flex gap-0.5 mt-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="fill-[#B88E2F] text-[#B88E2F]" />
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
