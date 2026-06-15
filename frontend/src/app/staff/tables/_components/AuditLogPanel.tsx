"use client";

import { useState, useMemo } from "react";

function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    reserve: "Đặt trước",
    unlock: "Mở khóa",
    check_in: "Check-in",
    status_change: "Đổi trạng thái",
    payment_assist: "Hỗ trợ thanh toán",
    cash_payment_completed: "Thanh toán tiền mặt thành công",
    online_payment_success: "Thanh toán trực tuyến thành công",
  };
  return labels[action] || action;
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    available: "Bàn trống",
    occupied: "Đang sử dụng",
    reserved: "Đã đặt trước",
    maintenance: "Bảo trì",
  };
  return status ? map[status] || status : "-";
}

function unlockReasonLabel(reason?: string) {
  const map: Record<string, string> = {
    system_error: "Lỗi hệ thống",
    customer_change_table: "Khách muốn đổi bàn",
  };
  return reason ? map[reason] || reason : "";
}

interface AuditLog {
  _id: string;
  action: string;
  tableId?: { number: number };
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  staffId?: { name?: string };
  createdAt: string;
}

interface Props {
  logs: AuditLog[];
  allTableNumbers: number[]; // danh sách tất cả số bàn (từ tablesQuery)
}

export default function AuditLogPanel({ logs, allTableNumbers }: Props) {
  const [selectedTable, setSelectedTable] = useState<number | "all">("all");

  // Hợp nhất các số bàn: từ logs + từ danh sách bàn thực tế, sắp xếp
  const tableNumbers = useMemo(() => {
    const fromLogs = new Set(
      logs.map((log) => log.tableId?.number).filter(Boolean) as number[],
    );
    const merged = new Set([...allTableNumbers, ...fromLogs]);
    return Array.from(merged).sort((a, b) => a - b);
  }, [logs, allTableNumbers]);

  // Lọc và sắp xếp log theo bàn được chọn
  const displayedLogs = useMemo(() => {
    let filtered = logs;
    if (selectedTable !== "all") {
      filtered = logs.filter((log) => log.tableId?.number === selectedTable);
    }
    return [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [logs, selectedTable]);

  return (
    <section className="rounded-card border border-neutral-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-neutral-900">Lịch sử thao tác</h2>
        <select
          className="rounded-btn border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
          value={selectedTable}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedTable(val === "all" ? "all" : Number(val));
          }}
        >
          <option value="all">Tất cả bàn</option>
          {tableNumbers.map((num) => (
            <option key={num} value={num}>
              Bàn {num}
            </option>
          ))}
        </select>
      </div>

      {displayedLogs.length === 0 ? (
        <p className="text-sm text-neutral-500">
          {selectedTable === "all"
            ? "Chưa có thao tác nào."
            : `Chưa có thao tác nào cho bàn ${selectedTable}.`}
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-1">
          <div className="space-y-2 text-sm">
            {displayedLogs.map((log) => (
              <div
                key={log._id}
                className="border-b border-neutral-100 pb-2 last:border-0"
              >
                <p className="font-medium text-neutral-800">
                  Bàn {log.tableId?.number}: {auditActionLabel(log.action)}
                </p>
                <p className="text-xs text-neutral-500">
                  {statusLabel(log.fromStatus)} → {statusLabel(log.toStatus)}{" "}
                  lúc {new Date(log.createdAt).toLocaleString("vi-VN")}
                  {log.staffId?.name && ` bởi ${log.staffId.name}`}
                </p>
                {log.action === 'unlock' && log.note && (
                  <p className="mt-1 text-xs text-neutral-600 italic">
                    Lý do: {unlockReasonLabel(log.note)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
