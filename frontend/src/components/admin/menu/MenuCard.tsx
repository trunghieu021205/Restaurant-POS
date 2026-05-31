// components/admin/menu/MenuCard.tsx
"use client";

import { MenuItem } from "@/types/menu";
import { Edit, Trash2, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MenuCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export function MenuCard({ item, onEdit, onDelete }: MenuCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const hasImage = item.image && item.image !== "";

  return (
    <div className="group bg-white rounded-radius-card shadow-card hover:shadow-card-hover transition-all border border-neutral-100 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-neutral-100">
        {hasImage ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              item.status === "available"
                ? "bg-black/80 text-success-600"
                : "bg-black/80 text-error-600"
            }`}
          >
            <Circle
              className={`w-2 h-2 fill-current ${
                item.status === "available"
                  ? "text-success-500"
                  : "text-error-500"
              }`}
            />
            {item.status === "available" ? "Còn món" : "Hết món"}
          </span>
        </div>
        {/* Action buttons - show on hover */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              onEdit(item);
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-primary-50 text-neutral-600 hover:text-primary-600 transition-colors"
            title="Sửa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(item);
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-error-50 text-neutral-600 hover:text-error-600 transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-neutral-800 line-clamp-2 leading-tight">
            {item.name}
          </h3>
        </div>
        <p className="text-sm text-neutral-500 line-clamp-2 mb-3 flex-1">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-50">
          <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
            {item.category}
          </span>
          <span className="font-bold text-primary-600">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
