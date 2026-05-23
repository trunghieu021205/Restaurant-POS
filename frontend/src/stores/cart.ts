import { create } from 'zustand';
import { CartItem } from '@/types';
import { persist } from 'zustand/middleware';

interface CartState {
    items: CartItem[];
    isExpanded: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    toggleExpanded: () => void;
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
                i.id === item.id ? { ...i, quantity: i.quantity +  qty } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity:  qty }] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
      toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
    }),
    {
      name: 'cart-storage', 
      partialize: (state) => ({ items: state.items }), 
    }
  )
);
export default useCartStore;