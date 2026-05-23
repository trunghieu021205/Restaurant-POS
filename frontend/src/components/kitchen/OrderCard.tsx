// components/kitchen/OrderCard.tsx
"use client";
import { motion } from "framer-motion";
import { Order, OrderStatus } from "@/data/dummyOrders";
import OrderStatusBadge from "./OrderStatusBadge";
import { toast } from "@/lib/toast";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  new: "preparing",
  preparing: "done",
  done: null,
};

const actionLabels: Record<string, string> = {
  new: "Nhận đơn",
  preparing: "Hoàn thành",
};

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const next = nextStatus[order.status];

  const handleAction = () => {
    if (!next) return;
    onStatusChange(order.id, next);
    toast.success(
      `Đơn ${order.id} chuyển sang "${next === "preparing" ? "Đang chế biến" : "Hoàn thành"}"`,
    );
  };

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">Đơn #{order.id}</h3>
          <p className="text-sm text-gray-500">
            Bàn {order.tableId} • {formattedTime}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Danh sách món */}
      <ul className="space-y-1.5 flex-1">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>
              {item.name} x{item.quantity}
              {item.notes && (
                <span className="text-gray-400 ml-1">({item.notes})</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* Hành động */}
      {next && (
        <button
          onClick={handleAction}
          className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          {actionLabels[order.status]}
        </button>
      )}
    </motion.div>
  );
}
