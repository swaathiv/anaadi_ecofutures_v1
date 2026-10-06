"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  slug: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  ready: boolean;
  add: (slug: string, quantity?: number, max?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const KEY = "anaadi-bag-v1";
const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((i) => typeof i?.slug === "string" && Number.isFinite(i?.quantity) && i.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStored());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setItems(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* Storage unavailable: the bag lives for this page view only. */
    }
  }, [items, ready]);

  const add = useCallback((slug: string, quantity = 1, max = 99) => {
    setItems((current) => {
      const existing = current.find((i) => i.slug === slug);
      if (existing) {
        return current.map((i) => (i.slug === slug ? { ...i, quantity: Math.min(max, i.quantity + quantity) } : i));
      }
      return [...current, { slug, quantity: Math.min(max, quantity) }];
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0 ? current.filter((i) => i.slug !== slug) : current.map((i) => (i.slug === slug ? { ...i, quantity } : i)),
    );
  }, []);

  const remove = useCallback((slug: string) => setItems((c) => c.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, ready, count: items.reduce((n, i) => n + i.quantity, 0), add, setQuantity, remove, clear }),
    [items, ready, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
