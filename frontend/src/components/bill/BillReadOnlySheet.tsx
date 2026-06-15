"use client";

import { useState } from "react";
import { AlertCircle, Receipt, X } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Sheet, SheetContent } from "@/components/ui/Sheet";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { BillSkeleton } from "./BillSkeleton";
import { formatCurrency } from "@/lib/utils";
import { useBillById } from "@/hooks/useBillById";

interface BillReadOnlySheetProps {
  billId: string;
  tableNumber?: number;
  paidAt?: string | null;
  open: boolean;
  onClose: () => void;
}

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string | null;
}

interface Bill {
  id: string;
  tableNumber?: number;
  paidAt?: string | null;
  items: BillItem[];
  subtotal: number;
  vatAmount: number;
  discount: number;
  totalAmount: number;
}

export function BillReadOnlySheet({
  billId,
  tableNumber,
  paidAt,
  open,
  onClose,
}: BillReadOnlySheetProps) {
  const isMobile = useIsMobile();

  const {
    data: bill,
    isLoading,
    isError,
    refetch,
  } = useBillById(open && billId ? billId : "");

  // Hiển thị ngày đúng
  const displayDate = paidAt
    ? new Date(paidAt).toLocaleDateString("vi-VN")
    : new Date().toLocaleDateString("vi-VN");

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
              Hóa đơn đã thanh toán
            </h2>
            <p className="mt-1 text-sm text-primary-800">Nhà hàng NGON</p>
            <p className="text-xs text-primary-700">
              123 Đường Ẩm Thực, TP. Hồ Chí Minh
            </p>
            <div className="mt-2 flex justify-center gap-6 text-sm">
              <span className="font-medium">
                Bàn số: {tableNumber ?? bill?.tableNumber ?? "N/A"}
              </span>
              <span>
                {(() => {
                  const dateStr = paidAt ?? bill?.paidAt;
                  return dateStr
                    ? new Date(dateStr).toLocaleString("vi-VN")
                    : new Date().toLocaleDateString("vi-VN");
                })()}
              </span>
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
                <p className="font-medium">Không có dữ liệu hóa đơn</p>
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
                  {bill.items.map((item: BillItem) => (
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

                <div className="mt-4 border-t-2 border-dashed border-primary-300 bg-white/80 px-2 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-700">Tổng cộng</span>
                    <span className="text-red-700">
                      {formatCurrency(bill.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
