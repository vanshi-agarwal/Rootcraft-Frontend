"use client";

import React, { useState, useEffect } from "react";
import {
  Grid,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";
import ImagePicker from "../components/ImagePicker";

/**
 * Category Interface
 * Defines the structure of a category object from the backend
 */
interface Category {
  _id: string;
  name: string;
  image?: string;
  imagePublicId?: string; // Added to track Cloudinary public ID
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Category Management Page Component
 *
 * Features:
 * - View all categories with stats
 * - Search categories by name
 * - Create new categories
 * - Edit existing categories
 * - Delete categories with confirmation
 * - Real-time data sync with backend
 */
export default function CategoriesPage() {
  // ==================== STATE MANAGEMENT ====================

  /** All categories from the database */
  const [categories, setCategories] = useState<Category[]>([]);

  /** Filtered categories based on search */
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  /** Loading state for API calls */
  const [loading, setLoading] = useState(true);

  /** Search term for filtering */
  const [searchTerm, setSearchTerm] = useState("");

  /** Delete modal state and selected category */
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    category: Category | null;
  }>({ isOpen: false, category: null });

  /** Create/Edit modal state */
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    category: Category | null;
  }>({ isOpen: false, mode: "create", category: null });

  /** Form data for create/edit */
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    imagePublicId: "", // Track Cloudinary public ID
    description: "",
  });

  /** Toast notification hook */
  const { showToast } = useToast();

  // ==================== LIFECYCLE HOOKS ====================

  /**
   * Fetch categories on component mount
   */
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Filter categories when search term or categories change
   */
  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categories, searchTerm]);

  // ==================== API FUNCTIONS ====================

  /**
   * Fetch all categories from the backend
   */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/categories");
      setCategories(data);
      setFilteredCategories(data);
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to fetch categories",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new category
   */
  const handleCreateCategory = async () => {
    try {
      await api.post("/categories", formData);
      showToast({
        type: "success",
        action: "checkout_success",
        message: "Category created successfully",
      });
      setFormModal({ isOpen: false, mode: "create", category: null });
      setFormData({ name: "", image: "", imagePublicId: "", description: "" });
      fetchCategories();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to create category",
      });
    }
  };

  /**
   * Update an existing category
   */
  const handleUpdateCategory = async () => {
    if (!formModal.category) return;

    try {
      await api.put(`/categories/${formModal.category._id}`, formData);
      showToast({
        type: "success",
        action: "checkout_success",
        message: "Category updated successfully",
      });
      setFormModal({ isOpen: false, mode: "create", category: null });
      setFormData({ name: "", image: "", imagePublicId: "", description: "" });
      fetchCategories();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to update category",
      });
    }
  };

  /**
   * Delete a category
   */
  const handleDeleteCategory = async () => {
    if (!deleteModal.category) return;

    try {
      await api.delete(`/categories/${deleteModal.category._id}`);
      showToast({
        type: "success",
        action: "checkout_success",
        message: "Category deleted successfully",
      });
      setDeleteModal({ isOpen: false, category: null });
      fetchCategories();
    } catch (error: any) {
      showToast({
        type: "error",
        action: "auth_error",
        message: error.response?.data?.message || "Failed to delete category",
      });
    }
  };

  // ==================== MODAL HANDLERS ====================

  /**
   * Open create category modal
   */
  const openCreateModal = () => {
    setFormData({ name: "", image: "", imagePublicId: "", description: "" });
    setFormModal({ isOpen: true, mode: "create", category: null });
  };

  /**
   * Open edit category modal with pre-filled data
   */
  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      image: category.image || "",
      imagePublicId: category.imagePublicId || "",
      description: category.description || "",
    });
    setFormModal({ isOpen: true, mode: "edit", category });
  };

  /**
   * Submit form based on mode (create or edit)
   */
  const handleFormSubmit = () => {
    if (formModal.mode === "create") {
      handleCreateCategory();
    } else {
      handleUpdateCategory();
    }
  };

  // ==================== STATS CALCULATION ====================

  const stats = {
    total: categories.length,
    withImages: categories.filter((c) => c.image).length,
    withoutImages: categories.filter((c) => !c.image).length,
  };

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* ========== STATS CARDS ========== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Categories Card */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#B88E2F]/10 p-3">
              <Grid className="h-6 w-6 text-[#B88E2F]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">
                Total Categories
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        {/* With Images Card */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-50 p-3">
              <ImageIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">
                With Images
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                {stats.withImages}
              </p>
            </div>
          </div>
        </div>

        {/* Without Images Card */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-50 p-3">
              <FileText className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 font-poppins">
                Without Images
              </p>
              <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                {stats.withoutImages}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SEARCH AND CREATE BUTTON ========== */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins text-sm"
              />
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r from-[#B88E2F] to-[#967223] text-white font-poppins font-medium hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      {/* ========== CATEGORIES TABLE ========== */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-[#FAF9F6] border-b border-[#E5E0D8]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#1A1A1A] font-poppins">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#E5E0D8]">
              {loading ? (
                /* Loading State */
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 border-4 border-[#B88E2F] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                /* Empty State */
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-600 font-poppins"
                  >
                    No categories found
                  </td>
                </tr>
              ) : (
                /* Category Rows */
                filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-[#FAF9F6] transition-colors"
                  >
                    {/* Category Name & Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Category Image */}
                        <div className="h-12 w-12 rounded-lg bg-[#FAF9F6] border border-[#E5E0D8] overflow-hidden flex items-center justify-center">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Grid className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        {/* Category Name */}
                        <div>
                          <p className="font-semibold text-[#1A1A1A] font-poppins">
                            {category.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 font-poppins line-clamp-2 max-w-md">
                        {category.description || "No description"}
                      </p>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-poppins">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 rounded-lg text-[#B88E2F] hover:bg-[#B88E2F]/10 transition-colors cursor-pointer"
                          title="Edit category"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            setDeleteModal({ isOpen: true, category })
                          }
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete category"
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

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setDeleteModal({ isOpen: false, category: null })}
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-2xl p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1A1A1A] font-poppins">
                    Confirm Delete
                  </h3>
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: false, category: null })
                    }
                    className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <p className="text-gray-600 font-poppins mb-6">
                  Are you sure you want to delete the category{" "}
                  <span className="font-semibold text-[#1A1A1A]">
                    {deleteModal.category?.name}
                  </span>
                  ? This action cannot be undone.
                </p>

                {/* Modal Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: false, category: null })
                    }
                    className="flex-1 px-4 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-poppins font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCategory}
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

      {/* ========== CREATE/EDIT CATEGORY MODAL ========== */}
      <AnimatePresence>
        {formModal.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() =>
                setFormModal({ isOpen: false, mode: "create", category: null })
              }
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="bg-white rounded-2xl border border-[#E5E0D8] shadow-2xl p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1A1A1A] font-poppins">
                    {formModal.mode === "create"
                      ? "Create Category"
                      : "Edit Category"}
                  </h3>
                  <button
                    onClick={() =>
                      setFormModal({
                        isOpen: false,
                        mode: "create",
                        category: null,
                      })
                    }
                    className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Category Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Living Room, Bedroom"
                      className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins"
                      required
                    />
                  </div>

                  {/* Image Picker Component */}
                  <ImagePicker
                    currentImage={formData.image}
                    currentPublicId={formData.imagePublicId}
                    folder="categories"
                    onImageUploaded={(url, publicId) => {
                      setFormData({
                        ...formData,
                        image: url,
                        imagePublicId: publicId,
                      });
                    }}
                    onImageRemoved={() => {
                      setFormData({
                        ...formData,
                        image: "",
                        imagePublicId: "",
                      });
                    }}
                    label="Category Image"
                    required={false}
                  />

                  {/* Description Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the category..."
                      rows={3}
                      className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins resize-none"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() =>
                      setFormModal({
                        isOpen: false,
                        mode: "create",
                        category: null,
                      })
                    }
                    className="flex-1 px-4 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-poppins font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFormSubmit}
                    disabled={!formData.name.trim()}
                    className="flex-1 px-4 py-2 rounded-xl bg-linear-to-r from-[#B88E2F] to-[#967223] text-white font-poppins font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {formModal.mode === "create" ? "Create" : "Save Changes"}
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
