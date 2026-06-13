import apiClient from "./apiClient";
import type { CartItem } from "@/types/cart";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "delivered"
  | "cancelled";

export interface KitchenOrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price?: number;
  notes?: string;
}

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableId: string;
  billId?: string;
  tableNumber: number | string;
  items: KitchenOrderItem[];
  status: OrderStatus;
  totalAmount: number;
  subTotal: number;
  createdAt: string;
  updatedAt?: string;
}

interface RawOrderItem {
  _id?: string;
  menuItemId: {
    _id?: string;
    id?: string;
    name?: string;
    price?: number;
  } | string;
  quantity: number;
  price?: number;
  note?: string;
}

interface RawOrder {
  _id?: string;
  id?: string;
  orderNumber?: string;
  tableId?: { _id?: string; id?: string; number?: number } | string;
  billId?: { _id?: string; id?: string } | string;
  items?: RawOrderItem[];
  status: OrderStatus;
  totalAmount?: number;
  subTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

function mapOrder(raw: RawOrder): KitchenOrder {
  const table =
    typeof raw.tableId === "object" && raw.tableId !== null ? raw.tableId : null;
  const tableId = table?._id ?? table?.id ?? String(raw.tableId ?? "");
  const billId =
    typeof raw.billId === "object" && raw.billId !== null
      ? raw.billId._id ?? raw.billId.id
      : raw.billId;

  return {
    id: raw._id ?? raw.id ?? "",
    orderNumber: raw.orderNumber ?? raw._id ?? raw.id ?? "",
    tableId,
    billId,
    tableNumber: table?.number ?? tableId,
    status: raw.status,
    totalAmount: raw.totalAmount ?? 0,
    subTotal: raw.subTotal ?? raw.totalAmount ?? 0,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt,
    items: (raw.items ?? []).map((item) => {
      const menu =
        typeof item.menuItemId === "object" && item.menuItemId !== null
          ? item.menuItemId
          : null;
      const menuItemId = menu?._id ?? menu?.id ?? String(item.menuItemId);
      return {
        id: item._id ?? menuItemId,
        menuItemId,
        name: menu?.name ?? "Món đã xóa",
        quantity: item.quantity,
        price: item.price ?? menu?.price,
        notes: item.note,
      };
    }),
  };
}

export async function fetchOrders(status: OrderStatus | "all" = "all") {
  const raw = await apiClient<RawOrder[]>(`/orders?status=${status}`);
  return raw.map(mapOrder);
}

export async function fetchTableOrders(tableId: string) {
  const raw = await apiClient<RawOrder[]>(
    `/orders/table/${encodeURIComponent(tableId)}`,
  );
  return raw.map(mapOrder);
}

export async function createOrderFromCart(tableId: string, items: CartItem[]) {
  const raw = await apiClient<RawOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      tableId,
      items: items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        note: item.note,
      })),
    }),
  });
  return mapOrder(raw);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const raw = await apiClient<{ order: RawOrder }>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return mapOrder(raw.order);
}
