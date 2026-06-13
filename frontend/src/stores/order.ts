
import { create } from 'zustand';
import { Order } from '@/types/order';

interface OrdersState {
    orders: Order[];
    setOrders: (orders: Order[]) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const useOrdersStore = create<OrdersState>((set) => ({
    orders: [],
    setOrders: (orders) => set({ orders }),
    updateOrderStatus: (orderId, status) =>
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      })),
}));
export default useOrdersStore;
