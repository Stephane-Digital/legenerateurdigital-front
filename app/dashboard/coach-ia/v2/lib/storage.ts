import type { AlexContext, AlexRoadmap, AlexStage, AlexToday, DailyLog } from "./types";

export const LS_ALEX_V2_CONTEXT = "lgd_alex_v2_context";
export const LS_ALEX_V2_STAGE = "lgd_alex_v2_stage";
export const LS_ALEX_V2_ROADMAP = "lgd_alex_v2_roadmap";
export const LS_ALEX_V2_TODAY = "lgd_alex_v2_today";
export const LS_ALEX_V2_LOGS = "lgd_alex_v2_logs";

// Additional V2 keys that can exist (bridge/editor)
export const LS_ALEX_V2_BRIEF = "lgd_alex_v2_brief";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

/**
 * OPTION C — Logs normalization / deduplication (UPSERT support)
 *
 * Goals:
 * - Ensure 1 log per (weekIndex, dayIndex) (keep latest if duplicates exist)
 * - Drop malformed entries (missing weekIndex/dayIndex positive integers)
 * - Keep deterministic order for UI (weekIndex ASC, dayIndex ASC)
 * - Safety clamp: keep only a CONSECUTIVE prefix of done=true days starting from (1,1),
 *   plus (optionally) the first incomplete day log if present.
 *
 * Why the clamp?
 * - If old/local test logs accidentally contain future days marked done, the UI shows a whole week "Terminé".
 * - In a true daily progression model, you cannot complete day N+1 without day N. So non-consecutive done logs
 *   are always invalid/noise and can be safely ignored.
 */

function toPositiveInt(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i <= 0) return null;
  return i;
}

function getOptionalTimestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}

function getEntryTimestamp(entry: unknown): number {
  if (!entry || typeof entry !== "object") return 0;
  const e = entry as Record<string, unknown>;
  // Prefer updatedAt, then createdAt, then createdAtISO, then ts.
  return (
    getOptionalTimestamp(e.updatedAt) ||
    getOptionalTimestamp(e.createdAt) ||
    getOptionalTimestamp(e.createdAtISO) ||
    getOptionalTimestamp(e.ts) ||
    0
  );
}

type NormalizeResult = { logs: DailyLog[]; dirty: boolean };

function normalizeLogs(raw: unknown): NormalizeResult {
  if (!Array.isArray(raw)) return { logs: [], dirty: raw != null };

  const map = new Map<string, DailyLog>();
  let dirty = false;

  for (const entry of raw) {
    if (!entry || typeof entry !== "object") {
      dirty = true;
      continue;
    }

    const e = entry as Record<string, unknown>;
    const w = toPositiveInt(e.weekIndex);
    const d = toPositiveInt(e.dayIndex);

    if (!w || !d) {
      dirty = true;
      continue;
    }

    const key = `${w}:${d}`;
    const prev = map.get(key);

    if (!prev) {
      map.set(key, entry as DailyLog);
      continue;
    }

    // Duplicates: keep the most recent one (timestamp if available), otherwise keep the last encountered.
    const prevT = getEntryTimestamp(prev);
    const nextT = getEntryTimestamp(entry);

    if (nextT === 0 && prevT === 0) {
      map.set(key, entry as DailyLog);
      dirty = true;
      continue;
    }

    if (nextT >= prevT) {
      map.set(key, entry as DailyLog);
      dirty = true;
    } else {
      dirty = true;
    }
  }

  const deduped = Array.from(map.values()).sort((a, b) => {
    const aw = Number((a as any).weekIndex) || 0;
    const bw = Number((b as any).weekIndex) || 0;
    if (aw !== bw) return aw - bw;
    const ad = Number((a as any).dayIndex) || 0;
    const bd = Number((b as any).dayIndex) || 0;
    return ad - bd;
  });

  if (deduped.length !== raw.length) dirty = true;

  // ---- Safety clamp (consecutive done prefix) ----
  // Build a quick lookup for done=true.
  const doneSet = new Set<string>();
  for (const l of deduped) {
    if ((l as any)?.done === true) {
      const w = Number((l as any).weekIndex) || 0;
      const d = Number((l as any).dayIndex) || 0;
      if (w > 0 && d > 0) doneSet.add(`${w}:${d}`);
    }
  }

  // Find the longest consecutive prefix of done days starting at (1,1),
  // moving day 1..7 then week+1.
  const allowed = new Set<string>();
  let w = 1;
  let d = 1;

  // Guard against infinite loops if something is weird.
  for (let steps = 0; steps < 365; steps++) {
    const key = `${w}:${d}`;
    if (!doneSet.has(key)) break;
    allowed.add(key);

    // advance
    if (d < 7) {
      d += 1;
    } else {
      w += 1;
      d = 1;
    }
  }

  // Optionally allow the FIRST incomplete day (so a "done:false" / blocker log for the current day isn't lost).
  const firstIncompleteKey = `${w}:${d}`;
  // If there is a log object for this key (done can be false), keep it too.
  const hasFirstIncompleteLog = deduped.some((l) => {
    const lw = Number((l as any).weekIndex) || 0;
    const ld = Number((l as any).dayIndex) || 0;
    return `${lw}:${ld}` === firstIncompleteKey;
  });
  if (hasFirstIncompleteLog) allowed.add(firstIncompleteKey);

  const clamped = deduped.filter((l) => {
    const lw = Number((l as any).weekIndex) || 0;
    const ld = Number((l as any).dayIndex) || 0;
    return allowed.has(`${lw}:${ld}`);
  });

  if (clamped.length !== deduped.length) dirty = true;

  return { logs: clamped, dirty };
}

