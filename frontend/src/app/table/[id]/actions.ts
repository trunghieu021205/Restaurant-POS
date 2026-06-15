"use server";

import type { TableSessionDto } from "@/services/qr";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface CheckInPayload {
  customerName: string;
  customerPhone: string;
}

export async function checkInTableAction(
  tableId: string,
  qrToken: string,
  payload: CheckInPayload,
): Promise<TableSessionDto> {
  const res = await fetch(
    `${API_URL}/qr/table/${encodeURIComponent(tableId)}/check-in`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken, ...payload }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Check-in thất bại");
  }

  return res.json();
}