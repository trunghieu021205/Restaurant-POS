import MenuItemCard from '@/components/menu/MenuItemCard';
import type { CartItem } from '@/types';

interface MenuGridProps {
  items: CartItem[];
}

export default function MenuGrid({ items }: MenuGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}