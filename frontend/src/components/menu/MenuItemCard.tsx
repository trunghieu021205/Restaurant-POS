"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useCartStore from "@/stores/cart";
import type { MenuItem } from "@/types/menu";
import { toast, showSuccessToast } from "@/lib/toast";
import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = async () => {
    if (item.isAvailable === false || isAdding) return;

    setIsAdding(true);
    try {
      await addItem(item.id, quantity, note.trim() || undefined);
      showSuccessToast(`Đã thêm ${quantity} ${item.name} vào giỏ hàng`);
      setQuantity(1);
      setNote("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const isUnavailable =
        message.includes("MENU_ITEM_UNAVAILABLE") ||
        message.toLowerCase().includes("da het") ||
        message.toLowerCase().includes("hết");

      if (isUnavailable) {
        toast.error(`${item.name} đã hết món. Menu đang được cập nhật lại.`);
        queryClient.invalidateQueries({ queryKey: ["menu", "today"] });
        return;
      }

      toast.error(message || "Không thể thêm món vào giỏ hàng");
    } finally {
      setIsAdding(false);
    }
  };

  const imageSrc =
    item.imageUrl && item.imageUrl !== ""
      ? item.imageUrl
      : "/menu/placeholder.jpg";

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col">
      <div className="relative h-36 sm:h-44 overflow-hidden">
        <img
          src={imageSrc}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="p-3 flex flex-col flex-1">
        <div className="flex-1 mb-2">
          <h3 className="font-semibold text-sm sm:text-base text-neutral-800 line-clamp-1 leading-snug">
            {item.name}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
            {item.description || "Món ngon hấp dẫn"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row! gap-2 items-center xs:justify-between">
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

          {item.isAvailable === false && (
            <span className="inline-flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 text-[11px] px-2 py-1 w-fit">
              Hết món
            </span>
          )}

          <button
            onClick={item.isAvailable === false ? undefined : handleAddToCart}
            disabled={item.isAvailable === false || isAdding}
            className="w-full bg-primary-500 hover:bg-primary-600 active:scale-95
              text-white text-xs sm:text-sm py-2 rounded-btn font-medium
              transition-all duration-150 shadow-sm hover:shadow-md
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAdding ? "Đang thêm..." : "+ Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </div>
  );
}
