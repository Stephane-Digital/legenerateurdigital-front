/// lib/api.ts

// --- Base API ---
const base =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

// --- Gestion du token en localStorage ---
export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("token");
}

// --- Client API générique ---
export async function api<T = any>(
  path: string,
  options: RequestInit = {}
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
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // pas de JSON => data reste null
  }

  if (!res.ok) {
    const detail = (data && (data.detail as string)) || res.statusText || "Erreur API";
    throw new Error(detail);
  }

  return data as T;
}

// --- Types de réponses utiles ---
export type TokenResponse = { access_token: string };

// --- Endpoints Auth ---
export async function login(body: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  return api<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function register(body: {
  name: string;
  email: string;
  password: string;
}): Promise<any> {
  return api<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function me<T = any>(): Promise<T> {
  return api<T>("/users/me");
}

// --- Santé de l’API (optionnel) ---
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}
