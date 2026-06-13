import type { OrderStatus } from "@/services/orders";

const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Chờ xác nhận",
      className: "bg-warning-500/10 text-warning-500 border-warning-500/20",
    },
    confirmed: {
      label: "Đang chuẩn bị",
      className: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    },
    delivered: {
      label: "Đã giao món",
      className: "bg-success-500/10 text-success-500 border-success-500/20",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-error-500/10 text-error-500 border-error-500/20",
    },
  };

const fallback = {
  label: "Trạng thái không xác định",
  className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export default function OrderStatusBadge({
  status,
}: {
  // Trong thực tế có thể nhận status không thuộc union (API/DB mapping)
  status: OrderStatus | string | undefined | null;
}) {
  const config =
    status && statusConfig[status as OrderStatus]
      ? statusConfig[status as OrderStatus]
      : fallback;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
