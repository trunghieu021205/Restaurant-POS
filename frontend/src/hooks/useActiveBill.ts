import { useQuery } from '@tanstack/react-query';
import { fetchBill } from '@/services/bill';

export function useActiveBill(tableId: string | null) {
  return useQuery({
    queryKey: ['active-bill', tableId],
    queryFn: () => fetchBill(tableId!),
    enabled: !!tableId,
    retry: false,
    // Không tự động refetch liên tục, chỉ check 1 lần
  });
}