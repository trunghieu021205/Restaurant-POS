"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Loader2, Printer, QrCode } from "lucide-react";

import { getAllTableQRs, TableQRDto } from "@/services/qr";
import useAuthStore from "@/stores/auth";

export default function AdminQRCheckinPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TableQRDto[]>([]);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAdmin) {
      router.replace("/");
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllTableQRs();
        setData(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể tải danh sách QR");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [hasHydrated, isAdmin, router]);

  const downloadQr = (table: TableQRDto) => {
    const link = document.createElement("a");
    link.href = table.qrCode;
    link.download = `bàn-${table.tableNumber}-qr.png`;
    link.click();
  };

  const printQr = (table: TableQRDto) => {
    const win = window.open("", "_blank", "width=420,height=620");
    if (!win) {
      window.print();
      return;
    }

    win.document.write(`
      <html>
        <head>
          <title>QR Bàn ${table.tableNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 32px; text-align: center; }
            img { width: 320px; max-width: 100%; }
            .id { color: #666; font-size: 12px; word-break: break-all; }
          </style>
        </head>
        <body>
          <h1>Ban ${table.tableNumber}</h1>
          <p class="id">ID: ${table.tableId}</p>
          <img src="${table.qrCode}" alt="QR Bàn ${table.tableNumber}" />
          <p class="id">${table.checkInUrl}</p>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  if (!hasHydrated || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-primary-50 text-primary-600">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Quản lý QR bàn</h1>
            <p className="text-sm text-neutral-500">
              Xem, tải xuống và in QR Code cho toàn bộ bàn hiện có.
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-btn border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-500 hover:text-primary-600"
        >
          Về trang chủ
        </Link>
      </div>

      {error ? (
        <div className="rounded-card border border-error-500/20 bg-white p-8 text-center shadow-card">
          <p className="font-medium text-error-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-btn bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
          >
            Thử lại
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-card border border-neutral-200 bg-white p-10 text-center shadow-card">
          <p className="text-neutral-500">Chưa có bàn nào trong hệ thống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((table) => (
            <article
              key={table.tableId}
              className="rounded-card border border-neutral-200 bg-white p-4 shadow-card"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-neutral-900">Bàn {table.tableNumber}</h2>
                  <p className="mt-1 break-all text-xs text-neutral-500">ID: {table.tableId}</p>
                </div>
                <a
                  href={table.checkInUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-btn p-2 text-neutral-500 hover:bg-neutral-100 hover:text-primary-600"
                  title="Xem QR"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="flex items-center justify-center rounded-card bg-neutral-50 p-3">
                <img
                  src={table.qrCode}
                  alt={`QR Bàn ${table.tableNumber}`}
                  className="aspect-square w-56 max-w-full object-contain"
                />
              </div>

              <p className="mt-3 break-all text-xs text-neutral-500">{table.checkInUrl}</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => downloadQr(table)}
                  className="inline-flex items-center justify-center gap-2 rounded-btn border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:border-primary-500 hover:text-primary-600"
                >
                  <Download className="h-4 w-4" />
                  Tải QR
                </button>
                <button
                  type="button"
                  onClick={() => printQr(table)}
                  className="inline-flex items-center justify-center gap-2 rounded-btn bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  <Printer className="h-4 w-4" />
                  In QR
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
