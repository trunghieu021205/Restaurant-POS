import { useQuery } from '@tanstack/react-query';
import { fetchBill } from '@/services/bill';

export function useBill(tableId: string) {
  return useQuery({
    queryKey: ['bill', tableId],
    queryFn: () => fetchBill(tableId),
    refetchInterval: 10_000, // polling 10s
    enabled: !!tableId,
  });
}