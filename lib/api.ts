export async function api(
  path: string,
  init: RequestInit = {}
): Promise<any> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  // ✅ Ne lit le body qu’une seule fois
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // le backend n’a pas renvoyé de JSON (ex: 204 No Content)
  }

  if (!res.ok) {
    const message =
      data?.detail || data?.message || res.statusText || "Erreur inconnue";
    throw new Error(message);
  }

  return data;
}
