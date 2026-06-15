"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Printer, ReceiptText, Loader2 } from "lucide-react";

import { fetchPaidBillsTodayForStaff } from "@/services/bill";
import { fetchStaffTables } from "@/services/staffTables";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/lib/roles";
import { toast } from "@/lib/toast";
import { BillReadOnlySheet } from "@/components/bill/BillReadOnlySheet";

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("vi-VN");
}

function formatPaymentMethod(method?: string | null) {
  const methods: Record<string, string> = {
    cash: "Tiền mặt",
    online_qr: "Thanh toán trực tuyến",
    vnpay: "VNPay",
  };
  return methods[method || ""] || method || "-";
}

export default function PaidBillsTodayPage() {
  const router = useRouter();
  const [billSheetOpen, setBillSheetOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedBillPaidAt, setSelectedBillPaidAt] = useState<string | null>(
    null,
  );
  const [selectedBillTableNumber, setSelectedBillTableNumber] = useState<
    number | undefined
  >(undefined);
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>("all");

  const openBillFor = (
    billId: string,
    tableNumber?: number,
    paidAt?: string | null,
  ) => {
    setSelectedBillId(billId);
    setSelectedBillTableNumber(tableNumber);
    setSelectedBillPaidAt(paidAt ?? null);
    setBillSheetOpen(true);
  };
  const { user, isLoading: authLoading } = useAuth();

  const canAccess = hasRole(user, ["staff", "admin"]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["paid-bills-today"],
    queryFn: fetchPaidBillsTodayForStaff,
    enabled: !!canAccess,
  });

  const { data: tablesData } = useQuery({
    queryKey: ["staff-tables"],
    queryFn: fetchStaffTables,
    enabled: !!canAccess,
  });

  const items = data ?? [];

  // Get all table numbers for filter (from all tables, not just bills)
  const tableNumbers = useMemo(() => {
    const tables = new Set<number>();
    if (tablesData) {
      for (const t of tablesData) {
        tables.add(t.number);
      }
    }
    return Array.from(tables).sort((a, b) => a - b);
  }, [tablesData]);

  // Filter items by selected table
  const filteredItems = useMemo(() => {
    if (selectedTableFilter === "all") return items;
    return items.filter((b) => b.tableNumber === Number(selectedTableFilter));
  }, [items, selectedTableFilter]);

  const customerSummary = useMemo(() => {
    const byName = new Map<string, number>();
    for (const b of items) {
      const key = b.customerName || "Chưa có khách";
      byName.set(key, (byName.get(key) ?? 0) + 1);
    }
    return Array.from(byName.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  if (!authLoading && !canAccess) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <BillReadOnlySheet
          billId={selectedBillId ?? ""}
          tableNumber={selectedBillTableNumber}
          paidAt={selectedBillPaidAt}
          open={billSheetOpen}
          onClose={() => setBillSheetOpen(false)}
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Bill đã thanh toán hôm nay
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Table filter */}
            {tableNumbers.length > 0 && (
              <select
                value={selectedTableFilter}
                onChange={(e) => setSelectedTableFilter(e.target.value)}
                className="rounded-card border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="all">Tất cả bàn</option>
                {tableNumbers.map((tableNum) => (
                  <option key={tableNum} value={tableNum.toString()}>
                    Bàn {tableNum}
                  </option>
                ))}
              </select>
            )}
            <div className="rounded-card bg-white border border-neutral-200 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <ReceiptText className="h-4 w-4" />
                <span>{filteredItems.length} bill</span>
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        )}

        {isError && (
          <div className="rounded-card bg-white p-6 border border-error-200 text-error-600">
            <p className="font-medium">
              Không thể tải danh sách bill đã thanh toán
            </p>
            <p className="mt-1 text-sm opacity-80">
              {error instanceof Error ? error.message : "Lỗi không xác định"}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid gap-4">
            {filteredItems.length === 0 ? (
              <div className="rounded-card bg-white p-10 border border-neutral-200 text-center">
                <div className="text-5xl">🧾</div>
                <p className="mt-3 text-neutral-600 font-medium">
                  {selectedTableFilter === "all" 
                    ? "Chưa có bill nào thanh toán hôm nay"
                    : `Chưa có bill nào thanh toán cho bàn ${selectedTableFilter}`}
                </p>
              </div>
            ) : (
              filteredItems.slice(0, 200).map((b) => (
                <div
                  key={b.id}
                  className="rounded-card bg-white border border-neutral-200 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Bàn {b.tableNumber ?? b.tableId}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Thời gian: {formatTime(b.paidAt)}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Khách: {b.customerName || "-"} • SĐT:{" "}
                        {b.customerPhone || "-"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="flex items-center justify-center gap-2 rounded-btn border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                        onClick={() => {
                          window.open(`/bill/${b.id}/print`, "_blank");
                        }}
                      >
                        <Printer className="h-4 w-4" />
                        In
                      </button>
                      <button
                        className="flex items-center justify-center gap-2 rounded-btn bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                        onClick={() =>
                          openBillFor(b.id, b.tableNumber, b.paidAt)
                        }
                      >
                        <span>Xem lại</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-neutral-100 pt-3">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="text-neutral-600">
                        Tổng:{" "}
                        <span className="font-semibold text-neutral-900">
                          {formatCurrency(b.totalAmount)}
                        </span>
                      </div>
                      <div className="text-neutral-600">
                        Thanh toán:{" "}
                        <span className="font-semibold text-neutral-900">
                          {formatPaymentMethod(b.paymentMethod)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
