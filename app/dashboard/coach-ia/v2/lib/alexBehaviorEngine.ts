import type { AlexContext, DailyLog, MissionBrief, MissionFormat, MissionType } from "./types";

export type AlexBehaviorScore = {
  // 0..100 (higher = better)
  discipline: number;
  execution: number;
  marketResponse: number;
  // 0..100 (higher = more resistance / friction)
  resistance: number;
};

export type AlexBehaviorTag =
  | "streak_ok"
  | "streak_break"
  | "no_result"
  | "good_result"
  | "needs_structure"
  | "needs_courage"
  | "needs_time"
  | "needs_script"
  | "needs_cta";

export type AlexOptimizationRec = {
  title: string;
  cause: string;
  action: string;
  // what to produce in the editor-intelligent
  editorMode: "post" | "carrousel";
  brief: string;
};

export type AlexNextMissionTweak = {
  // keep mission generation stable: we only hint, not rewrite roadmap
  preferredType?: MissionType;
  preferredFormat?: MissionFormat;
  // optional copy/angle to inject
  angleHint?: string;
  ctaHint?: string;
  // business focus
  businessModelHint?: "MMR" | "MLR" | "CONTENT";
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function lastNDone(logs: DailyLog[], n: number): DailyLog[] {
  // logs expected ordered day1..day7; we take last n entries
  const slice = logs.slice(-n);
  return slice;
}

function computeStreak(logs: DailyLog[]): number {
  // streak from latest backwards while done
  let s = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i]?.done) s++;
    else break;
  }
  return s;
}

function avgKpi(logs: DailyLog[]): number {
  const done = logs.filter((l) => l.done);
  if (!done.length) return 0;
  const sum = done.reduce((a, b) => a + (Number.isFinite(b.kpiValue) ? b.kpiValue : 0), 0);
  return sum / done.length;
}

function mostCommonBlocker(logs: DailyLog[]): DailyLog["blocker"] | null {
  const done = logs.filter((l) => l.done);
  if (!done.length) return null;
  const freq: Record<string, number> = {};
  for (const l of done) {
    const k = l.blocker ?? "autre";
    freq[k] = (freq[k] || 0) + 1;
  }
  let best: string | null = null;
  let bestN = -1;
  for (const k of Object.keys(freq)) {
    if (freq[k] > bestN) {
      best = k;
      bestN = freq[k];
    }
  }
  return (best as DailyLog["blocker"]) ?? null;
}

/**
 * Compute a simple behavior score from logs.
 * - discipline: consistency (done ratio + streak)
 * - execution: done ratio (more weight) + time-per-day expectation
 * - marketResponse: KPI average (scaled)
 * - resistance: repeated blockers / low streak
 */
export function computeBehaviorScore(ctx: AlexContext | null, logs: DailyLog[]): AlexBehaviorScore {
  const total = logs.length || 1;
  const doneCount = logs.filter((l) => l.done).length;
  const doneRatio = doneCount / total;

  const streak = computeStreak(logs);
  const discipline = clamp(Math.round(doneRatio * 70 + Math.min(streak, 7) * 5), 0, 100);

  const time = ctx?.timePerDay ?? 30;
  const timeBoost = time === 90 ? 10 : time === 60 ? 5 : 0;
  const execution = clamp(Math.round(doneRatio * 85 + timeBoost), 0, 100);

  const kpi = avgKpi(logs);
  // scale KPI: 0 => 0, 1 => 40, 3 => 70, 5+ => 90
  const marketResponse = clamp(Math.round((Math.log10(1 + kpi) / Math.log10(6)) * 90), 0, 100);

  const common = mostCommonBlocker(logs);
  const resistanceBase = common && common !== "autre" ? 55 : 25;
  const streakPenalty = streak === 0 ? 20 : streak < 2 ? 10 : 0;
  const resistance = clamp(resistanceBase + streakPenalty + Math.round((1 - doneRatio) * 25), 0, 100);

  return { discipline, execution, marketResponse, resistance };
}

export function getBehaviorTags(ctx: AlexContext | null, logs: DailyLog[]): AlexBehaviorTag[] {
  const score = computeBehaviorScore(ctx, logs);
  const tags: AlexBehaviorTag[] = [];

  const streak = computeStreak(logs);
  if (streak >= 3) tags.push("streak_ok");
  if (streak === 0) tags.push("streak_break");

  if (score.marketResponse >= 55) tags.push("good_result");
  else tags.push("no_result");

  const common = mostCommonBlocker(logs);
  if (common === "idees") tags.push("needs_structure");
  if (common === "oser") tags.push("needs_courage");
  if (common === "temps") tags.push("needs_time");
  if (common === "message") tags.push("needs_script");
  if (common === "pas_de_reponses") tags.push("needs_cta");

  return tags;
}

/**
 * IMPORTANT (no-casse):
 * StageRenderer V2 calls this function with 2 args:
 *   makeOptimizationRecFromBlocker(blocker, behaviorTags)
 * Older versions only accepted 1 arg.
 * We keep backward-compat by making the 2nd arg optional.
 */
