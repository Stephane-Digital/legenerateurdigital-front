// lib/api.ts

const base =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

/* =======================
   Gestion du token (client)
   ======================= */
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

/* =========================
   Helper API (normalisé)
   ========================= */

type ApiOptions = RequestInit & {
  headers?: HeadersInit;
};

function mergeHeaders(baseHeaders: Record<string, string>, extra?: HeadersInit): Record<string, string> {
  const out: Record<string, string> = { ...baseHeaders };

  if (!extra) return out;

  // Cas 1 : Headers
  if (extra instanceof Headers) {
    extra.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }

  // Cas 2 : string[][]
  if (Array.isArray(extra)) {
    for (const [k, v] of extra) {
      out[k] = String(v);
    }
    return out;
  }

  // Cas 3 : Record<string, string>
  return { ...out, ...(extra as Record<string, string>) };
}

export async function api(path: string, options: ApiOptions = {}) {
  const token = getToken();

  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }

  const headers = mergeHeaders(baseHeaders, options.headers);

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
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

/* =========================
   Healthcheck
   ========================= */
export async function checkHealth() {
  try {
    const res = await fetch(`${base}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
