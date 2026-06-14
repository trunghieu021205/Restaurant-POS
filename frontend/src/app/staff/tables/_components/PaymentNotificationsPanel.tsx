"use client";

import { useMemo } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import PaymentNotificationItem from "./PaymentNotificationItem";
import type { PaymentNotification } from "@/services/staffTables";

interface Props {
  notifications: PaymentNotification[];
  cashPendingCount: number;
  onSelectNotification: (n: PaymentNotification) => void;
  onOpenCashBill: (billId: string) => void;
  onAssist: (id: string) => void;
  onComplete: (id: string) => void;
  onPrint: (item: PaymentNotification) => void;
  isProcessing: boolean; // trạng thái loading từ mutation
}

export default function PaymentNotificationsPanel({
  notifications,
  cashPendingCount,
  onSelectNotification,
  onOpenCashBill,
  onAssist,
  onComplete,
  onPrint,
  isProcessing,
}: Props) {
  const router = useRouter();

  const unprocessedCount = useMemo(() => {
    return notifications.filter(
      (n) => n.paymentStatus === "requested" || n.paymentStatus === "pending"
    ).length;
  }, [notifications]);

  const sorted = useMemo(() => {
    return [...notifications]
      .filter((n) =>
        ["requested", "pending", "assisted"].includes(n.paymentStatus)
      )
      .sort((a, b) => {
        const priority: Record<string, number> = {
          requested: 0,
          pending: 1,
          assisted: 2,
        };
        return (priority[a.paymentStatus] ?? 3) - (priority[b.paymentStatus] ?? 3);
      })
      .slice(0, 8);
  }, [notifications]);

  const handleOpenBill = (item: PaymentNotification) => {
    if (item.type === "cash_payment_request") {
      const billId =
        typeof item.billId === "object" ? item.billId._id : item.billId || "";
      onOpenCashBill(billId);
      return;
    }
    onSelectNotification(item);
  };

  return (
    <section className="rounded-card border border-neutral-200 bg-white p-4 shadow-card">
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-neutral-900">
        <Bell size={18} /> Yêu cầu thanh toán
        {unprocessedCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {unprocessedCount} mới
          </span>
        )}
      </h2>

      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          Mặc định hiển thị các yêu cầu chưa hoàn tất (pending/assisted).
        </p>
        <button
          onClick={() => router.push("/staff/paid-bills-today")}
          className="rounded-btn bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
        >
          Xem bill đã thanh toán
        </button>
      </div>

      {cashPendingCount > 0 && (
        <p className="-mt-2 mb-3 text-sm text-neutral-600">
          Tiền mặt đang chờ xử lý:{" "}
          <span className="font-semibold">{cashPendingCount}</span>
        </p>
      )}

      <div className="max-h-96 overflow-y-auto pr-1">
        <div className="space-y-3">
          {sorted.map((item) => (
            <PaymentNotificationItem
              key={item.id || item._id}
              item={item}
              isUnprocessed={
                item.paymentStatus === "requested" ||
                item.paymentStatus === "pending"
              }
              onOpenBill={handleOpenBill}
              onAssist={onAssist}
              onComplete={onComplete}
              onPrint={onPrint}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      </div>
    </section>
  );
}