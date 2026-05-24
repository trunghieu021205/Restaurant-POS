"use client";

import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Loader2, Receipt, AlertCircle, Printer, X } from "lucide-react";
import { useBill } from "@/hooks/useBill";
import { useCheckout } from "@/hooks/useCheckout";
import { BillSkeleton } from "./BillSkeleton";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

interface BillSheetProps {
  tableId: string;
  open: boolean;
  onClose: () => void;
}

export function BillSheet({ tableId, open, onClose }: BillSheetProps) {
  const isMobile = useIsMobile();
  const { data: bill, isLoading, isError } = useBill(tableId);
  const checkout = useCheckout(tableId);

  const handleCheckout = () => {
    if (!bill || bill.items.length === 0) return;
    checkout.mutate();
  };

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
        {/* Header */}
        <div className="bg-primary-100 border-b-2 border-dashed border-primary-300 px-6 pt-4 pb-3 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-sm transition-colors"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-primary-900 flex items-center justify-center gap-2">
              <Receipt className="h-6 w-6" />
              HÓA ĐƠN THANH TOÁN
            </h2>
            <p className="text-sm text-primary-800 mt-1">Nhà hàng NGON</p>
            <p className="text-xs text-primary-700">
              123 Đường Ẩm Thực, TP. Hồ Chí Minh
            </p>
            <div className="flex justify-center gap-6 mt-2 text-sm">
              <span className="font-medium">Bàn: {tableId}</span>
              <span>{new Date().toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden px-4 py-2">
          <ScrollArea className="h-full pr-1">
            {isLoading ? (
              <BillSkeleton />
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-600">
                <AlertCircle className="h-10 w-10 mb-3" />
                <p className="font-medium">Không thể tải hóa đơn</p>
              </div>
            ) : !bill || bill.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Receipt className="h-10 w-10 mb-3 opacity-50" />
                <p className="font-medium">Chưa có món nào</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 shadow-sm mt-2">
                {/* Header cột */}
                <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase pb-2 border-b border-gray-100">
                  <span className="col-span-6">Món</span>
                  <span className="col-span-2 text-center">SL</span>
                  <span className="col-span-2 text-right">Đơn giá</span>
                  <span className="col-span-2 text-right">T.Tiền</span>
                </div>

                {/* Danh sách món */}
                <div className="divide-y divide-gray-50">
                  {bill.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 py-2.5 text-sm items-start"
                    >
                      <div className="col-span-6">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            ↳ {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="col-span-2 text-center text-gray-600">
                        {item.quantity}
                      </span>
                      <span className="col-span-2 text-right text-gray-600">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="col-span-2 text-right font-medium text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tổng phụ */}
                <div className="border-t border-dashed border-gray-200 mt-2 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(bill.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>VAT (8%)</span>
                    <span>{formatCurrency(bill.vatAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        {bill && bill.items.length > 0 && (
          <div className="border-t-2 border-dashed border-primary-300 px-6 py-4 bg-white/80">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span className="text-gray-700">TỔNG CỘNG</span>
              <span className="text-red-700">
                {formatCurrency(bill.totalAmount)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                size="lg"
                onClick={() => alert("Đã gửi lệnh in (mock)")}
              >
                <Printer className="mr-2 h-4 w-4" />
                In
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handleCheckout}
                disabled={checkout.isPending}
              >
                {checkout.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang thanh toán...
                  </>
                ) : (
                  "Thanh toán"
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
