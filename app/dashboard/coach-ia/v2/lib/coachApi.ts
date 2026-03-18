const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function coachChat(message: string): Promise<{ reply: string; tokens_consumed?: number; quota?: any }> {
  return apiFetch("/coach/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
