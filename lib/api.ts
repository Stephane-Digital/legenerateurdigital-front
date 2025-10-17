// lib/api.ts

/**
 * Base URL de l'API (prend en priorité NEXT_PUBLIC_API_URL,
 * puis NEXT_PUBLIC_API_BASE_URL, sinon fallback Render).
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://legenerateurdigital-backend-m9b5.onrender.com";

/* --------------------------------- Token ---------------------------------- */

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

/* ---------------------------- Utils / Helpers ----------------------------- */

function joinUrl(base: string, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

type ApiErrorPayload = { detail?: string; message?: string } | null;

/**
 * Appel générique d'API :
 *  - Headers tapés correctement avec `new Headers`
 *  - Ajout auto du token Bearer
 *  - `cache: "no-store"` pour éviter les caches côté Next
 *  - Lève une Error en cas d'échec (message lisible)
 */
export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();

  // On part des headers éventuels passés à la fonction (HeadersInit)
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(joinUrl(API_BASE, path), {
    ...options,
    headers,
    cache: "no-store",
  });

  // Réponses non OK -> on tente d'extraire un message d'erreur
  if (!res.ok) {
    let payload: ApiErrorPayload = null;
    try {
      payload = await res.json();
    } catch {
      /* ignore JSON parse error */
    }
    const msg =
      payload?.detail ||
      payload?.message ||
      `Erreur API (${res.status})`;
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return null;

  // Réponse JSON
  try {
    return await res.json();
  } catch {
    // au cas où l'API renverrait du vide
    return null;
  }
}

/* --------------------------- Endpoints pratiques -------------------------- */

/** Ping de santé */
export async function checkHealth() {
  try {
    const data = await api("/health");
    return !!data;
  } catch {
    return false;
  }
}

/** Inscription */
export async function register(
  name: string,
  email: string,
  password: string
) {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/** Login : renvoie le token ET le stocke dans localStorage */
export async function login(email: string, password: string) {
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  // Attendu: { access_token: string, token_type?: string }
  const token: string | undefined =
    data?.access_token || data?.token || data?.accessToken;

  if (!token) {
    throw new Error("Réponse de login invalide (token manquant).");
  }
  setToken(token);
  return data;
}

/** Récupération de l'utilisateur courant */
export async function me<T = any>() {
  return api("/users/me") as Promise<T>;
}
