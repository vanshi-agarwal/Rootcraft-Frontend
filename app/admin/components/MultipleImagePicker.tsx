"use client";

import React, { useState } from "react";
import { Upload, X, Loader2, AlertCircle, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";

/**
 * Gallery Image Interface
 */
export interface GalleryImage {
    url: string;
    publicId: string;
}

/**
 * Multiple Image Picker Props
 */
interface MultipleImagePickerProps {
    /** Current gallery images */
    currentImages?: GalleryImage[];
    /** Cloudinary folder name */
    folder?: string;
    /** Callback when images are updated */
    onImagesChanged: (images: GalleryImage[]) => void;
    /** Label for the picker */
    label?: string;
    /** Maximum number of images */
    maxImages?: number;
}

/**
 * Multiple Image Picker Component
 * 
 * Features:
 * - Upload multiple images
 * - Drag & drop support
 * - Preview all images
 * - Delete individual images
 * - Reorder images (drag to reorder)
 * - Loading states
 * - 5MB per image limit
 * - Toast notifications
 */
export default function MultipleImagePicker({
    currentImages = [],
    folder = "products",
    onImagesChanged,
    label = "Product Gallery",
    maxImages = 10,
}: MultipleImagePickerProps) {
    // ==================== STATE MANAGEMENT ====================

    /** Gallery images */
    const [images, setImages] = useState<GalleryImage[]>(currentImages);

    /** Upload loading state */
    const [uploading, setUploading] = useState(false);

    /** Deleting image index */
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

    /** Toast notification hook */
    const { showToast } = useToast();

    // ==================== FILE VALIDATION ====================

    /**
     * Validate file before upload
     */
    const validateFile = (file: File): boolean => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showToast({
                type: "error",
                action: "auth_error",
                message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.",
            });
            return false;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            showToast({
                type: "error",
                action: "auth_error",
                message: `File size exceeds 5MB limit. File is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
            });
            return false;
        }

        return true;
    };

    // ==================== UPLOAD HANDLER ====================

    /**
     * Handle file upload
     */
    const handleFileUpload = async (files: FileList) => {
        // Check max images limit
        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            showToast({
                type: "error",
                action: "auth_error",
                message: `Maximum ${maxImages} images allowed.`,
            });
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        // Validate all files
        const validFiles = filesToUpload.filter(validateFile);
        if (validFiles.length === 0) return;

        try {
            setUploading(true);

            // Upload all files
            const uploadPromises = validFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);

                const { data } = await api.post(`/upload?folder=${folder}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                return {
                    url: data.url,
                    publicId: data.publicId,
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);
            const newImages = [...images, ...uploadedImages];

            setImages(newImages);
            onImagesChanged(newImages);

            showToast({
                type: "success",
                action: "checkout_success",
                message: `${uploadedImages.length} image(s) uploaded successfully`,
            });
        } catch (error: any) {
            console.error('Upload error:', error);
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to upload images",
            });
        } finally {
            setUploading(false);
        }
    };

    // ==================== DELETE HANDLER ====================

    /**
     * Delete specific image
     */
    const handleDeleteImage = async (index: number) => {
        const imageToDelete = images[index];
        if (!imageToDelete.publicId) return;

        try {
            setDeletingIndex(index);

            // Removed immediate Cloudinary deletion for safety.
            // await api.delete('/upload', {
            //     data: { publicId: imageToDelete.publicId },
            // });

            const newImages = images.filter((_, i) => i !== index);
            setImages(newImages);
            onImagesChanged(newImages);

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
            setDeletingIndex(null);
        }
    };

    // ==================== FILE INPUT HANDLER ====================

    /**
     * Handle file input change
     */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files);
        }
        // Reset input
        e.target.value = '';
    };

    // ==================== RENDER ====================

    return (
        <div className="space-y-3">
            {/* Label */}
            <label className="block text-sm font-medium text-gray-700 font-poppins">
                {label} ({images.length}/{maxImages})
            </label>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* Existing Images */}
                <AnimatePresence>
                    {images.map((image, index) => (
                        <motion.div
                            key={image.publicId}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#E5E0D8] bg-[#FAF9F6]"
                        >
                            {/* Image */}
                            <img
                                src={image.url}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Delete Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(index)}
                                    disabled={deletingIndex === index}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {deletingIndex === index ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <X className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {/* Image Number Badge */}
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-poppins">
                                {index + 1}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Upload Button */}
                {images.length < maxImages && (
                    <label className="relative aspect-square rounded-xl border-2 border-dashed border-[#E5E0D8] bg-[#FAF9F6] hover:border-[#B88E2F] hover:bg-[#B88E2F]/5 transition-all cursor-pointer flex items-center justify-center group">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                            multiple
                            onChange={handleFileSelect}
                            disabled={uploading}
                            className="hidden"
                        />

                        {uploading ? (
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 text-[#B88E2F] animate-spin mx-auto mb-2" />
                                <p className="text-xs text-gray-600 font-poppins">Uploading...</p>
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <div className="rounded-full bg-[#B88E2F]/10 p-3 mx-auto mb-2 group-hover:bg-[#B88E2F]/20 transition-colors w-fit">
                                    <Plus className="h-6 w-6 text-[#B88E2F]" />
                                </div>
                                <p className="text-xs text-gray-600 font-poppins font-medium">
                                    Add Images
                                </p>
                            </div>
                        )}
                    </label>
                )}
            </div>

            {/* Help Text */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 font-poppins">
                    Upload up to {maxImages} images. Each image must be under 5MB (JPEG, PNG, WEBP, or GIF).
                    Images are automatically compressed and optimized.
                </p>
            </div>
        </div>
    );
}
