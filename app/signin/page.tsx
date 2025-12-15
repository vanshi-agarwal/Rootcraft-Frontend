"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  // Custom auth hook handles login logic
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      await login(data); // This handles API call, toast, and redirect
      // Reset not really needed as we redirect, but fine
      reset();
    } catch (err: any) {
      // Error toast is handled by context, but we can set form error if we wanted
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
      imageSrc="/inspiration/ins-2.jpg"
      imageAlt="Modern living room with stylish furniture"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-(--color-wood-dark) hover:underline font-medium"
            >
              Forgot Password?
            </Link>
          </div>
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

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-(--color-wood-dark) text-white py-3.5 rounded-xl font-medium shadow-lg hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </motion.button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-(--color-wood-dark) font-semibold hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
