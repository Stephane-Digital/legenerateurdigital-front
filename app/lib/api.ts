"use client";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const TOKEN_STORAGE_KEY = "lgd_token";
const AUTH_REQUIRED_ERROR = "AUTH_REQUIRED";

/**
 * LGD
 * Helpers conservés pour compatibilité, mais l'API fonctionne en COOKIE FIRST.
 */
export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (!token) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearInvalidStoredToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.message === AUTH_REQUIRED_ERROR) return true;

    const msg = error.message.toLowerCase();
    return (
      msg.includes("token invalide") ||
      msg.includes("non authentifié") ||
      msg.includes("not authenticated") ||
      msg.includes("invalid token") ||
      msg.includes("401")
    );
  }
  return false;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;

  const current = `${window.location.pathname}${window.location.search}`;
  const next = encodeURIComponent(current);
  window.location.href = `/login?next=${next}`;
}

async function request<T = any>(
  method: HttpMethod,
  path: string,
  body?: any,
  opts?: {
    withCredentials?: boolean;
    headers?: Record<string, string>;
    useAuthHeader?: boolean;
  }
): Promise<{ data: T }> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    ...(opts?.headers || {}),
  };

  if (opts?.useAuthHeader) {
    const token = getAuthToken();
    if (token && !headers["Authorization"] && !headers["authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (body !== undefined && body !== null) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(url, {
    method,
    credentials: opts?.withCredentials === false ? "omit" : "include",
    headers,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const detail =
      typeof payload === "string"
        ? payload
        : payload?.detail
          ? typeof payload.detail === "string"
            ? payload.detail
            : JSON.stringify(payload.detail)
          : JSON.stringify(payload);

    const normalizedDetail = String(detail || `HTTP ${res.status}`);
    const lowered = normalizedDetail.toLowerCase();

    if (
      res.status === 401 &&
      (
        lowered.includes("token invalide") ||
        lowered.includes("non authentifié") ||
        lowered.includes("not authenticated") ||
        lowered.includes("invalid token")
      )
    ) {
      clearInvalidStoredToken();
      redirectToLogin();
      throw new Error(AUTH_REQUIRED_ERROR);
    }

    if (res.status === 401) {
      clearInvalidStoredToken();
      redirectToLogin();
      throw new Error(AUTH_REQUIRED_ERROR);
    }

    throw new Error(normalizedDetail || `HTTP ${res.status}`);
  }

  return { data: payload as T };
}

export const api = {
  get: <T = any>(
    path: string,
    opts?: {
      withCredentials?: boolean;
      headers?: Record<string, string>;
      useAuthHeader?: boolean;
    }
  ) => request<T>("GET", path, undefined, opts),

  post: <T = any>(
    path: string,
    body?: any,
    opts?: {
      withCredentials?: boolean;
      headers?: Record<string, string>;
      useAuthHeader?: boolean;
    }
  ) => request<T>("POST", path, body, opts),

  put: <T = any>(
    path: string,
    body?: any,
    opts?: {
      withCredentials?: boolean;
      headers?: Record<string, string>;
      useAuthHeader?: boolean;
    }
  ) => request<T>("PUT", path, body, opts),

  patch: <T = any>(
    path: string,
    body?: any,
    opts?: {
      withCredentials?: boolean;
      headers?: Record<string, string>;
      useAuthHeader?: boolean;
    }
  ) => request<T>("PATCH", path, body, opts),

  delete: <T = any>(
    path: string,
    opts?: {
      withCredentials?: boolean;
      headers?: Record<string, string>;
      useAuthHeader?: boolean;
    }
  ) => request<T>("DELETE", path, undefined, opts),
};

export default api;
