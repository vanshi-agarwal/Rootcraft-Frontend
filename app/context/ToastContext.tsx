"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  X,
  ShoppingCart,
  Heart,
  Trash2,
  XCircle,
  Share2,
  Send,
} from "lucide-react";

export type ToastType = "success" | "error" | "info";
export type ToastAction =
  | "add_to_cart"
  | "remove_from_cart"
  | "add_to_wishlist"
  | "remove_from_wishlist"
  | "share"
  | "contact_form_submit"
  | "checkout_success"
  | "checkout_error"
  | "login_success"
  | "register_success"
  | "auth_error"
  | "logout";

export interface Toast {
  id: string;
  type: ToastType;
  action: ToastAction;
  message: string;
  productName?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastToastRef = useRef<{
    action: ToastAction;
    productName?: string;
    timestamp: number;
  } | null>(null);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const now = Date.now();

    // Prevent duplicate toasts within 500ms for the same action and product
    if (
      lastToastRef.current &&
      lastToastRef.current.action === toast.action &&
      lastToastRef.current.productName === toast.productName &&
      now - lastToastRef.current.timestamp < 500
    ) {
      return; // Skip duplicate toast
    }

    lastToastRef.current = {
      action: toast.action,
      productName: toast.productName,
      timestamp: now,
    };

    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastConfig = (action: ToastAction) => {
    switch (action) {
      case "add_to_cart":
        return {
          icon: ShoppingCart,
          defaultMessage: "Added to cart",
          color: "bg-[#B88E2F]",
          iconColor: "text-white",
        };
      case "remove_from_cart":
        return {
          icon: Trash2,
          defaultMessage: "Removed from cart",
          color: "bg-[#E97171]",
          iconColor: "text-white",
        };
      case "add_to_wishlist":
        return {
          icon: Heart,
          defaultMessage: "Added to wishlist",
          color: "bg-[#E97171]",
          iconColor: "text-white",
        };
      case "remove_from_wishlist":
        return {
          icon: Heart,
          defaultMessage: "Removed from wishlist",
          color: "bg-gray-600",
          iconColor: "text-white",
        };
      case "share":
        return {
          icon: Share2,
          defaultMessage: "Link copied to clipboard",
          color: "bg-[#B88E2F]",
          iconColor: "text-white",
        };
      case "contact_form_submit":
        return {
          icon: Send,
          defaultMessage: "Message sent successfully!",
          color: "bg-[#2EC1AC]",
          iconColor: "text-white",
        };
      case "checkout_success":
        return {
          icon: CheckCircle2,
          defaultMessage: "Order placed successfully!",
          color: "bg-[#2EC1AC]",
          iconColor: "text-white",
        };
      case "checkout_error":
        return {
          icon: XCircle,
          defaultMessage: "Unable to process order",
          color: "bg-[#E97171]",
          iconColor: "text-white",
        };
      case "login_success":
        return {
          icon: CheckCircle2,
          defaultMessage: "Login successful!",
          color: "bg-[#2EC1AC]",
          iconColor: "text-white",
        };
      case "register_success":
        return {
          icon: CheckCircle2,
          defaultMessage: "Account created successfully!",
          color: "bg-[#2EC1AC]",
          iconColor: "text-white",
        };
      case "auth_error":
        return {
          icon: XCircle,
          defaultMessage: "Authentication failed",
          color: "bg-[#E97171]",
          iconColor: "text-white",
        };
      case "logout":
        return {
          icon: CheckCircle2,
          defaultMessage: "Logged out",
          color: "bg-gray-600",
          iconColor: "text-white",
        };
      default:
        return {
          icon: CheckCircle2,
          defaultMessage: "Success",
          color: "bg-green-500",
          iconColor: "text-white",
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = getToastConfig(toast.action);
            const Icon = config.icon;

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                className="pointer-events-auto"
              >
                <div
                  className={`
                  ${config.color}
                  text-white rounded-xl shadow-2xl
                  min-w-[320px] max-w-[400px]
                  flex items-center gap-3 p-4
                  backdrop-blur-md
                  border border-white/30
                  relative overflow-hidden
                `}
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                  {/* Icon */}
                  <div className="shrink-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                        delay: 0.1,
                      }}
                      className={`${config.iconColor} bg-white/20 rounded-full p-2.5`}
                    >
                      <Icon
                        size={18}
                        className={
                          toast.action === "add_to_wishlist" ||
                            toast.action === "remove_from_wishlist"
                            ? "fill-current"
                            : ""
                        }
                      />
                    </motion.div>
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins font-semibold text-sm leading-tight">
                      {toast.message || config.defaultMessage}
                    </p>
                    {toast.productName && (
                      <p className="font-poppins text-xs opacity-90 mt-0.5 truncate">
                        {toast.productName}
                      </p>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
                    aria-label="Close toast"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
