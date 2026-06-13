import apiClient from "./apiClient";
import type { BillResponse } from "@/types/bill";

export interface PaidBillTodayItem {
  id: string;
  tableId: string;
  tableNumber?: number;
  status: "paid" | string | null;
  items: Array<{
    id: string;
    orderId?: string;
    orderNumber?: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    status?: string;
  }>;
  subtotal: number;
  tax: number;
  vatAmount: number;
  discount: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: "cash" | "online_qr" | string | null;
  paidAt?: string | null;
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

export async function fetchPaidBillsTodayForStaff(): Promise<PaidBillTodayItem[]> {
  const res = await apiClient<{ items: PaidBillTodayItem[] }>(
    "/bills/staff/paid-today",
  );
  return res.items;
}

export async function fetchBillById(billId: string): Promise<Bill> {
  const bill = await apiClient<RawBill>(`/bills/${encodeURIComponent(billId)}`);
  return mapBill(bill);
}

export async function getBillReceipt(billId: string): Promise<BillResponse> {
  // Không truyền token — public route
  return apiClient<BillResponse>(`/bills/${billId}/receipt`);
}

