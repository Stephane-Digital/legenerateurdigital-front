export type CoachUserPlan = "azur" | "essentiel" | "pro" | "ultime" | (string & {});
export type CoachFocus = "jour" | "objectif" | "diagnostic" | (string & {});

export type CoachMessageRole = "user" | "assistant" | "system";

export type CoachMessage = {
  id: string;
  role: CoachMessageRole;
  content: string;
  createdAt: number;
  created_at?: number;
};

export type CoachTask = {
  id: string;
  title: string;
  done: boolean;
};

export type CoachDay = {
  title: string;
  tasks: CoachTask[];
};

export type CoachActionPlan = {
  days: CoachDay[];
  selectedDay?: number;
  selected_day?: number;
};

export type CoachQuotaResponse = {
  plan?: CoachUserPlan;
  display_plan?: string;
  plan_key?: string;
  daily_limit?: number;
  limit_tokens?: number;
  tokens_limit?: number;
  tokens_used?: number;
  used_tokens?: number;
  remaining?: number;
  feature?: string;
  [k: string]: any;
};

export type CoachSession = {
  id: string;
  createdAt: number;
  userName: string;
  messages: CoachMessage[];
  actionPlan: CoachActionPlan;
  backendQuotas?: CoachQuotaResponse;
};

function planFromLimit(limit?: unknown): CoachUserPlan {
  const n = Number(limit ?? 0);
  if (n === 70_000) return "azur";
  if (n === 2_500_000) return "ultime";
  if (n === 1_000_000) return "pro";
  if (n === 400_000) return "essentiel";
  return "essentiel";
}

const PLAN_ALIASES: Record<string, CoachUserPlan> = {
  azur: "azur",
  trial: "azur",
  starter: "azur",
  decouverte: "azur",
  découverte: "azur",
  essential: "essentiel",
  essentiel: "essentiel",
  ess: "essentiel",
  basic: "essentiel",
  pro: "pro",
  professional: "pro",
  ultimate: "ultime",
  ultime: "ultime",
  premium: "ultime",
};

export function normalizeCoachUserPlan(plan: unknown, limit?: unknown): CoachUserPlan {
  const fromLimit = planFromLimit(limit);
  if (Number(limit ?? 0) > 0) return fromLimit;

  const p = String(plan ?? "essentiel").toLowerCase().trim();
  return PLAN_ALIASES[p] ?? (p as CoachUserPlan);
}

export function planLabel(plan: CoachUserPlan | undefined, limit?: number): string {
  const p = normalizeCoachUserPlan(plan, limit);
  if (p === "azur") return "AZUR";
  if (p === "pro") return "Pro";
  if (p === "ultime") return "Ultime";
  return "Essentiel";
}

export function planTokenLimit(plan: CoachUserPlan | undefined): number {
  const p = normalizeCoachUserPlan(plan);
  if (p === "azur") return 70_000;
  if (p === "ultime") return 2_500_000;
  if (p === "pro") return 1_000_000;
  return 400_000;
}

export function normalizeMessage(m: any): CoachMessage {
  const createdAt =
    typeof m?.createdAt === "number"
      ? m.createdAt
      : typeof m?.created_at === "number"
        ? m.created_at
        : Date.now();

  return {
    id: String(m?.id ?? cryptoRandomId()),
    role: (m?.role ?? "user") as CoachMessageRole,
    content: String(m?.content ?? ""),
    createdAt,
    ...(typeof m?.created_at === "number" ? { created_at: m.created_at } : {}),
  };
}

export function normalizeActionPlan(plan: any): CoachActionPlan {
  const daysRaw = Array.isArray(plan?.days) ? plan.days : [];
  const days: CoachDay[] = daysRaw.map((d: any, idx: number) => ({
    title: String(d?.title ?? `Jour ${idx + 1}`),
    tasks: Array.isArray(d?.tasks)
      ? d.tasks.map((t: any, tIdx: number) => ({
          id: String(t?.id ?? `t_${idx}_${tIdx}`),
          title: String(t?.title ?? "Tâche"),
          done: Boolean(t?.done),
        }))
      : [],
  }));

  const selected =
    typeof plan?.selectedDay === "number"
      ? plan.selectedDay
      : typeof plan?.selected_day === "number"
        ? plan.selected_day
        : 0;

  return {
    days,
    selectedDay: selected,
    ...(typeof plan?.selected_day === "number" ? { selected_day: plan.selected_day } : {}),
  };
}

export function clampTokens(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export function normalizeQuota(q: any): CoachQuotaResponse {
  if (!q || typeof q !== "object") return {};

  const limit = clampTokens(q.limit_tokens ?? q.tokens_limit ?? q.limitTokens ?? q.limit ?? q.credits ?? 0);
  const plan = normalizeCoachUserPlan(q.display_plan ?? q.plan_key ?? q.plan, limit);
  const used = clampTokens(q.tokens_used ?? q.used_tokens ?? q.usedTokens ?? q.used ?? 0);
  const remainingRaw =
    q.remaining != null ? clampTokens(q.remaining) : Math.max(0, limit - used);

  return {
    ...q,
    plan,
    display_plan: q.display_plan ?? (plan === "azur" ? "azur" : plan),
    plan_key: q.plan_key ?? plan,
    daily_limit: clampTokens(q.daily_limit ?? (limit === 70_000 ? 10_000 : Math.round(limit / 30))),
    limit_tokens: limit,
    tokens_limit: limit,
    tokens_used: used,
    remaining: remainingRaw,
  };
}

function cryptoRandomId(): string {
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID();
  } catch {}
  return `m_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
