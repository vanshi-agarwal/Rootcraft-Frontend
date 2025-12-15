"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Grid,
    Package,
    FileText,
    ShoppingCart,
    LogOut,
    X,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

/**
 * Navigation Items
 */
const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Category Management", href: "/admin/categories", icon: Grid },
    { name: "Product Management", href: "/admin/products", icon: Package },
    { name: "Blogs Management", href: "/admin/blogs", icon: FileText },
    { name: "Order Management", href: "/admin/orders", icon: ShoppingCart },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Sidebar Component
 * 
 * Features:
 * - Fixed position on desktop
 * - 100vh max height
 * - Internal scrolling for navigation
 * - Mobile slide-out
 * - Sticky header and footer
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container - Fixed with 100vh */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 w-72 h-screen transform bg-white border-r border-[#E5E0D8] transition-transform duration-300 ease-in-out shadow-xl flex flex-col",
                    "lg:sticky lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Sidebar Inner Container - 100vh with flex layout */}
                <div className="flex h-full flex-col bg-[#FAF9F6] overflow-hidden">
                    {/* Header - Fixed at top */}
                    <div className="shrink-0 flex items-center justify-between p-6 border-b border-[#E5E0D8] bg-white">
                        <Link href="/" className="shrink-0 flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full bg-[#B88E2F] flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">
                                <Image src="/logo.png" alt="Logo" width={50} height={50} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-poppins font-bold text-2xl text-[#1A1A1A] leading-none">
                                    Rootcraft
                                </span>
                                <span className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mt-0.5 group-hover:text-[#B88E2F] transition-colors">
                                    Premium Furniture
                                </span>
                            </div>
                        </Link>
                        <button
                            onClick={onClose}
                            className="lg:hidden rounded-lg p-1.5 text-gray-600 hover:bg-[#E5E0D8] transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation - Scrollable middle section */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium font-poppins transition-all duration-200 cursor-pointer",
                                        isActive
                                            ? "bg-linear-to-r from-[#B88E2F] to-[#967223] text-white shadow-lg"
                                            : "text-gray-700 hover:bg-white hover:text-[#B88E2F] hover:shadow-sm"
                                    )}
                                >
                                    <item.icon
                                        size={20}
                                        className={cn(
                                            "transition-transform group-hover:scale-110 shrink-0",
                                            isActive ? "text-white" : "text-gray-600 group-hover:text-[#B88E2F]"
                                        )}
                                    />
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && (
                                        <ChevronRight size={16} className="text-white/80 shrink-0" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer - Fixed at bottom */}
                    <div className="shrink-0 p-4 border-t border-[#E5E0D8] bg-white">
                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium font-poppins text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                        >
                            <LogOut size={20} className="shrink-0" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
