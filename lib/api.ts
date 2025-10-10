// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export type ApiError = { message?: string };

export async function apiPost<TBody extends object, TResp = any>(
  path: string,
  body: TBody,
  token?: string
): Promise<TResp> {
  if (!API_BASE) throw new Error('NEXT_PUBLIC_API_BASE_URL is missing');
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data as ApiError)?.message || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return data as TResp;
}
