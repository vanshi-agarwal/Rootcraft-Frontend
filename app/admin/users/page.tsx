"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    Search,
    Filter,
    UserPlus,
    Edit,
    Trash2,
    X,
    Shield,
    User as UserIcon,
    Mail,
    Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { useToast } from "@/app/context/ToastContext";

/**
 * User Interface
 * Defines the structure of a user object from the backend
 */
interface User {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    createdAt: string;
}

/**
 * User Management Page Component
 * 
 * Features:
 * - View all users with stats dashboard
 * - Search users by name, email, or mobile
 * - Filter users by role (admin/user)
 * - Edit user name and role
 * - Delete users with confirmation
 * - Real-time data sync with backend API
 */

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        user: User | null;
    }>({ isOpen: false, user: null });
    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        user: User | null;
    }>({ isOpen: false, user: null });
    const [editForm, setEditForm] = useState({ name: "", role: "" });
    const { showToast } = useToast();

    // Fetch users
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users
    useEffect(() => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.mobile.includes(searchTerm)
            );
        }

        // Role filter
        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/users");
            setUsers(data);
            setFilteredUsers(data);
        } catch (error: any) {
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to fetch users",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteModal.user) return;

        try {
            await api.delete(`/users/${deleteModal.user._id}`);
            showToast({
                type: "success",
                action: "checkout_success",
                message: "User deleted successfully",
            });
            setDeleteModal({ isOpen: false, user: null });
            fetchUsers();
        } catch (error: any) {
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to delete user",
            });
        }
    };

    const handleEditUser = async () => {
        if (!editModal.user) return;

        try {
            await api.put(`/users/${editModal.user._id}`, {
                name: editForm.name,
                role: editForm.role,
            });
            showToast({
                type: "success",
                action: "checkout_success",
                message: "User updated successfully",
            });
            setEditModal({ isOpen: false, user: null });
            fetchUsers();
        } catch (error: any) {
            showToast({
                type: "error",
                action: "auth_error",
                message: error.response?.data?.message || "Failed to update user",
            });
        }
    };

    const openEditModal = (user: User) => {
        setEditForm({ name: user.name, role: user.role });
        setEditModal({ isOpen: true, user });
    };

    // Stats calculation
    const stats = {
        total: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        users: users.filter((u) => u.role === "user").length,
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-[#B88E2F]/10 p-3">
                            <Users className="h-6 w-6 text-[#B88E2F]" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 font-poppins">
                                Total Users
                            </p>
                            <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-purple-50 p-3">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 font-poppins">
                                Admins
                            </p>
                            <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                                {stats.admins}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-emerald-50 p-3">
                            <UserIcon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600 font-poppins">
                                Regular Users
                            </p>
                            <p className="text-2xl font-bold text-[#1A1A1A] font-poppins">
                                {stats.users}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins text-sm cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FAF9F6] border-b border-[#E5E0D8]">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A] font-poppins">
                                    Joined
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
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-600 font-poppins">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-[#FAF9F6] transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#B88E2F] to-[#967223] p-[2px]">
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                                                        alt={user.name}
                                                        className="h-full w-full rounded-full bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[#1A1A1A] font-poppins">
                                                        {user.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="font-poppins">{user.email || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="h-4 w-4" />
                                                    <span className="font-poppins">{user.mobile}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-poppins ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                                    }`}
                                            >
                                                {user.role === "admin" ? (
                                                    <Shield className="h-3 w-3" />
                                                ) : (
                                                    <UserIcon className="h-3 w-3" />
                                                )}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 font-poppins">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 rounded-lg text-[#B88E2F] hover:bg-[#B88E2F]/10 transition-colors cursor-pointer"
                                                    title="Edit user"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeleteModal({ isOpen: true, user })
                                                    }
                                                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                    title="Delete user"
                                                    disabled={user.role === "admin"}
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

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setDeleteModal({ isOpen: false, user: null })}
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
                                        onClick={() =>
                                            setDeleteModal({ isOpen: false, user: null })
                                        }
                                        className="p-1 rounded-lg hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-gray-600 font-poppins mb-6">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold text-[#1A1A1A]">
                                        {deleteModal.user?.name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            setDeleteModal({ isOpen: false, user: null })
                                        }
                                        className="flex-1 px-4 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-poppins font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
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

            {/* Edit User Modal */}
            <AnimatePresence>
                {editModal.isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setEditModal({ isOpen: false, user: null })}
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
                                        Edit User
                                    </h3>
                                    <button
                                        onClick={() => setEditModal({ isOpen: false, user: null })}
                                        className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, name: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
                                            Role
                                        </label>
                                        <select
                                            value={editForm.role}
                                            onChange={(e) =>
                                                setEditForm({ ...editForm, role: e.target.value })
                                            }
                                            className="w-full px-4 py-2 border border-[#E5E0D8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B88E2F] font-poppins cursor-pointer"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="bg-[#FAF9F6] p-3 rounded-lg">
                                        <p className="text-xs text-gray-600 font-poppins">
                                            <strong>Note:</strong> Only name and role can be updated.
                                            Email and mobile cannot be changed.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setEditModal({ isOpen: false, user: null })}
                                        className="flex-1 px-4 py-2 rounded-xl border border-[#E5E0D8] text-gray-700 font-poppins font-medium hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditUser}
                                        className="flex-1 px-4 py-2 rounded-xl bg-linear-to-r from-[#B88E2F] to-[#967223] text-white font-poppins font-medium hover:shadow-lg transition-all cursor-pointer"
                                    >
                                        Save Changes
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
