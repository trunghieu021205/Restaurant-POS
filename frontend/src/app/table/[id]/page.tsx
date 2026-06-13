"use client";

import { useEffect, use, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
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
import { checkInTableByQr, rejoinTableSession, validateTableSession } from "@/services/qr";
import { io } from "socket.io-client";
import { useCategories } from "@/hooks/useCategories";
import MenuCategoryFilter from "./MenuCategoryFilter";
import { TableOrderTracker } from "@/components/table/TableOrderTracker";
import {
  clearAllTableSessions,
  clearTableSession,
  getTableSession,
  saveTableSession,
} from "@/lib/tableSession";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

type Params = Promise<{ id: string }>;

export default function TablePage({ params }: { params: Params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
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
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [menuRefreshing, setMenuRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let resolvedTable: ResolvedTable | null = null;
      let denialMessage = "Vui lòng quét QR hợp lệ để truy cập bàn.";
      try {
        const existingSession = getTableSession(id)?.token;

        if (!qrToken && existingSession) {
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
        setAccessDenied(qrToken ? null : denialMessage);
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
  }, [id, qrToken, setTableId, fetchCart, collapseCart]);

  // Lắng nghe sự kiện payment_completed để tự redirect về home
  useEffect(() => {
    if (!tableOk) return;

    const socket = io(API_ORIGIN);
    socket.emit("join-table", id);

    socket.on("payment_completed", () => {
      clearTableSession(id, table?.number);
      clearAllTableSessions();
      useCartStore.getState().resetLocalCart();
      closeBill();
      window.location.href = "/";
    });

    return () => {
      socket.disconnect();
    };
  }, [id, table?.number, tableOk, closeBill]);

  const restoreSession = (session: Awaited<ReturnType<typeof checkInTableByQr>>) => {
    saveTableSession({
      table: session.table,
      token: session.sessionToken,
      customerName,
      customerPhone,
    });
    setTableOk(true);
    setAccessDenied(null);
    setTable(session.table);
    setTableId(session.table.id);
    fetchCart(session.table.id);
    collapseCart();
  };

  const handleCheckIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!qrToken) return;

    setCheckingIn(true);
    setAccessDenied(null);
    try {
      const checkIn = await checkInTableByQr(id, qrToken, {
        customerName,
        customerPhone,
      });
      restoreSession(checkIn);
    } catch (e) {
      setAccessDenied(e instanceof Error ? e.message : "Check-in that bai");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRejoin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setCheckingIn(true);
    setAccessDenied(null);
    try {
      const session = await rejoinTableSession(id, {
        customerName,
        customerPhone,
      });
      restoreSession(session);
    } catch (e) {
      setAccessDenied(e instanceof Error ? e.message : "Khong the vao lai ban");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRefreshMenu = async () => {
    setMenuRefreshing(true);
    try {
      await queryClient.cancelQueries({ queryKey: ["menu", "today"] });
      queryClient.removeQueries({ queryKey: ["menu", "today"] });
      await refetch();
    } finally {
      setMenuRefreshing(false);
    }
  };

  if (isLoading || tableOk === null) return <MenuSkeleton />;

  if (tableOk === false) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
        <form
          onSubmit={qrToken ? handleCheckIn : handleRejoin}
          className="space-y-4 rounded-card border border-neutral-200 bg-white p-6 shadow-card"
        >
          <div>
            <p className="text-sm font-medium text-neutral-500">Bàn {id}</p>
            <h1 className="text-2xl font-bold text-neutral-900">
              Thông tin khách hàng
            </h1>
          </div>
          {accessDenied && (
            <p className="rounded-btn bg-error-500/10 px-3 py-2 text-sm text-error-600">
              {accessDenied}
            </p>
          )}
          <label className="block text-sm font-medium text-neutral-700">
            Họ tên
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="mt-1 w-full rounded-btn border border-neutral-200 px-3 py-2 outline-none focus:border-primary-500"
              placeholder="Nguyễn Văn A"
            />
          </label>
          <label className="block text-sm font-medium text-neutral-700">
            Số điện thoại
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              className="mt-1 w-full rounded-btn border border-neutral-200 px-3 py-2 outline-none focus:border-primary-500"
              placeholder="0901234567"
              required
            />
          </label>
          <button
            disabled={checkingIn}
            className="w-full rounded-btn bg-primary-600 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {checkingIn ? "Đang check-in..." : "Tiếp tục vào bàn"}
          </button>
        </form>
      </div>
    );
  }

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
          <div className="mb-4 flex justify-end">
            <button
              onClick={handleRefreshMenu}
              disabled={menuRefreshing || isLoading}
              className="inline-flex items-center gap-2 rounded-btn border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${menuRefreshing ? "animate-spin" : ""}`}
              />
              {menuRefreshing ? "Đang tải..." : "Tải lại menu"}
            </button>
          </div>

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
