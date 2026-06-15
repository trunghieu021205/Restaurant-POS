import apiClient from "@/services/apiClient";

export type TableStatus = "available" | "occupied" | "reserved" | "maintenance";
export type PaymentRequestType = "cash_payment_request" | "online_qr_payment";
export type PaymentRequestStatus = "requested" | "pending" | "success" | "assisted" | "completed";

export interface StaffTable {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  customerName?: string;
  customerPhone?: string;
  checkedInAt?: string;
  reservedAt?: string;
  billId: string | null;
  billStatus: string | null;
  totalAmount: number;
  updatedAt?: string;
}

export interface PaymentNotification {
  id?: string;
  _id?: string;
  tableId: string | { _id: string; number: number };
  tableNumber?: number;
  billId?: string | { _id: string; totalAmount: number; status: string };
  type: PaymentRequestType;
  paymentStatus: PaymentRequestStatus;
  amount?: number;
  method?: "cash" | "online_qr";
  billCode?: string;
  paymentId?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  assistedAt?: string;
  completedAt?: string;
}

export interface TableAuditLog {
  _id: string;
  tableId: { _id: string; number: number };
  action: string;
  fromStatus?: string;
  toStatus?: string;
  staffId?: { _id: string; name?: string; email?: string };
  note?: string;
  createdAt: string;
}

export function fetchStaffTables() {
  return apiClient<StaffTable[]>("/tables/staff/statuses");
}

export function reserveTable(tableId: string, data: { customerName: string; customerPhone: string }) {
  return apiClient<StaffTable>(`/tables/${encodeURIComponent(tableId)}/reserve`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function unlockTable(tableId: string, data: { confirmed: boolean; note?: string }) {
  return apiClient<StaffTable>(`/tables/${encodeURIComponent(tableId)}/unlock`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchPaymentNotifications() {
  return apiClient<PaymentNotification[]>("/tables/staff/payment-notifications");
}

export function updatePaymentNotification(id: string, paymentStatus: "assisted" | "completed") {
  return apiClient<PaymentNotification>(`/tables/staff/payment-notifications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
  });
}

export function fetchTableAuditLogs() {
  return apiClient<TableAuditLog[]>("/tables/staff/audit-logs");
}
