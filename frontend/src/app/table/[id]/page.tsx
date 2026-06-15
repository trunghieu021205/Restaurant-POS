"use client";

import { useEffect, use, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import {
  //checkInTableByQr,
  rejoinTableSession,
  validateTableSession,
} from "@/services/qr";

import { checkInTableAction } from "./actions";
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
import {
  validateCustomerForm,
  sanitizePhoneNumber,
  type FormErrors,
} from "@/lib/validation";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const socket = io(API_ORIGIN, {
  transports: ["polling", "websocket"],
  withCredentials: true,
});

type Params = Promise<{ id: string }>;

export default function TablePage({ params }: { params: Params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const qrToken = searchParams.get("qrToken");
  const { isOpen: billOpen, closeBill, setTableId } = useBillStore();
  const { fetchCart, collapseCart, items } = useCartStore();
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
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState<{
    customerName: boolean;
    customerPhone: boolean;
  }>({
    customerName: false,
    customerPhone: false,
  });

  // Check if user has active unpaid orders
  const hasActiveOrders = items.length > 0;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let resolvedTable: ResolvedTable | null = null;
      let denialMessage = "Vui lòng quét QR hợp lệ để truy cập bàn.";
      try {
        const existingSession = getTableSession(id)?.token;

        // Ưu tiên dùng sessionToken đã lưu, chỉ dùng qrToken nếu không có session
        if (existingSession) {
          const validated = await validateTableSession(id, existingSession);
          resolvedTable = validated.table;
        } else if (qrToken) {
          // Nếu không có session nhưng có qrToken, cần check-in mới
          setTableOk(false);
          setAccessDenied(null);
          setTable(null);
          setTableId(null);
          return;
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        // Nếu session không còn hoạt động, xóa session cũ và cho phép check-in lại
        if (
          errorMessage.includes("Phiên làm việc của bàn không còn hoạt động")
        ) {
          clearTableSession(id);
          denialMessage = "";
        } else {
          console.error("table access validation failed:", e);
          denialMessage = errorMessage;
        }
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

      if (resolvedTable.status === "maintenance") {
        setTableOk(false);
        setAccessDenied(
          `Bàn số ${resolvedTable.number} đang bảo trì. Vui lòng liên hệ nhân viên.`,
        );
        setTable(null);
        setTableId(null);
        clearTableSession(id);
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
    if (!tableOk || !table) return;
    socket.emit("join-table", table.id);

    socket.on("payment_completed", () => {
      clearTableSession(id, table?.number);
      clearAllTableSessions();
      useCartStore.getState().resetLocalCart();
      closeBill();
      window.location.href = "/";
    });

    socket.on("table_unlocked", () => {
      clearTableSession(id, table?.number);
      clearAllTableSessions();
      useCartStore.getState().resetLocalCart();
      closeBill();
      window.location.href = "/";
    });

    return () => {
      socket.disconnect();
    };
  }, [id, table?.id, table?.number, tableOk, closeBill]);

  // Prevent browser back button when has active orders
  useEffect(() => {
    if (!tableOk || !hasActiveOrders) return;

    const handlePopState = (event: PopStateEvent) => {
      if (hasActiveOrders) {
        event.preventDefault();
        window.history.pushState(null, "", window.location.href);
        alert(
          "Bạn đang có đơn hàng chưa thanh toán. Vui lòng thanh toán trước khi rời bàn.",
        );
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [tableOk, hasActiveOrders]);

  // Store active session state for Header to check
  useEffect(() => {
    if (tableOk && hasActiveOrders) {
      sessionStorage.setItem("activeTableSession", "true");
      sessionStorage.setItem("activeTableId", id);
    } else {
      sessionStorage.removeItem("activeTableSession");
      sessionStorage.removeItem("activeTableId");
    }

    return () => {
      sessionStorage.removeItem("activeTableSession");
      sessionStorage.removeItem("activeTableId");
    };
  }, [tableOk, hasActiveOrders, id]);

  // Prevent route changes when has active orders
  useEffect(() => {
    if (!tableOk || !hasActiveOrders) return;

    const originalPush = router.push;
    const originalReplace = router.replace;

    // Helper function to extract path from router arguments
    const extractPath = (
      args: Parameters<typeof router.push>,
    ): string | undefined => {
      const firstArg = args[0];
      if (typeof firstArg === "string") {
        return firstArg;
      }
      // Use type assertion to safely access pathname
      if (firstArg && typeof firstArg === "object") {
        return (
          (firstArg as { pathname?: string; href?: string }).pathname ||
          (firstArg as { pathname?: string; href?: string }).href
        );
      }
      return undefined;
    };

    router.push = (...args: Parameters<typeof router.push>) => {
      const targetPath = extractPath(args);
      if (targetPath && targetPath !== pathname) {
        alert(
          "Bạn đang có đơn hàng chưa thanh toán. Vui lòng thanh toán trước khi rời bàn.",
        );
        return Promise.reject(new Error("Navigation blocked"));
      }
      return originalPush(...args);
    };

    router.replace = (...args: Parameters<typeof router.replace>) => {
      const targetPath = extractPath(args);
      if (targetPath && targetPath !== pathname) {
        alert(
          "Bạn đang có đơn hàng chưa thanh toán. Vui lòng thanh toán trước khi rời bàn.",
        );
        return Promise.reject(new Error("Navigation blocked"));
      }
      return originalReplace(...args);
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [tableOk, hasActiveOrders, router, pathname]);

  const validateForm = useCallback((): boolean => {
    const { isValid, errors } = validateCustomerForm({
      customerName,
      customerPhone,
    });
    setFormErrors(errors);
    return isValid;
  }, [customerName, customerPhone]);

  const handlePhoneChange = (value: string) => {
    const sanitized = sanitizePhoneNumber(value);
    setCustomerPhone(sanitized);
    if (formTouched.customerPhone) validateForm();
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: "customerName" | "customerPhone") => {
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const restoreSession = (session: {
    table: ResolvedTable;
    sessionToken: string;
  }) => {
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

    setFormTouched({
      customerName: true,
      customerPhone: true,
    });

    if (!validateForm()) {
      return;
    }

    setCheckingIn(true);
    setAccessDenied(null);
    try {
      const checkIn = await checkInTableAction(id, qrToken, {
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

    setFormTouched({
      customerName: true,
      customerPhone: true,
    });

    if (!validateForm()) {
      return;
    }

    try {
      const session = await rejoinTableSession(id, {
        customerName,
        customerPhone,
      });
      restoreSession(session);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Không thể vào lại bàn";
      // Check if this is an EMPTY_SESSION_RESET error
      if (
        errorMessage.includes("đã được mở lại") ||
        errorMessage.includes("EMPTY_SESSION_RESET")
      ) {
        setAccessDenied(
          "Bàn đã được mở lại cho khách mới. Vui lòng quét mã QR trên bàn để bắt đầu phiên mới.",
        );
        // Clear the stored session for this table
        clearTableSession(id);
      } else {
        setAccessDenied(errorMessage);
      }
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
            <p className="mt-1 text-sm text-neutral-500">
              Vui lòng nhập đầy đủ thông tin để tiếp tục
            </p>
          </div>

          {accessDenied && (
            <div className="rounded-btn bg-error-500/10 px-3 py-2 border border-error-200">
              <p className="text-sm text-error-600">{accessDenied}</p>
            </div>
          )}

          {/* Customer Name Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Họ tên <span className="text-error-500">*</span>
              <input
                value={customerName}
                onChange={(event) => {
                  setCustomerName(event.target.value);
                  if (formTouched.customerName) validateForm();
                }}
                onBlur={() => handleFieldBlur("customerName")}
                className={`mt-1 w-full rounded-btn border px-3 py-2 outline-none transition-colors ${
                  formTouched.customerName && formErrors.customerName
                    ? "border-error-500 focus:border-error-500 bg-error-50"
                    : "border-neutral-200 focus:border-primary-500"
                }`}
                placeholder="Nguyễn Văn A"
              />
            </label>
            {formTouched.customerName && formErrors.customerName && (
              <p className="mt-1 text-sm text-error-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.customerName}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Số điện thoại <span className="text-error-500">*</span>
              <input
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => handleFieldBlur("customerPhone")}
                className={`mt-1 w-full rounded-btn border px-3 py-2 outline-none transition-colors ${
                  formTouched.customerPhone && formErrors.customerPhone
                    ? "border-error-500 focus:border-error-500 bg-error-50"
                    : "border-neutral-200 focus:border-primary-500"
                }`}
                placeholder="0901234567"
                inputMode="tel"
              />
            </label>
            {formTouched.customerPhone && formErrors.customerPhone && (
              <p className="mt-1 text-sm text-error-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.customerPhone}
              </p>
            )}
            <p className="mt-1 text-xs text-neutral-400">
              Định dạng: 0901234567 hoặc +84901234567
            </p>
          </div>

          {/* Submit Button */}
          <button
            disabled={checkingIn}
            className="w-full rounded-btn bg-primary-600 px-4 py-2.5 font-medium text-white transition-all hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {checkingIn ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Đang check-in...
              </span>
            ) : (
              "Tiếp tục vào bàn"
            )}
          </button>
        </form>
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
          <div className="mb-4 sm:mb-6 flex justify-between items-center">
            <h1 className="text-xl font-bold text-neutral-800 sm:text-2xl md:text-3xl">
              Bàn số {table?.number ?? id}
            </h1>
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
