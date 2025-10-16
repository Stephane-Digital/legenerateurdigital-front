// lib/api.ts

const base =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

// --- Token côté client ---
export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

// --- Helper pour normaliser les headers ---
function toHeaders(init?: HeadersInit): Headers {
  if (!init) return new Headers();
  if (init instanceof Headers) return new Headers(init);
  if (Array.isArray(init)) return new Headers(init);
  return new Headers(init as Record<string, string>);
}

// --- Appel API générique ---
type ApiOptions = RequestInit & { headers?: HeadersInit };

export async function api(path: string, options: ApiOptions = {}) {
  const token = getToken();

  // On part d’une instance `Headers` => plus de conflit de types
  const headers = new Headers({ "Content-Type": "application/json" });

  if (token) headers.set("Authorization", `Bearer ${token}`);

  // On fusionne proprement les headers passés en option
  const extra = toHeaders(options.headers);
  extra.forEach((value, key) => headers.set(key, value));

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers, // <== on passe une instance `Headers`
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Erreur API ${res.status}`);
  }

  return data;
}

// --- Healthcheck ---
export async function checkHealth() {
  try {
    const res = await fetch(`${base}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
