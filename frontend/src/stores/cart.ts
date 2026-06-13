import { create } from 'zustand';
import { CartItem } from '@/types/cart';
import { getCart, addToCart, removeFromCart, clearCart, updateCartItemNote } from '@/services/cart';

interface CartState {
    tableId: string | null;
    items: CartItem[];
    isExpanded: boolean;
    isLoading: boolean;
    error: string | null;
    fetchCart: (tableId: string) => Promise<void>;
    addItem: (menuItemId: string, quantity?: number, note?: string) => Promise<void>;
    removeItem: (menuItemId: string) => Promise<void>;
    updateNote: (menuItemId: string, note: string) => Promise<void>;
    clearCart: () => Promise<void>;
    resetLocalCart: () => void;
    getTotal: () => number;
    toggleExpanded: () => void;
    setExpanded: (expanded: boolean) => void;
    collapseCart: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  tableId: null,
  items: [],
  isExpanded: false,
  isLoading: false,
  error: null,

  fetchCart: async (tableId: string) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await getCart(tableId);
      set({ tableId, items: cart.items, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      set({ error: 'Failed to fetch cart', isLoading: false });
    }
  },

  addItem: async (menuItemId: string, quantity = 1, note = '') => {
    const { tableId } = get();
    if (!tableId) {
      set({ error: 'No table selected' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await addToCart(tableId, menuItemId, quantity, note);
      set({ items: cart.items, isLoading: false });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      const message = error instanceof Error ? error.message : 'Failed to add item to cart';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  removeItem: async (menuItemId: string) => {
    const { tableId } = get();
    if (!tableId) {
      set({ error: 'No table selected' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const cart = await removeFromCart(tableId, menuItemId);
      set({ items: cart.items, isLoading: false });
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      set({ error: 'Failed to remove item from cart', isLoading: false });
    }
  },

  updateNote: async (menuItemId: string, note: string) => {
    const { tableId, items } = get();
    if (!tableId) return;

    // Optimistic update — chỉ update local state
    set({
      items: items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, note } : i
      ),
    });

    try {
      const cart = await updateCartItemNote(tableId, menuItemId, note);
      set({ items: cart.items });
    } catch (error) {
      console.error('Failed to update note:', error);
      // Rollback về state cũ nếu lỗi
      set({ items });
    }
  },
  
  clearCart: async () => {
    const { tableId } = get();
    if (!tableId) {
      set({ error: 'No table selected' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await clearCart(tableId);
      set({ items: [], isLoading: false });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      set({ error: 'Failed to clear cart', isLoading: false });
    }
  },

  resetLocalCart: () => set({
    tableId: null,
    items: [],
    isExpanded: false,
    isLoading: false,
    error: null,
  }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const price = item.menuItem?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  },

  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  collapseCart: () => set({ isExpanded: false }),
}));

export default useCartStore;
