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

  // Certaines routes peuvent renvoyer du vide → on sécurise
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null as any;
  return res.json();
}

/**
 * ✅ Coach chat (backend = source de vérité pour le débit tokens)
 * POST /coach/chat
 */
export async function coachChat(message: string) {
  return apiFetch("/coach/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

/**
 * Rewrite + quota consume (si tu gardes ce flux côté UI)
 * POST /ai/text/rewrite
 * POST /ai-quota/consume?amount=...&feature=coach
 */
export async function coachRewrite(payload: any) {
  const rewrite = await apiFetch("/ai/text/rewrite", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  let tokens = 0;
  if (rewrite?.usage?.total_tokens) {
    tokens = Number(rewrite.usage.total_tokens) || 0;
  } else if (rewrite?.text) {
    tokens = Math.ceil(String(rewrite.text).length / 4); // fallback estimation
  }

  if (tokens > 0) {
    // ✅ on garde credentials + gestion d'erreur identique
    await apiFetch(`/ai-quota/consume?amount=${tokens}&feature=coach`, {
      method: "POST",
      // body inutile ici, mais apiFetch exige json header: ok
      body: JSON.stringify({}),
    });
  }

  return rewrite;
}
