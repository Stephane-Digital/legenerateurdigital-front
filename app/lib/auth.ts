"use client";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const TOKEN_STORAGE_KEY = "lgd_token";
const USER_STORAGE_KEY = "lgd_user";

type LoginResponse =
  | {
      access_token?: string;
      token?: string;
      user?: any;
      [key: string]: any;
    }
  | null
  | undefined;

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (!token) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    deleteCookie(TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  setCookie(TOKEN_STORAGE_KEY, token, 7);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const localToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (localToken) return localToken;

  const cookieMatch = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_STORAGE_KEY}=([^;]*)`)
  );

  return cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
  deleteCookie(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function extractToken(data: LoginResponse): string | null {
  if (!data || typeof data !== "object") return null;

  if (typeof data.access_token === "string" && data.access_token.trim()) {
    return data.access_token;
  }

  if (typeof data.token === "string" && data.token.trim()) {
    return data.token;
  }

  return null;
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = String(email || "").trim();
  const normalizedPassword = String(password || "");

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email: normalizedEmail,
      password: normalizedPassword,
    }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const detail =
      (data && typeof data === "object" && "detail" in data && String((data as any).detail)) ||
      "Identifiants invalides";

    throw new Error(detail);
  }

  const token = extractToken(data);

  if (!token) {
    throw new Error("Token d'authentification introuvable.");
  }

  setAuthToken(token);

  if (data && typeof data === "object" && "user" in data) {
    setStoredUser((data as any).user ?? null);
  }

  return data;
}

export async function fetchMe() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    return null;
  }

  const data = await parseJsonSafe(res);
  if (data) {
    setStoredUser(data);
  }

  return data;
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // ignore network/logout endpoint issues
  } finally {
    clearAuth();
  }
}

export function isAuthenticated() {
  return !!getAuthToken();
}
