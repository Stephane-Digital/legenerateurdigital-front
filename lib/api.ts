// lib/api.ts

// On accepte les deux noms d’ENV, et on met un fallback EXACT vers ton Render
const base =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://legenerateurdigital-backend-m9b5.onrender.com";

// --- Gestion du token ---
export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
}
export function getToken(): string | null {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
}
export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem("token");
}

// --- Appel API principal ---
export async function api(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (e: any) {
    // Erreur réseau/DNS/CORS
    throw new Error(
      `Impossible de joindre l'API (${url}). Vérifie l'URL et CORS. Détail: ${e?.message || e}`
    );
  }

  let data: any = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) || `HTTP ${res.status}`;
    throw new Error(detail);
  }

  return data;
}

// --- Helpers métier ---
export async function checkHealth() {
  try {
    const res = await fetch(`${base}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function login(email: string, password: string) {
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data?.access_token) setToken(data.access_token);
  return data;
}

// NOTE : si le backend attend "full_name" et pas "name", dé-commente la ligne correspondante
export async function register(name: string, email: string, password: string) {
  return api("/auth/register", {
    method: "POST",
    // body: JSON.stringify({ full_name: name, email, password }), // <-- si le backend attend 'full_name'
    body: JSON.stringify({ name, email, password }), // <-- si le backend attend 'name'
  });
}

export async function me() {
  return api("/users/me");
}
