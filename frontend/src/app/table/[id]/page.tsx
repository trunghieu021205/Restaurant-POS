"use client";

import { useState, useEffect, use } from "react";
import MenuGrid from "@/components/menu/MenuGrid";
import MenuSkeleton from "@/components/menu/MenuSkeleton";
import Cart from "@/components/cart/Cart";
import type { CartItem } from "@/types";
import useCartStore from "@/stores/cart";
import useBillStore from "@/stores/bill";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import { BillSheet } from "@/components/bill/BillSheet";

const dummyMenu: CartItem[] = [
  {
    id: "1",
    name: "Phở bò",
    price: 50000,
    quantity: 1,
    image: "/menu/food/pho.jpg",
    description: "Phở bò tái chín đậm đà",
  },
  {
    id: "2",
    name: "Bún chả",
    price: 45000,
    quantity: 1,
    image: "/menu/food/buncha.jpg",
    description: "Bún chả Hà Nội chính gốc",
  },
  {
    id: "3",
    name: "Cơm tấm",
    price: 40000,
    quantity: 1,
    image: "/menu/food/comtam.jpg",
    description: "Cơm tấm sườn bì chả",
  },
  {
    id: "4",
    name: "Gỏi cuốn",
    price: 35000,
    quantity: 1,
    image: "/menu/food/goicuon.jpg",
    description: "Gỏi cuốn tôm thịt tươi",
  },
  {
    id: "5",
    name: "Chả giò",
    price: 30000,
    quantity: 1,
    image: "/menu/food/chagio.jpg",
    description: "Chả giò rế giòn tan",
  },
  {
    id: "6",
    name: "Bánh mì",
    price: 20000,
    quantity: 1,
    image: "/menu/food/banhmi.jpg",
    description: "Bánh mì thịt nướng đặc biệt",
  },
];

type Params = Promise<{ id: string }>;

export default function TablePage({ params }: { params: Params }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<CartItem[]>([]);
  const { isOpen: billOpen, closeBill, setTableId } = useBillStore();
  const isExpanded = useCartStore((state) => state.isExpanded);

  useEffect(() => {
    setTableId(id);
    return () => setTableId(null);
  }, [id, setTableId]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMenu(dummyMenu);
  }, []);

  const rightPadding = isExpanded ? "lg:pr-80" : "lg:pr-20"; // 320px hoặc 80px
  if (loading) return <MenuSkeleton />;
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-[70vh] flex flex-col lg:flex-row">
        <div
          className={`flex-1 p-4 ${rightPadding} transition-all duration-300`}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-6">
            Bàn số {id}
          </h1>
          <MenuGrid items={menu} />
        </div>
        <Cart />
        <BillSheet tableId={id} open={billOpen} onClose={closeBill} />
      </div>
    </ErrorBoundary>
  );
}
