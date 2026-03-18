// app/dashboard/coach-ia/lib/types.ts
// Types + small normalizers (NO refactor outside coach-ia).
// Backend remains the source of truth; these helpers just harden against older shapes.

export type CoachUserPlan = "essentiel" | "pro" | "ultime" | (string & {});
export type CoachFocus = "jour" | "objectif" | "diagnostic" | (string & {});

export type CoachMessageRole = "user" | "assistant" | "system";

export type CoachMessage = {
  id: string;
  role: CoachMessageRole;
  content: string;
  /** Canonical (client) */
  createdAt: number;
  /** Backward-compat (older drafts) */
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
  /** Canonical */
  selectedDay?: number;
  /** Backward-compat */
  selected_day?: number;
};

export type CoachQuotaResponse = {
  // Canonical fields we will use everywhere in UI
  plan?: CoachUserPlan;
  limit_tokens?: number;
  tokens_limit?: number;
  tokens_used?: number;
  used_tokens?: number;
  remaining?: number;
  feature?: string;

  // Allow extra fields without breaking
  [k: string]: any;
};

export type CoachSession = {
  id: string;
  createdAt: number;
  userName: string;
  messages: CoachMessage[];
  actionPlan: CoachActionPlan;

  // Optional backend snapshot
  backendQuotas?: CoachQuotaResponse;
};

const PLAN_ALIASES: Record<string, CoachUserPlan> = {
  // essential / essent(i)el
  essential: "essentiel",
  essentiel: "essentiel",
  ess: "essentiel",
  basic: "essentiel",

  // pro
  pro: "pro",
  professional: "pro",

  // ultimate / ultime
  ultimate: "ultime",
  ultime: "ultime",
  premium: "ultime",
};

export function normalizeCoachUserPlan(plan: unknown): CoachUserPlan {
  const p = String(plan ?? "essentiel").toLowerCase().trim();
  return PLAN_ALIASES[p] ?? (p as CoachUserPlan);
}

export function planLabel(plan: CoachUserPlan | undefined): string {
  const p = normalizeCoachUserPlan(plan);
  if (p === "pro") return "Pro";
  if (p === "ultime") return "Ultime";
  return "Essentiel";
}

/**
 * Default token limits per plan (fallback only when backend quota is unavailable).
 * IMPORTANT: Admin IA-Quotas remains the source of truth; this is just a UI fallback.
 */
export function planTokenLimit(plan: CoachUserPlan | undefined): number {
  const p = normalizeCoachUserPlan(plan);
  if (p === "ultime") return 2_000_000;
  if (p === "pro") return 800_000;
  return 200_000;
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

/**
 * Normalize quota response from backend/admin services.
 * Accepts multiple field names to stay compatible with earlier API shapes.
 */
export function normalizeQuota(q: any): CoachQuotaResponse {
  if (!q || typeof q !== "object") return {};

  const plan = q.plan != null ? normalizeCoachUserPlan(q.plan) : undefined;

  const limit =
    clampTokens(q.limit_tokens ?? q.tokens_limit ?? q.limitTokens ?? q.limit ?? 0);

  const used = clampTokens(
    q.tokens_used ?? q.used_tokens ?? q.usedTokens ?? q.used ?? 0
  );

  const remainingRaw =
    q.remaining != null ? clampTokens(q.remaining) : Math.max(0, limit - used);

  return {
    ...q,
    plan,
    limit_tokens: limit,
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
