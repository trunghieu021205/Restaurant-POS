"use client";

import type { PaymentNotification } from "@/services/staffTables";

// Helper functions
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

function paymentMethodLabel(method?: string, type?: string) {
  if (method === "online_qr" || type === "online_qr_payment")
    return "Thanh toán trực tuyến (QR)";
  return "Tiền mặt / thẻ tại quầy";
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
  notification: PaymentNotification;
  onClose: () => void;
  onComplete?: (id: string) => void;
  isCompleting?: boolean;
}

export default function PaymentDetailModal({
  notification,
  onClose,
  onComplete,
  isCompleting,
}: Props) {
  const id = notificationId(notification);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-lg rounded-card bg-white p-5 shadow-modal">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary-700">
              Bàn {notificationTableNumber(notification)}
            </p>
            <h2 className="text-xl font-bold text-neutral-900">
              Chi tiết thanh toán
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600"
          >
            Đóng
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-btn bg-neutral-50 p-3">
            <dt className="text-neutral-500">Mã hóa đơn</dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {notificationBillCode(notification)}
            </dd>
          </div>
          <div className="rounded-btn bg-neutral-50 p-3">
            <dt className="text-neutral-500">Số tiền</dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {formatMoney(notificationAmount(notification))}
            </dd>
          </div>
          <div className="rounded-btn bg-neutral-50 p-3">
            <dt className="text-neutral-500">Phương thức</dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {paymentMethodLabel(notification.method, notification.type)}
            </dd>
          </div>
          <div className="rounded-btn bg-neutral-50 p-3">
            <dt className="text-neutral-500">Trạng thái</dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {paymentStatusLabel(notification.paymentStatus)}
            </dd>
          </div>
          <div className="rounded-btn bg-neutral-50 p-3 sm:col-span-2">
            <dt className="text-neutral-500">Thời gian</dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {formatTime(notification.paidAt || notification.createdAt)}
            </dd>
          </div>
          {notification.transactionId && (
            <div className="rounded-btn bg-neutral-50 p-3 sm:col-span-2">
              <dt className="text-neutral-500">Mã giao dịch</dt>
              <dd className="mt-1 break-all font-semibold text-neutral-900">
                {notification.transactionId}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {notification.type === "cash_payment_request" &&
            notification.paymentStatus !== "completed" &&
            onComplete && (
              <button
                onClick={() => onComplete(id)}
                disabled={isCompleting}
                className="rounded-btn bg-success-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                Xác nhận đã nhận thanh toán
              </button>
            )}
          <button
            onClick={onClose}
            className="rounded-btn border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
