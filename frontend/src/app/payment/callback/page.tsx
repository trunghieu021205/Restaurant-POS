"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // This page is only used if VNPAY_RETURN_URL is misconfigured to point to frontend
    // The correct configuration should point VNPAY_RETURN_URL to backend: http://localhost:5000/api/payments/callback
    // If you're seeing this page, please update VNPAY_RETURN_URL in your backend .env file

    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const vnpTxnRef = searchParams.get("vnp_TxnRef");

    if (!vnpResponseCode) {
      setError("Không tìm thấy mã phản hồi từ VNPay");
      return;
    }

    // Forward to backend callback endpoint
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    // Redirect to backend callback
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/payments/callback?${params.toString()}`;
  }, [mounted, searchParams]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
        <p className="mt-4 text-gray-600">Đang chuyển hướng đến cổng thanh toán...</p>
        <p className="mt-2 text-sm text-gray-500">Vui lòng không đóng trang này</p>
      </div>
    </div>
  );
}
