// lib/api.ts
const base =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

// --- token local ---
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

// --- appel API générique ---
export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, { ...options, headers });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Erreur API (${res.status})`);
  }

  return data;
}

// endpoints pratiques
export const health = () => api("/health");
export const register = (name: string, email: string, password: string) =>
  api("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
export const login = (email: string, password: string) =>
  api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const me = () => api("/users/me");
