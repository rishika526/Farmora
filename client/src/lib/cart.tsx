import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Kit } from "@/lib/api";

type CartItem = {
  kit: Kit;
  quantity: number;
};

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addToCart: (kit: Kit) => void;
  removeFromCart: (kitId: string) => void;
  clearCart: () => void;
}

const CART_KEY = "farmora-cart";
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CartItem[];
      setItems(parsed);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(kit: Kit) {
    setItems((prev) => {
      const existing = prev.find((i) => i.kit.id === kit.id);
      if (existing) {
        return prev.map((i) =>
          i.kit.id === kit.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { kit, quantity: 1 }];
    });
  }

  function removeFromCart(kitId: string) {
    setItems((prev) => prev.filter((i) => i.kit.id !== kitId));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider value={{ items, itemCount, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
