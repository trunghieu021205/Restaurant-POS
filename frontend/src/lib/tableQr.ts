export type TableQrParseResult =
  | { ok: true; tableId: string }
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

  const relativePath = raw.startsWith('/') ? raw : `/${raw}`;
  const directId = extractIdFromPath(relativePath);
  if (directId) {
    return { ok: true, tableId: directId };
  }

  try {
    const url = new URL(raw);
    if (currentOrigin && url.origin !== currentOrigin) {
      return { ok: false, reason: 'foreign' };
    }

    const id = extractIdFromPath(url.pathname);
    return id ? { ok: true, tableId: id } : { ok: false, reason: 'invalid' };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}
