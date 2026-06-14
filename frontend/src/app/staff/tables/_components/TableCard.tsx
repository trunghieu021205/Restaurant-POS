"use client";

import { Users, LockOpen } from "lucide-react";
import type { StaffTable, TableStatus } from "@/services/staffTables";

const statusStyles: Record<
  TableStatus,
  { label: string; card: string; dot: string }
> = {
  available: {
    label: "Bàn trống",
    card: "border-emerald-200 bg-emerald-50",
    dot: "bg-emerald-500",
  },
  occupied: {
    label: "Đang sử dụng",
    card: "border-red-200 bg-red-50",
    dot: "bg-red-500",
  },
  reserved: {
    label: "Đã đặt trước",
    card: "border-primary-200 bg-primary-50",
    dot: "bg-primary-500",
  },
  maintenance: {
    label: "Bảo trì",
    card: "border-neutral-300 bg-neutral-100",
    dot: "bg-neutral-500",
  },
  cleaning: {
    label: "Đang dọn",
    card: "border-blue-200 bg-blue-50",
    dot: "bg-blue-500",
  },
};

function formatMoney(value: number) {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatTime(value?: string) {
  return value ? new Date(value).toLocaleString("vi-VN") : "-";
}

interface Props {
  table: StaffTable;
  onReserve: (table: StaffTable) => void;
  onUnlock: (table: StaffTable) => void;
}

export default function TableCard({ table, onReserve, onUnlock }: Props) {
  const styles = statusStyles[table.status];

  return (
    <section className={`rounded-card border p-4 shadow-card ${styles.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">Bàn</p>
          <h2 className="text-3xl font-bold text-neutral-900">
            {table.number}
          </h2>
        </div>
        <span className="rounded-btn bg-white/80 px-2 py-1 text-xs font-semibold text-neutral-700">
          {styles.label}
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm text-neutral-700">
        <p className="flex items-center gap-2">
          <Users size={15} /> {table.customerName || "Chưa có khách"}
        </p>
        <p>{table.customerPhone || "Chưa có số điện thoại"}</p>
        <p>Check-in: {formatTime(table.checkedInAt)}</p>
        <p>Đặt trước: {formatTime(table.reservedAt)}</p>
        <p className="font-semibold">
          Tổng bill hiện tại: {formatMoney(table.totalAmount || 0)}
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onReserve(table)}
          disabled={table.status === "occupied" || table.status === "maintenance"}
          className="flex-1 rounded-btn border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50"
        >
          Đặt trước
        </button>
        <button
          onClick={() => onUnlock(table)}
          disabled={table.billStatus === "open" || table.status === "maintenance"}
          className="flex-1 rounded-btn bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50"
        >
          <LockOpen className="mr-1 inline" size={15} /> Mở khóa
        </button>
      </div>
    </section>
  );
}
