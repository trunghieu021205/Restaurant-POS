"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  Loader2,
  RefreshCw,
  Utensils,
  X,
} from "lucide-react";
import OrderStatusBadge from "@/components/kitchen/OrderStatusBadge";
import { useTableOrders } from "@/hooks/useTableOrders";

interface TableOrderTrackerProps {
  tableId: string;
}

const visibleStatuses = new Set(["pending", "confirmed"]);

export function TableOrderTracker({ tableId }: TableOrderTrackerProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTableOrders(tableId);

  const visibleOrders = orders.filter((order) =>
    visibleStatuses.has(order.status),
  );
  const pendingItemCount = visibleOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const renderContent = () => (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 pb-3 pt-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-800">
          <Utensils className="h-4 w-4 text-primary-500" />
          Món đang xử lý
          {pendingItemCount > 0 && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-600">
              {pendingItemCount}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-1">
          {isFetching && !isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
          ) : (
            <button
              onClick={() => refetch()}
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-primary-600"
              aria-label="Cập nhật trạng thái món"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 lg:hidden"
            aria-label="Đóng theo dõi món"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-neutral-50"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 py-12 text-center text-error-600">
          <AlertCircle className="h-10 w-10 opacity-80" />
          <div>
            <p className="font-medium">Không thể tải trạng thái món</p>
            <p className="mt-1 text-sm opacity-80">
              {error instanceof Error ? error.message : "Vui lòng thử lại."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-btn bg-white px-4 py-2 text-sm font-medium shadow-sm"
          >
            Thử lại
          </button>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-12 text-center text-neutral-400">
          <ClipboardList className="h-10 w-10 opacity-40" />
          <p className="text-sm font-medium">Không có món đang chờ phục vụ</p>
          <p className="text-xs">Món đã giao sẽ tự ẩn khỏi danh sách.</p>
        </div>
      ) : (
        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2"
          style={{ overscrollBehavior: "contain" }}
        >
          {visibleOrders.map((order) => (
            <div key={order.id} className="rounded-xl bg-neutral-50 px-3 py-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <OrderStatusBadge status={order.status} />
              </div>
              <ul className="space-y-1.5">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0 text-neutral-700">
                      <span className="block truncate">{item.name}</span>
                      {item.notes && (
                        <span className="block truncate text-xs text-neutral-400">
                          {item.notes}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-semibold text-primary-600">
                      x{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        className="fixed bottom-6 left-5 z-(--z-modal) rounded-full bg-success-500 p-4 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-success-600 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Mở theo dõi món"
      >
        <Utensils className="h-6 w-6" />
        {pendingItemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-bold text-white">
            {pendingItemCount > 9 ? "9+" : pendingItemCount}
          </span>
        )}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-(--z-overlay) bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          onTouchMove={(event) => event.preventDefault()}
        />
      )}

      <div
        className={`
          fixed bottom-0 left-0 right-0 z-(--z-drawer) flex max-h-[85dvh]
          flex-col rounded-t-2xl bg-white shadow-modal transition-transform
          duration-300 ease-out lg:hidden
          ${mobileOpen ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{renderContent()}</div>
      </div>

      <div
        className={`
          fixed left-0 top-0 z-(--z-drawer) hidden h-full flex-col bg-white
          shadow-modal transition-all duration-300 lg:flex
          ${desktopExpanded ? "w-80" : "w-16"}
        `}
      >
        <button
          onClick={() => setDesktopExpanded((value) => !value)}
          className="relative mx-auto mt-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-all duration-200 hover:bg-primary-50 hover:text-primary-600"
          title={desktopExpanded ? "Thu gọn theo dõi món" : "Mở theo dõi món"}
        >
          {desktopExpanded ? (
            <X className="h-5 w-5" />
          ) : (
            <>
              <Utensils className="h-5 w-5" />
              {pendingItemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-success-500 text-[10px] font-bold text-white">
                  {pendingItemCount > 9 ? "9+" : pendingItemCount}
                </span>
              )}
            </>
          )}
        </button>

        <div
          className={`flex min-h-0 flex-1 flex-col overflow-hidden transition-opacity duration-200 ${
            desktopExpanded ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
}
