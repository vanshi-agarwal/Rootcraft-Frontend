"use client";

import Link from "next/link";
import { Loader2, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import type { ReactNode, FormEvent } from "react";
import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";

const FOOTER_DATA = {
  company: [
    { label: "About Us", href: "#" },
    { label: "Contact Us", href: "/contact" },
    { label: "Blogs", href: "/blog" },
    { label: "Careers", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Track Order", href: "#" },
    { label: "Shipping & Delivery", href: "#" },
    { label: "Returns & Exchanges", href: "#" },
  ],
  shop: [
    { label: "Living Room", href: "/shop" },
    { label: "Bedroom", href: "/shop" },
    { label: "Dining Room", href: "/shop" },
    { label: "New Arrivals", href: "/shop" },
  ],
};

const SOCIAL_LINKS: {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}[] = [
  {
    id: "facebook",
    label: "Facebook",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.5l.5-4H14V7a1 1 0 0 1 1-1h3Z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "x",
    label: "X",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 4h3.6l4.2 5.8L15.6 4H20l-6.2 8.3L20 20h-3.6l-4.4-6-4.2 6H4l6.4-8.6Z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5Zm-2.48 6H7.5V21H2.5Zm7 0h4.7v1.9h.07c.65-1.2 2.24-2.47 4.6-2.47 4.92 0 5.83 3.21 5.83 7.38V21h-5v-5.7c0-1.36-.02-3.11-1.9-3.11-1.9 0-2.19 1.48-2.19 3V21h-5Z" />
      </svg>
    ),
  },
];

const SocialButton = ({
  icon,
  href,
  label,
}: {
  icon: ReactNode;
  href: string;
  label: string;
}) => (
  <a
    href={href}
    aria-label={label}
    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#B88E2F] hover:border-[#B88E2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E2F] transition-none"
  >
    {icon}
  </a>
);

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValidEmail) {
      showToast({
        type: "error",
        action: "auth_error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    showToast({
      type: "success",
      action: "contact_form_submit",
      message: `You're on the list, ${trimmedEmail}!`,
    });

    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <footer className="relative bg-[#050505] text-white overflow-hidden pt-24 pb-0 font-sans">
      {/* 1. TOP GRADIENT LINE (Subtle separation) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#B88E2F]/50 to-transparent opacity-50" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-20">
        {/* 2. NEWSLETTER - High Visibility Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-sm mb-20">
          <div className="max-w-lg">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Join the <span className="text-[#B88E2F]">Inner Circle</span>
            </h3>
            <p className="text-gray-400 text-sm md:text-base">
              Get early access to new collections, exclusive sales, and interior
              design tips directly to your inbox.
            </p>
          </div>

          <div className="w-full md:w-auto flex-1 max-w-md">
            <form
              className="relative flex items-center"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                name="newsletter-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter Email.."
                className="w-full bg-[#111] border border-white/10 rounded-full py-4 pl-6 pr-36 text-white text-sm sm:text-base leading-tight placeholder:text-gray-600 placeholder:text-sm sm:placeholder:text-base focus:outline-none focus:border-[#B88E2F] focus:ring-2 focus:ring-[#B88E2F]/20 transition-all duration-300 disabled:opacity-60"
                disabled={isSubmitting}
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#B88E2F] hover:bg-[#a17a25] disabled:hover:bg-[#B88E2F] text-white px-6 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 will-change-transform disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* 3. MAIN LINKS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
          {/* Brand Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg  flex items-center justify-center text-white font-serif font-bold text-xl">
                <Image src="/logo.png" alt="Logo" width={50} height={50} />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Rootcraft
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Premium furniture crafted for the modern home. We blend ergonomic
              engineering with timeless aesthetics to create spaces you'll love.
            </p>
            <div className="flex gap-3 mt-2">
              {SOCIAL_LINKS.map((social) => (
                <SocialButton
                  key={social.id}
                  icon={social.icon}
                  href={social.href}
                  label={social.label}
                />
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
            <ul className="flex flex-col gap-4">
              {FOOTER_DATA.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#B88E2F] hover:translate-x-2 transition-all duration-300 ease-out text-sm inline-block will-change-transform"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold mb-6 text-white">Support</h4>
            <ul className="flex flex-col gap-4">
              {FOOTER_DATA.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#B88E2F] hover:translate-x-2 transition-all duration-300 ease-out text-sm inline-block will-change-transform"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Card (Span 4) - Replaced muddy image with a clean card */}
          <div className="lg:col-span-4">
            <div className="h-full bg-[#111] border border-white/10 rounded-xl p-6 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">Visit Our Showroom</h4>
                <p className="text-gray-400 text-sm mb-6">
                  Experience the quality of our wood and fabrics in person.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="text-[#B88E2F] shrink-0 mt-1"
                      size={18}
                    />
                    <span className="text-sm text-gray-300">
                      123 Any Street, Design District,
                      <br />
                      Any City, Any State, Country 123456
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-[#B88E2F] shrink-0" size={18} />
                    <span className="text-sm text-gray-300">
                      +1 (111) 111-1111
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#B88E2F]/10 rounded-full blur-2xl group-hover:bg-[#B88E2F]/20 transition-all duration-500 ease-out will-change-transform pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. BIG BOTTOM WATERMARK & COPYRIGHT */}
      <div className="border-t border-white/5 bg-[#0A0A0A] pt-8 pb-8 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} Rootcraft. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>

        {/* Huge Watermark - Placed at the very bottom, low opacity, NOT interfering with main content */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[30%] pointer-events-none select-none w-full text-center">
          <h1 className="text-[18vw] font-bold leading-none text-white/3 tracking-tight">
            Rootcraft
          </h1>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
