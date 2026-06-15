"use client";

import { ReceiptText, CheckCircle2, Printer } from "lucide-react";
import type { PaymentNotification } from "@/services/staffTables";

// Helper functions (giữ nguyên)
function notificationId(item: PaymentNotification) {
  return item.id || item._id || "";
}

function notificationTableNumber(item: PaymentNotification) {
  return (
    item.tableNumber ||
    (typeof item.tableId === "object" ? item.tableId.number : "-")
  );
}

function notificationBillCode(item: PaymentNotification) {
  if (item.billCode) return item.billCode;
  const billId =
    typeof item.billId === "string" ? item.billId : item.billId?._id;
  return billId ? billId.slice(-8).toUpperCase() : "-";
}

function notificationAmount(item: PaymentNotification) {
  if (typeof item.amount === "number") return item.amount;
  return typeof item.billId === "object" ? item.billId.totalAmount : 0;
}

function paymentTypeLabel(type: string) {
  const labels: Record<string, string> = {
    cash_payment_request: "Yêu cầu thanh toán tiền mặt",
    online_qr_payment: "Thanh toán trực tuyến (QR)",
    request_payment: "Yêu cầu thanh toán",
    qr_payment: "Thanh toán QR",
    online_payment: "Thanh toán online",
  };
  return labels[type] || type;
}

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    requested: "Đã gửi yêu cầu",
    pending: "Đang chờ",
    paid: "Đã thanh toán",
    success: "Thành công",
    assisted: "Đã hỗ trợ",
    completed: "Hoàn tất",
  };
  return labels[status] || status;
}

function formatMoney(value: number) {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatTime(value?: string) {
  return value ? new Date(value).toLocaleString("vi-VN") : "-";
}

interface Props {
  item: PaymentNotification;
  isUnprocessed: boolean;
  onOpenBill: (item: PaymentNotification) => void;
  onAssist: (id: string) => void;
  onComplete: (id: string) => void;
  onPrint: (item: PaymentNotification) => void;
  isProcessing: boolean;
}

export default function PaymentNotificationItem({
  item,
  isUnprocessed,
  onOpenBill,
  onAssist,
  onComplete,
  onPrint,
  isProcessing,
}: Props) {
  const id = notificationId(item);
  const isAssisted = item.paymentStatus === "assisted";

  // Xác định label & hành động cho nút chính
  const mainButtonLabel = isAssisted ? "Hoàn tất" : "Đã hỗ trợ";
  const mainButtonAction = () => {
    if (isAssisted) {
      onComplete(id);
    } else {
      onAssist(id);
    }
  };
  const mainButtonClass = isAssisted
    ? "bg-success-500"
    : "bg-primary-600 hover:bg-primary-700";

  return (
    <div
      className={`rounded-btn border p-3 text-sm transition ${
        isUnprocessed
          ? "border-l-4 border-l-primary-500 bg-primary-50 border-primary-200 shadow-sm"
          : "border-neutral-200 bg-white opacity-75"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-neutral-900">
          Bàn {notificationTableNumber(item)}
          {isUnprocessed && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              <span className="h-2 w-2 rounded-full bg-error-500 animate-pulse" />
              Mới
            </span>
          )}
        </p>
        <span
          className={`text-xs font-medium ${isUnprocessed ? "text-primary-700" : "text-neutral-500"}`}
        >
          {paymentStatusLabel(item.paymentStatus)}
        </span>
      </div>
      <p className="text-neutral-500">
        {paymentTypeLabel(item.type)} lúc {formatTime(item.createdAt)}
      </p>
      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
        <p className="text-xs text-neutral-500">
          Mã hóa đơn
          <span className="ml-1 font-semibold text-neutral-800">
            {notificationBillCode(item)}
          </span>
        </p>
        <p className="text-xs text-neutral-500 text-right">
          Số tiền
          <span className="ml-1 font-semibold text-neutral-800">
            {formatMoney(notificationAmount(item))}
          </span>
        </p>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => onOpenBill(item)}
          className="flex-1 rounded-btn border border-neutral-200 px-2 py-1.5 text-xs"
        >
          <ReceiptText className="mr-1 inline" size={13} /> Hoá đơn
        </button>

        {/* Nút chính: Đã hỗ trợ / Hoàn tất */}
        <button
          onClick={mainButtonAction}
          disabled={isProcessing}
          className={`flex-1 rounded-btn px-2 py-1.5 text-xs text-white disabled:opacity-60 ${mainButtonClass}`}
        >
          {isAssisted && <CheckCircle2 className="mr-1 inline" size={13} />}
          {mainButtonLabel}
        </button>
      </div>
    </div>
  );
}
