"use client";
import { useState } from "react";
import useCartStore from "@/stores/cart";
import type { CartItem } from "@/types";
import { showSuccessToast } from "@/lib/toast";
import { Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MenuItemCardProps {
  item: CartItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(99, prev + 1));
  };

  const handleAddToCart = () => {
    addItem({ ...item, quantity });
    showSuccessToast(`Đã thêm ${quantity} ${item.name} vào giỏ hàng`);
    setQuantity(1);
  };

  const imageSrc = item.image && item.image !== "" ? item.image : "/placeholder.jpg";

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col">
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={imageSrc}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base md:text-lg mb-1 text-neutral-800 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-sm text-neutral-500 mb-3 flex-1 line-clamp-2">
          {item.description || "Món ngon hấp dẫn"}
        </p>
        {/* Bộ chọn số lượng + nút thêm */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-primary-600 font-bold text-lg">
              {formatCurrency(item.price)}
            </span>

            {/* Nút tăng giảm số lượng */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleDecrease}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium tabular-nums">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                disabled={quantity >= 99}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm py-2 rounded-btn transition-all duration-200 hover:shadow-md"
          >
            + Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
