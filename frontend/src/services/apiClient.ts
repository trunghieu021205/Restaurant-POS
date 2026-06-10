// services/apiClient.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null; // SSR guard

  try {
    const raw = localStorage.getItem('auth-storage'); // Zustand persist key
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export default async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  // Merge headers — nếu caller truyền Content-Type rỗng thì xóa đi (cho FormData)
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  const callerHeaders = (options.headers ?? {}) as Record<string, string>;

  // Content-Type: '' là signal để xóa (dùng cho FormData)
  const mergedHeaders = { ...baseHeaders, ...callerHeaders };
  if (mergedHeaders['Content-Type'] === '') {
    delete mergedHeaders['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody?.message ?? `API error ${response.status}: ${path}`
    );
  }

  return response.json() as Promise<T>;
}