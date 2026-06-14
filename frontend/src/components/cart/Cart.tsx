"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import useCartStore from "@/stores/cart";
import useBillStore from "@/stores/bill";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types/cart";
import { useDebouncedCallback } from "use-debounce";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrderFromCart } from "@/services/orders";
import { toast } from "@/lib/toast";
import { useBill } from "@/hooks/useBill";

// ── Item riêng biệt để isolate state ────────────────────────────
function CartItemRow({
  item,
  onRemove,
  onNoteChange,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
}) {
  // State note nằm trong component con → không ảnh hưởng item khác
  const [note, setNote] = useState(item.note ?? "");
  const menuItem = item.menuItem;
  const debouncedNoteChange = useDebouncedCallback(
    (value: string) => onNoteChange(item.menuItemId, value),
    2000, // 500ms sau khi ngừng gõ mới gọi API
  );

  return (
    <div className="bg-neutral-50 rounded-xl px-3 py-2.5 space-y-2">
      {/* Row chính */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-800 leading-tight truncate">
            {menuItem?.name || "Unknown item"}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {item.quantity} × {formatCurrency(menuItem?.price || 0)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-semibold text-primary-600">
            {formatCurrency((menuItem?.price || 0) * item.quantity)}
          </span>
          <button
            onClick={() => onRemove(item.menuItemId)}
            className="p-1 rounded-full hover:bg-error-50 text-neutral-300 hover:text-error-500 transition-colors"
            aria-label="Xóa món"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note input — luôn hiển thị */}
      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          debouncedNoteChange(e.target.value);
        }}
        placeholder="Ghi chú: ít cay, không hành, thêm đá..."
        // maxLength={120}
        rows={2}
        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200
          focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20
          outline-none resize-none text-neutral-700 placeholder-neutral-300
          bg-white transition-all"
      />
    </div>
  );
}

// ── Cart chính ───────────────────────────────────────────────────
export default function Cart() {
  const {
    tableId,
    items,
    removeItem,
    updateNote,
    getTotal,
    clearCart,
    isExpanded,
    setExpanded,
    toggleExpanded,
    collapseCart,
  } = useCartStore();
  const { openBill } = useBillStore();
  const billOpen = useBillStore((state) => state.isOpen);
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: bill } = useBill(tableId ?? "");
  const hasPendingCashRequest =
    !!bill && bill.paymentMethod === "cash" && bill.status !== "paid";

  const totalAmount = getTotal();
  const isEmpty = items.length === 0;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const sendOrder = useMutation({
    mutationFn: async () => {
      if (!tableId) throw new Error("Chưa chọn bàn");
      if (items.length === 0) throw new Error("Giỏ hàng trống");
      return createOrderFromCart(tableId, items);
    },
    onSuccess: async () => {
      await clearCart();
      if (tableId) {
        queryClient.invalidateQueries({ queryKey: ["bill", tableId] });
        queryClient.invalidateQueries({ queryKey: ["table-orders", tableId] });
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đã gửi order đến bếp");
      setMobileOpen(false);
      collapseCart();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Gửi order thất bại",
      );
    },
  });

  const handleSendOrder = () => {
    sendOrder.mutate();
  };

  const handleViewBill = () => {
    setMobileOpen(false);
    collapseCart();
    openBill();
  };

  const handleOpenMobileCart = () => {
    setMobileOpen(true);
    setExpanded(true);
  };

  const handleCloseMobileCart = () => {
    setMobileOpen(false);
    setExpanded(false);
  };

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

  // ── Nội dung giỏ hàng (dùng chung mobile + desktop) ─────────────
  const renderCartContent = () => (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex justify-between flex-nowrap items-center px-4 pt-4 pb-3 border-b border-neutral-100">
        <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary-500" />
          Giỏ hàng
          {!isEmpty && (
            <span className="text-xs font-bold bg-primary-100 text-primary-600 rounded-full px-2 py-0.5">
              {itemCount}
            </span>
          )}
        </h2>
        <button
          onClick={handleCloseMobileCart}
          className="lg:hidden p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-neutral-400 py-12">
          <ShoppingCart className="w-10 h-10 opacity-30" />
          <p className="text-sm">Giỏ hàng trống</p>
        </div>
      ) : (
        <>
          <div
            className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0"
            style={{ overscrollBehavior: "contain" }}
          >
            {items.map((item) => (
              <CartItemRow
                key={item.menuItemId}
                item={item}
                onRemove={removeItem}
                onNoteChange={updateNote}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 px-4 py-4 shrink-0 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-neutral-600">Tổng cộng</span>
              <span className="text-lg font-bold text-primary-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <button
              onClick={handleSendOrder}
              disabled={sendOrder.isPending || hasPendingCashRequest}
              title={
                hasPendingCashRequest
                  ? "Đã gửi yêu cầu thanh toán, không thể đặt thêm món"
                  : undefined
              }
              className="w-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white py-2.5 rounded-btn font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {sendOrder.isPending
                ? "Đang gửi..."
                : hasPendingCashRequest
                  ? "Đang chờ thanh toán..."
                  : "Gửi order"}
            </button>
            <button
              onClick={handleViewBill}
              className="w-full border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 text-neutral-600 hover:text-primary-600 py-2 rounded-btn text-sm transition-all"
            >
              Xem hoá đơn
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* FAB mobile */}
      {!billOpen && (
        <button
          className="lg:hidden fixed bottom-6 right-5 bg-primary-500 text-white p-4 rounded-full shadow-lg z-(--z-floating) hover:bg-primary-600 hover:scale-110 transition-all duration-200"
          onClick={handleOpenMobileCart}
          aria-label="Mở giỏ hàng"
        >
          <ShoppingCart className="h-6 w-6" />
          {!isEmpty && (
            <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </button>
      )}

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-(--z-overlay) lg:hidden"
          onClick={handleCloseMobileCart}
          onTouchMove={(e) => e.preventDefault()}
        />
      )}

      {/* Mobile slide-up panel */}
      <div
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-modal
          z-(--z-drawer) transition-transform duration-300 ease-out
          max-h-[85dvh] flex flex-col
          ${mobileOpen ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          {renderCartContent()}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`
          hidden lg:flex fixed top-0 right-0 h-full bg-white shadow-modal
          z-(--z-drawer) flex-col transition-all duration-300
          ${billOpen ? "pointer-events-none opacity-0" : "opacity-100"}
          ${isExpanded ? "w-75" : "w-16"}
        `}
      >
        <button
          onClick={toggleExpanded}
          className="flex items-center justify-center mt-4 mx-auto w-10 h-10 rounded-full hover:bg-primary-50 text-neutral-500 hover:text-primary-600 transition-all duration-200 shrink-0 relative"
          title={isExpanded ? "Thu gọn" : "Mở giỏ hàng"}
        >
          {isExpanded ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {!isEmpty && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </>
          )}
        </button>

        <div
          className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${
            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {renderCartContent()}
        </div>
      </div>
    </>
  );
}
