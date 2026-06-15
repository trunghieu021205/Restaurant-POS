"use client";

import { useEffect, useState } from "react";
import { useBillById } from "@/hooks/useBillById";
import { formatCurrency } from "@/lib/utils";
import { useParams } from "next/navigation";
import { Receipt } from "lucide-react";

export default function BillPrintPage() {
  const params = useParams();
  const billId = params.id as string;
  const { data: bill, isLoading, isError } = useBillById(billId);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Auto-print when page loads
    if (bill && isClient) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [bill, isClient]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Đang tải hóa đơn...</p>
      </div>
    );
  }

  if (isError || !bill) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-600">Không thể tải hóa đơn</p>
      </div>
    );
  }

  const printedAt = bill.paidAt ? new Date(bill.paidAt) : new Date();
  const formattedDateTime = printedAt.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div
        id="printable-bill"
        className="mx-auto max-w-2xl rounded-lg bg-white shadow-lg"
      >
        <div className="border-b-2 border-dashed border-gray-300 px-6 pb-3 pt-4 text-center">
          <h1 className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900">
            <Receipt className="h-6 w-6" />
            Hóa đơn thanh toán
          </h1>
          <p className="mt-1 text-sm text-gray-800">Nhà hàng NGON</p>
          <p className="text-xs text-gray-600">
            123 Đường Ẩm Thực, TP. Hồ Chí Minh
          </p>
          <div className="mt-2 flex justify-center gap-6 text-sm text-gray-700">
            <span className="font-medium">
              Bàn số: {bill.tableNumber ?? "—"}
            </span>
            <span>{formattedDateTime}</span>
          </div>
        </div>
        {/* Items section */}
        <div className="px-4 py-2">
          <div className="rounded-lg bg-white p-4 shadow-sm">
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

            {/* Summary section - matches BillSheet component */}
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
        </div>

        {/* Total section */}
        <div className="border-t-2 border-dashed border-gray-300 bg-white/80 px-6 py-4">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-700">Tổng cộng</span>
            <span className="text-red-700">
              {formatCurrency(bill.totalAmount)}
            </span>
          </div>
          {bill.paymentMethod && (
            <div className="mt-2 text-sm text-gray-600">
              Phương thức thanh toán:{" "}
              {bill.paymentMethod === "cash"
                ? "Tiền mặt"
                : "Thanh toán trực tuyến"}
            </div>
          )}
        </div>

        {/* Print button for manual printing */}
        <div className="px-6 py-4">
          <button
            onClick={() => window.print()}
            className="w-full rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            In hóa đơn
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          html,
          body {
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .min-h-screen {
            min-height: 0 !important;
            height: auto !important;
            padding: 0 !important;
            background: white !important;
          }
          #printable-bill {
            box-shadow: none;
            border-radius: 0;
            max-width: 100%;
            margin: 0;
          }
          button {
            display: none !important;
          }
          @page {
            margin: 0.5cm;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