function setV2Logs(next: DailyLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ALEX_V2_LOGS, safeStringify(next));
}

export function getV2Context(): AlexContext | null {
  if (typeof window === "undefined") return null;
  return safeParse<AlexContext>(localStorage.getItem(LS_ALEX_V2_CONTEXT));
}

export function setV2Context(next: AlexContext) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ALEX_V2_CONTEXT, safeStringify(next));
}

export function getV2Stage(): AlexStage | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LS_ALEX_V2_STAGE);
  return (raw as AlexStage) || null;
}

export function setV2Stage(stage: AlexStage) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ALEX_V2_STAGE, stage);
}

export function getV2Roadmap(): AlexRoadmap | null {
  if (typeof window === "undefined") return null;
  return safeParse<AlexRoadmap>(localStorage.getItem(LS_ALEX_V2_ROADMAP));
}

export function setV2Roadmap(next: AlexRoadmap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ALEX_V2_ROADMAP, safeStringify(next));
}

export function getV2Today(): AlexToday | null {
  if (typeof window === "undefined") return null;
  return safeParse<AlexToday>(localStorage.getItem(LS_ALEX_V2_TODAY));
}

export function setV2Today(next: AlexToday) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ALEX_V2_TODAY, safeStringify(next));
}

export function getV2Logs(): DailyLog[] {
  if (typeof window === "undefined") return [];
  const raw = safeParse<unknown>(localStorage.getItem(LS_ALEX_V2_LOGS));
  const { logs, dirty } = normalizeLogs(raw);

  // Auto-heal storage if needed.
  if (dirty) setV2Logs(logs);

  return logs;
}

export function addV2Log(entry: DailyLog) {
  if (typeof window === "undefined") return;

  // Guard against malformed entries (avoid poisoning progression).
  const w = toPositiveInt((entry as any)?.weekIndex);
  const d = toPositiveInt((entry as any)?.dayIndex);
  if (!w || !d) return;

  const raw = safeParse<unknown>(localStorage.getItem(LS_ALEX_V2_LOGS));
  const { logs: prev } = normalizeLogs(raw);

  const key = `${w}:${d}`;
  // UPSERT: replace existing for same day (week/day).
  const next = prev.filter((l) => `${Number((l as any).weekIndex) || 0}:${Number((l as any).dayIndex) || 0}` !== key);
  next.push(entry);

  const { logs: normalized } = normalizeLogs(next as unknown);
  setV2Logs(normalized);
}

export function resetAlexV2All(opts?: { includeLegacy?: boolean }) {
  if (typeof window === "undefined") return;

  // V2 keys
  localStorage.removeItem(LS_ALEX_V2_CONTEXT);
  localStorage.removeItem(LS_ALEX_V2_STAGE);
  localStorage.removeItem(LS_ALEX_V2_ROADMAP);
  localStorage.removeItem(LS_ALEX_V2_TODAY);
  localStorage.removeItem(LS_ALEX_V2_LOGS);
  localStorage.removeItem(LS_ALEX_V2_BRIEF);

  // Also cleanup bridge/editor artefacts that can bias the UX after a reset.
  localStorage.removeItem("lgd_coach_brief");
  localStorage.removeItem("lgd_editor_brief_dismissed");
  localStorage.removeItem("lgd_editor_brief_last_consumed");

  if (opts?.includeLegacy) {
    // Legacy Coach V1 keys (anti “page fantôme” / state conflicts)
    localStorage.removeItem("lgd_coach_profile_v1");
    localStorage.removeItem("lgd_coach_objective_v1");
    localStorage.removeItem("lgd_coach_roadmap_v1");
  }
}
