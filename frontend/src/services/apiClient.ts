import useAuthStore from "@/stores/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type AuthStorageState = {
  state?: {
    token?: string | null;
    refreshToken?: string | null;
    user?: unknown;
  };
};

function getAuthStorage(): AuthStorageState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getToken(): string | null {
  return getAuthStorage()?.state?.token ?? null;
}

function getRefreshToken(): string | null {
  return getAuthStorage()?.state?.refreshToken ?? null;
}

function updateStoredTokens(token: string, refreshToken?: string | null) {
  if (typeof window === "undefined") return;
  const parsed = getAuthStorage();
  if (!parsed) return;
  parsed.state = {
    ...parsed.state,
    token,
    refreshToken: refreshToken ?? parsed.state?.refreshToken ?? null,
  };
  localStorage.setItem("auth-storage", JSON.stringify(parsed));
  localStorage.setItem("auth-token-refreshed-at", String(Date.now()));
  useAuthStore.getState().setToken(token, refreshToken);
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth-storage");
  localStorage.setItem("auth-logout-at", String(Date.now()));
  useAuthStore.getState().logout();
}

function getTableSessionToken(tableId?: string): string | null {
  if (typeof window === "undefined" || !tableId) return null;
  try {
    const sessionKey = `table-session:${tableId}`;
    return localStorage.getItem(sessionKey) ?? sessionStorage.getItem(sessionKey);
  } catch {
    return null;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn('[refreshAccessToken] No refresh token available');
    return null;
  }

  if (!refreshPromise) {
    console.log('[refreshAccessToken] Attempting to refresh access token');
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          console.error(`[refreshAccessToken] Refresh failed with status ${response.status}`);
          return null;
        }
        const data = await response.json();
        if (!data?.token) {
          console.error('[refreshAccessToken] Refresh response missing token');
          return null;
        }
        console.log('[refreshAccessToken] Refresh successful, updating tokens');
        updateStoredTokens(data.token, data.refreshToken);
        return data.token as string;
      })
      .catch((error) => {
        console.error('[refreshAccessToken] Refresh error:', error);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function buildHeaders(options: RequestInit, token: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers ?? {}) as Record<string, string>),
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (headers["Content-Type"] === "") delete headers["Content-Type"];
  return headers;
}

export default async function apiClient<T>(
  path: string,
  options: RequestInit = {},
  useTableSession = false,
  tableId?: string,
): Promise<T> {
  const token = useTableSession ? getTableSessionToken(tableId) : getToken();
  const request = (nextToken: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: buildHeaders(options, nextToken),
    });

  let response = await request(token);
  if (response.status === 401 && !useTableSession) {
    const nextToken = await refreshAccessToken();
    if (nextToken) response = await request(nextToken);
    else clearStoredAuth();
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.message ?? `API error ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}
