"use client";

import { useState } from "react";

interface Props {
  table: { number: number };
  onClose: () => void;
  onSubmit: (note: string) => void;
}

const UNLOCK_REASONS = [
  { value: "system_error", label: "Lỗi hệ thống" },
  { value: "customer_change_table", label: "Khách muốn đổi bàn" },
  { value: "customer_cancel_reservation", label: "Khách huỷ đặt trước" },
];

export default function UnlockTableModal({ table, onClose, onSubmit }: Props) {
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(note);
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-card bg-white p-5 shadow-modal"
      >
        <h2 className="text-lg font-bold text-neutral-900">
          Mở khóa bàn {table.number}?
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Thao tác này chuyển bàn về trạng thái Bàn trong và ghi lại lịch sử
          nhân viên thực hiện.
        </p>
        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Lý do mở khóa
          </label>
          <select
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
            className="w-full rounded-btn border border-neutral-200 px-3 py-2 text-sm"
          >
            <option value="">Chọn lý do...</option>
            {UNLOCK_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-btn border border-neutral-200 px-4 py-2 text-sm"
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={!note}
            className="rounded-btn bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            Xác nhận mở khóa
          </button>
        </div>
      </form>
    </div>
  );
}
