// app/dashboard/coach-ia/lib/api.ts
// LGD — Coach API (cookie auth)
// - Quota display: GET /ai-quota/global (fallback: /ai-quota/)
// - Consume: POST /ai-quota/consume?amount=...&feature=coach
// - Chat fallback: POST /ai/text/rewrite

export type CoachQuotaDTO = {
  feature?: string;
  plan?: string;
  tokens_used?: number;
  tokens_limit?: number;
  remaining?: number;
};

export type CoachNextActionDTO = {
  title?: string;
  why?: string;
  steps?: string[];
  cta_label?: string;
  cta_hint?: string;
};

// ✅ Important (LGD): default must match the backend cookie host.
// If the backend cookie is set on 127.0.0.1 but we call localhost (or the reverse),
// the browser won't send the auth cookie => 401.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as any),
  };

  // Ajoute Content-Type JSON uniquement si un body est présent et si rien n'est déjà défini
  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  const text = await res.text();
  if (!res.ok) {
    // Standardize auth failure so UI can react cleanly.
    if (res.status === 401) throw new Error("UNAUTH");
    throw new Error(text || `HTTP ${res.status}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export async function coachQuota(): Promise<{
  plan: string;
  tokens_used: number;
  tokens_limit: number;
  remaining: number;
}> {
  // ✅ endpoint principal (Coach V2)
  try {
    const q = await fetchJSON<CoachQuotaDTO>("/ai-quota/global");
    return {
      plan: String(q.plan || ""),
      tokens_used: Number(q.tokens_used || 0),
      tokens_limit: Number(q.tokens_limit || 0),
      remaining: Number(q.remaining || 0),
    };
  } catch (e: any) {
    // If unauthenticated, do not spam fallback endpoints (they will 401 too).
    const msg = String(e?.message || e || "");
    if (msg.includes("UNAUTH") || msg.includes("401")) throw e;

    // ✅ fallback stable
    const q = await fetchJSON<CoachQuotaDTO>("/ai-quota/");
    return {
      plan: String(q.plan || ""),
      tokens_used: Number(q.tokens_used || 0),
      tokens_limit: Number(q.tokens_limit || 0),
      remaining: Number(q.remaining || 0),
    };
  }
}

function estimateTokens(text: string) {
  const t = (text || "").trim();
  if (!t) return 1;
  // approx ~4 chars/token
  return Math.max(1, Math.ceil(t.length / 4));
}

export async function consumeCoachQuota(amount: number): Promise<any> {
  const a = Math.max(1, Math.trunc(Number(amount) || 1));
  return await fetchJSON(`/ai-quota/consume?amount=${a}&feature=coach`, {
    method: "POST",
  });
}

export async function coachChat(message: string): Promise<{ reply: string }> {
  const msg = (message || "").trim();
  if (!msg) return { reply: "" };

  // ⚠️ Coach actuel utilise rewrite (fallback). On débite APRÈS réponse.
  const res = await fetchJSON<any>("/ai/text/rewrite", {
    method: "POST",
    body: JSON.stringify({ text: msg }),
  });

  const reply = String(res?.reply || res?.text || "").trim();

  // ✅ Débit réel si usage.total_tokens existe, sinon estimation msg+reply
  const usageTotal =
    typeof res?.usage?.total_tokens === "number" ? (res.usage.total_tokens as number) : 0;

  const amount = usageTotal > 0 ? usageTotal : estimateTokens(msg) + estimateTokens(reply);

  try {
    await consumeCoachQuota(amount);
  } catch {
    // ne jamais bloquer le coach si débit échoue
  }

  return { reply };
}

export async function coachNextAction(): Promise<CoachNextActionDTO> {
  try {
    return await fetchJSON<CoachNextActionDTO>("/coach/next-action");
  } catch {
    return {
      title: "Définir ton objectif",
      why: "Commence par définir clairement ton objectif business.",
      steps: [],
      cta_label: "Démarrer",
      cta_hint: "Envoie ton objectif.",
    };
  }
}
