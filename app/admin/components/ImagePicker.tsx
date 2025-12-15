"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";

/**
 * Image Picker Component Props
 */
interface ImagePickerProps {
    /** Current image URL (for editing) */
    currentImage?: string;
    /** Current image public ID (for deleting/replacing) */
    currentPublicId?: string;
    /** Cloudinary folder name */
    folder?: string;
    /** Callback when image is successfully uploaded */
    onImageUploaded: (url: string, publicId: string) => void;
    /** Callback when image is removed */
    onImageRemoved?: () => void;
    /** Label for the picker */
    label?: string;
    /** Whether the field is required */
    required?: boolean;
}

/**
 * Image Picker Component
 * 
 * Features:
 * - Drag and drop support
 * - Click to upload
 * - Image preview
 * - Compression (handled by Cloudinary)
 * - 5MB size limit
 * - Replace existing image
 * - Delete image
 * - Loading states
 * - Error handling
 * - Toast notifications
 */
export default function ImagePicker({
    currentImage,
    currentPublicId,
    folder = "categories",
    onImageUploaded,
    onImageRemoved,
    label = "Category Image",
    required = false,
}: ImagePickerProps) {
    // ==================== STATE MANAGEMENT ====================

    /** Preview image URL */
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);

    /** Current public ID */
    const [publicId, setPublicId] = useState<string | null>(currentPublicId || null);

    /** Upload loading state */
    const [uploading, setUploading] = useState(false);

    /** Deleting loading state */
    const [deleting, setDeleting] = useState(false);

    /** Drag over state */
    const [isDragOver, setIsDragOver] = useState(false);

    /** File input reference */
    const fileInputRef = useRef<HTMLInputElement>(null);

    /** Toast notification hook */
    const { showToast } = useToast();

    // ==================== FILE VALIDATION ====================

    /**
     * Validate file before upload
     */
    const validateFile = (file: File): boolean => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showToast({
                type: "error",
                action: "auth_error",
                message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.",
            });
            return false;
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showToast({
                type: "error",
                action: "auth_error",
                message: `File size exceeds 5MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
            });
            return false;
        }

        return true;
    };

    // ==================== UPLOAD HANDLER ====================

    /**
     * Handle file upload to Cloudinary
     */
    const handleFileUpload = async (file: File) => {
        // Validate file
        if (!validateFile(file)) {
            return;
        }

        try {
            setUploading(true);

            // Create form data
            const formData = new FormData();
            formData.append('image', file);

            // Determine endpoint (always new upload to prevent premature deletion)
            let endpoint = `/upload?folder=${folder}`;


            // Upload to backend (which uploads to Cloudinary)
            const { data } = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Set preview and public ID
            setPreviewUrl(data.url);
            setPublicId(data.publicId);

            // Notify parent component
            onImageUploaded(data.url, data.publicId);

            // Show success toast
            showToast({
                type: "success",
                action: "checkout_success",
                message: publicId ? "Image replaced successfully" : "Image uploaded successfully",
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to upload image",
            });
        } finally {
            setUploading(false);
        }
    };

    // ==================== DELETE HANDLER ====================

    /**
     * Handle image deletion
     */
    const handleDelete = async () => {
        if (!publicId) return;

        try {
            setDeleting(true);

            // Removed immediate Cloudinary deletion for safety
            // await api.delete('/upload', {
            //     data: { publicId },
            // });

            // Clear preview
            setPreviewUrl(null);
            setPublicId(null);

            // Notify parent component
            if (onImageRemoved) {
                onImageRemoved();
            }

            // Show success toast
            showToast({
                type: "success",
                action: "checkout_success",
                message: "Image deleted successfully",
            });
        } catch (error: any) {
            console.error('Delete error:', error);
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to delete image",
            });
        } finally {
            setDeleting(false);
        }
    };

    // ==================== DRAG & DROP HANDLERS ====================

    /**
     * Handle drag over event
     */
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    /**
     * Handle drag leave event
     */
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    /**
     * Handle file drop
     */
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    /**
     * Handle file input change
     */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    /**
     * Trigger file input click
     */
    const handleClick = () => {
        if (!uploading && !deleting) {
            fileInputRef.current?.click();
        }
    };

    // ==================== RENDER ====================

    return (
        <div className="space-y-2">
            {/* Label */}
            <label className="block text-sm font-medium text-gray-700 font-poppins">
                {label} {required && <span className="text-red-600">*</span>}
            </label>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Image Preview or Upload Area */}
            <div className="relative">
                {previewUrl ? (
                    /* Image Preview */
                    <div className="relative group">
                        <div className="relative h-48 w-full rounded-xl overflow-hidden border-2 border-[#E5E0D8] bg-[#FAF9F6]">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                {/* Replace Button */}
                                <button
                                    type="button"
                                    onClick={handleClick}
                                    disabled={uploading || deleting}
                                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-poppins font-medium hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                            Uploading...
                                        </>
                                    ) : (
                                        "Replace"
                                    )}
                                </button>

                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={uploading || deleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-poppins font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Upload Area */
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClick}
                        className={`
              relative h-48 w-full rounded-xl border-2 border-dashed transition-all cursor-pointer
              ${isDragOver
                                ? 'border-[#B88E2F] bg-[#B88E2F]/10'
                                : 'border-[#E5E0D8] bg-[#FAF9F6] hover:border-[#B88E2F] hover:bg-[#B88E2F]/5'
                            }
              ${uploading ? 'cursor-not-allowed opacity-50' : ''}
            `}
                    >
                        <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
                            {uploading ? (
                                /* Uploading State */
                                <>
                                    <Loader2 className="h-12 w-12 text-[#B88E2F] animate-spin" />
                                    <p className="text-sm font-medium text-gray-700 font-poppins">
                                        Uploading image...
                                    </p>
                                    <p className="text-xs text-gray-500 font-poppins">
                                        Compressing and optimizing
                                    </p>
                                </>
                            ) : (
                                /* Upload Prompt */
                                <>
                                    <div className="rounded-full bg-[#B88E2F]/10 p-4">
                                        <Upload className="h-8 w-8 text-[#B88E2F]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-700 font-poppins">
                                            <span className="text-[#B88E2F]">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 font-poppins mt-1">
                                            JPEG, PNG, WEBP, or GIF (max 5MB)
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Help Text */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 font-poppins">
                    Images are automatically compressed and optimized for web. Maximum file size is 5MB.
                </p>
            </div>
        </div>
    );
}
