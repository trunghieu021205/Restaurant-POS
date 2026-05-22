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
    addItem: (newItem) =>
        set((state) => {
            const existingIndex = state.items.findIndex((i) => i.id === newItem.id);
            if (existingIndex >= 0) {
            // Đã có -> cập nhật quantity
            const updatedItems = state.items.map((item, index) =>
                index === existingIndex
                ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
                : item
            );
            return { items: updatedItems };
            }
            // Chưa có -> thêm mới
            return { items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }] };
        }),
    removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    clearCart: () => set({ items: [] }),
    getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));
export default useCartStore;