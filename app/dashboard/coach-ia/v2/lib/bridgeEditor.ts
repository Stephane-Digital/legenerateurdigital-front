"use client";

/**
 * LGD — Coach Alex V2 -> Editor Intelligent bridge
 *
 * Objectif:
 * - Écrire un brief "safe" dans localStorage (jamais "[object Object]")
 * - Toujours inclure un identifiant unique (briefId) + timestamp (createdAtISO)
 *   pour permettre à l'éditeur de détecter / ignorer un brief déjà consommé.
 *
 * Clés utilisées côté EditorModeRouter :
 * - LS_ALEX_BRIEF = "lgd_alex_v2_brief"   (payload JSON stringifié)
 * - LS_COACH_BRIEF = "lgd_coach_brief"   (fallback string pour les anciens Copilot)
 */

export const LS_ALEX_BRIEF = "lgd_alex_v2_brief";
export const LS_COACH_BRIEF = "lgd_coach_brief";

export type EditorBriefPayload =
  | string
  | {
      source?: "coach-alex-v2" | string;
      // texte principal destiné au Copilot (idée / sujet)
      text?: string;

      // mission / contexte (formats possibles)
      missionTitle?: string;
      title?: string;
      objective?: string;
      checklist?: string[];
      kpiLabel?: string;
      durationMin?: number;

      intent?: string;
      level?: string;

      // blocage éventuel (objet libre)
      blocker?: any;

      // meta libre
      meta?: Record<string, any>;
      createdAtISO?: string;
      briefId?: string;
    };

function safeStringify(v: any) {
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}

function normalizeText(t: string) {
  return (t || "").replace(/\s+/g, " ").trim();
}

function makeBriefId() {
  // sans dépendance (crypto peut être bloqué en 일부 environnements)
  return "b_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
}

function buildTextFromMissionLike(obj: any): string {
  if (!obj || typeof obj !== "object") return "";
  const title = normalizeText(String(obj.missionTitle || obj.title || ""));
  const objective = normalizeText(String(obj.objective || ""));
  const kpi = normalizeText(String(obj.kpiLabel || ""));
  const duration = Number.isFinite(obj.durationMin) ? Number(obj.durationMin) : null;

  const checklist: string[] = Array.isArray(obj.checklist) ? obj.checklist.map((x: any) => normalizeText(String(x))).filter(Boolean) : [];

  const lines: string[] = [];
  if (title) lines.push(title);
  if (objective) lines.push(objective);
  if (checklist.length) {
    lines.push("");
    lines.push("Checklist :");
    checklist.forEach((c) => lines.push("- " + c));
  }
  if (kpi || duration !== null) {
    lines.push("");
    const meta: string[] = [];
    if (kpi) meta.push("KPI: " + kpi);
    if (duration !== null) meta.push("Durée: " + duration + " min");
    lines.push(meta.join(" · "));
  }
  return lines.join("\n").trim();
}

/**
 * Écrit le brief sous forme JSON stringifié dans LS_ALEX_BRIEF.
 * Écrit aussi un fallback string dans LS_COACH_BRIEF (compat Copilot legacy).
 */
export function writeEditorBrief(payload: EditorBriefPayload) {
  if (typeof window === "undefined") return;

  try {
    const createdAtISO = new Date().toISOString();
    const briefId = makeBriefId();

    // 1) string direct
    if (typeof payload === "string") {
      const txt = normalizeText(payload);
      if (!txt) return;

      const enriched = {
        source: "coach-alex-v2",
        text: txt,
        createdAtISO,
        briefId,
        version: 2,
      };

      const raw = safeStringify(enriched);
      if (!raw) return;

      window.localStorage.setItem(LS_ALEX_BRIEF, raw);
      window.localStorage.setItem(LS_COACH_BRIEF, txt);
      return;
    }

    // 2) objet
    const obj: any = payload || {};
    const text =
      normalizeText(String(obj.text || "")) ||
      buildTextFromMissionLike(obj);

    if (!text) {
      // rien à écrire => on évite de polluer
      return;
    }

    const enriched = {
      source: obj.source || "coach-alex-v2",
      text,
      missionTitle: obj.missionTitle || obj.title || undefined,
      intent: obj.intent || undefined,
      level: obj.level || undefined,
      blocker: obj.blocker ?? undefined,
      meta: obj.meta ?? undefined,
      createdAtISO: obj.createdAtISO || createdAtISO,
      briefId: obj.briefId || briefId,
      version: 2,
    };

    const raw = safeStringify(enriched);
    if (!raw) return;

    window.localStorage.setItem(LS_ALEX_BRIEF, raw);
    window.localStorage.setItem(LS_COACH_BRIEF, text);
  } catch {
    // ignore
  }
}

/** Nettoie le brief (utile en debug) */
export function clearEditorBrief() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LS_ALEX_BRIEF);
    window.localStorage.removeItem(LS_COACH_BRIEF);
  } catch {
    // ignore
  }
}
