import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
}

const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    clearCart: () => set({ items: [] }),
    getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
export default useCartStore;