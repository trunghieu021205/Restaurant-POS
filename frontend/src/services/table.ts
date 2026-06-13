import apiClient from './apiClient';

export interface ResolvedTable {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  customerName?: string;
  customerPhone?: string;
  checkedInAt?: string;
}

interface TableExistsResponse {
  exists: boolean;
  table: ResolvedTable | null;
}

export async function resolveTable(tableId: string): Promise<ResolvedTable | null> {
  const safeId = encodeURIComponent(tableId.trim());
  const res = await apiClient<TableExistsResponse>(`/tables/${safeId}/exists`);
  return res.exists ? res.table : null;
}

export async function tableExists(tableId: string): Promise<boolean> {
  return (await resolveTable(tableId)) !== null;
}
