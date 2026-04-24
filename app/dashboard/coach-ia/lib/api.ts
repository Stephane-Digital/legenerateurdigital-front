export type CoachQuotaDTO = {
  feature?: string;
  plan?: string;
  display_plan?: string;
  plan_key?: string;
  daily_limit?: number;
  tokens_used?: number;
  tokens_limit?: number;
  remaining?: number;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as any),
  };

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
    if (res.status === 401) throw new Error("UNAUTH");
    throw new Error(text || `HTTP ${res.status}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

function planFromLimit(limit?: number): string {
  const n = Number(limit || 0);
  if (n === 70_000) return "azur";
  if (n === 2_500_000) return "ultime";
  if (n === 1_000_000) return "pro";
  if (n === 400_000) return "essentiel";
  return "essentiel";
}

export async function coachQuota(): Promise<{
  plan: string;
  display_plan: string;
  plan_key: string;
  daily_limit: number;
  tokens_used: number;
  tokens_limit: number;
  remaining: number;
}> {
  const makeQuota = (q: CoachQuotaDTO) => {
    const tokensLimit = Number(q.tokens_limit || 0);
    const canonicalPlan = planFromLimit(tokensLimit);
    const displayPlan =
      canonicalPlan ||
      String(q.display_plan || q.plan_key || q.plan || "").trim();

    const daily =
      Number(q.daily_limit || 0) > 0
        ? Number(q.daily_limit || 0)
        : tokensLimit === 70_000
          ? 10_000
          : Math.round(tokensLimit / 30);

    return {
      plan: canonicalPlan,
      display_plan: displayPlan,
      plan_key: canonicalPlan,
      daily_limit: Number(daily || 0),
      tokens_used: Number(q.tokens_used || 0),
      tokens_limit: tokensLimit,
      remaining: Number(q.remaining || 0),
    };
  };

  try {
    const q = await fetchJSON<CoachQuotaDTO>("/ai-quota/global");
    return makeQuota(q);
  } catch (e: any) {
    const msg = String(e?.message || e || "");
    if (msg.includes("UNAUTH") || msg.includes("401")) throw e;
    const q = await fetchJSON<CoachQuotaDTO>("/ai-quota/");
    return makeQuota(q);
  }
}

function estimateTokens(text: string) {
  const t = (text || "").trim();
  if (!t) return 1;
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

  const res = await fetchJSON<any>("/ai/text/rewrite", {
    method: "POST",
    body: JSON.stringify({ text: msg }),
  });

  const reply = String(res?.reply || res?.text || "").trim();

  const usageTotal =
    typeof res?.usage?.total_tokens === "number" ? (res.usage.total_tokens as number) : 0;

  const amount = usageTotal > 0 ? usageTotal : estimateTokens(msg) + estimateTokens(reply);

  try {
    await consumeCoachQuota(amount);
  } catch {}

  return { reply };
}

export async function coachNextAction(): Promise<any> {
  try {
    return await fetchJSON<any>("/coach/next-action");
  } catch {
    return {
      title: "Définir ton objectif",
      why: "Clarifie ton cap avant d’agir.",
      steps: ["Choisis un objectif simple", "Valide une action faisable aujourd’hui"],
      cta_label: "Continuer",
      cta_hint: "Passe à l’étape suivante",
    };
  }
}
