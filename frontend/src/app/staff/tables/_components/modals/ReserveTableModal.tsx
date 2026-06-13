"use client";

import { useState } from "react";

interface Props {
  table: { number: number };
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}

export default function ReserveTableModal({
  table,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(customerName, customerPhone);
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-card bg-white p-5 shadow-modal"
      >
        <h2 className="text-lg font-bold text-neutral-900">
          Đặt trước bàn {table.number}
        </h2>
        <div className="mt-4 space-y-3">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            placeholder="Tên khách hàng"
            className="w-full rounded-btn border border-neutral-200 px-3 py-2"
          />
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            placeholder="Số điện thoại"
            className="w-full rounded-btn border border-neutral-200 px-3 py-2"
          />
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
            disabled={isLoading}
            className="rounded-btn bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          >
            Đặt trước
          </button>
        </div>
      </form>
    </div>
  );
}
