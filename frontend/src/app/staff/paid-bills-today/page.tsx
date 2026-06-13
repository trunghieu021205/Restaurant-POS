"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Printer, ReceiptText, Loader2 } from "lucide-react";

import { fetchPaidBillsTodayForStaff } from "@/services/bill";
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

  const items = data ?? [];

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

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Bill đã thanh toán hôm nay
            </h1>
            <p className="text-sm text-neutral-500">
              Dùng để xem lại & in lại hóa đơn nếu staff/quầy quên in trước khi
              hoàn tất.
            </p>
          </div>
          <div className="rounded-card bg-white border border-neutral-200 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <ReceiptText className="h-4 w-4" />
              <span>{items.length} bill</span>
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
            {items.length === 0 ? (
              <div className="rounded-card bg-white p-10 border border-neutral-200 text-center">
                <div className="text-5xl">🧾</div>
                <p className="mt-3 text-neutral-600 font-medium">
                  Chưa có bill nào thanh toán hôm nay
                </p>
              </div>
            ) : (
              items.slice(0, 200).map((b) => (
                <div
                  key={b.id}
                  className="rounded-card bg-white border border-neutral-200 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          Bàn {b.tableNumber ?? b.tableId}
                        </p>
                        <span className="rounded-btn bg-success-500/10 px-2 py-0.5 text-xs font-semibold text-success-700">
                          Paid
                        </span>
                      </div>
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
                          // In trực tiếp từ trang này: tạo nội dung print dạng text/HTML.
                          // Trường hợp bạn muốn format đẹp hơn theo layout BillSheet, có thể đổi sang render component bill.
                          try {
                            const w = window.open(
                              "",
                              "_blank",
                              "width=420,height=720",
                            );
                            if (!w) {
                              toast.error("Không thể mở cửa sổ in");
                              return;
                            }
                            const itemsHtml = b.items
                              .map((it) => {
                                const line = `${it.quantity} x ${it.name}`;
                                const note = it.notes
                                  ? `\n  (${it.notes})`
                                  : "";
                                return `• ${line}${note}`;
                              })
                              .join("<br/>");

                            w.document.write(`
                                <html>
                                  <head>
                                    <title>In bill</title>
                                    <style>
                                      body{font-family:Arial,Helvetica,sans-serif;padding:16px;}
                                      h2{margin:0 0 8px 0;font-size:18px;}
                                      .muted{color:#666;font-size:12px;}
                                      .row{display:flex;justify-content:space-between;font-size:13px;margin-top:4px;}
                                      .total{font-weight:700;font-size:16px;margin-top:10px;}
                                      .items{margin-top:10px;font-size:13px;line-height:1.4;}
                                      pre{white-space:pre-wrap;}
                                    </style>
                                  </head>
                                  <body>
                                    <h2>HÓA ĐƠN THANH TOÁN</h2>
                                    <div class='muted'>Bàn: ${b.tableNumber ?? b.tableId} • Mã: ${b.id.slice(-8).toUpperCase()}</div>
                                    <div class='muted'>Khách: ${b.customerName ?? "-"} • SĐT: ${b.customerPhone ?? "-"}</div>
                                    <div class='muted'>Thời gian: ${formatTime(b.paidAt)}</div>
                                    <div class='muted'>Phương thức: ${b.paymentMethod ?? "-"}</div>
                                    <div class='items'>${itemsHtml}</div>
                                    <div class='row'><span>Tổng cộng</span><span>${formatCurrency(b.totalAmount)}</span></div>
                                    <div class='total'>Cảm ơn quý khách!</div>
                                    <script>
                                      setTimeout(()=>{window.focus();window.print();}, 100);
                                    </script>
                                  </body>
                                </html>
                              `);
                            w.document.close();
                          } catch (e) {
                            toast.error("Lỗi in bill");
                          }
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
                          {b.paymentMethod ?? "-"}
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
