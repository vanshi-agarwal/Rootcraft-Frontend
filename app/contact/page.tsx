"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Phone,
  Clock,
  Send,
  Loader2,
  ChevronRight,
  Home,
} from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useToast } from "../context/ToastContext";
import FeaturesSection from "../components/FeaturesSection";
import Link from "next/link";

// --- 1. Validation Schema (Zod) ---
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// --- 2. Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 100 },
  },
} as const;

export default function page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Form Hook Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  // Submit Handler
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to send message");
      }

      reset();

      showToast({
        type: "success",
        action: "contact_form_submit",
        message: result.message || "Message sent successfully!",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      showToast({
        type: "error",
        action: "contact_form_submit",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* --- CREATIVE COMPACT HERO SECTION --- */}
        <section className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center overflow-hidden px-4">
          {/* Background Image with Parallax-like feel */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
            style={{
              backgroundImage:
                "url('/shop-bg.jpg')",
            }}
          />

          {/* Heavy Blur Overlay for Contrast */}
          <div className="absolute inset-0 bg-white/20 z-10" />

          {/* Content */}
          <div className="relative z-20 flex flex-col items-center gap-3 text-center">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-poppins font-bold text-3xl sm:text-5xl text-[#3A3A3A] tracking-tight"
            >
              Shop
            </motion.h1>

            {/* Glassmorphic Breadcrumb Pill */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 bg-white/70 border border-white/60 px-5 py-2 rounded-full shadow-sm text-sm font-medium"
            >
              <Link
                href="/"
                className="flex items-center gap-1.5 text-black hover:text-[#B88E2F] transition-colors"
              >
                <Home size={14} />
                Home
              </Link>
              <ChevronRight size={14} className="text-gray-500" />
              <span className="text-gray-500">Contact</span>
            </motion.div>
          </div>
        </section>

        {/* --- Main Content Area --- */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px] py-16 lg:py-24">
          <motion.div
            className="text-center mb-16 lg:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-poppins font-semibold text-[36px] text-black mb-4">
              Get In Touch With Us
            </h2>
            <p className="font-poppins text-[#9F9F9F] max-w-[644px] mx-auto text-base leading-relaxed">
              For more information about our product & services please feel free
              to drop us an email. Our staff always be there to help you out. Do
              not hesitate!
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* --- LEFT: Contact Info Cards --- */}
            <div className="lg:col-span-4 space-y-8">
              <ContactInfoCard
                icon={MapPin}
                title="Address"
                content={
                  <>
                    236 5th SE Avenue, New York
                    <br />
                    NY10000, United States
                  </>
                }
              />
              <ContactInfoCard
                icon={Phone}
                title="Phone"
                content={
                  <>
                    Mobile: +(84) 546-6789
                    <br />
                    Hotline: +(84) 456-6789
                  </>
                }
              />
              <ContactInfoCard
                icon={Clock}
                title="Working Time"
                content={
                  <>
                    Monday-Friday: 9:00 - 22:00
                    <br />
                    Saturday-Sunday: 9:00 - 21:00
                  </>
                }
              />
            </div>

            {/* --- RIGHT: Contact Form --- */}
            <div className="lg:col-span-8">
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-0 lg:pl-10 space-y-6"
              >
                {/* Name Input */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <label className="font-poppins font-medium text-base text-black">
                    Your Name
                  </label>
                  <div className="relative">
                    <motion.input
                      {...register("name")}
                      placeholder="John Doe"
                      whileHover={{ scale: 1.01 }}
                      whileFocus={{ scale: 1.02 }}
                      className={`w-full h-[75px] rounded-[10px] border ${errors.name ? "border-red-500" : "border-[#9F9F9F]"
                        } bg-white px-6 font-poppins text-[#9F9F9F] outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all`}
                    />
                    {errors.name && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-5 left-0 text-xs text-red-500 font-poppins"
                      >
                        {errors.name.message}
                      </motion.span>
                    )}
                  </div>
                </motion.div>

                {/* Email Input */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <label className="font-poppins font-medium text-base text-black">
                    Email Address
                  </label>
                  <motion.div className="relative" whileHover={{ scale: 1.01 }}>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="john@example.com"
                      className={`w-full h-[75px] rounded-[10px] border ${errors.email ? "border-red-500" : "border-[#9F9F9F]"
                        } bg-white px-6 font-poppins text-[#9F9F9F] outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all`}
                    />
                    {errors.email && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-5 left-0 text-xs text-red-500 font-poppins"
                      >
                        {errors.email.message}
                      </motion.span>
                    )}
                  </motion.div>
                </motion.div>

                {/* Subject Input */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <label className="font-poppins font-medium text-base text-black">
                    Subject
                  </label>
                  <motion.div className="relative" whileHover={{ scale: 1.01 }}>
                    <input
                      {...register("subject")}
                      placeholder="This is an optional"
                      className="w-full h-[75px] rounded-[10px] border border-[#9F9F9F] bg-white px-6 font-poppins text-[#9F9F9F] outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all"
                    />
                  </motion.div>
                </motion.div>

                {/* Message Input */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="font-poppins font-medium text-base text-black">
                    Message
                  </label>
                  <motion.div className="relative" whileHover={{ scale: 1.01 }}>
                    <textarea
                      {...register("message")}
                      placeholder="Hi! I'd like to ask about..."
                      className={`w-full h-[120px] py-6 rounded-[10px] border ${errors.message ? "border-red-500" : "border-[#9F9F9F]"
                        } bg-white px-6 font-poppins text-[#9F9F9F] outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F] transition-all resize-none`}
                    />
                    {errors.message && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-5 left-0 text-xs text-red-500 font-poppins"
                      >
                        {errors.message.message}
                      </motion.span>
                    )}
                  </motion.div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  className="pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      w-[237px] h-[55px] rounded-[5px] font-poppins font-medium text-base text-white transition-all duration-300 flex items-center justify-center gap-2
                      bg-[#B88E2F] hover:bg-[#9c7826]
                      ${isSubmitting
                        ? "opacity-80 cursor-not-allowed"
                        : "cursor-pointer"
                      }
                    `}
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        Submit <Send size={20} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        </section>

        {/* --- Map Section --- */}
        <motion.section
          className="w-full h-[450px] relative grayscale hover:grayscale-0 transition-all duration-700"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878428698!3d40.74076684379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle!5e0!3m2!1sen!2sus!4v1629283094953!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            className="absolute inset-0"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5 }}
          />
          {/* Overlay Card */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-2xl rounded-lg hidden md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.1, y: -5 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <MapPin className="text-[#B88E2F]" size={24} />
              </motion.div>
              <div>
                <p className="font-bold text-sm">Rootcraft HQ</p>
                <p className="text-xs text-gray-500">New York, USA</p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* --- Features Section --- */}
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}

// --- Helper Components ---

const ContactInfoCard = ({
  icon: Icon,
  title,
  content,
}: {
  icon: any;
  title: string;
  content: React.ReactNode;
}) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      className="flex gap-6 items-start p-4 rounded-lg hover:bg-[#F9F1E7] transition-colors duration-300 cursor-pointer"
    >
      <motion.div
        className="mt-1"
        whileHover={{ rotate: 360, scale: 1.2 }}
        transition={{ duration: 0.6 }}
      >
        <Icon size={30} className="text-black" fillOpacity={1} />
      </motion.div>
      <div>
        <motion.h3
          className="font-poppins font-medium text-[24px] text-black mb-1"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {title}
        </motion.h3>
        <p className="font-poppins font-normal text-base text-black max-w-[212px]">
          {content}
        </p>
      </div>
    </motion.div>
  );
};
