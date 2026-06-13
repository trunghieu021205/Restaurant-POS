"use client";

import { useState } from "react";

interface Props {
  table: { number: number };
  onClose: () => void;
  onSubmit: (note: string) => void;
}

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
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Lý do hoặc ghi chú xác nhận"
          className="mt-4 min-h-24 w-full rounded-btn border border-neutral-200 px-3 py-2"
        />
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
            className="rounded-btn bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            Xác nhận mở khóa
          </button>
        </div>
      </form>
    </div>
  );
}
