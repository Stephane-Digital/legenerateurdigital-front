// lib/api.ts
export const tokenKey = '__token__';

export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : undefined;

export const setToken = (t: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(tokenKey, t);
};

export const clearToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(tokenKey);
};

export default async function api<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      message = (data as any)?.detail || (data as any)?.message || message;
    } catch {}
    throw new Error(message);
  }

  return (await res.text()) ? (res.json() as Promise<T>) : (undefined as T);
}
