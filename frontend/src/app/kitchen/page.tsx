"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { fetchOrders, updateOrderStatus } from "@/services/orders";
import type { KitchenOrder, OrderStatus } from "@/services/orders";
import OrderCard from "@/components/kitchen/OrderCard";
import OrderFilter from "@/components/kitchen/OrderFilter";
import KitchenSkeleton from "@/components/kitchen/KitchenSkeleton";
import { toast } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/roles";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

export default function KitchenPage() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const canAccess = hasRole(user, ["staff", "admin"]);

  useEffect(() => {
    if (!authLoading && !canAccess) router.push("/");
  }, [authLoading, canAccess, router]);

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery<KitchenOrder[]>({
    queryKey: ["orders", filter],
    queryFn: () => fetchOrders(filter),
    refetchInterval: 10000,
    enabled: canAccess,
  });
  const pendingCount = orders.filter((order) => order.status === "pending").length;

  useEffect(() => {
    if (error) toast.error("Không thể tải danh sách đơn hàng");
  }, [error]);

  useEffect(() => {
    if (!canAccess) return;
    const socket = io(API_ORIGIN, { transports: ["websocket", "polling"] });
    const refreshOrders = () =>
      queryClient.invalidateQueries({ queryKey: ["orders"] });

    socket.emit("join-kitchen");
    socket.on("new_order", refreshOrders);
    socket.on("order_status_updated", refreshOrders);

    return () => {
      socket.off("new_order", refreshOrders);
      socket.off("order_status_updated", refreshOrders);
      socket.disconnect();
    };
  }, [canAccess, queryClient]);

  const mutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status),
    onMutate: ({ orderId }) => setUpdatingId(orderId),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["table-orders", order.tableId],
      });
      queryClient.invalidateQueries({ queryKey: ["bill", order.tableId] });
      toast.success("Đã cập nhật trạng thái đơn");
    },
    onError: (e) => {
      toast.error(
        e instanceof Error ? e.message : "Cập nhật trạng thái thất bại",
      );
    },
    onSettled: () => setUpdatingId(null),
  });

  const handleStatusChange = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      mutation.mutate({ orderId, status: newStatus });
    },
    [mutation],
  );

  if (authLoading || !canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-3 pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Bếp</h1>
          {pendingCount > 0 && (
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
              {pendingCount} đơn chờ
            </span>
          )}
        </div>
        <OrderFilter selected={filter} onFilterChange={setFilter} />
      </div>

      <div className="px-3 py-4">
        {isLoading && <KitchenSkeleton />}

        {error && !isLoading && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Không thể tải danh sách đơn hàng.
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!isLoading && orders.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  isUpdating={updatingId === order.id}
                />
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-base">Không có đơn hàng nào.</p>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
