"use client";
import { useState } from "react";
import useCartStore from "@/stores/cart";
import type { MenuItem } from "@/types/menu";
import { showSuccessToast } from "@/lib/toast";
import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem(item.id, quantity, note.trim() || undefined);
    showSuccessToast(`Đã thêm ${quantity} ${item.name} vào giỏ hàng`);
    setQuantity(1);
    setNote("");
  };

  const imageSrc =
    item.imageUrl && item.imageUrl !== "" ? item.imageUrl : "/placeholder.jpg";

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col">
      {/* Ảnh */}
      <div className="relative h-36 sm:h-44 overflow-hidden">
        <img
          src={imageSrc}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Nội dung */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        {/* Tên + mô tả */}
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-neutral-800 line-clamp-1 leading-snug">
            {item.name}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
            {item.description || "Món ngon hấp dẫn"}
          </p>
        </div>

        {/* Giá + số lượng */}
        <div className="flex flex-col xs:flex-row gap-2 items-center xs:justify-between">
          <span className="text-primary-600 font-bold text-sm sm:text-base">
            {formatCurrency(item.price)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuantity((p) => Math.max(1, p - 1))}
              disabled={quantity <= 1}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-semibold tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((p) => Math.min(99, p + 1))}
              disabled={quantity >= 99}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Note — luôn hiển thị */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú: ít cay, không hành..."
          maxLength={120}
          rows={2}
          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200
            focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20
            outline-none resize-none text-neutral-700 placeholder-neutral-300
            bg-neutral-50 transition-all"
        />

        {/* Nút thêm */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-primary-500 hover:bg-primary-600 active:scale-95
            text-white text-xs sm:text-sm py-2 rounded-btn font-medium
            transition-all duration-150 shadow-sm hover:shadow-md"
        >
          + Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
