"use client";

import Link from "next/link";
import { QrCode, ShieldCheck } from "lucide-react";

import useAuthStore from "@/stores/auth";

export default function HomePage() {
  const { token, user, hasHydrated } = useAuthStore();
  const isAnonymous = hasHydrated && !token;
  const isAdmin = hasHydrated && user?.role === "admin";

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary-600">
          Restaurant POS
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          Chào mừng đến với nhà hàng của chúng tôi
        </h1>
        <p className="text-neutral-600">
          Quét mã QR trên bàn để bắt đầu gọi món!
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        {isAnonymous && (
          <section className="rounded-card border border-neutral-200 bg-white p-4 shadow-card sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-primary-50 text-primary-600">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-neutral-900">
                  Quét mã QR
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Khách chưa đăng nhập có thể vào đúng bàn bằng QR trên mặt bàn.
                </p>
              </div>
            </div>

            <Link
              href="/scan-qr"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-btn bg-primary-500 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-600 sm:w-auto"
            >
              <QrCode className="h-5 w-5" />
              Quét mã QR
            </Link>
          </section>
        )}

        {isAdmin && (
          <section className="rounded-card border border-neutral-200 bg-white p-4 shadow-card sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-secondary-500/10 text-secondary-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-neutral-900">
                  Quản lý QR bàn
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Xem, tải xuống và in QR cho từng bàn trong hệ thống.
                </p>
              </div>
            </div>

            <Link
              href="/admin/qr-checkin"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-btn bg-neutral-900 px-4 py-3 font-medium text-white transition-colors hover:bg-neutral-800 sm:w-auto"
            >
              <QrCode className="h-5 w-5" />
              Quản lý QR bàn
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
