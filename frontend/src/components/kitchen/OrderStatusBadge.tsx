import type { OrderStatus } from "@/services/orders";

const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Chờ bếp",
      className: "bg-warning-500/10 text-warning-500 border-warning-500/20",
    },
    confirmed: {
      label: "Đã xác nhận",
      className: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    },
    cooking: {
      label: "Đang chế biến",
      className: "bg-primary-500/10 text-primary-500 border-primary-500/20",
    },
    done: {
      label: "Hoàn thành",
      className: "bg-success-500/10 text-success-500 border-success-500/20",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-error-500/10 text-error-500 border-error-500/20",
    },
  };

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
