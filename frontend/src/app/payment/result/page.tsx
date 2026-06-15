"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle, Info, Loader2, Receipt } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTransactionById } from "@/services/payment";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

function PaymentResultContent() {
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

  const isSuccess = transaction.status === "SUCCESS";

  return (
    <div
      className={`min-h-screen bg-linear-to-b ${isSuccess ? "from-green-50" : "from-primary-50"} to-white px-4 py-12`}
    >
      {/* ... rest of your JSX */}
    </div>
  );
}

function PaymentResultFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultFallback />}>
      <PaymentResultContent />
    </Suspense>
  );
}
