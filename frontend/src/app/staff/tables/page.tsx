"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/roles";
import { toast } from "@/lib/toast";
import {
  fetchPaymentNotifications,
  fetchStaffTables,
  fetchTableAuditLogs,
  reserveTable,
  unlockTable,
  updatePaymentNotification,
  type PaymentNotification,
  type StaffTable,
  type TableStatus,
} from "@/services/staffTables";

import TablesGrid from "./_components/TablesGrid";
import PaymentNotificationsPanel from "./_components/PaymentNotificationsPanel";
import AuditLogPanel from "./_components/AuditLogPanel";
import ReserveTableModal from "./_components/modals/ReserveTableModal";
import UnlockTableModal from "./_components/modals/UnlockTableModal";
import PaymentDetailModal from "./_components/modals/PaymentDetailModal";
import { BillReadOnlySheet } from "@/components/bill/BillReadOnlySheet";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

const statusStyles: Record<TableStatus, { label: string; dot: string }> = {
  available: { label: "Bàn trống", dot: "bg-emerald-500" },
  occupied: { label: "Đang sử dụng", dot: "bg-red-500" },
  reserved: { label: "Đã đặt trước", dot: "bg-primary-300" },
  maintenance: { label: "Bảo trì", dot: "bg-neutral-500" },
};

