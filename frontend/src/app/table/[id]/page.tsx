"use client";

import { useEffect, use, useState } from "react";
import MenuGrid from "@/components/menu/MenuGrid";
import MenuSkeleton from "@/components/menu/MenuSkeleton";
import Cart from "@/components/cart/Cart";
import useCartStore from "@/stores/cart";
import useBillStore from "@/stores/bill";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import { BillSheet } from "@/components/bill/BillSheet";
import { useTodayMenu } from "@/hooks/useTodayMenu";
import { resolveTable, type ResolvedTable } from "@/services/table";
import { fetchCategories } from "@/services/category";
import type { Category } from "@/types/menu";
import MenuCategoryFilter from "./MenuCategoryFilter";

type Params = Promise<{ id: string }>;

export default function TablePage({ params }: { params: Params }) {
  const { id } = use(params);
  const { isOpen: billOpen, closeBill, setTableId } = useBillStore();
  const { fetchCart, collapseCart } = useCartStore();
  const isExpanded = useCartStore((state) => state.isExpanded);

  const { menuItems, isLoading, isError, error, refetch } = useTodayMenu();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState(menuItems);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetchCategories();
        if (!cancelled) setCategories(res);
      } catch (e) {
        console.error("fetchCategories failed:", e);
        if (!cancelled) setCategories([]);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // nếu chưa filter kịp thì giữ menuItems
    setFilteredItems(menuItems);
  }, [menuItems]);

  // tableOk: null = đang kiểm tra, false = không tồn tại
  const [tableOk, setTableOk] = useState<boolean | null>(null);
  const [table, setTable] = useState<ResolvedTable | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // 1) Validate table exists trước khi setTableId/fetchCart
      let resolvedTable: ResolvedTable | null = null;
      try {
        resolvedTable = await resolveTable(id);
      } catch (e) {
        console.error("resolveTable failed:", e);
        // nếu endpoint check lỗi/404 thì coi như bàn không hợp lệ
        resolvedTable = null;
      }

      if (cancelled) return;

      if (!resolvedTable) {
        setTableOk(false);
        setTable(null);
        setTableId(null);
        return;
      }

      setTableOk(true);
      setTable(resolvedTable);

      setTableId(resolvedTable.id);
      fetchCart(resolvedTable.id);
      collapseCart();
    };

    run();

    return () => {
      cancelled = true;
      setTableId(null);
    };
  }, [id, setTableId, fetchCart, collapseCart]);

  if (isLoading || tableOk === null) return <MenuSkeleton />;

  // Chặn UI khi table không hợp lệ
  if (tableOk === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <p className="text-red-500 font-medium">Không có bàn này</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <p className="text-red-500 font-medium">
          Không thể tải menu. Vui lòng thử lại.
        </p>
        <p className="text-sm text-neutral-400">
          {error instanceof Error ? error.message : "Lỗi không xác định"}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-card text-sm hover:opacity-90 transition-opacity"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-[70vh]">
        <div
          className={`transition-all duration-300 ${
            isExpanded ? "lg:pr-75" : "lg:pr-16"
          }`}
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-800 mb-4 sm:mb-6">
            Bàn số {id}
          </h1>

          {menuItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2 text-neutral-400">
              <p className="text-lg font-medium">Chưa có món hôm nay</p>
              <p className="text-sm">
                Vui lòng liên hệ nhân viên để được hỗ trợ.
              </p>
            </div>
          ) : (
            <>
              <MenuCategoryFilter
                categories={categories}
                items={menuItems}
                defaultCategoryName="Món chính"
                onFiltered={(filtered) => setFilteredItems(filtered)}
              />
              <MenuGrid items={filteredItems} />
            </>
          )}
        </div>

        <Cart />
        <BillSheet
          tableId={table?.id ?? id}
          open={billOpen}
          onClose={closeBill}
        />
      </div>
    </ErrorBoundary>
  );
}
