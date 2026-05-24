"use client";
import { useState } from "react";
import { ShoppingCart, X, FileText } from "lucide-react";
import useCartStore from "@/stores/cart";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

export default function Cart() {
  const { items, removeItem, getTotal, clearCart, isExpanded, toggleExpanded } =
    useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalAmount = getTotal();

  const isEmpty = items.length === 0;

  const handleSendOrder = async () => {
    alert("Gửi order thành công! (mock)");
    clearCart();
    setMobileOpen(false);
  };

  const handleViewBill = () => {
    // 1. Đóng sidebar trên mobile nếu đang mở
    if (mobileOpen) setMobileOpen(false);
    // 2. Thu gọn sidebar trên desktop (nếu đang mở rộng)
    if (isExpanded) collapseCart();
    // 3. Mở modal hoá đơn
    onOpenBill?.();
  };

  return (
    <>
      {/* FAB cho mobile */}
      <button
        className="lg:hidden fixed bottom-6 right-6 bg-primary-500 text-white p-4 rounded-full shadow-lg z-(--z-modal) hover:bg-primary-600 hover:scale-110 transition-all duration-200"
        onClick={() => setMobileOpen(true)}
        aria-label="Mở giỏ hàng"
      >
        <ShoppingCart className="h-6 w-6" />
        {!isEmpty && (
          <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {/* Overlay cho mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-(--z-overlay) lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Panel giỏ hàng */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-modal z-(--z-drawer) transition-all duration-300 
          ${mobileOpen ? "translate-x-0" : "translate-x-full"} 
          lg:translate-x-0`}
        style={{ width: isExpanded ? "320px" : "80px" }}
      >
        {/* Toggle desktop */}
        <button
          onClick={toggleExpanded}
          className="hidden lg:flex absolute top-4 left-4 p-2 rounded-btn text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 hover:scale-110 transition-all duration-200 z-10"
          title={isExpanded ? "Thu gọn" : "Mở rộng"}
        >
          {isExpanded ? (
            <X className="h-5 w-5" />
          ) : (
            <ShoppingCart className="h-5 w-5" />
          )}
        </button>

        {/* Badge khi thu gọn */}
        {!isExpanded && !isEmpty && (
          <div className="hidden lg:flex absolute top-16 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold rounded-full h-6 w-6 items-center justify-center">
            {items.length}
          </div>
        )}

        {/* Nội dung giỏ hàng */}
        <div
          className={`flex flex-col h-full pt-16 px-4 pb-4 ${!isExpanded && "lg:hidden"}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-neutral-800">
              Giỏ hàng ({items.length})
            </h2>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isEmpty ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-neutral-400">Giỏ hàng trống</p>
            </div>
          ) : (
            <>
              {/* Danh sách món */}
              <div className="space-y-3 -mx-4 px-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-neutral-100 pb-2"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="font-medium text-sm text-neutral-700 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-error-500 text-sm hover:text-error-600 transition-colors shrink-0"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-200 pt-4 mt-4 space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="space-y-2">
                  {!isEmpty && (
                    <button
                      onClick={handleSendOrder}
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-btn font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      Gửi order
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
