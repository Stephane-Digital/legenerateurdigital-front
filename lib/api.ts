// lib/api.ts
const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://legenerateurdigital-backend.onrender.com';

// === Gestion du token dans localStorage ===
export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

// === Fonction API principale ===
export default async function api(path: string, options: RequestInit = {}) {
  const token = getToken();

  // ✅ Type corrigé pour éviter l’erreur de typage
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (token) {
    // ✅ Utilise 'Bearer' standard HTTP, pas "Porteur"
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ✅ Exécution de la requête
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  // ✅ Gestion sécurisée de la réponse JSON
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
