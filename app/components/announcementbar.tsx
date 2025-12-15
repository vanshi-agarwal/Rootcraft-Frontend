"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Building2, Truck, HelpCircle, Check, Copy } from "lucide-react";

// --- Dummy Data ---
const LEFT_NAV_ITEMS = [
  { label: "Furniture", href: "/furniture", highlight: true },
  { label: "Home Interiors", href: "/interiors", highlight: false },
  { label: "Bulk Order", href: "/bulk", highlight: false },
];

const RIGHT_NAV_ITEMS = [
  {
    id: "phone",
    label: "+91-1234567890",
    icon: Phone,
    action: "copy", // Special action for phone
    href: "#",
  },
  {
    id: "franchise",
    label: "Become a Franchise",
    icon: Building2,
    href: "/franchise",
  },
  {
    id: "track",
    label: "Track Order",
    icon: Truck,
    href: "/track-order",
  },
  {
    id: "help",
    label: "Help Center",
    icon: HelpCircle,
    href: "/help",
  },
];

const AnnouncementBar = () => {
  const [copied, setCopied] = useState(false);

  // Function to handle phone number copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text.replace(/[^0-9+]/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-50 w-full bg-[#FAF9F6] border-b border-[#E5E0D8] text-[#4A4A4A] font-sans text-[11px] sm:text-xs tracking-wide"
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 h-10 sm:h-11 flex items-center justify-between">
        {/* --- LEFT SIDE: Categories --- */}
        <nav className="flex items-center h-full">
          <ul className="flex items-center gap-0">
            {LEFT_NAV_ITEMS.map((item, index) => (
              <React.Fragment key={item.label}>
                <li className="relative group h-full flex items-center">
                  <Link
                    href={item.href}
                    className={`
                      relative px-3 sm:px-4 py-2 transition-colors duration-300
                      ${item.highlight
                        ? "text-[#C68554] font-semibold"
                        : "text-[#4A4A4A] hover:text-[#C68554]"
                      }
                    `}
                  >
                    {item.label}

                    {/* Hover Underline Animation */}
                    <span className="absolute bottom-1 left-4 right-4 h-px bg-[#C68554] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                </li>
                {/* Divider Line */}
                {index !== LEFT_NAV_ITEMS.length - 1 && (
                  <div className="h-3 w-px bg-[#D1D1D1] mx-1" />
                )}
              </React.Fragment>
            ))}
          </ul>
        </nav>

        {/* --- RIGHT SIDE: Utilities --- */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {RIGHT_NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isPhone = item.action === "copy";

            return (
              <React.Fragment key={item.id}>
                {/* Separator (only before items, not first) */}
                {index !== 0 && <div className="h-4 w-px bg-[#D1D1D1]" />}

                <motion.div
                  className="relative group cursor-pointer"
                  whileHover={{ y: -1 }}
                  onClick={() => (isPhone ? handleCopy(item.label) : null)}
                >
                  {isPhone ? (
                    // Phone Number with Copy Logic
                    <button className="flex items-center gap-2 hover:text-[#C68554] transition-colors">
                      <div className="relative">
                        <AnimatePresence mode="wait">
                          {copied ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="phone"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <span className="font-medium whitespace-nowrap">
                        {copied ? "Copied!" : item.label}
                      </span>
                    </button>
                  ) : (
                    // Standard Link Items
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 hover:text-[#C68554] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#888]" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  )}
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default AnnouncementBar;
