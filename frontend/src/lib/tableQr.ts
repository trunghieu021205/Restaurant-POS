export type TableQrParseResult =
  | { ok: true; tableId: string; qrToken: string | null }
  | { ok: false; reason: 'empty' | 'foreign' | 'invalid' };

const TABLE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

function extractIdFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length !== 2 || parts[0] !== 'table') {
    return null;
  }

  const id = decodeURIComponent(parts[1]).trim();
  return TABLE_ID_PATTERN.test(id) ? id : null;
}

export function parseTableQrValue(value: string, currentOrigin?: string): TableQrParseResult {
  const raw = value.trim();
  if (!raw) {
    return { ok: false, reason: 'empty' };
  }

  try {
    const url = currentOrigin ? new URL(raw, currentOrigin) : new URL(raw);
    const isAbsoluteUrl = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(raw);
    if (isAbsoluteUrl && currentOrigin && url.origin !== currentOrigin) {
      return { ok: false, reason: 'foreign' };
    }

    const id = extractIdFromPath(url.pathname);
    return id
      ? { ok: true, tableId: id, qrToken: url.searchParams.get('qrToken') }
      : { ok: false, reason: 'invalid' };
  } catch {
    const relativePath = raw.startsWith('/') ? raw : `/${raw}`;
    const directId = extractIdFromPath(relativePath);
    return directId
      ? { ok: true, tableId: directId, qrToken: null }
      : { ok: false, reason: 'invalid' };
  }
}
