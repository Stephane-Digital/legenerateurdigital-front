// app/lib/api.ts
export const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

// --- Token helpers (localStorage, simple MVP)
const TOKEN_KEY = "lgd_token";
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const getToken = () => (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} – ${text}`);
  }

  // Certains endpoints (ex. logout) peuvent retourner 204 sans body
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return undefined as T;

  return res.json();
}
