// lib/api.ts

// 1) Base URL : accepte les deux noms d'env variables
const base =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com"; // fallback utile en dev

// -----------------------------
// Gestion très simple du token
// -----------------------------
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

// --------------------------------------
// Helper générique pour les appels JSON
// --------------------------------------
type ApiOptions = RequestInit & { headers?: Record<string, string> };

export async function api(path: string, options: ApiOptions = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message)) ||
      `API error ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// --------------------------------------
// Fonctions spécifiques à l'auth
// --------------------------------------

// /auth/register : JSON
export async function register(email: string, password: string, full_name?: string) {
  const data = await api("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });
  // data = { access_token, token_type }
  setToken(data.access_token);
  return data;
}

// /auth/login : x-www-form-urlencoded (très important)
export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message)) ||
      `API error ${res.status}`;
    throw new Error(msg);
  }

  setToken(data.access_token);
  return data; // { access_token, token_type }
}

export async function me() {
  // utilise le header Authorization via api()
  return api("/users/me", { method: "GET", cache: "no-store" });
}

// Santé simple (utile pour une page /status)
export async function checkHealth() {
  try {
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

// Optionnel : exposer la base pour debug
export const API_BASE = base;
