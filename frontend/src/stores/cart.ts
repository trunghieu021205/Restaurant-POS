import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartState {
    items: CartItem[];
    isExpanded: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
    toggleExpanded: () => void;
}

const useCartStore = create<CartState>((set, get) => ({
    items: [],
    isExpanded: false,
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    clearCart: () => set({ items: [] }),
    getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));
export default useCartStore;