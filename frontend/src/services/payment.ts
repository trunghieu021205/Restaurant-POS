import apiClient from "./apiClient";
import type {
  PaymentTransaction,
  CreatePaymentRequest,
  CreatePaymentResponse,
} from "@/types/payment";

export async function createPaymentTransaction(
  request: CreatePaymentRequest & { tableId: string }
): Promise<CreatePaymentResponse> {
  const { tableId, ...requestData } = request;
  return apiClient<CreatePaymentResponse>("/payments/create", {
    method: "POST",
    body: JSON.stringify(requestData),
  }, true, tableId);
}

export async function getTransactionById(
  transactionId: string,
  tableId?: string
): Promise<PaymentTransaction> {
  return apiClient<PaymentTransaction>(`/payments/${transactionId}`, {}, !!tableId, tableId);
}

export async function getTransactionsByOrder(
  orderId: string,
  tableId?: string
): Promise<PaymentTransaction[]> {
  return apiClient<PaymentTransaction[]>(`/payments/order/${orderId}`, {}, !!tableId, tableId);
}