export default function StaffTablesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const canAccess = hasRole(user, ["staff", "admin"]);

  // --- State cho modals ---
  const [reserveTarget, setReserveTarget] = useState<StaffTable | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<StaffTable | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<PaymentNotification | null>(null);
  const [cashBillSheetOpen, setCashBillSheetOpen] = useState(false);
  const [cashBillId, setCashBillId] = useState<string>("");

  // --- Queries ---
  const tablesQuery = useQuery({
    queryKey: ["staff-tables"],
    queryFn: fetchStaffTables,
    enabled: canAccess,
  });
  const notificationsQuery = useQuery({
    queryKey: ["staff-payment-notifications"],
    queryFn: fetchPaymentNotifications,
    enabled: canAccess,
    refetchInterval: 30000,
  });
  const auditQuery = useQuery({
    queryKey: ["table-audit-logs"],
    queryFn: fetchTableAuditLogs,
    enabled: canAccess,
  });

  const cashPendingCount = useMemo(() => {
    const list = notificationsQuery.data || [];
    return list.filter(
      (n) =>
        n.type === "cash_payment_request" &&
        (n.paymentStatus === "requested" || n.paymentStatus === "pending"),
    ).length;
  }, [notificationsQuery.data]);

  // --- Mutations ---
  const reserveMutation = useMutation({
    mutationFn: (params: { name: string; phone: string }) =>
      reserveTable(reserveTarget!.id, {
        customerName: params.name,
        customerPhone: params.phone,
      }),
    onSuccess: () => {
      toast.success("Đã đặt trước bàn");
      setReserveTarget(null);
      queryClient.invalidateQueries({ queryKey: ["staff-tables"] });
      queryClient.invalidateQueries({ queryKey: ["table-audit-logs"] });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Đặt trước thất bại",
      ),
  });

  const unlockMutation = useMutation({
    mutationFn: (note: string) =>
      unlockTable(unlockTarget!.id, { confirmed: true, note }),
    onSuccess: () => {
      toast.success("Đã mở khóa bàn");
      setUnlockTarget(null);
      queryClient.invalidateQueries({ queryKey: ["staff-tables"] });
      queryClient.invalidateQueries({ queryKey: ["table-audit-logs"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Mở khóa thất bại"),
  });

  const notificationMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "assisted" | "completed";
    }) => updatePaymentNotification(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff-payment-notifications"],
      });
      queryClient.invalidateQueries({ queryKey: ["table-audit-logs"] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Cập nhật thất bại"),
  });

  // --- Summary ---
  const summary = useMemo(() => {
    const base: Record<TableStatus, number> = {
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0,
    };
    for (const table of tablesQuery.data || []) base[table.status] += 1;
    return base;
  }, [tablesQuery.data]);

  // --- Socket & Auth ---
  useEffect(() => {
    if (!authLoading && !canAccess) router.push("/");
  }, [authLoading, canAccess, router]);

  useEffect(() => {
    if (!canAccess) return;
    const socket = io(API_ORIGIN);
    socket.emit("join-staff");

    socket.on("table_status_updated", (table: StaffTable) => {
      queryClient.setQueryData<StaffTable[]>(["staff-tables"], (current) =>
        current
          ? current.map((item) => (item.id === table.id ? table : item))
          : current,
      );
    });
    socket.on("payment_notification", () =>
      queryClient.invalidateQueries({
        queryKey: ["staff-payment-notifications"],
      }),
    );
    socket.on("payment_notification_updated", () =>
      queryClient.invalidateQueries({
        queryKey: ["staff-payment-notifications"],
      }),
    );
    socket.on(
      "payment_notification_detail",
      (notification: PaymentNotification) => {
        if (notification.type === "cash_payment_request") {
          const tableNo =
            notification.tableNumber ||
            (typeof notification.tableId === "object"
              ? notification.tableId.number
              : "-");
          toast.success(
            `Bàn ${tableNo} gửi yêu cầu thanh toán tiền mặt (${notification.paymentStatus})`,
          );
          return;
        }
        setSelectedNotification(notification);
      },
    );

    return () => {
      socket.disconnect();
    };
  }, [canAccess, queryClient]);

  if (authLoading || !canAccess) return null;

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Quản lý trạng thái bàn
            </h1>
            <p className="text-sm text-neutral-500">
              Theo dõi realtime trạng thái bàn, đặt trước, hỗ trợ thanh toán và
              lịch sử thao tác.
            </p>
          </div>
          <button
            onClick={() => {
              tablesQuery.refetch();
              notificationsQuery.refetch();
              auditQuery.refetch();
            }}
            className="inline-flex items-center gap-2 rounded-btn border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700"
          >
            <RefreshCw size={16} /> Tải lại
          </button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {Object.entries(statusStyles).map(([status, styles]) => (
            <div
              key={status}
              className="rounded-card border border-neutral-200 bg-white p-3"
            >
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                {styles.label}
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-900">
                {summary[status as TableStatus]}
              </p>
            </div>
          ))}
        </div>

        {/* Main Grid + Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <TablesGrid
            tables={tablesQuery.data || []}
            onReserve={setReserveTarget}
            onUnlock={setUnlockTarget}
          />

          <aside className="space-y-4">
            <PaymentNotificationsPanel
              notifications={notificationsQuery.data || []}
              cashPendingCount={cashPendingCount}
              onSelectNotification={setSelectedNotification}
              onOpenCashBill={(billId) => {
                setSelectedNotification(null);
                setCashBillId(billId);
                setCashBillSheetOpen(true);
              }}
              onAssist={(id) =>
                notificationMutation.mutate({ id, status: "assisted" })
              }
              onComplete={(id) =>
                notificationMutation.mutate({ id, status: "completed" })
              }
              isProcessing={notificationMutation.isPending}
            />
            <AuditLogPanel
              logs={auditQuery.data || []}
              allTableNumbers={(tablesQuery.data || []).map((t) => t.number)}
            />
          </aside>
        </div>
      </div>

      {/* Modals */}
      {reserveTarget && (
        <ReserveTableModal
          table={{ number: reserveTarget.number }}
          isLoading={reserveMutation.isPending}
          onClose={() => setReserveTarget(null)}
          onSubmit={(name, phone) => reserveMutation.mutate({ name, phone })}
        />
      )}

      {unlockTarget && (
        <UnlockTableModal
          table={{ number: unlockTarget.number }}
          onClose={() => setUnlockTarget(null)}
          onSubmit={(note) => unlockMutation.mutate(note)}
        />
      )}

      {cashBillSheetOpen && (
        <BillReadOnlySheet
          billId={cashBillId}
          open={cashBillSheetOpen}
          tableNumber={undefined}
          paidAt={null}
          onClose={() => {
            setCashBillSheetOpen(false);
            setCashBillId("");
          }}
        />
      )}

      {selectedNotification &&
        selectedNotification.type !== "cash_payment_request" && (
          <PaymentDetailModal
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onComplete={(id) => {
              if (
                selectedNotification.type === "cash_payment_request" &&
                selectedNotification.paymentStatus !== "completed"
              ) {
                notificationMutation.mutate({ id, status: "completed" });
              }
            }}
            isCompleting={notificationMutation.isPending}
          />
        )}
    </div>
  );
}
