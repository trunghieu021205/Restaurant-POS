"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Receipt, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useBill } from "@/hooks/useBill";
import { useCheckout } from "@/hooks/useCheckout";
import type { PaymentMethod } from "@/types/bill";
import { BillSkeleton } from "./BillSkeleton";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";
import { createPaymentTransaction } from "@/services/payment";
import { toast } from "react-hot-toast";

interface BillSheetProps {
  tableId: string;
  tableNumber?: number;
  open: boolean;
  onClose: () => void;
}

export function BillSheet({
  tableId,
  tableNumber,
  open,
  onClose,
}: BillSheetProps) {
  const isMobile = useIsMobile();
  const { data: bill, isLoading, isError, refetch } = useBill(tableId);
  const checkout = useCheckout(tableId);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const handleCheckout = async () => {
    if (!bill || bill.items.length === 0 || checkout.isPending) return;

    if (paymentMethod === "online_qr") {
      // Get the first order ID from the bill items
      const orderId = bill.items[0]?.orderId;
      if (!orderId) {
        toast.error("Không tìm thấy đơn hàng để thanh toán");
        return;
      }

      setIsCreatingPayment(true);
      try {
        const result = await createPaymentTransaction({ orderId, tableId });
        // Redirect to payment processing page
        window.location.href = `/payment/processing?paymentUrl=${encodeURIComponent(result.paymentUrl)}&amount=${bill.totalAmount}`;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể tạo giao dịch thanh toán",
        );
        setIsCreatingPayment(false);
      }
      return;
    }

    checkout.mutate("cash");
  };

  const hasPendingCashRequest =
    !!bill && bill.paymentMethod === "cash" && bill.status !== "paid";

  const canCheckout =
    !!bill &&
    bill.items.length > 0 &&
    bill.status !== "paid" &&
    !hasPendingCashRequest &&
    !checkout.isPending &&
    !isCreatingPayment;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "center"}
        className={
          isMobile
            ? "h-[90dvh] rounded-t-2xl bg-primary-50 flex flex-col p-0 overflow-hidden"
            : "bg-primary-50 flex flex-col p-0 overflow-hidden"
        }
      >
        <div className="relative border-b-2 border-dashed border-primary-300 bg-primary-100 px-6 pb-3 pt-4">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-1.5 shadow-sm transition-colors hover:bg-white"
            aria-label="Đóng hóa đơn"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
          <div className="text-center">
            <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-primary-900">
              <Receipt className="h-6 w-6" />
              Hóa đơn thanh toán
            </h2>
            <p className="mt-1 text-sm text-primary-800">Nhà hàng NGON</p>
            <p className="text-xs text-primary-700">
              123 Đường Ẩm Thực, TP. Hồ Chí Minh
            </p>
            <div className="mt-2 flex justify-center gap-6 text-sm">
              <span className="font-medium">
                Bàn số: {tableNumber ?? bill?.tableNumber ?? tableId}
              </span>
              <span>{new Date().toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden px-4 py-2">
          <ScrollArea className="h-full pr-1">
            {isLoading ? (
              <BillSkeleton />
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-red-600">
                <AlertCircle className="mb-3 h-10 w-10" />
                <p className="font-medium">Không thể tải hóa đơn</p>
                <button
                  onClick={() => refetch()}
                  className="mt-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium shadow-sm"
                >
                  Thử lại
                </button>
              </div>
            ) : !bill || bill.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Receipt className="mb-3 h-10 w-10 opacity-50" />
                <p className="font-medium">Chưa có món nào cần thanh toán</p>
              </div>
            ) : (
              <div className="mt-2 rounded-lg bg-white p-4 shadow-sm">
                <div className="grid grid-cols-12 border-b border-gray-100 pb-2 text-xs font-semibold uppercase text-gray-500">
                  <span className="col-span-3">Món</span>
                  <span className="col-span-1 text-center">SL</span>
                  <span className="col-span-4 text-right">Đơn giá</span>
                  <span className="col-span-4 text-right">Thành tiền</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {bill.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 items-start py-2.5 text-sm"
                    >
                      <div className="col-span-3">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.notes && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="col-span-1 text-center text-gray-600">
                        {item.quantity}
                      </span>
                      <span className="col-span-4 text-right text-gray-600">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="col-span-4 text-right font-medium text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-1.5 border-t border-dashed border-gray-200 pt-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(bill.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>VAT (8%)</span>
                    <span>{formatCurrency(bill.vatAmount)}</span>
                  </div>
                  {bill.discount > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Giảm giá</span>
                      <span>-{formatCurrency(bill.discount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {bill && bill.items.length > 0 && (
          <div className="border-t-2 border-dashed border-primary-300 bg-white/80 px-6 py-4">
            <div className="mb-4 flex justify-between text-lg font-bold">
              <span className="text-gray-700">Tổng cộng</span>
              <span className="text-red-700">
                {formatCurrency(bill.totalAmount)}
              </span>
            </div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phương thức thanh toán
            </label>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {[
                { value: "cash", label: "Tiền mặt" },
                { value: "online_qr", label: "VNPay" },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(method.value as PaymentMethod)
                  }
                  disabled={
                    checkout.isPending ||
                    bill.status === "paid" ||
                    isCreatingPayment
                  }
                  className={`rounded-md border px-3 py-2 text-sm font-medium ${
                    paymentMethod === method.value
                      ? "border-primary-500 bg-primary-50 text-primary-800"
                      : "border-neutral-200 bg-white text-gray-700"
                  } disabled:opacity-60`}
                >
                  {method.label}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={!canCheckout}
            >
              {isCreatingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo giao dịch...
                </>
              ) : checkout.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : bill.status === "paid" ? (
                "Đã thanh toán"
              ) : hasPendingCashRequest ? (
                "Đã gửi yêu cầu — đang chờ nhân viên"
              ) : paymentMethod === "cash" ? (
                "Gửi yêu cầu"
              ) : (
                "Thanh toán trực tuyến"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
