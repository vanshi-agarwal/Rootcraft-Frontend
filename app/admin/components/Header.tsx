"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Home, User, LogOut, ChevronDown, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic Title Logic
  const getPageTitle = (path: string) => {
    // Dashboard
    if (path === "/admin") {
      return {
        title: "Dashboard",
        subtitle: "Overview of your store performance",
      };
    }

    // Handle specific actions (Create/Edit)
    if (path.includes("/create")) {
      if (path.includes("/blogs"))
        return { title: "Create Blog Post", subtitle: "Write a new article" };
      if (path.includes("/products"))
        return {
          title: "Create Product",
          subtitle: "Add a new product to your catalog",
        };
      if (path.includes("/categories"))
        return { title: "Create Category", subtitle: "Add a new category" };
      if (path.includes("/users"))
        return { title: "Create User", subtitle: "Add a new user manually" };
      return { title: "Create New Item", subtitle: "Create a new item" };
    }

    if (path.includes("/edit")) {
      if (path.includes("/blogs"))
        return { title: "Edit Blog Post", subtitle: "Update article details" };
      if (path.includes("/products"))
        return { title: "Edit Product", subtitle: "Update product details" };
      if (path.includes("/categories"))
        return { title: "Edit Category", subtitle: "Update category details" };
      if (path.includes("/users"))
        return { title: "Edit User", subtitle: "Update user details" };
      return { title: "Edit Item", subtitle: "Update item details" };
    }

    // Handle main lists
    if (path.includes("/blogs"))
      return { title: "Blog Management", subtitle: "Manage your blog posts" };
    if (path.includes("/products"))
      return { title: "Product Management", subtitle: "Manage your inventory" };
    if (path.includes("/categories"))
      return {
        title: "Category Management",
        subtitle: "Manage product categories",
      };
    if (path.includes("/orders"))
      return { title: "Order Management", subtitle: "View and process orders" };
    if (path.includes("/users"))
      return { title: "User Management", subtitle: "Manage registered users" };

    // Fallback for unknown routes
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return { title: "Dashboard", subtitle: "Overview" };

    const formattedTitle =
      lastSegment.charAt(0).toUpperCase() +
      lastSegment.slice(1).replace(/-/g, " ");
    return {
      title: `${formattedTitle} Management`,
      subtitle: `Overview of ${formattedTitle}`,
    };
  };

  const { title, subtitle } = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-[#E5E0D8] bg-white/95 px-6 backdrop-blur-md transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-xl p-2 text-gray-700 hover:bg-[#FAF9F6] transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight font-poppins">
            {title}
          </h1>
          <p className="text-xs text-gray-600 hidden sm:block font-poppins">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Home Button with Tooltip */}
        <div className="relative group">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF9F6] text-gray-700 transition-all hover:bg-[#B88E2F] hover:text-white shadow-sm"
          >
            <Home size={20} />
          </Link>
          <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-xs px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-lg">
            Home Page
          </span>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 rounded-full border border-[#E5E0D8] bg-white py-1.5 pl-1.5 pr-3 transition-all hover:bg-[#FAF9F6] hover:border-[#B88E2F] shadow-sm cursor-pointer"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full bg-linear-to-br from-[#B88E2F] to-[#967223] p-[2px]">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                  user?.name || "Admin"
                }`}
                alt={user?.name || "Admin"}
                className="h-full w-full object-cover rounded-full bg-white"
              />
            </div>
            <span className="hidden text-sm font-medium text-[#1A1A1A] sm:block font-poppins max-w-[100px] truncate">
              {user?.name || "Admin"}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "text-gray-600 transition-transform",
                isProfileOpen && "rotate-180"
              )}
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white shadow-xl"
              >
                <div className="p-4 border-b border-[#E5E0D8] bg-[#FAF9F6]">
                  <p className="text-sm font-bold text-[#1A1A1A] font-poppins truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.email || "admin@rootcraft.com"}
                  </p>
                  <p className="text-xs text-[#B88E2F] font-semibold mt-1 capitalize">
                    {user?.role || "admin"}
                  </p>
                </div>
                <div className="p-2">
                  <Link
                    href="/"
                    className="flex cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-[#FAF9F6] hover:text-[#B88E2F] transition-colors font-poppins"
                  >
                    <Monitor size={16} />
                    View Live Site
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    className="flex cursor-pointer w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-poppins"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
