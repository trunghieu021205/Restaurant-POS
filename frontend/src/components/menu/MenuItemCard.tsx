'use client';
import useCartStore from '@/stores/cart';
import type { CartItem } from '@/types';

interface MenuItemCardProps {
  item: CartItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="bg-white rounded-card shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col">
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={item.image || '/placeholder.jpg'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-base md:text-lg mb-1 text-neutral-800 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-sm text-neutral-500 mb-3 flex-1 line-clamp-2">
          {item.description || 'Món ngon hấp dẫn'}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-primary-600 font-bold text-lg">
            {item.price.toLocaleString()}đ
          </span>
          <button
            onClick={() => addItem({ ...item, quantity: 1 })}
            className="bg-primary-500 hover:bg-primary-600 text-white text-sm px-3 py-1.5 rounded-btn transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            + Thêm
          </button>
        </div>
      </div>
    </div>
  );
}