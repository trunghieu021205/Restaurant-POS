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
  confirmed: "cooking",
  cooking: "done",
  done: null,
  cancelled: null,
};

const actionLabels: Partial<Record<OrderStatus, string>> = {
  pending: "Xác nhận",
  confirmed: "Bắt đầu nấu",
  cooking: "Hoàn thành",
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-card shadow-card p-4 flex flex-col gap-3 border border-gray-100 h-full"
    >
      <div className="flex justify-between items-center gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            Đơn #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500">
            Bàn số {order.tableNumber} • {formattedTime}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="space-y-1.5 flex-1">
        {order.items.map((item) => (
          <li key={item.id} className="text-sm">
            <div className="flex justify-between gap-2">
              <span className="font-medium text-gray-800">{item.name}</span>
              <span className="text-gray-600">x{item.quantity}</span>
            </div>
            {item.notes && (
              <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>
            )}
          </li>
        ))}
      </ul>

      {next && (
        <button
          onClick={() => onStatusChange(order.id, next)}
          disabled={isUpdating}
          className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUpdating ? "Đang cập nhật..." : actionLabels[order.status]}
        </button>
      )}
    </motion.div>
  );
}
