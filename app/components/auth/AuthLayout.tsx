import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  imageSrc,
  imageAlt,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-(--color-beige-100)">
      {/* Left Side - Image (Hidden on mobile) */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-black/20" /> {/* Overlay */}
        </motion.div>

        <div className="absolute bottom-12 left-12 text-white z-10 max-w-md">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-4xl font-serif font-bold mb-4"
          >
            Elevate Your Living Space
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-lg font-light opacity-90"
          >
            Join our community of design enthusiasts and discover furniture that
            tells a story.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative">
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center text-(--color-wood-dark) hover:opacity-70 transition-opacity group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-(--color-beige-200)"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-(--color-wood-dark) mb-2">
              {title}
            </h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
