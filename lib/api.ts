// lib/api.ts
export const tokenKey = "_token";

/* 🔑 Gestion du token en localStorage */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(tokenKey);
};

export const setToken = (t: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(tokenKey, t);
};

export const clearToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(tokenKey);
};

/* 🌐 Client API principal */
export async function api(
  path: string,
  init: RequestInit = {}
): Promise<any> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 🔄 Envoi de la requête
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  // ✅ Lire la réponse JSON une seule fois
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Cas sans body (ex: 204 No Content)
  }

  if (!res.ok) {
    const message =
      data?.detail || data?.message || res.statusText || "Erreur inconnue";
    throw new Error(message);
  }

  return data;
}

/* 🔍 Vérification simple pour /health */
export async function checkHealth(): Promise<{
  ok: boolean;
  message: string;
}> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    if (!res.ok) return { ok: false, message: `${res.statusText}` };

    const data = await res.json();
    return { ok: data.status === "ok", message: "API joignable ✅" };
  } catch (e: any) {
    return { ok: false, message: e.message ?? "Erreur de connexion" };
  }
}
