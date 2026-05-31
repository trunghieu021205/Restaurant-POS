// components/kitchen/OrderFilter.tsx
"use client";
import { OrderStatus } from "@/data/dummyOrders";

interface OrderFilterProps {
  selected: OrderStatus | "all";
  onFilterChange: (status: OrderStatus | "all") => void;
}

const tabs: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "new", label: "Mới" },
  { value: "preparing", label: "Đang chế biến" },
  { value: "done", label: "Hoàn thành" },
];

export default function OrderFilter({
  selected,
  onFilterChange,
}: OrderFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onFilterChange(tab.value)}
          className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
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
