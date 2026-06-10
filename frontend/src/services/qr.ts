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

