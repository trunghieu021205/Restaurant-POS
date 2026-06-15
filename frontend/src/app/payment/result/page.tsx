"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Info, Loader2, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionById } from "@/services/payment";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const status = searchParams.get("status");
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

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isLoading) {
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

  const isSuccess = transaction.status === "SUCCESS";

  return (
    <div
      className={`min-h-screen bg-linear-to-b ${isSuccess ? "from-green-50" : "from-primary-50"} to-white px-4 py-12`}
    >
      <div className="mx-auto max-w-md">
        <div
          className={`rounded-lg border ${isSuccess ? "border-green-200" : "border-primary-200"} bg-white p-8 shadow-lg`}
        >
          <div className="mb-6 flex justify-center">
            <div
              className={`rounded-full ${isSuccess ? "bg-green-100" : "bg-primary-100"} p-4`}
            >
              {isSuccess ? (
                <CheckCircle className="h-16 w-16 text-green-600" />
              ) : (
                <Info className="h-16 w-16 text-primary-600" />
              )}
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            {status === "already_processed"
              ? "Giao dịch đã được xử lý"
              : isSuccess
                ? "Thanh toán thành công"
                : "Kết quả thanh toán"}
          </h1>
          <p className="mb-8 text-center text-gray-600">
            {status === "already_processed"
              ? "Giao dịch này đã được xử lý trước đó. Vui lòng kiểm tra trạng thái bên dưới."
              : isSuccess
                ? "Cảm ơn bạn đã thanh toán"
                : "Vui lòng kiểm tra trạng thái giao dịch"}
          </p>

          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Mã giao dịch</span>
              <span className="font-mono font-medium text-gray-900">
                {transaction.transactionCode}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Số tiền</span>
              <span
                className={`font-bold ${isSuccess ? "text-green-600" : "text-gray-900"}`}
              >
                {formatCurrency(transaction.amount)}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Trạng thái</span>
              <span
                className={`font-medium ${isSuccess ? "text-green-600" : "text-primary-600"}`}
              >
                {transaction.status === "SUCCESS"
                  ? "Thành công"
                  : transaction.status === "FAILED"
                    ? "Thất bại"
                    : transaction.status === "PENDING"
                      ? "Đang xử lý"
                      : transaction.status === "EXPIRED"
                        ? "Hết hạn"
                        : transaction.status}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Phương thức</span>
              <span className="font-medium text-gray-900">
                {transaction.paymentGateway === "vnpay" ? "VNPay" : "QR"}
              </span>
            </div>

            <div className="flex justify-between border-b border-gray-200 pb-3">
              <span className="text-gray-600">Bàn số</span>
              <span className="font-medium text-gray-900">
                {transaction.tableNumber || transaction.tableId}
              </span>
            </div>

            {transaction.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian thanh toán</span>
                <span className="font-medium text-gray-900">
                  {new Date(transaction.paidAt).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <Button
              className="w-full"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = `/table/${transaction.tableId}`;
                }
              }}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Xem hóa đơn
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.close();
                }
              }}
            >
              Đóng trang
            </Button>
          </div>
        </div>

        {status === "already_processed" && (
          <div className="mt-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
              <div className="text-sm text-primary-800">
                <p className="font-medium">Giao dịch đã được xử lý</p>
                <p className="mt-1">
                  Giao dịch này đã được xử lý trước đó, có thể do bạn đã tải lại
                  trang hoặc gửi yêu cầu thanh toán nhiều lần. Vui lòng kiểm tra
                  trạng thái giao dịch bên dưới.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
