"use client";

export type PlanTier = "essentiel" | "pro" | "ultime";

export type UpgradeHint = {
  title: string;
  body: string;
};

export type CoachPlanLimits = {
  tier: PlanTier;
  // UI / coaching limits
  optimizeDepth: 1 | 2 | 3;
  // How often user can "restart onboarding / regenerate plan"
  planRegenMax: number; // within cooldown window
  planRegenCooldownDays: number;
  // Mission regen (not exposed everywhere yet, reserved)
  missionRegenPerDay: number;
  // Future flags
  sprintAllowed: boolean;
  facebookUnlockEarly: boolean;
  pinterestUnlock: boolean;
};

export function tierFromPlanLabel(planLabel?: string): PlanTier {
  const p = (planLabel || "").toLowerCase();
  if (p.includes("ult")) return "ultime";
  if (p.includes("pro")) return "pro";
  return "essentiel";
}

export function getCoachPlanLimits(tier: PlanTier): CoachPlanLimits {
  if (tier === "ultime") {
    return {
      tier,
      optimizeDepth: 3,
      planRegenMax: 99,
      planRegenCooldownDays: 0,
      missionRegenPerDay: 99,
      sprintAllowed: true,
      facebookUnlockEarly: true,
      pinterestUnlock: true,
    };
  }
  if (tier === "pro") {
    return {
      tier,
      optimizeDepth: 2,
      planRegenMax: 1,
      planRegenCooldownDays: 1, // once per day
      missionRegenPerDay: 3,
      sprintAllowed: false,
      facebookUnlockEarly: true,
      pinterestUnlock: false,
    };
  }
  // Essentiel
  return {
    tier,
    optimizeDepth: 1,
    planRegenMax: 1,
    planRegenCooldownDays: 7, // once per 7 days
    missionRegenPerDay: 1,
    sprintAllowed: false,
    facebookUnlockEarly: false,
    pinterestUnlock: false,
  };
}

const LS_PLAN_REGEN = "lgd_alex_v2_plan_regen_v1"; // JSON {count:number, windowStartISO:string}

function nowISO() {
  return new Date().toISOString();
}

function diffDays(fromISO: string, toISO: string) {
  const a = new Date(fromISO).getTime();
  const b = new Date(toISO).getTime();
  const ms = b - a;
  return ms / (1000 * 60 * 60 * 24);
}

export function getPlanRegenState(): { count: number; windowStartISO: string } {
  if (typeof window === "undefined") return { count: 0, windowStartISO: nowISO() };
  try {
    const raw = window.localStorage.getItem(LS_PLAN_REGEN);
    if (!raw) return { count: 0, windowStartISO: nowISO() };
    const parsed = JSON.parse(raw);
    if (typeof parsed?.count !== "number" || typeof parsed?.windowStartISO !== "string") {
      return { count: 0, windowStartISO: nowISO() };
    }
    return { count: parsed.count, windowStartISO: parsed.windowStartISO };
  } catch {
    return { count: 0, windowStartISO: nowISO() };
  }
}

export function canRegenPlan(limits: CoachPlanLimits): { ok: boolean; reason?: string } {
  if (limits.planRegenCooldownDays === 0) return { ok: true };

  const state = getPlanRegenState();
  const days = diffDays(state.windowStartISO, nowISO());

  // cooldown window expired -> reset implicitly
  if (days >= limits.planRegenCooldownDays) return { ok: true };

  if (state.count >= limits.planRegenMax) {
    return { ok: false, reason: `Limite atteinte (${limits.planRegenMax}/${limits.planRegenMax})` };
  }
  return { ok: true };
}

export function commitPlanRegen(limits: CoachPlanLimits) {
  if (typeof window === "undefined") return;
  if (limits.planRegenCooldownDays === 0) return;

  const state = getPlanRegenState();
  const days = diffDays(state.windowStartISO, nowISO());

  let next = state;
  if (days >= limits.planRegenCooldownDays) {
    next = { count: 1, windowStartISO: nowISO() };
  } else {
    next = { count: Math.max(0, state.count) + 1, windowStartISO: state.windowStartISO };
  }

  window.localStorage.setItem(LS_PLAN_REGEN, JSON.stringify(next));
}

export function getUpgradeHintForPlanRegen(tier: PlanTier): UpgradeHint | null {
  if (tier === "ultime") return null;
  if (tier === "pro") {
    return {
      title: "Disponible chaque jour en Pro",
      body: "Avec Pro, tu peux relancer ton onboarding 1 fois par jour pour ajuster ton plan.",
    };
  }
  return {
    title: "Disponible en Pro",
    body: "Avec Pro, tu peux relancer ton onboarding 1 fois par jour au lieu d’1 fois tous les 7 jours.",
  };
}
