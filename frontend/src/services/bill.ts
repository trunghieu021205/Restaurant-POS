import apiClient from "@/services/apiClient";
import type { Bill, PaymentMethod } from "@/types/bill";
import type { OrderStatus } from "@/services/orders";

interface RawBillItem {
  id?: string;
  orderId?: string;
  orderNumber?: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  note?: string;
  status?: OrderStatus;
}

interface RawBill {
  id: string | null;
  tableId: string;
  tableNumber?: number;
  status: Bill["status"];
  items: RawBillItem[];
  subtotal: number;
  tax?: number;
  vatAmount: number;
  discount?: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
}

function mapBill(bill: RawBill): Bill {
  return {
    id: bill.id,
    tableId: bill.tableId,
    tableNumber: bill.tableNumber,
    status: bill.status,
    subtotal: bill.subtotal,
    tax: bill.tax ?? bill.vatAmount,
    vatAmount: bill.vatAmount,
    discount: bill.discount ?? 0,
    totalAmount: bill.totalAmount,
    paymentMethod: bill.paymentMethod,
    paidAt: bill.paidAt,
    items: bill.items.map((item, index) => ({
      id: item.id ?? `${item.name}-${index}`,
      orderId: item.orderId,
      orderNumber: item.orderNumber,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes ?? item.note,
      status: item.status,
    })),
  };
}

export async function fetchBill(tableId: string): Promise<Bill> {
  const bill = await apiClient<RawBill>(`/tables/${encodeURIComponent(tableId)}/bill`);
  return mapBill(bill);
}

export async function checkoutTable(
  tableId: string,
  paymentMethod: PaymentMethod,
): Promise<{ success: boolean; bill: Bill }> {
  const result = await apiClient<{ success: boolean; bill: RawBill }>(
    `/tables/${encodeURIComponent(tableId)}/checkout`,
    {
      method: "POST",
      body: JSON.stringify({ paymentMethod }),
    },
  );

  return {
    success: result.success,
    bill: mapBill(result.bill),
  };
}
