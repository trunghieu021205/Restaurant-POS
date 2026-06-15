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

  // ... rest of your component
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
