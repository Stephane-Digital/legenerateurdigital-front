import type { AlexContext, AlexToday, DayPlan } from "./types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://legenerateurdigital-backend-m9b5.onrender.com").replace(/\/$/, "");

export type AlexLiveStrategistMode = "live" | "fallback";

export type AlexLiveStrategistPayload = {
  context: AlexContext;
  today: AlexToday | null;
  currentMission: DayPlan | null;
  generatedAtISO: string;
};

export type AlexLiveStrategistResult = {
  mode: AlexLiveStrategistMode;
  title: string;
  diagnostic: string;
  realBlocker: string;
  premiumMission: string;
  mistakeToAvoid: string;
  expectedResult: string;
  actionSteps: string[];
  kpiLabel: string;
  durationMin: number;
  editorPrompt: string;
  raw?: unknown;
};

type BackendLiveStrategistResponse = Partial<AlexLiveStrategistResult> & {
  success?: boolean;
  error?: string;
};

function nowISO() {
  return new Date().toISOString();
}

function cleanText(value: unknown, fallback = ""): string {
  const text = String(value || "")
    .replace(/\*\*/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();

  return text || fallback;
}

function safeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item)).filter(Boolean).slice(0, 5);
}

function getBrowserToken(): string {
  if (typeof window === "undefined") return "";

  const localToken = window.localStorage.getItem("token") || window.localStorage.getItem("access_token") || "";
  if (localToken.trim()) return localToken.trim();

  const match = document.cookie.match(/(?:^|;\s*)(?:token|access_token)=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

function offerLabel(ctx: AlexContext): string {
  return cleanText(ctx.offerDescription, "ton offre");
}

function audienceLabel(ctx: AlexContext): string {
  return cleanText(ctx.targetAudienceDescription, "ton client idéal");
}

function channelLabel(ctx: AlexContext): string {
  const raw = cleanText(ctx.primaryChannel || ctx.channelNotes, "Instagram").toLowerCase();
  if (raw.includes("instagram")) return "Instagram";
  if (raw.includes("facebook")) return "Facebook";
  if (raw.includes("tiktok")) return "TikTok";
  if (raw.includes("linkedin")) return "LinkedIn";
  if (raw.includes("pinterest")) return "Pinterest";
  return cleanText(ctx.primaryChannel || ctx.channelNotes, "Instagram");
}

function blockerLabel(ctx: AlexContext): string {
  switch (ctx.mainBlocker) {
    case "vente":
      return "la vente te semble encore inconfortable";
    case "confiance":
      return "tu doutes encore de ta légitimité";
    case "temps":
      return "tu dois avancer avec peu de temps disponible";
    case "technique":
      return "la technique risque de te ralentir";
    case "dispersion":
    default:
      return "tu dois rester concentré sur une seule action utile";
  }
}

function goalLabel(ctx: AlexContext): string {
  switch (ctx.businessGoal) {
    case "revenu_500":
      return "atteindre tes premiers 500€/mois";
    case "quitter_job":
      return "préparer une sortie progressive du salariat";
    case "premiers_clients":
      return "obtenir tes premiers clients";
    case "business_stable":
      return "construire un business plus stable";
    case "premiers_revenus":
    default:
      return "obtenir tes premiers revenus";
  }
}

function dmKeyword(ctx: AlexContext): string {
  const offer = offerLabel(ctx).toLowerCase();
  if (offer.includes("libert") || offer.includes("code")) return "LIBERTÉ";
  if (offer.includes("coach")) return "COACH";
  if (offer.includes("formation")) return "FORMATION";
  return "PLAN";
}

function fallbackLiveStrategy(payload: AlexLiveStrategistPayload): AlexLiveStrategistResult {
  const ctx = payload.context;
  const mission = payload.currentMission;
  const offer = offerLabel(ctx);
  const audience = audienceLabel(ctx);
  const channel = channelLabel(ctx);
  const keyword = dmKeyword(ctx);
  const durationMin = mission?.durationMin || (ctx.timePerDay === 30 ? 25 : ctx.timePerDay === 60 ? 45 : 60);

  const title = "Diagnostic stratégique Alex";
  const diagnostic = `Tu ne dois pas chercher à convaincre tout le monde aujourd’hui. Ta priorité est d’aider une seule personne précise à se reconnaître dans son blocage, puis à voir ${offer} comme une étape simple pour avancer.`;
  const realBlocker = `Le vrai blocage n’est probablement pas le manque d’informations. Le problème est que ${blockerLabel(ctx)} pendant que ton audience veut ${goalLabel(ctx)}.`;
  const premiumMission = mission?.objective
    ? cleanText(mission.objective)
    : `Créer un message sur ${channel} qui parle à ${audience}, nomme son blocage, puis ouvre une conversation naturelle autour de ${offer}.`;

  const mistakeToAvoid = "Ne transforme pas cette mission en discours commercial. Ne cherche pas à tout expliquer. Fais simplement ressentir à la bonne personne qu’elle est comprise.";
  const expectedResult = `Ce soir, tu dois avoir au minimum un message, un post ou une story capable de déclencher une réponse du type : “c’est exactement mon cas”.`;

  const actionSteps = [
    `Écris une phrase qui commence par : “Tu as déjà essayé, mais...”`,
    `Ajoute une phrase qui montre que le problème n’est pas la personne, mais l’absence d’un chemin clair.`,
    `Relie naturellement cette situation à ${offer}, sans promettre de miracle.`,
    `Termine avec un CTA simple : “DM ${keyword}” ou “commente ${keyword}”.`,
  ];

  return {
    mode: "fallback",
    title,
    diagnostic,
    realBlocker,
    premiumMission,
    mistakeToAvoid,
    expectedResult,
    actionSteps,
    kpiLabel: mission?.kpiLabel || "Réponse qualifiée obtenue",
    durationMin,
    editorPrompt: buildEditorPrompt({ ctx, mission, diagnostic, realBlocker, premiumMission, mistakeToAvoid, expectedResult, actionSteps }),
  };
}

function normalizeBackendResult(response: BackendLiveStrategistResponse, fallback: AlexLiveStrategistResult): AlexLiveStrategistResult {
  const actionSteps = safeArray(response.actionSteps);

  return {
    mode: "live",
    title: cleanText(response.title, fallback.title),
    diagnostic: cleanText(response.diagnostic, fallback.diagnostic),
    realBlocker: cleanText(response.realBlocker, fallback.realBlocker),
    premiumMission: cleanText(response.premiumMission, fallback.premiumMission),
    mistakeToAvoid: cleanText(response.mistakeToAvoid, fallback.mistakeToAvoid),
    expectedResult: cleanText(response.expectedResult, fallback.expectedResult),
    actionSteps: actionSteps.length ? actionSteps : fallback.actionSteps,
    kpiLabel: cleanText(response.kpiLabel, fallback.kpiLabel),
    durationMin: Number(response.durationMin || fallback.durationMin),
    editorPrompt: cleanText(response.editorPrompt, fallback.editorPrompt),
    raw: response,
  };
}

function buildEditorPrompt(args: {
  ctx: AlexContext;
  mission: DayPlan | null;
  diagnostic: string;
  realBlocker: string;
  premiumMission: string;
  mistakeToAvoid: string;
  expectedResult: string;
  actionSteps: string[];
}): string {
  const { ctx, mission, diagnostic, realBlocker, premiumMission, mistakeToAvoid, expectedResult, actionSteps } = args;
  const offer = offerLabel(ctx);
  const audience = audienceLabel(ctx);
  const channel = channelLabel(ctx);
  const format = mission?.format || "post";

  return [
    "Tu es Coach Alex, stratège business LGD.",
    "Crée un contenu clair, humain, orienté action, sans promesse agressive.",
    `Format attendu : ${format}.`,
    `Canal : ${channel}.`,
    `Offre : ${offer}.`,
    `Client idéal : ${audience}.`,
    `Objectif : ${goalLabel(ctx)}.`,
    `Diagnostic : ${diagnostic}`,
    `Blocage réel : ${realBlocker}`,
    `Mission : ${premiumMission}`,
    `Erreur à éviter : ${mistakeToAvoid}`,
    `Résultat attendu : ${expectedResult}`,
    "Actions à intégrer :",
    ...actionSteps.map((step, index) => `${index + 1}. ${step}`),
  ].join("\n");
}

export function buildAlexLiveStrategistPayload(args: {
  context: AlexContext;
  today?: AlexToday | null;
  currentMission?: DayPlan | null;
}): AlexLiveStrategistPayload {
  return {
    context: args.context,
    today: args.today || null,
    currentMission: args.currentMission || null,
    generatedAtISO: nowISO(),
  };
}

export async function generateAlexLiveStrategy(args: {
  context: AlexContext;
  today?: AlexToday | null;
  currentMission?: DayPlan | null;
  signal?: AbortSignal;
}): Promise<AlexLiveStrategistResult> {
  const payload = buildAlexLiveStrategistPayload(args);
  const fallback = fallbackLiveStrategy(payload);
  const token = getBrowserToken();

  try {
    const response = await fetch(`${API_URL}/coach/live-strategist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: args.signal,
    });

    if (!response.ok) return fallback;

    const data = (await response.json()) as BackendLiveStrategistResponse;
    if (data?.success === false || data?.error) return fallback;

    return normalizeBackendResult(data, fallback);
  } catch {
    return fallback;
  }
}

export function buildAlexLiveFallback(args: {
  context: AlexContext;
  today?: AlexToday | null;
  currentMission?: DayPlan | null;
}): AlexLiveStrategistResult {
  return fallbackLiveStrategy(buildAlexLiveStrategistPayload(args));
}
