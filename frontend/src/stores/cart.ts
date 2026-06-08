import { create } from 'zustand';
import { CartItem } from '@/types';
import { persist } from 'zustand/middleware';

interface CartState {
    items: CartItem[];
    isExpanded: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateNote: (id: string, note: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    toggleExpanded: () => void;
    setExpanded: (expanded: boolean) => void;
    collapseCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isExpanded: false,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          const qty = item.quantity || 1;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateNote: (id, note) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, note } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
      setExpanded: (expanded) => set({ isExpanded: expanded }),
      collapseCart: () => set({ isExpanded: false }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;