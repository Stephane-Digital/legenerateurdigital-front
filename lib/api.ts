// lib/api.ts
const base =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

// --- Token in localStorage ---
export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
}
export function getToken(): string | null {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
}
export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("token");
}

// --- Generic API call ---
type ReqInit = RequestInit & { json?: any };
export async function api<T = any>(
  path: string,
  options: ReqInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
    body: options.json ? JSON.stringify(options.json) : options.body,
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = `Erreur API (${res.status})`;
    try {
      const data = await res.json();
      detail = (data?.detail as string) || detail;
    } catch {}
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

// --- Auth helpers ---
export function register(body: { name: string; email: string; password: string }) {
  return api("/auth/register", { method: "POST", json: body });
}
export async function login(body: { email: string; password: string }) {
  const data = await api<{ access_token: string }>("/auth/login", {
    method: "POST",
    json: body,
  });
  setToken(data.access_token);
  return data;
}
export function me<T = any>() {
  return api<T>("/users/me", { method: "GET" });
}
