export type PaymentMethod = "cash" | "online_qr";
export type BillStatus = "open" | "paid" | "cancelled";

export interface BillItem {
  id: string;
  orderId?: string;
  orderNumber?: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status?: "pending" | "confirmed" | "delivered" | "cancelled";
}

export interface Bill {
  id: string | null;
  tableId: string;
  tableNumber?: number;
  status: BillStatus | null;
  items: BillItem[];
  subtotal: number;
  tax: number;
  vatAmount: number;
  discount: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
}

export interface BillResponse extends Bill {
  id: string; 
  orders: unknown[]; 
  createdAt?: string;
  updatedAt?: string;
}