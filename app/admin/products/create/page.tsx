"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";
import ImagePicker from "../../components/ImagePicker";
import MultipleImagePicker, {
  type GalleryImage,
} from "../../components/MultipleImagePicker";

export default function CreateProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    oldPrice: 0,
    image: "",
    imagePublicId: "",
    gallery: [] as GalleryImage[],
    category: "",
    countInStock: 0,
    sku: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post("/products", formData);
      showToast({
        type: "success",
        action: "checkout_success",
        message: "Product created successfully",
      });
      router.push("/admin/products");
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to create product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] font-poppins">
            Create Product
          </h1>
          <p className="text-gray-600 font-poppins">
            Add a new product to your store
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1A1A1A] font-poppins mb-6">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                Product Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Modern Wooden Chair"
                className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                URL Slug <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="modern-wooden-chair"
                className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                Price (₹) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="29999"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                value={formData.oldPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    oldPrice: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="39999"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                Stock Quantity <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.countInStock || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    countInStock: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="100"
                min="0"
                className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku || ""}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="FURN-CHAIR-001"
                className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-text"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed product description..."
                rows={4}
                className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins resize-none cursor-text"
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-[#1A1A1A] font-poppins">
            Product Images
          </h2>
          <ImagePicker
            currentImage={formData.image}
            currentPublicId={formData.imagePublicId}
            folder="products"
            onImageUploaded={(url, publicId) =>
              setFormData({ ...formData, image: url, imagePublicId: publicId })
            }
            onImageRemoved={() =>
              setFormData({ ...formData, image: "", imagePublicId: "" })
            }
            label="Main Product Image"
            required={true}
          />
          <MultipleImagePicker
            currentImages={formData.gallery}
            folder="products"
            onImagesChanged={(images) =>
              setFormData({ ...formData, gallery: images })
            }
            label="Product Gallery"
            maxImages={10}
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-poppins font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.image}
            className="px-6 py-2 rounded-xl bg-linear-to-r from-[#B88E2F] to-[#967223] text-white font-poppins font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
