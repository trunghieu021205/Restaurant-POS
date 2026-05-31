import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutTable } from '@/services/bill';
import { toast } from '@/lib/toast';

export function useCheckout(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => checkoutTable(tableId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['bill', tableId] });
      const previousBill = queryClient.getQueryData(['bill', tableId]);
      // Optimistic: set bill rỗng
      queryClient.setQueryData(['bill', tableId], {
        tableId,
        items: [],
        totalAmount: 0,
      });
      return { previousBill };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBill) {
        queryClient.setQueryData(['bill', tableId], context.previousBill);
      }
      toast.error('Thanh toán thất bại');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', tableId] });
      toast.success('Thanh toán thành công!');
      // Nếu bạn dùng CartContext, có thể gọi clearCart() ở đây
    },
  });
}