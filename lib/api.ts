// lib/api.ts
export const tokenKey = '__token';

export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : undefined;

export const setToken = (t: string) =>
  typeof window !== 'undefined' ? localStorage.setItem(tokenKey, t) : undefined;

export const clearToken = () =>
  typeof window !== 'undefined' ? localStorage.removeItem(tokenKey) : undefined;

export default async function api<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  // On manipule un Dictionnaire pour pouvoir faire headers['Authorization'] = ...
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge propre de init.headers (quel que soit son type)
  if (init.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((v, k) => (headers[k] = v));
    } else if (Array.isArray(init.headers)) {
      for (const [k, v] of init.headers) headers[k] = v as string;
    } else {
      Object.assign(headers, init.headers as Record<string, string>);
    }
  }

  // Ajout du token si présent
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      message = (data as any)?.detail ?? (data as any)?.message ?? message;
    } catch {}
    throw new Error(message);
  }

  // Tente JSON d'abord, sinon retourne du texte
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
