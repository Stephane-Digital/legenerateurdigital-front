// app/lib/api.ts
export const tokenKey = "__token";

export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;

export const setToken = (t: string) =>
  typeof window !== "undefined" ? localStorage.setItem(tokenKey, t) : undefined;

export const clearToken = () =>
  typeof window !== "undefined" ? localStorage.removeItem(tokenKey) : undefined;

export async function api<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      message = (data as any)?.detail || (data as any)?.message || message;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}
