"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionById } from "@/services/payment";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const reason = searchParams.get("reason");
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

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50 to-white px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-red-200 bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Thanh toán thất bại
          </h1>
          <p className="mb-8 text-center text-gray-600">
            {reason || "Giao dịch thanh toán không thành công"}
          </p>

          {transaction && (
            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-600">Mã giao dịch</span>
                <span className="font-mono font-medium text-gray-900">
                  {transaction.transactionCode}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-600">Số tiền</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-600">Trạng thái</span>
                <span className="font-medium text-red-600">
                  {transaction.status === "FAILED"
                    ? "Thất bại"
                    : transaction.status}
                </span>
              </div>

              {transaction.gatewayMessage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Lý do</span>
                  <span className="font-medium text-gray-900">
                    {transaction.gatewayMessage}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 space-y-3">
            <Button
              className="w-full"
              onClick={() => {
                if (typeof window !== "undefined" && transaction) {
                  window.location.href = `/table/${transaction.tableId}`;
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử thanh toán lại
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.history.back();
                }
              }}
            >
              Quay lại
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
            <div className="text-sm text-primary-800">
              <p className="font-medium">Gặp vấn đề?</p>
              <p className="mt-1">
                Nếu bạn đã bị trừ tiền nhưng thanh toán vẫn thất bại, vui lòng
                liên hệ nhân viên để được hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentFailureFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<PaymentFailureFallback />}>
      <PaymentFailureContent />
    </Suspense>
  );
}
