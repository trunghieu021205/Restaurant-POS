"use client";
import type { OrderStatus } from "@/services/orders";

interface OrderFilterProps {
  selected: OrderStatus | "all";
  onFilterChange: (status: OrderStatus | "all") => void;
}

const tabs: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Mới" },
  { value: "confirmed", label: "Đang làm" },
  { value: "delivered", label: "Đã giao" },
];

export default function OrderFilter({
  selected,
  onFilterChange,
}: OrderFilterProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5 w-full">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={`py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors min-h-9 ${
            selected === tab.value
              ? "bg-primary-500 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
