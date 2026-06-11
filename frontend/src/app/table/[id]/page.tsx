"use client";

import { useEffect, use, useState } from "react";
import { useSearchParams } from "next/navigation";
import MenuGrid from "@/components/menu/MenuGrid";
import MenuSkeleton from "@/components/menu/MenuSkeleton";
import Cart from "@/components/cart/Cart";
import useCartStore from "@/stores/cart";
import useBillStore from "@/stores/bill";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import { BillSheet } from "@/components/bill/BillSheet";
import { useTodayMenu } from "@/hooks/useTodayMenu";
import type { ResolvedTable } from "@/services/table";
import { checkInTableByQr, validateTableSession } from "@/services/qr";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/types/menu";
import MenuCategoryFilter from "./MenuCategoryFilter";
import { TableOrderTracker } from "@/components/table/TableOrderTracker";

type Params = Promise<{ id: string }>;

export default function TablePage({ params }: { params: Params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const qrToken = searchParams.get("qrToken");
  const { isOpen: billOpen, closeBill, setTableId } = useBillStore();
  const { fetchCart, collapseCart } = useCartStore();
  const isExpanded = useCartStore((state) => state.isExpanded);

  const { menuItems, isLoading, isError, error, refetch } = useTodayMenu();

  const { categories } = useCategories();
  const [filteredItems, setFilteredItems] = useState<typeof menuItems | null>(
    null,
  );
  const [tableOk, setTableOk] = useState<boolean | null>(null);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);
  const [table, setTable] = useState<ResolvedTable | null>(null);
  const tableSessionKey = `table-session:${id}`;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let resolvedTable: ResolvedTable | null = null;
      let denialMessage = "Vui lòng quét QR hợp lệ để truy cập bàn.";
      try {
        const existingSession =
          typeof window !== "undefined"
            ? sessionStorage.getItem(tableSessionKey)
            : null;

        if (qrToken) {
          const checkIn = await checkInTableByQr(id, qrToken);
          sessionStorage.setItem(tableSessionKey, checkIn.sessionToken);
          sessionStorage.setItem(
            `table-session:${checkIn.table.id}`,
            checkIn.sessionToken,
          );
          resolvedTable = checkIn.table;
        } else if (existingSession) {
          const validated = await validateTableSession(id, existingSession);
          resolvedTable = validated.table;
        }
      } catch (e) {
        console.error("table access validation failed:", e);
        denialMessage = e instanceof Error ? e.message : denialMessage;
        resolvedTable = null;
      }

      if (cancelled) return;

      if (!resolvedTable) {
        setTableOk(false);
        setAccessDenied(denialMessage);
        setTable(null);
        setTableId(null);
        return;
      }

      setTableOk(true);
      setAccessDenied(null);
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
  }, [id, qrToken, tableSessionKey, setTableId, fetchCart, collapseCart]);

  if (isLoading || tableOk === null) return <MenuSkeleton />;

  if (tableOk === false) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-medium text-red-500">
          {accessDenied ?? "Không có bàn này"}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-medium text-red-500">
          Không thể tải menu. Vui lòng thử lại.
        </p>
        <p className="text-sm text-neutral-400">
          {error instanceof Error ? error.message : "Lỗi không xác định"}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-card bg-primary px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
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
          } lg:pl-16`}
        >
          <h1 className="mb-4 text-xl font-bold text-neutral-800 sm:mb-6 sm:text-2xl md:text-3xl">
            Bàn số {table?.number ?? id}
          </h1>

          {menuItems.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-neutral-400">
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
              <MenuGrid items={filteredItems ?? menuItems} />
            </>
          )}
        </div>

        <Cart />
        {table && <TableOrderTracker tableId={table.id} />}
        <BillSheet
          tableId={table?.id ?? id}
          tableNumber={table?.number}
          open={billOpen}
          onClose={closeBill}
        />
      </div>
    </ErrorBoundary>
  );
}
