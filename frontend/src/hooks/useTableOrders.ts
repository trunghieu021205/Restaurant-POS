"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { fetchTableOrders } from "@/services/orders";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5000";

export function useTableOrders(tableId?: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["table-orders", tableId],
    queryFn: () => fetchTableOrders(tableId ?? ""),
    enabled: !!tableId,
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (!tableId) return;

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    const invalidateTableData = () => {
      queryClient.invalidateQueries({ queryKey: ["table-orders", tableId] });
      queryClient.invalidateQueries({ queryKey: ["bill", tableId] });
    };

    socket.emit("join-table", tableId);
    socket.on("order_status_updated", invalidateTableData);
    socket.on("bill_paid", invalidateTableData);

    return () => {
      socket.emit("leave-table", tableId);
      socket.off("order_status_updated", invalidateTableData);
      socket.off("bill_paid", invalidateTableData);
      socket.disconnect();
    };
  }, [queryClient, tableId]);

  return query;
}
