"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";
import ImagePicker from "../../components/ImagePicker";
import RichTextEditor from "../../components/RichTextEditor";

export default function CreateBlogPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image: "",
        imagePublicId: "",
        author: "Rootcraft Team",
        category: "",
        tags: [] as string[],
        published: false,
        readTime: 5,
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData({ ...formData, title, slug: generateSlug(title) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post("/blogs", formData);
            showToast({ type: "success", action: "checkout_success", message: "Blog created successfully" });
            router.push("/admin/blogs");
        } catch (error: any) {
            showToast({ type: "error", action: "auth_error", message: error.response?.data?.message || "Failed to create blog" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/blogs" className="p-2 rounded-lg hover:bg-white transition-colors cursor-pointer">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1A1A] font-poppins">Create Blog Post</h1>
                    <p className="text-gray-600 font-poppins">Write a new article</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-[#1A1A1A] font-poppins mb-6">Blog Content</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                                        Title <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g., 10 Modern Living Room Ideas" className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text" required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                                        Content <span className="text-red-600">*</span>
                                    </label>
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(value) => setFormData({ ...formData, content: value })}
                                        placeholder="Write your blog post here..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                                        Excerpt <span className="text-red-600">*</span>
                                    </label>
                                    <textarea
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        placeholder="Brief summary of the blog..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins resize-none cursor-text"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar Settings */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-[#1A1A1A] font-poppins mb-6">Publishing</h2>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer p-3 border border-[#E5E0D8] rounded-xl hover:bg-[#FAF9F6] transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.published}
                                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                                        className="w-5 h-5 text-[#B88E2F] rounded focus:ring-[#B88E2F] cursor-pointer"
                                    />
                                    <span className="font-medium text-[#1A1A1A] font-poppins">
                                        Publish Immediately
                                    </span>
                                </label>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">URL Slug <span className="text-red-600">*</span></label>
                                    <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="modern-living-room-ideas" className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text" required />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-[#1A1A1A] font-poppins mb-6">Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                                        Category <span className="text-red-600">*</span>
                                    </label>
                                    <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Interior Design" className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text" required />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                                        Author
                                    </label>
                                    <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                                        Read Time (mins)
                                    </label>
                                    <input type="number" value={formData.readTime} onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })} className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text" min="1" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-[#1A1A1A] font-poppins mb-6">Featured Image</h2>
                            <ImagePicker
                                currentImage={formData.image}
                                currentPublicId={formData.imagePublicId}
                                folder="blogs"
                                onImageUploaded={(url, publicId) => setFormData({ ...formData, image: url, imagePublicId: publicId })}
                                onImageRemoved={() => setFormData({ ...formData, image: "", imagePublicId: "" })}
                                label="Blog Featured Image"
                                required={true}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pb-10">
                    <Link href="/admin/blogs" className="px-6 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-poppins font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer">Cancel</Link>
                    <button type="submit" disabled={isSubmitting || !formData.title || !formData.image} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#B88E2F] to-[#967223] text-white font-poppins font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">{isSubmitting ? "Creating..." : "Create Blog Post"}</button>
                </div>
            </form>
        </div>
    );
}