export function makeOptimizationRecFromBlocker(
  blocker: DailyLog["blocker"] | null,
  _behaviorTags?: AlexBehaviorTag[]
): AlexOptimizationRec | null {
  if (!blocker || blocker === "autre") return null;

  switch (blocker) {
    case "idees":
      return {
        title: "Trouver des idées → on enlève la friction",
        cause: "Tu n’as pas de structure simple à répéter.",
        action: "Utilise 1 template : Problème → Solution → Preuve → CTA DM.",
        editorMode: "carrousel",
        brief:
          "Carrousel Autorité (MMR) : slide 1 = promesse claire, slides 2-4 = 3 étapes simples, slide finale = question + CTA DM.",
      };
    case "message":
      return {
        title: "Je ne savais pas quoi dire → script DM",
        cause: "Ton message est trop complexe ou trop long.",
        action: "Demain : 1 question ouverte + 1 bénéfice + CTA.",
        editorMode: "post",
        brief:
          "Script DM : 1 question de qualification, 1 bénéfice, puis « Tu veux que je te montre comment ? ».",
      };
    case "pas_de_reponses":
      return {
        title: "Personne ne répond → CTA plus clair",
        cause: "Le hook/CTA ne déclenche pas une action.",
        action: "Renforce la slide 1 + CTA DM explicite.",
        editorMode: "carrousel",
        brief:
          "Optimise ton CTA : dernière slide = « Réponds MOT‑CLE en DM » + question directe.",
      };
    case "temps":
      return {
        title: "Manque de temps → version 20 minutes",
        cause: "Trop d’ambition pour une seule session.",
        action: "Version courte : 1 idée, 3 bullets, 1 CTA DM.",
        editorMode: "post",
        brief:
          "Post court : 1 idée forte, 3 bullets, 1 CTA DM. Objectif = régularité.",
      };
    case "oser":
      return {
        title: "Oser publier → petite victoire",
        cause: "La peur de mal faire bloque l’action.",
        action: "Format léger : story / mini post imparfait.",
        editorMode: "post",
        brief:
          "Mini post : 1 anecdote + 1 leçon + 1 question. Publie imparfait, mais publie.",
      };
    default:
      return null;
  }
}

export function getNextMissionTweak(ctx: AlexContext | null, logs: DailyLog[]): AlexNextMissionTweak {
  const tags = getBehaviorTags(ctx, logs);
  const common = mostCommonBlocker(logs);

  // default: focus conversion gradually (MMR/MLR) via IG
  const tweak: AlexNextMissionTweak = {
    businessModelHint: "CONTENT",
    preferredType: "content",
    preferredFormat: "carrousel",
    angleHint: "Autorité simple → problème client brûlant → 3 étapes → CTA DM",
    ctaHint: "CTA DM : « réponds MOT‑CLE »",
  };

  // If results are good, push to conversations/vente (MMR first)
  if (tags.includes("good_result")) {
    tweak.businessModelHint = "MMR";
    tweak.preferredType = "conversation";
    tweak.preferredFormat = "dm_script";
    tweak.angleHint = "Qualification rapide + bénéfice + CTA";
    tweak.ctaHint = "« Tu veux que je te montre comment ? »";
    return tweak;
  }

  // If no results and blocker says CTA -> conversion fix
  if (common === "pas_de_reponses") {
    tweak.businessModelHint = "CONTENT";
    tweak.preferredType = "content";
    tweak.preferredFormat = "carrousel";
    tweak.angleHint = "Hook + CTA DM plus direct";
    tweak.ctaHint = "« DM MOT‑CLE »";
    return tweak;
  }

  // If message blocker -> dm script support (MLR/ebook)
  if (common === "message") {
    tweak.businessModelHint = "MLR";
    tweak.preferredType = "conversation";
    tweak.preferredFormat = "dm_script";
    tweak.angleHint = "DM : question → bénéfice → CTA";
    tweak.ctaHint = "« Tu veux l’ebook ? »";
    return tweak;
  }

  // If time blocker -> shorter mission
  if (common === "temps") {
    tweak.preferredType = "content";
    tweak.preferredFormat = "post";
    tweak.angleHint = "Post court : 3 bullets + CTA";
    tweak.ctaHint = "« DM MOT‑CLE »";
    return tweak;
  }

  // If courage blocker -> low-friction story
  if (common === "oser") {
    tweak.preferredType = "content";
    tweak.preferredFormat = "story";
    tweak.angleHint = "Story : 1 point + question";
    tweak.ctaHint = "« réponds à cette story »";
    return tweak;
  }

  // If ideas blocker -> repeat template
  if (common === "idees") {
    tweak.preferredType = "content";
    tweak.preferredFormat = "carrousel";
    tweak.angleHint = "Template répétable (problème → solution → preuve)";
    tweak.ctaHint = "« DM MOT‑CLE »";
    return tweak;
  }

  return tweak;
}
