"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * Admin Shell Component
 * 
 * Main layout wrapper for admin pages
 * - Sidebar is fixed/sticky on the left (100vh)
 * - Main content scrolls independently on the right
 * - Header is part of the scrollable content area
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#FAF9F6] font-poppins">
            {/* Fixed/Sticky Sidebar - 100vh, stays in place */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area - Scrolls independently */}
            <div className="flex flex-1 flex-col lg:ml-0">
                {/* Header */}
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Scrollable Content */}
                <main className="flex-1 bg-[#FAF9F6] p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
