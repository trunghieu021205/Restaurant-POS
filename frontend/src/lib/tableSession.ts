import type { ResolvedTable } from "@/services/table";

const SESSION_PREFIX = "table-session:";
const META_PREFIX = "table-session-meta:";

export interface StoredTableSession {
  tableId: string;
  tableNumber?: number;
  token: string;
  customerName?: string;
  customerPhone?: string;
  savedAt: number;
}

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getTableSession(tableId: string): StoredTableSession | null {
  if (!canUseStorage()) return null;
  const token = localStorage.getItem(`${SESSION_PREFIX}${tableId}`);
  if (!token) return null;

  const rawMeta = localStorage.getItem(`${META_PREFIX}${tableId}`);
  if (!rawMeta) return { tableId, token, savedAt: Date.now() };

  try {
    return { tableId, token, ...JSON.parse(rawMeta) };
  } catch {
    return { tableId, token, savedAt: Date.now() };
  }
}

export function saveTableSession(args: {
  table: ResolvedTable;
  token: string;
  customerName?: string;
  customerPhone?: string;
}) {
  if (!canUseStorage()) return;
  const tableId = args.table.id;
  const meta: StoredTableSession = {
    tableId,
    tableNumber: args.table.number,
    token: args.token,
    customerName: args.customerName ?? args.table.customerName,
    customerPhone: args.customerPhone ?? args.table.customerPhone,
    savedAt: Date.now(),
  };

  localStorage.setItem(`${SESSION_PREFIX}${tableId}`, args.token);
  localStorage.setItem(`${SESSION_PREFIX}${args.table.number}`, args.token);
  localStorage.setItem(`${META_PREFIX}${tableId}`, JSON.stringify(meta));
  localStorage.setItem(`${META_PREFIX}${args.table.number}`, JSON.stringify(meta));
}

export function clearTableSession(tableId: string, tableNumber?: number | string) {
  if (!canUseStorage()) return;
  const ids = new Set([tableId, tableNumber ? String(tableNumber) : ""]);
  ids.forEach((id) => {
    if (!id) return;
    localStorage.removeItem(`${SESSION_PREFIX}${id}`);
    localStorage.removeItem(`${META_PREFIX}${id}`);
  });
}

export function clearAllTableSessions() {
  if (!canUseStorage()) return;
  Object.keys(localStorage)
    .filter((key) => key.startsWith(SESSION_PREFIX) || key.startsWith(META_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}
