"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useToast } from "./ToastContext";

export interface WishlistItem {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  tag?: {
    type: "new" | "discount";
    value: string;
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (product: WishlistItem) => void;
  getWishlistCount: () => number;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { showToast } = useToast();

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rootcraft_wishlist");
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (error) {
          console.error("Error loading wishlist:", error);
        }
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rootcraft_wishlist", JSON.stringify(items));
    }
  }, [items]);

  const addToWishlist = useCallback(
    (product: WishlistItem) => {
      setItems((prevItems) => {
        // Check if product already exists
        if (prevItems.find((item) => item.id === product.id)) {
          return prevItems;
        }
        showToast({
          type: "success",
          action: "add_to_wishlist",
          message: "Added to wishlist",
          productName: product.name,
        });
        return [...prevItems, product];
      });
    },
    [showToast]
  );

  const removeFromWishlist = useCallback(
    (id: string) => {
      setItems((prevItems) => {
        const item = prevItems.find((i) => i.id === id);
        if (item) {
          showToast({
            type: "success",
            action: "remove_from_wishlist",
            message: "Removed from wishlist",
            productName: item.name,
          });
        }
        return prevItems.filter((item) => item.id !== id);
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback(
    (id: string) => {
      return items.some((item) => item.id === id);
    },
    [items]
  );

  const toggleWishlist = useCallback(
    (product: WishlistItem) => {
      // Prevent rapid toggling
      const alreadyInWishlist = isInWishlist(product.id);
      if (alreadyInWishlist) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  const getWishlistCount = useCallback(() => {
    return items.length;
  }, [items]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      getWishlistCount,
      clearWishlist,
    }),
    [
      items,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist,
      getWishlistCount,
      clearWishlist,
    ]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

