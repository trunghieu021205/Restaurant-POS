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
    status: 'available' | 'occupied';
  };
  sessionToken: string;
}

export interface ValidatedTableSessionDto {
  table: TableSessionDto['table'];
}

export async function checkInTableByQr(
  tableId: string,
  qrToken: string,
): Promise<TableSessionDto> {
  return apiClient<TableSessionDto>(`/qr/table/${encodeURIComponent(tableId)}/check-in`, {
    method: 'POST',
    body: JSON.stringify({ qrToken }),
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

