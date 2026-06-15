"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionById } from "@/services/payment";
import { getBillReceipt } from "@/services/bill";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: transaction,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment-transaction", transactionId],
    queryFn: () => getTransactionById(transactionId!),
    enabled: mounted && !!transactionId,
  });

  const { data: bill } = useQuery({
    queryKey: ["bill-receipt", transaction?.billId],
    queryFn: () => getBillReceipt(transaction!.billId),
    enabled: !!transaction?.billId,
  });

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">Không thể tải thông tin giao dịch</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-green-200 bg-white p-8 shadow-lg">
          {/* Header */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Thanh toán thành công
          </h1>
          <p className="mb-8 text-center text-gray-600">
            Cảm ơn bạn đã thanh toán
          </p>

          {/* Thông tin giao dịch */}
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Mã giao dịch</span>
              <span className="font-mono font-medium text-gray-900">
                {transaction.transactionCode}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Bàn số</span>
              <span className="font-medium text-gray-900">
                {transaction.tableNumber || transaction.tableId}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Phương thức</span>
              <span className="font-medium text-gray-900">
                {transaction.paymentGateway === "vnpay" ? "VNPay" : "QR"}
              </span>
            </div>
            {transaction.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian</span>
                <span className="font-medium text-gray-900">
                  {new Date(transaction.paidAt).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>

          {/* Chi tiết hoá đơn */}
          {bill && (
            <div className="mt-6">
              <h2 className="mb-3 font-semibold text-gray-900">
                Chi tiết hoá đơn
              </h2>
              <div className="space-y-2">
                {bill.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name}{" "}
                      <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(bill.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (8%)</span>
                  <span>{formatCurrency(bill.vatAmount)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(bill.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-green-600">
                    {formatCurrency(bill.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = "/")}
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccessFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
