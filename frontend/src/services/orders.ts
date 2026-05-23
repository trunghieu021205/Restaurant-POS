// services/orders.ts
import { dummyOrders, Order } from '@/data/dummyOrders';

// Giả lập delay mạng
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchOrders = async (): Promise<Order[]> => {
  await delay(500);
  // Trả về bản sao để tránh mutate trực tiếp mock data
  return [...dummyOrders];
};

// Hàm cập nhật trạng thái (mock) – sau này sẽ là API call
export const updateOrderStatus = async (
  orderId: string,
  newStatus: Order['status']
): Promise<Order> => {
  await delay(300);
  // Logic mock: tìm và cập nhật
  const order = dummyOrders.find(o => o.id === orderId);
  if (!order) throw new Error('Order not found');
  order.status = newStatus;
  return { ...order };
};