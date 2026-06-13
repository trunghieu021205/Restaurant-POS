// hooks/useBillById.ts
import { useQuery } from "@tanstack/react-query";
import { fetchBillById } from "@/services/bill";

export function useBillById(billId: string) {
  return useQuery({
    queryKey: ["bill-by-id", billId],
    queryFn: () => fetchBillById(billId),
    enabled: !!billId,
    staleTime: 5 * 60_000, // bill paid không thay đổi → cache 5 phút
  });
}
