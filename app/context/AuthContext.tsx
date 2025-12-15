"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../lib/axios";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";

interface User {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { showToast } = useToast();

    // Check if user is logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await api.get("/users/profile");
                setUser(data);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        try {
            const { data } = await api.post("/users/auth", credentials);
            setUser(data);
            showToast({
                type: "success",
                action: "login_success",
                message: `Welcome back, ${data.name}!`,
            });
            router.push("/");
        } catch (error: any) {
            const message = error.response?.data?.message || "Login failed";
            showToast({
                type: "error",
                action: "auth_error",
                message: message,
            });
            throw error;
        }
    };

    const register = async (userData: any) => {
        try {
            const { data } = await api.post("/users", userData);
            setUser(data);
            showToast({
                type: "success",
                action: "register_success",
                message: "Account created successfully!",
            });
            router.push("/");
        } catch (error: any) {
            const message = error.response?.data?.message || "Registration failed";
            showToast({
                type: "error",
                action: "auth_error",
                message: message,
            });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post("/users/logout");
            setUser(null);
            showToast({
                type: "success",
                action: "logout",
                message: "Logged out successfully",
            });
            router.push("/signin");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
