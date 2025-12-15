"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    Eye,
    EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";

/**
 * Blog Interface
 */
interface Blog {
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    imagePublicId?: string;
    author: string;
    category: string;
    tags?: string[];
    published: boolean;
    views?: number;
    readTime?: number;
    createdAt?: string;
}

/**
 * Blog Management Page Component
 */
export default function BlogsPage() {
    // ==================== STATE MANAGEMENT ====================

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        blog: Blog | null;
    }>({ isOpen: false, blog: null });

    const { showToast } = useToast();

    // ==================== LIFECYCLE HOOKS ====================

    useEffect(() => {
        fetchBlogs();
    }, []);

    useEffect(() => {
        filterBlogs();
    }, [blogs, searchTerm, statusFilter]);

    // ==================== API FUNCTIONS ====================

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/blogs");
            setBlogs(data);
        } catch (error: any) {
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to fetch blogs",
            });
        } finally {
            setLoading(false);
        }
    };

    const filterBlogs = () => {
        let filtered = blogs;

        if (searchTerm) {
            filtered = filtered.filter((blog) =>
                blog.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter === "published") {
            filtered = filtered.filter((blog) => blog.published);
        } else if (statusFilter === "draft") {
            filtered = filtered.filter((blog) => !blog.published);
        }

        setFilteredBlogs(filtered);
    };

    const handleDeleteBlog = async () => {
        if (!deleteModal.blog?._id) return;

        try {
            await api.delete(`/blogs/${deleteModal.blog._id}`);
            showToast({
                type: "success",
                action: "checkout_success",
                message: "Blog deleted successfully",
            });
            setDeleteModal({ isOpen: false, blog: null });
            fetchBlogs();
        } catch (error: any) {
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to delete blog",
            });
        }
    };

    const togglePublish = async (blog: Blog) => {
        try {
            await api.put(`/blogs/${blog._id}`, {
                ...blog,
                published: !blog.published,
            });
            showToast({
                type: "success",
                action: "checkout_success",
                message: blog.published ? "Blog unpublished" : "Blog published",
            });
            fetchBlogs();
        } catch (error: any) {
            showToast({
                type: "error",
                action: "auth_error",
                message: "Failed to toggle publish status",
            });
        }
    };

    // ==================== STATS ====================

    const stats = {
        total: blogs.length,
        published: blogs.filter((b) => b.published).length,
        drafts: blogs.filter((b) => !b.published).length,
        totalViews: blogs.reduce((sum, b) => sum + (b.views || 0), 0),
    };

    // ==================== RENDER ====================

    return (
        <div className="space-y-6">
            {/* ========== STATS CARDS ========== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-[#B88E2F]/10 p-3">
                            <FileText className="h-6 w-6 text-[#B88E2F]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 font-poppins">
                                Total Blogs
                            </p>
                            <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-emerald-50 p-3">
                            <Eye className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 font-poppins">
                                Published
                            </p>
                            <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                                {stats.published}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-amber-50 p-3">
                            <EyeOff className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 font-poppins">
                                Drafts
                            </p>
                            <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                                {stats.drafts}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-purple-50 p-3">
                            <Eye className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 font-poppins">
                                Total Views
                            </p>
                            <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                                {stats.totalViews.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========== FILTERS AND CREATE ========== */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex-1 max-w-md w-full">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search blogs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins text-sm cursor-text"
                                />
                            </div>
                        </div>

                        <Link
                            href="/admin/blogs/create"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#B88E2F] to-[#967223] text-white font-poppins font-medium hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Create Blog</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins text-sm cursor-pointer"
                        >
                            <option value="all">All Blogs</option>
                            <option value="published">Published</option>
                            <option value="draft">Drafts</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ========== BLOGS TABLE ========== */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FAF9F6] border-b border-[#E5E0D8]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                                    Blog
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                                    Category
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1A1A1A] font-poppins">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E0D8]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="h-8 w-8 border-4 border-[#B88E2F] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBlogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-600 font-poppins">
                                        No blogs found
                                    </td>
                                </tr>
                            ) : (
                                filteredBlogs.map((blog) => (
                                    <tr key={blog._id} className="hover:bg-[#FAF9F6] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-14 w-22 rounded-lg bg-[#FAF9F6] border border-[#E5E0D8] overflow-hidden flex items-center justify-center">
                                                    {blog.image ? (
                                                        <img
                                                            src={blog.image}
                                                            alt={blog.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FileText className="h-6 w-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#1A1A1A] font-poppins">
                                                        {blog.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-poppins line-clamp-1">
                                                        {blog.excerpt}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#B88E2F]/10 text-[#B88E2F] font-poppins">
                                                {blog.category}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePublish(blog)}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-poppins cursor-pointer ${blog.published
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-amber-100 text-amber-700"
                                                    }`}
                                            >
                                                {blog.published ? (
                                                    <>
                                                        <Eye className="h-3 w-3" />
                                                        Published
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="h-3 w-3" />
                                                        Draft
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/blogs/edit/${blog._id}`}
                                                    className="p-2 rounded-lg text-[#B88E2F] hover:bg-[#B88E2F]/10 transition-colors cursor-pointer"
                                                    title="Edit blog"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, blog })}
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                    title="Delete blog"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========== DELETE MODAL ========== */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setDeleteModal({ isOpen: false, blog: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                        >
                            <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-[#1A1A1A] font-poppins">
                                        Confirm Delete
                                    </h3>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, blog: null })}
                                        className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-gray-600 font-poppins mb-6">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold text-[#1A1A1A]">
                                        {deleteModal.blog?.title}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: false, blog: null })}
                                        className="flex-1 px-4 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-poppins font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteBlog}
                                        className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-poppins font-medium hover:bg-red-700 transition-colors cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
