"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useToast } from "./ToastContext";

export interface CartItem {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  tag?: {
    type: "new" | "discount";
    value: string;
  };
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("rootcraft_cart");
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rootcraft_cart", JSON.stringify(items));
    }
  }, [items]);

  const openCart = useCallback(() => {
    setIsOpen(true);
    // Prevent body scroll when cart is open
    document.body.style.overflow = "hidden";
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = "unset";
  }, []);

  const addToCart = useCallback(
    (product: Omit<CartItem, "quantity">) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);
        if (existingItem) {
          showToast({
            type: "success",
            action: "add_to_cart",
            message: "Quantity updated in cart",
            productName: product.name,
          });
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        showToast({
          type: "success",
          action: "add_to_cart",
          message: "Added to cart",
          productName: product.name,
        });
        return [...prevItems, { ...product, quantity: 1 }];
      });
      openCart();
    },
    [openCart, showToast]
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setItems((prevItems) => {
        const item = prevItems.find((i) => i.id === id);
        if (item) {
          showToast({
            type: "success",
            action: "remove_from_cart",
            message: "Removed from cart",
            productName: item.name,
          });
        }
        return prevItems.filter((item) => item.id !== id);
      });
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(id);
        return;
      }
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    },
    [removeFromCart]
  );

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      document.body.style.overflow = newState ? "hidden" : "unset";
      return newState;
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        getTotalItems,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
