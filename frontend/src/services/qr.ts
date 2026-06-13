import apiClient from './apiClient';

export interface TableQRDto {
  tableId: string;
  tableNumber: number;
  checkInUrl: string;
  qrCode: string; // base64 png (data URL)
}

export async function getAllTableQRs(): Promise<TableQRDto[]> {
  return apiClient<TableQRDto[]>(`/qr/tables`);
}

export interface TableSessionDto {
  table: {
    id: string;
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
    customerName?: string;
    customerPhone?: string;
    checkedInAt?: string;
  };
  sessionToken: string;
}

export interface ValidatedTableSessionDto {
  table: TableSessionDto['table'];
}

export async function checkInTableByQr(
  tableId: string,
  qrToken: string,
  customer?: { customerName: string; customerPhone: string },
): Promise<TableSessionDto> {
  return apiClient<TableSessionDto>(`/qr/table/${encodeURIComponent(tableId)}/check-in`, {
    method: 'POST',
    body: JSON.stringify({ qrToken, ...customer }),
  });
}

export async function validateTableSession(
  tableId: string,
  sessionToken: string,
): Promise<ValidatedTableSessionDto> {
  return apiClient<ValidatedTableSessionDto>(`/qr/table/${encodeURIComponent(tableId)}/session`, {
    method: 'POST',
    body: JSON.stringify({ sessionToken }),
  });
}

export async function rejoinTableSession(
  tableId: string,
  customer: { customerName: string; customerPhone: string },
): Promise<TableSessionDto> {
  return apiClient<TableSessionDto>(`/qr/table/${encodeURIComponent(tableId)}/rejoin`, {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}

export interface PaymentQRDto {
  billId: string;
  tableId: string;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  transferContent: string;
  bankInfo: {
    bankId: string;
    accountNo: string;
    accountName: string;
  };
  qrCode: string;
}

export async function getPaymentQR(billId: string): Promise<PaymentQRDto> {
  return apiClient<PaymentQRDto>(`/qr/payment/${encodeURIComponent(billId)}`);
}

