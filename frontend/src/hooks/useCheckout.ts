import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutTable } from "@/services/bill";
import type { PaymentMethod } from "@/types/bill";
import { toast } from "@/lib/toast";

export function useCheckout(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethod: PaymentMethod) =>
      checkoutTable(tableId, paymentMethod),
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Thanh toán thất bại";
      toast.error(message);
    },
    onSuccess: ({ bill }) => {
      queryClient.setQueryData(["bill", tableId], bill);
      queryClient.invalidateQueries({ queryKey: ["bill", tableId] });
      queryClient.invalidateQueries({ queryKey: ["table-orders", tableId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });

      const billStatus = bill.status;
      const paymentMethod = bill.paymentMethod;

      if (billStatus === "paid" && typeof window !== "undefined") {
        sessionStorage.removeItem(`table-session:${tableId}`);
      }

      if (billStatus !== "paid" && paymentMethod === "cash") {
        toast.success("Đã gửi yêu cầu thanh toán đến nhân viên");
      } else if (billStatus === "paid") {
        toast.success("Thanh toán thành công!");
      } else {
        toast.success("Đã cập nhật thanh toán");
      }
    },
  });
}