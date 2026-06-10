export type PaymentMethod = "cash" | "credit_card" | "e_wallet";
export type BillStatus = "open" | "paid" | "cancelled";

export interface BillItem {
  id: string;
  orderId?: string;
  orderNumber?: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status?: "pending" | "confirmed" | "cooking" | "done" | "cancelled";
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
  paymentMethod?: PaymentMethod;
  paidAt?: string;
}
