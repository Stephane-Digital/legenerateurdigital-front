// app/lib/api.ts

// Base URL de l’API (Render). Tu peux laisser l’env ou la valeur par défaut.
const base =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

/* =======================
   Gestion du token
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

/* =======================
   Helper fetch générique
======================= */
export async function api(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();

  // headers typés en Record<string, string>
  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    mergedHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  // essaie de parser le JSON si présent
  let data: any = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || `Erreur API ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

/* =======================
   Endpoints pratiques
======================= */
export async function checkHealth(): Promise<boolean> {
  try {
    const r = await api("/health");
    return !!r;
  } catch {
    return false;
  }
}

export async function register(name: string, email: string, password: string) {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string) {
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // si l’API renvoie un access_token → on le stocke
  const token =
    data?.access_token || data?.token || data?.accessToken || null;
  if (token) setToken(token);

  return data;
}

export async function me() {
  // nécessite un token -> renverra 401 si non connecté
  return api("/users/me", { method: "GET" });
}
