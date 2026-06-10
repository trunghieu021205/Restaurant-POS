"use client";

import { useEffect, use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { fetchCategories } from "@/services/category";
import type { Category } from "@/types/menu";
import MenuCategoryFilter from "./MenuCategoryFilter";
import { fetchTableOrders } from "@/services/orders";
import OrderStatusBadge from "@/components/kitchen/OrderStatusBadge";

type Params = Promise<{ id: string }>;

export default function TablePage({ params }: { params: Params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const qrToken = searchParams.get("qrToken");
  const { isOpen: billOpen, closeBill, setTableId } = useBillStore();
  const { fetchCart, collapseCart } = useCartStore();
  const isExpanded = useCartStore((state) => state.isExpanded);

  const { menuItems, isLoading, isError, error, refetch } = useTodayMenu();

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredItems, setFilteredItems] = useState<typeof menuItems | null>(
    null,
  );

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

  // tableOk: null = đang kiểm tra, false = không tồn tại
  const [tableOk, setTableOk] = useState<boolean | null>(null);
  const [accessDenied, setAccessDenied] = useState<string | null>(null);
  const [table, setTable] = useState<ResolvedTable | null>(null);
  const tableSessionKey = `table-session:${id}`;

  const { data: tableOrders = [] } = useQuery({
    queryKey: ["table-orders", table?.id],
    queryFn: () => fetchTableOrders(table?.id ?? id),
    enabled: tableOk === true && !!table,
    refetchInterval: 10_000,
  });

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

  // Chặn UI khi table không hợp lệ
  if (tableOk === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <p className="text-red-500 font-medium">
          {accessDenied ?? "Không có bàn này"}
        </p>
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
              <MenuGrid items={filteredItems ?? menuItems} />
            </>
          )}

          {tableOrders.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-neutral-800 mb-3">
                Món đã order
              </h2>
              <div className="space-y-3">
                {tableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-neutral-100 rounded-card p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-neutral-700">
                        Đơn #{order.orderNumber}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <ul className="divide-y divide-neutral-50">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="py-2 flex items-start justify-between gap-3 text-sm"
                        >
                          <span className="text-neutral-700">
                            {item.name}
                            {item.notes && (
                              <span className="block text-xs text-neutral-400">
                                {item.notes}
                              </span>
                            )}
                          </span>
                          <span className="font-medium text-neutral-500">
                            x{item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <Cart />
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
