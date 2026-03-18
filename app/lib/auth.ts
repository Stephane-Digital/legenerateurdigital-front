// ============================================================
// 🔐 AUTH LGD — VERSION FINALE COMPATIBLE BACKEND FASTAPI
// ============================================================

import { getAuthToken, setAuthToken } from "./api";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export async function loginUser(email: string, password: string) {
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : data?.detail
          ? JSON.stringify(data.detail)
          : "Erreur de connexion";

    throw new Error(detail);
  }

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

export async function registerUser(fullName: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : data?.detail
          ? JSON.stringify(data.detail)
          : "Erreur lors de l'inscription";

    throw new Error(detail);
  }

  return data;
}

export async function me() {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!res.ok) return null;
  return res.json();
}

export async function logoutUser() {
  const token = getAuthToken();

  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  setAuthToken(null);
}
