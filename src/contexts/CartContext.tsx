'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CartItem, OrderPricing } from '@/types';
import { calculatePricing, generateId } from '@/lib/utils';
import { lockSlot, releaseSlot } from '@/services/slot.service';
import { useAuth } from './AuthContext';

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  pricing: OrderPricing | null;
  addItem: (item: Omit<CartItem, 'id' | 'addedAt' | 'lockExpiry'>) => Promise<{ success: boolean; error?: string }>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isSlotInCart: (slotId: string) => boolean;
  getExpiredItems: () => CartItem[];
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dh_cart');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as CartItem[];
          // Filter out expired items
          const valid = parsed.filter((item) => item.lockExpiry > Date.now());
          setItems(valid);
        } catch {}
      }
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dh_cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = useCallback(
    async (itemData: Omit<CartItem, 'id' | 'addedAt' | 'lockExpiry'>) => {
      if (!user) return { success: false, error: 'Please sign in to book' };

      // Check for duplicate slot
      const existing = items.find((i) => i.slotId === itemData.slotId);
      if (existing) return { success: false, error: 'This slot is already in your cart' };

      // Only allow one item at a time (marketplace simplicity for v1)
      if (items.length >= 1) {
        return { success: false, error: 'Please complete your current booking first' };
      }

      // Lock the slot
      const lockResult = await lockSlot(itemData.slotId, (user as any).uid || user.uid);
      if (!lockResult.success) {
        return { success: false, error: lockResult.error || 'Could not reserve slot' };
      }

      const newItem: CartItem = {
        ...itemData,
        id: generateId(),
        addedAt: Date.now(),
        lockExpiry: lockResult.lockExpiry,
      };

      setItems((prev) => [...prev, newItem]);
      setIsOpen(true);
      return { success: true };
    },
    [items, user]
  );

  const removeItem = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item && user) {
        await releaseSlot(item.slotId, (user as any).uid || user.uid);
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [items, user]
  );

  const clearCart = useCallback(() => {
    // Release all slot locks
    items.forEach(async (item) => {
      if (user) {
        await releaseSlot(item.slotId, (user as any).uid || user.uid);
      }
    });
    setItems([]);
  }, [items, user]);

  const pricing: OrderPricing | null =
    items.length > 0 ? calculatePricing(items.reduce((sum, i) => sum + i.fee, 0)) : null;

  const isSlotInCart = useCallback(
    (slotId: string) => items.some((i) => i.slotId === slotId),
    [items]
  );

  const getExpiredItems = useCallback(
    () => items.filter((i) => i.lockExpiry < Date.now()),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        itemCount: items.length,
        pricing,
        addItem,
        removeItem,
        clearCart,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((o) => !o),
        isSlotInCart,
        getExpiredItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
