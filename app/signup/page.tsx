"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    mobile: z.string().min(10, "Mobile number must be at least 10 digits").regex(/^[0-9]+$/, "Must be only digits"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth(); // Rename to avoid conflict with hook-form's register
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.fullName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        mobile: data.mobile,
      });
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join us to access exclusive collections"
      imageSrc="/inspiration/ins-1.jpg"
      imageAlt="Minimalist bright living room"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("fullName")}
              type="text"
              placeholder="John Doe"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.fullName
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-(--color-beige-200)"
                } focus:border-(--color-wood-dark) focus:ring-4 focus:outline-none transition-all duration-200 bg-gray-50`}
            />
          </div>
          {errors.fullName && (
            <p className="text-red-500 text-xs ml-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Mobile Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">
            Mobile Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("mobile")}
              type="tel"
              placeholder="9876543210"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.mobile
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-(--color-beige-200)"
                } focus:border-(--color-wood-dark) focus:ring-4 focus:outline-none transition-all duration-200 bg-gray-50`}
            />
          </div>
          {errors.mobile && (
            <p className="text-red-500 text-xs ml-1">
              {errors.mobile.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.email
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-(--color-beige-200)"
                } focus:border-(--color-wood-dark) focus:ring-4 focus:outline-none transition-all duration-200 bg-gray-50`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs ml-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${errors.password
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-(--color-beige-200)"
                } focus:border-(--color-wood-dark) focus:ring-4 focus:outline-none transition-all duration-200 bg-gray-50`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs ml-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${errors.confirmPassword
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-(--color-beige-200)"
                } focus:border-(--color-wood-dark) focus:ring-4 focus:outline-none transition-all duration-200 bg-gray-50`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs ml-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-(--color-wood-dark) text-white py-3.5 rounded-xl font-medium shadow-lg hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Create Account"
          )}
        </motion.button>


        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-(--color-wood-dark) font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
