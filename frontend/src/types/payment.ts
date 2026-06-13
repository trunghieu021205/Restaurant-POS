export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";
export type PaymentGateway = "vnpay";
export type PaymentMethod = "online_qr";

export interface PaymentTransaction {
  id: string;
  transactionCode: string;
  orderId: string;
  orderNumber?: string;
  billId: string;
  tableId: string;
  tableNumber?: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentGateway: PaymentGateway;
  status: PaymentStatus;
  paymentUrl?: string;
  gatewayTransactionId?: string;
  gatewayResponseCode?: string;
  gatewayMessage?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  orderId: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  transactionId: string;
  transactionCode: string;
  paymentUrl: string;
}
