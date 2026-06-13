"use client";

import { motion } from "framer-motion";
import type { KitchenOrder, OrderStatus } from "@/services/orders";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderCardProps {
  order: KitchenOrder;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  isUpdating?: boolean;
}

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: "confirmed",
  confirmed: "delivered",
  delivered: null,
  cancelled: null,
};

const actionLabels: Partial<Record<OrderStatus, string>> = {
  pending: "Xác nhận",
  confirmed: "Giao món",
};

const actionButtonClass: Partial<Record<OrderStatus, string>> = {
  pending:
    "bg-warning-500 hover:bg-warning-600 focus:ring-warning-500/50 text-white",
  confirmed:
    "bg-success-500 hover:bg-success-600 focus:ring-success-500/50 text-white",
};

export default function OrderCard({
  order,
  onStatusChange,
  isUpdating,
}: OrderCardProps) {
  const next = nextStatus[order.status];
  const formattedTime = new Date(order.createdAt).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-card shadow-card flex flex-col gap-2.5 border border-gray-100 h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-3 pt-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
            #{order.orderNumber}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-tight">
            Bàn {order.tableNumber} · {formattedTime}
          </p>
        </div>
        <div className="shrink-0">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-3" />

      {/* Items */}
      <ul className="flex-1 space-y-1.5 px-3">
        {order.items.map((item) => (
          <li key={item.id} className="text-sm">
            <div className="flex justify-between items-baseline gap-2">
              <span className="font-medium text-gray-800 text-xs leading-snug min-w-0 wrap-break-words">
                {item.name}
              </span>
              <span className="text-gray-500 text-xs shrink-0 font-medium">
                ×{item.quantity}
              </span>
            </div>
            {item.notes && (
              <div className="mt-1 flex items-start gap-1 rounded bg-sky-50 border-l-2 border-sky-400 px-2 py-1">
                <p className="text-[11px] text-sky-700 font-medium leading-relaxed wrap-break-words min-w-0">
                  {item.notes}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Action button */}
      {next ? (
        <div className="px-3 pb-3">
          <button
            onClick={() => onStatusChange(order.id, next)}
            disabled={isUpdating}
            className={`w-full py-2.5 px-3 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed min-h-11 ${actionButtonClass[order.status]}`}
          >
            {isUpdating ? "Đang cập nhật..." : actionLabels[order.status]}
          </button>
        </div>
      ) : (
        <div className="pb-3" />
      )}
    </motion.div>
  );
}
