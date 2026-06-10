import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutTable } from '@/services/bill';
import type { PaymentMethod } from '@/types/bill';
import { toast } from '@/lib/toast';

export function useCheckout(tableId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethod: PaymentMethod) => checkoutTable(tableId, paymentMethod),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['bill', tableId] });
      const previousBill = queryClient.getQueryData(['bill', tableId]);

      queryClient.setQueryData(['bill', tableId], {
        id: null,
        tableId,
        status: null,
        items: [],
        subtotal: 0,
        tax: 0,
        vatAmount: 0,
        discount: 0,
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
      queryClient.invalidateQueries({ queryKey: ['table-orders', tableId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`table-session:${tableId}`);
      }

      toast.success('Thanh toán thành công!');
    },
  });
}
