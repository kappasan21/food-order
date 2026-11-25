"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  menuItemId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "food-order-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as CartItem[]);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isReady]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCents = items.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      totalCents,
      addItem(item, quantity = 1) {
        setItems((current) => {
          const existing = current.find(
            (entry) => entry.menuItemId === item.menuItemId,
          );

          if (existing) {
            return current.map((entry) =>
              entry.menuItemId === item.menuItemId
                ? { ...entry, quantity: entry.quantity + quantity }
                : entry,
            );
          }

          return [...current, { ...item, quantity }];
        });
      },
      removeItem(menuItemId) {
        setItems((current) =>
          current.filter((entry) => entry.menuItemId !== menuItemId),
        );
      },
      updateQuantity(menuItemId, quantity) {
        if (quantity <= 0) {
          setItems((current) =>
            current.filter((entry) => entry.menuItemId !== menuItemId),
          );
          return;
        }

        setItems((current) =>
          current.map((entry) =>
            entry.menuItemId === menuItemId ? { ...entry, quantity } : entry,
          ),
        );
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
