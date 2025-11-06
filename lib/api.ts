// lib/api.ts

// -------------------------------------------------------
// 🌐 Base API
// -------------------------------------------------------
const base =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

// -------------------------------------------------------
// 🔐 Gestion du token (localStorage côté navigateur)
// -------------------------------------------------------
export function setToken(token: string) {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("token", token);
    console.log("✅ Token sauvegardé :", token.slice(0, 25) + "...");
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    console.log("📦 Token récupéré :", token ? token.slice(0, 25) + "..." : "❌ Aucun");
    return token;
  }
  return null;
}

export function clearToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    console.log("🧹 Token supprimé");
  }
}

export function logout() {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
}

// -------------------------------------------------------
// 🧠 Client API générique avec debug
// -------------------------------------------------------
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

  console.log("🔐 [API DEBUG]", {
    path,
    method: options.method || "GET",
    token: token ? token.slice(0, 20) + "..." : "❌ Aucun token",
    headers,
  });

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  // Gestion du "204 No Content"
  if (res.status === 204) return undefined as T;

  let data: any = null;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const detail = data?.detail || res.statusText || "Erreur API";
    throw new Error(detail);
  }

  return data as T;
}

// -------------------------------------------------------
// 🧩 Types
// -------------------------------------------------------
export type TokenResponse = { access_token: string; token_type?: string };

export type UserProfile = {
  id: number;
  email: string;
  full_name?: string;
  created_at: string;
  is_active?: boolean;
};

// -------------------------------------------------------
// 👤 Authentification : Register / Login / Profil
// -------------------------------------------------------
export async function register(body: {
  full_name?: string;
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const data = await api<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
  setToken(data.access_token);
  return data;
}

export async function login(body: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append("username", body.email);
  formData.append("password", body.password);

  const data = await api<TokenResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  setToken(data.access_token);
  return data;
}

export async function me(): Promise<UserProfile> {
  return api<UserProfile>("/users/me");
}

// -------------------------------------------------------
// ❤️ Santé du serveur
// -------------------------------------------------------
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
// ============================================================
// SUPPRESSION D’UNE IDÉE D’ENTREPRISE
// ============================================================
export async function deleteIdeeEntreprise(id: number) {
  const token = getToken();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/entreprise/idee/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la suppression de l’idée");
  }

  return await response.json();
}
// ============================================================
// RÉCUPÉRATION D’UNE IDÉE (pour préremplir le formulaire)
// ============================================================
export async function getIdeeEntreprise(id: number) {
  const token = getToken();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/entreprise/idee`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Erreur lors du chargement des idées");
  const data = await response.json();
  return data.find((idee: any) => idee.id === id);
}

// ============================================================
// MISE À JOUR D’UNE IDÉE
// ============================================================
export async function updateIdeeEntreprise(id: number, payload: any) {
  const token = getToken();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/entreprise/idee/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Erreur lors de la mise à jour de l’idée");
  return await response.json();
}