"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Loader2, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function PaymentProcessingContent() {
  const searchParams = useSearchParams();
  const paymentUrl = searchParams.get("paymentUrl");
  const amount = searchParams.get("amount");
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !paymentUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = paymentUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, paymentUrl]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!paymentUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">Không tìm thấy thông tin thanh toán</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="rounded-lg border border-blue-200 bg-white p-8 shadow-lg">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <CreditCard className="h-16 w-16 text-blue-600" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            Đang chuyển hướng đến cổng thanh toán
          </h1>
          <p className="mb-8 text-center text-gray-600">
            Bạn sẽ được chuyển đến VNPay để hoàn tất thanh toán
          </p>

          {amount && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600">Số tiền thanh toán</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(parseFloat(amount))}
              </p>
            </div>
          )}

          <div className="mb-6 flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-gray-600">
              Tự động chuyển sau {countdown} giây...
            </p>
          </div>

          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition-opacity hover:opacity-90"
          >
            <ExternalLink className="mr-2 inline h-4 w-4" />
            Chuyển ngay đến VNPay
          </a>

          <div className="mt-6 rounded-lg border border-primary-200 bg-primary-50 p-4">
            <p className="text-sm text-primary-800">
              <strong>Lưu ý:</strong> Sau khi thanh toán xong, vui lòng không
              đóng trang này. Hệ thống sẽ tự động chuyển bạn về trang kết quả.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentProcessingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={<PaymentProcessingFallback />}>
      <PaymentProcessingContent />
    </Suspense>
  );
}
