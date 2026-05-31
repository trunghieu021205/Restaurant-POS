// app/kitchen/page.tsx
"use client";
import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { fetchOrders } from "@/services/orders";
import { Order, OrderStatus } from "@/data/dummyOrders";
import OrderCard from "@/components/kitchen/OrderCard";
import OrderFilter from "@/components/kitchen/OrderFilter";
import KitchenSkeleton from "@/components/kitchen/KitchenSkeleton";
import { toast } from "@/lib/toast"; // ✅ giờ đây import đúng

export default function KitchenPage() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const queryClient = useQueryClient();

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 10000,
  });

  // Toast khi có lỗi fetch
  useEffect(() => {
    if (error) {
      toast.error("Không thể tải danh sách đơn hàng");
    }
  }, [error]);

  const handleStatusChange = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      queryClient.setQueryData<Order[]>(["orders"], (old) =>
        old?.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    },
    [queryClient],
  );

  const filteredOrders = orders?.filter(
    (o) => filter === "all" || o.status === filter,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Bếp - Đơn hàng
        </h1>
        <OrderFilter selected={filter} onFilterChange={setFilter} />

        {isLoading && <KitchenSkeleton />}

        {/* Lỗi vẫn hiển thị text fallback, nhưng toast đã báo */}
        {error && (
          <div className="text-center py-12 text-gray-500">
            Không thể tải danh sách đơn hàng.
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">Không có đơn hàng nào.</p>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
