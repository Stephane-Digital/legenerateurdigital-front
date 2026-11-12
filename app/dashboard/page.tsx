"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import CardLuxe from "@/components/ui/CardLuxe";

// Icons (react-icons/fa)
import {
  FaBolt,
  FaBook,
  FaCheckCircle,
  FaCircle,
  FaEnvelope,
  FaFilter,
  FaGem,
  FaLock,
  FaRobot,
  FaSyncAlt,
  FaTimes,
  FaUserAstronaut
} from "react-icons/fa";

type Plan = "none" | "azur" | "essentiel" | "pro" | "ultime";

type ModalKey =
  | "editor"
  | "coach"
  | "affiliation"
  | "emailing"
  | "ebook"
  | "multiplier"
  | "offer"
  | "funnel"
  | "lead_engine"
  | "planner"
  | "library"
  | "settings";

type DashboardWorkspace = "home" | "activity";

type DailyProgress = {
  idea: boolean;
  content: boolean;
  email: boolean;
  offer: boolean;
};

type AiQuotaSnapshot = {
  remaining: number;
  used: number;
  limit: number;
  planLabel: string;
  planKey: Plan;
  dailyLimit: number;
};

type CmoModuleKey = "coach" | "emailing" | "editor" | "lead_engine";

type CmoDashboardResult = {
  local_target?: CmoModuleKey;
  source?: "live" | "local";
  diagnostic?: string;
  priority_action?: string;
  why_this_action?: string;
  next_best_action?: string;
  risk_to_avoid?: string;
  generated_content?: {
    post?: string;
    email?: string;
    cta?: string;
    lead_magnet_idea?: string;
  };
};

type CmoModuleTarget = {
  key: CmoModuleKey;
  label: string;
  path: string;
};

type MissionCashActionStatus = "generated" | "started" | "completed";

type MissionCashActionRecord = {
  id: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  source: "live" | "local";
  status: MissionCashActionStatus;
  module: CmoModuleKey;
  moduleLabel: string;
  missionTitle: string;
  diagnostic: string;
  opportunity: string;
  expectedResult: string;
  mistakeToAvoid: string;
  immediateAction: string;
  cta: string;
};

type RealActionModule = "editor" | "emailing" | "lead_engine" | "coach" | "planner" | "library";

type RealActionRecord = {
  id: string;
  date: string;
  createdAt: string;
  module: RealActionModule;
  action: string;
  label: string;
  title: string;
  details?: string;
  source?: string;
  missionCashActionId?: string;
  missionCashTitle?: string;
};

const CMO_AUTO_PAYLOAD_KEY = "lgd_cmo_module_auto_payload";
const LGD_MISSION_CASH_HISTORY_KEY = "lgd_mission_cash_action_history";
const LGD_REAL_ACTIONS_HISTORY_KEY = "lgd_real_actions_history_v1";
const LGD_ACTIVE_MISSION_CASH_ACTION_KEY = "lgd_active_mission_cash_action_v1";


const SYSTEMEIO_PLANS_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_PLANS_URL || "https://legenerateurdigital.systeme.io/lgd";
const SYSTEMEIO_TRIAL_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_TRIAL_URL || "https://legenerateurdigital.systeme.io/trial";
const SYSTEMEIO_CREATE_ACCOUNT_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_CREATE_ACCOUNT_URL || "https://legenerateurdigital.systeme.io/lgd";
const SYSTEMEIO_AFFILIATION_URL =
  process.env.NEXT_PUBLIC_SYSTEMEIO_AFFILIATION_URL || "https://legenerateurdigital.systeme.io/affiliation-lgd";

const LOGIN_PATH = "/auth/login";

const LGD_DAILY_PROGRESS_KEY = "lgd_dashboard_daily_progress";

const DEFAULT_PROGRESS: DailyProgress = {
  idea: false,
  content: false,
  email: false,
  offer: false,
};

function planLabel(plan: Plan) {
  if (plan === "ultime") return "ULTIME";
  if (plan === "pro") return "PRO";
  if (plan === "essentiel") return "ESSENTIEL";
  if (plan === "azur") return "AZUR";
  return "VISITEUR";
}


function getStoredToken() {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("lgd_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    ""
  );
}

function normalizeQuotaPlan(...values: Array<string | undefined | null>) {
  const raw = values
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean)
    .join(" ");

  if (!raw) return "";
  if (
    raw.includes("azur") ||
    raw.includes("trial") ||
    raw.includes("starter") ||
    raw.includes("decouverte") ||
    raw.includes("découverte")
  ) {
    return "azur";
  }
  if (raw.includes("ult")) return "ultime";
  if (raw.includes("pro")) return "pro";
  if (raw.includes("essentiel") || raw.includes("essential")) return "essentiel";
  return "";
}

function quotaPlanFromLimit(limit?: number) {
  const n = Number(limit || 0);
  if (n === 70_000) return "azur";
  if (n === 2_500_000) return "ultime";
  if (n === 1_000_000) return "pro";
  if (n === 400_000) return "essentiel";
  return "";
}

function quotaLimitFromPlan(plan: string, fallbackLimit?: number) {
  const p = String(plan || "").toLowerCase();
  if (p === "azur") return 70_000;
  if (p === "ultime") return 2_500_000;
  if (p === "pro") return 1_000_000;
  if (p === "essentiel") return 400_000;
  return Number(fallbackLimit || 0);
}

function quotaDisplayPlan(plan: string) {
  if (plan === "azur") return "AZUR";
  if (plan === "ultime") return "Ultime";
  if (plan === "pro") return "Pro";
  if (plan === "essentiel") return "Essentiel";
  return "Plan";
}

function normalizeAiQuotaSnapshot(data: any): AiQuotaSnapshot {
  const rawLimit = Number(data?.tokens_limit ?? data?.limit_tokens ?? data?.limit ?? 0);
  const planKey =
    (normalizeQuotaPlan(data?.display_plan, data?.plan_key, data?.plan, data?.current_plan) ||
      quotaPlanFromLimit(rawLimit) ||
      "essentiel") as Plan;

  const limit = quotaLimitFromPlan(planKey, rawLimit);
  const used = Number(
    data?.tokens_used ??
      data?.used_tokens ??
      data?.tokens_consumed ??
      data?.monthly_used_tokens ??
      data?.used ??
      0
  );
  const remainingFromApi = Number(data?.remaining ?? data?.tokens_remaining ?? data?.remaining_tokens);
  const remaining = Number.isFinite(remainingFromApi)
    ? remainingFromApi
    : Math.max(limit - (Number.isFinite(used) ? used : 0), 0);
  const dailyLimit =
    Number(data?.daily_limit || 0) > 0
      ? Number(data?.daily_limit || 0)
      : planKey === "azur"
        ? 10_000
        : limit > 0
          ? Math.round(limit / 30)
          : 0;

  return {
    remaining: Math.max(0, Math.round(Number.isFinite(remaining) ? remaining : 0)),
    used: Math.max(0, Math.round(Number.isFinite(used) ? used : 0)),
    limit: Math.max(0, Math.round(Number.isFinite(limit) ? limit : 0)),
    planLabel: quotaDisplayPlan(planKey),
    planKey,
    dailyLimit: Math.max(0, Math.round(Number.isFinite(dailyLimit) ? dailyLimit : 0)),
  };
}

async function fetchAiQuotaSnapshot(): Promise<AiQuotaSnapshot | null> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const token = getStoredToken();
  if (!token) return null;

  const fetchQuota = async (path: string) => {
    const res = await fetch(`${base}${path}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`${path} ${res.status}`);
    return (await res.json()) as any;
  };

  try {
    return normalizeAiQuotaSnapshot(await fetchQuota("/ai-quota/global"));
  } catch (error: any) {
    const message = String(error?.message || error || "");
    if (message.includes("401") || message.includes("403")) throw error;
    return normalizeAiQuotaSnapshot(await fetchQuota("/ai-quota/"));
  }
}

async function fetchPlanFromBackend(): Promise<Plan> {
  const quota = await fetchAiQuotaSnapshot();
  return quota?.planKey || "none";
}

function formatQuotaNumber(value: number) {
  return Math.max(0, Math.round(value)).toLocaleString("fr-FR");
}

type CoachProfileSnapshot = {
  profile?: Record<string, any>;
  intent?: string | null;
  level?: string | null;
  time_per_day?: number | null;
};

function firstProfileString(profile: Record<string, any>, ...keys: string[]) {
  for (const key of keys) {
    const value = profile?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function readableBusinessGoal(value: string) {
  const v = String(value || "").toLowerCase();
  if (v.includes("premiers_revenus")) return "obtenir les premiers revenus";
  if (v.includes("revenu_500")) return "atteindre les premiers 500€/mois";
  if (v.includes("premiers_clients")) return "obtenir les premiers clients";
  if (v.includes("quitter_job")) return "préparer une sortie progressive du salariat";
  if (v.includes("business_stable")) return "construire un business stable";
  return value || "";
}

function readableBlocker(value: string) {
  const v = String(value || "").toLowerCase();
  if (v.includes("vente")) return "ne pas savoir vendre ou avoir peur de vendre";
  if (v.includes("confiance")) return "manquer de confiance ou de légitimité";
  if (v.includes("temps")) return "manquer de temps";
  if (v.includes("technique")) return "bloquer sur la technique";
  if (v.includes("dispersion")) return "se disperser et manquer de focus";
  return value || "";
}

function extractCoachV2Profile(profileOut: CoachProfileSnapshot | null) {
  const root = profileOut?.profile && typeof profileOut.profile === "object" ? profileOut.profile : {};
  const coachV2 =
    (root as any)?.coach_v2 ||
    (root as any)?.coachV2 ||
    (root as any)?.coachV2Snapshot ||
    null;

  const context =
    coachV2?.context && typeof coachV2.context === "object"
      ? coachV2.context
      : root;

  const today =
    coachV2?.today && typeof coachV2.today === "object"
      ? coachV2.today
      : null;

  const mission =
    today?.mission && typeof today.mission === "object"
      ? today.mission
      : null;

  const roadmap =
    coachV2?.roadmap && typeof coachV2.roadmap === "object"
      ? coachV2.roadmap
      : null;

  return { root, coachV2, context, today, mission, roadmap };
}

function compactCoachProfile(profile: Record<string, any>, mission?: Record<string, any> | null) {
  const entries = [
    ["Objectif", readableBusinessGoal(firstProfileString(profile, "businessGoal", "goal", "objective", "intent"))],
    ["Offre", firstProfileString(profile, "offerDescription", "offer", "offerName", "product", "service")],
    ["Client idéal", firstProfileString(profile, "targetAudienceDescription", "audience", "target", "targetAudience")],
    ["Canal", firstProfileString(profile, "primaryChannel", "channelNotes", "preferredChannel")],
    ["Modèle", firstProfileString(profile, "businessModel", "model")],
    ["Niveau", firstProfileString(profile, "level", "stage")],
    ["Temps disponible", firstProfileString(profile, "timePerDay", "time_per_day")],
    ["Blocage", readableBlocker(firstProfileString(profile, "mainBlocker", "blocker", "obstacle"))],
    ["Mission Alex du jour", firstProfileString(mission || {}, "title")],
    ["Objectif mission Alex", firstProfileString(mission || {}, "objective")],
  ].filter(([, value]) => value);

  if (!entries.length) return "Profil Coach Alex encore incomplet.";
  return entries.map(([label, value]) => `${label} : ${value}`).join("\n");
}

async function fetchCoachProfileSnapshot(base: string, token: string): Promise<CoachProfileSnapshot | null> {
  try {
    const res = await fetch(`${base}/coach-profile`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as CoachProfileSnapshot;
  } catch {
    return null;
  }
}

async function fetchCmoDashboardStrategy(): Promise<CmoDashboardResult> {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const token = getStoredToken();

  if (!token) {
    throw new Error("Token utilisateur introuvable.");
  }

  const coachProfile = await fetchCoachProfileSnapshot(base, token);
  const { context, mission } = extractCoachV2Profile(coachProfile);

  const offer = firstProfileString(context, "offerDescription", "offer", "offerName", "product", "service");
  const audience = firstProfileString(context, "targetAudienceDescription", "audience", "target", "targetAudience");
  const businessGoalRaw = firstProfileString(context, "businessGoal", "goal", "objective", "intent");
  const objectiveLabel = readableBusinessGoal(businessGoalRaw);
  const blocker = readableBlocker(firstProfileString(context, "mainBlocker", "blocker", "obstacle"));
  const businessModel = firstProfileString(context, "businessModel", "model");
  const channel = firstProfileString(context, "primaryChannel", "channelNotes", "preferredChannel") || "Instagram";
  const stage = firstProfileString(context, "level", "stage") || coachProfile?.level || "intermediate";
  const timePerDay = firstProfileString(context, "timePerDay", "time_per_day") || String(coachProfile?.time_per_day || "");
  const alexMissionTitle = firstProfileString(mission || {}, "title");
  const alexMissionObjective = firstProfileString(mission || {}, "objective");
  const missionCashHistory = readMissionCashHistory();
  const missionCashHistorySummary = summarizeMissionCashHistory(missionCashHistory);
  const realActionsHistory = readRealActionsHistory();
  const realActionsHistorySummary = summarizeRealActionsHistory(realActionsHistory);

  const objective =
    [
      "Déterminer la Mission Cash du Jour la plus rentable à exécuter maintenant.",
      objectiveLabel ? `Objectif Coach Alex : ${objectiveLabel}.` : "",
      offer ? `Offre : ${offer}.` : "",
      audience ? `Client idéal : ${audience}.` : "",
      blocker ? `Blocage principal : ${blocker}.` : "",
      channel ? `Canal prioritaire : ${channel}.` : "",
    ]
      .filter(Boolean)
      .join("\n") ||
    "Choisir l'action la plus utile à exécuter aujourd'hui selon l'objectif actif du Coach Alex.";

  const res = await fetch(`${base}/cmo-ai/strategy`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      objective,
      niche: businessModel || "business digital / offre à préciser",
      audience,
      offer,
      current_situation: [
        "Contexte actif issu du questionnaire Coach Alex V3.",
        compactCoachProfile(context, mission),
        alexMissionTitle ? `Titre mission Alex : ${alexMissionTitle}` : "",
        alexMissionObjective ? `Objectif mission Alex : ${alexMissionObjective}` : "",
        "Historique Mission Cash récent :",
        missionCashHistorySummary,
        "Actions réellement réalisées dans LGD :",
        realActionsHistorySummary,
      ]
        .filter(Boolean)
        .join("\n"),
      constraints: [
        "Tu dois t'inspirer du cerveau Coach Alex, pas générer une idée marketing générique.",
        "La Mission Cash doit être directement reliée à l'offre, au client idéal, au blocage, au canal et à la mission Alex du jour.",
        "Tiens compte de l'historique Mission Cash récent : si une action similaire vient d'être démarrée, propose l'étape logique suivante.",
        "Tiens compte des actions réellement réalisées : si un contenu, email ou lead magnet vient d'être créé, ne répète pas la même mission et propose l'étape business suivante.",
        "Propose UNE action rapide orientée vente, réponse, DM, email, relance, post ou conversion.",
        "Évite les conseils vagues comme créer un questionnaire ou créer un post engageant si le contexte permet une action plus précise.",
        "Réponse courte, actionnable, non technique, orientée exécution et résultat mesurable aujourd'hui.",
        blocker ? `Blocage principal à traiter : ${blocker}.` : "Blocage principal non renseigné.",
        businessModel ? `Modèle économique : ${businessModel}.` : "Modèle économique non renseigné.",
        timePerDay ? `Temps disponible par jour : ${timePerDay}.` : "Temps disponible non renseigné.",
        "Ne jamais citer LGD, Le Générateur Digital, MRR ou l'affiliation LGD sauf si ces éléments sont explicitement présents dans le profil Coach ou dans l'objectif actif.",
      ].join("\n"),
      preferred_channel: channel || "Choisir automatiquement le meilleur module entre Coach Alex, Emailing IA, Éditeur intelligent ou Lead Engine selon le profil actif.",
      tone: "premium, humain, direct, motivant, orienté cash",
      user_level: stage || "intermediate",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`cmo-ai/strategy ${res.status}`);
  }

  const data = (await res.json()) as any;
  return { ...((data?.result || data || {}) as CmoDashboardResult), source: "live" };
}



function countMatches(text: string, words: string[]) {
  return words.reduce((score, word) => (text.includes(word) ? score + 1 : score), 0);
}

function getCmoModuleTarget(
  result: CmoDashboardResult | null,
  progress?: DailyProgress
): CmoModuleTarget {
  if (result?.local_target === "emailing") {
    return { key: "emailing", label: "Créer avec Emailing IA", path: "/dashboard/email-campaigns" };
  }

  if (result?.local_target === "lead_engine") {
    return { key: "lead_engine", label: "Créer avec Leads IA", path: "/dashboard/lead-engine" };
  }

  if (result?.local_target === "editor") {
    return { key: "editor", label: "Créer dans l’Éditeur", path: "/dashboard/automatisations/reseaux_sociaux/editor-intelligent" };
  }

  if (result?.local_target === "coach") {
    return { key: "coach", label: "Exécuter dans Coach Alex", path: "/dashboard/coach-ia" };
  }

  const priorityText = [result?.priority_action, result?.next_best_action]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const contentText = [
    result?.generated_content?.email,
    result?.generated_content?.post,
    result?.generated_content?.lead_magnet_idea,
    result?.generated_content?.cta,
    result?.diagnostic,
    result?.why_this_action,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const text = `${priorityText} ${contentText}`;

  const scores: Record<CmoModuleTarget["key"], number> = {
    emailing:
      countMatches(priorityText, ["email", "mail", "e-mail", "e-mailing", "campagne", "séquence", "sequence", "newsletter"]) * 3 +
      countMatches(contentText, ["email", "mail", "e-mail", "e-mailing", "campagne", "séquence", "sequence", "newsletter"]),
    lead_engine:
      countMatches(priorityText, ["lead magnet", "lead", "prospect", "landing", "capture", "formulaire", "conversion", "funnel"]) * 3 +
      countMatches(contentText, ["lead magnet", "lead", "prospect", "landing", "capture", "formulaire", "conversion", "funnel"]),
    editor:
      countMatches(priorityText, ["post", "contenu", "carrousel", "publication", "réseau", "reseau", "instagram", "linkedin", "éditeur", "editeur"]) * 3 +
      countMatches(contentText, ["post", "contenu", "carrousel", "publication", "réseau", "reseau", "instagram", "linkedin", "éditeur", "editeur"]),
    coach:
      countMatches(priorityText, ["analyser", "analyse", "ajuster", "stratégie", "strategie", "clarifier", "diagnostic", "approche", "décision", "decision"]) * 3 +
      countMatches(contentText, ["analyser", "analyse", "ajuster", "stratégie", "strategie", "clarifier", "diagnostic", "approche", "décision", "decision"]),
  };

  // Si le module vient déjà d'être exécuté dans le plan du jour,
  // le CMO évite de reproposer systématiquement la même action.
  if (progress?.email) scores.emailing -= 4;
  if (progress?.content) scores.editor -= 3;
  if (progress?.offer) scores.lead_engine -= 2;

  // Fallback intelligent si le backend renvoie une décision trop générique.
  if (Math.max(...Object.values(scores)) <= 0) {
    if (!progress?.email && text.includes("vente")) {
      return {
        key: "emailing",
        label: "Créer avec Emailing IA",
        path: "/dashboard/email-campaigns",
      };
    }

    if (!progress?.offer) {
      return {
        key: "lead_engine",
        label: "Créer avec Leads IA",
        path: "/dashboard/lead-engine",
      };
    }

    if (!progress?.content) {
      return {
        key: "editor",
        label: "Créer dans l’Éditeur",
        path: "/dashboard/automatisations/reseaux_sociaux/editor-intelligent",
      };
    }
  }

  const targetKey = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "coach") as CmoModuleTarget["key"];

  if (targetKey === "emailing") {
    return {
      key: "emailing",
      label: "Créer avec Emailing IA",
      path: "/dashboard/email-campaigns",
    };
  }

  if (targetKey === "lead_engine") {
    return {
      key: "lead_engine",
      label: "Créer avec Leads IA",
      path: "/dashboard/lead-engine",
    };
  }

  if (targetKey === "editor") {
    return {
      key: "editor",
      label: "Créer dans l’Éditeur",
      path: "/dashboard/automatisations/reseaux_sociaux/editor-intelligent",
    };
  }

  return {
    key: "coach",
    label: "Exécuter dans Coach Alex",
    path: "/dashboard/coach-ia",
  };
}


function getPlanFromLocalStorage(): Plan {
  if (typeof window === "undefined") return "none";
  const essentiel = localStorage.getItem("lgd_plan_essentiel");
  const pro = localStorage.getItem("lgd_plan_pro");
  const ultime = localStorage.getItem("lgd_plan_ultime");

  const trial = localStorage.getItem("lgd_plan_trial");
  const starter = localStorage.getItem("lgd_plan_starter");

  if (ultime === "active") return "ultime";
  if (pro === "active") return "pro";
  if (trial === "active" || starter === "active") return "azur";
  if (essentiel === "active") return "essentiel";
  return "none";
}

function readDailyProgress(): DailyProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;

  try {
    const raw = window.localStorage.getItem(LGD_DAILY_PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;

    const parsed = JSON.parse(raw) as Partial<DailyProgress>;
    return {
      idea: Boolean(parsed.idea),
      content: Boolean(parsed.content),
      email: Boolean(parsed.email),
      offer: Boolean(parsed.offer),
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function writeDailyProgress(progress: DailyProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LGD_DAILY_PROGRESS_KEY, JSON.stringify(progress));
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function openSystemeioPlans() {
  openExternal(SYSTEMEIO_PLANS_URL);
}

function goToTrial() {
  openExternal(SYSTEMEIO_TRIAL_URL);
}

function goToRegister() {
  openExternal(SYSTEMEIO_CREATE_ACCOUNT_URL);
}

function goToLogin() {
  window.location.href = LOGIN_PATH;
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
      {children}
    </span>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full rounded-2xl px-5 py-3 font-semibold transition-all",
        "bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20",
        disabled ? "opacity-60 cursor-not-allowed hover:translate-y-0" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl px-5 py-3 font-semibold border border-yellow-600/25 bg-[#0b0b0b] text-white/85 hover:bg-yellow-500/10 transition-all"
    >
      {children}
    </button>
  );
}

function LockBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-3 py-1 text-[12px] text-white/60">
      <FaLock className="text-yellow-300" />
      Connecte-toi pour utiliser
    </span>
  );
}

function ProgressItem({
  done,
  label,
  onClick,
}: {
  done?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-left transition-all",
        "hover:-translate-y-0.5",
        done
          ? "border-yellow-500/30 bg-yellow-500/10 text-white"
          : "border-yellow-600/15 bg-[#0b0b0b] text-white/75 hover:bg-yellow-500/5",
      ].join(" ")}
    >
      <div className="shrink-0">
        {done ? (
          <FaCheckCircle className="text-yellow-400 text-lg" />
        ) : (
          <FaCircle className="text-white/30 text-[12px]" />
        )}
      </div>
      <span className={done ? "text-white/95" : "text-white/70"}>{label}</span>
    </button>
  );
}

function ModalShell({
  open,
  title,
  subtitle,
  icon,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl"
          >
            <div className="card-luxe rounded-2xl border border-yellow-600/20 bg-gradient-to-b from-[#111] to-[#0b0b0b] p-6 sm:p-8 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {icon ? (
                    <div className="mt-1 text-2xl text-yellow-400 drop-shadow-[0_0_12px_rgba(255,184,0,0.35)]">
                      {icon}
                    </div>
                  ) : null}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-yellow-400">
                      {title}
                    </h3>
                    {subtitle ? (
                      <p className="mt-1 text-sm text-white/65">{subtitle}</p>
                    ) : null}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl border border-yellow-600/25 px-3 py-2 text-yellow-200 hover:bg-yellow-500/10 transition-all"
                  aria-label="Fermer"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-6">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const LOCAL_CMO_ACTIONS: CmoDashboardResult[] = [
  {
    local_target: "lead_engine",
    priority_action: "Créer un lead magnet simple pour capter des prospects aujourd’hui.",
    diagnostic: "Tu n’as pas besoin d’une grande stratégie maintenant : tu as besoin d’un point d’entrée clair pour transformer ton trafic en contacts qualifiés.",
    why_this_action: "Une ressource gratuite bien ciblée rassure, donne une première victoire à ton audience et prépare naturellement la vente.",
    next_best_action: "Lance Lead Engine et construis une promesse courte autour du problème le plus urgent de ton client.",
    generated_content: { cta: "Créer mon lead magnet" },
  },
  {
    local_target: "emailing",
    priority_action: "Rédiger un email court pour relancer les prospects qui hésitent.",
    diagnostic: "Le plus rentable aujourd’hui est de réveiller les contacts déjà intéressés au lieu de repartir de zéro.",
    why_this_action: "Un email humain peut lever une objection, rappeler la valeur de ton offre et provoquer une réponse rapide.",
    next_best_action: "Ouvre Emailing IA et prépare une relance orientée bénéfice + passage à l’action.",
    generated_content: { cta: "Préparer ma relance" },
  },
  {
    local_target: "editor",
    priority_action: "Créer un post clair qui montre le problème puis la solution.",
    diagnostic: "Ton audience doit comprendre en quelques secondes pourquoi ton offre l’aide concrètement.",
    why_this_action: "Un contenu simple et visuel crée de la confiance avant de demander une action commerciale.",
    next_best_action: "Ouvre l’Éditeur intelligent et transforme cette mission en publication prête à poster.",
    generated_content: { cta: "Créer mon post" },
  },
  {
    local_target: "coach",
    priority_action: "Clarifier l’offre avant de produire plus de contenu.",
    diagnostic: "Si ton message est flou, chaque action suivante perd en puissance. Le bon premier pas est de verrouiller la promesse.",
    why_this_action: "Une offre plus lisible rend tes emails, posts et pages beaucoup plus faciles à convertir.",
    next_best_action: "Lance Coach Alex et demande-lui de reformuler ton offre en promesse vendable.",
    generated_content: { cta: "Clarifier mon offre" },
  },
];

function getRandomLocalCmoAction() {
  const storageKey = "lgd_dashboard_last_local_cmo_action_index";
  const total = LOCAL_CMO_ACTIONS.length;
  if (total <= 1) return { ...LOCAL_CMO_ACTIONS[0], source: "local" as const };

  let previousIndex = -1;

  if (typeof window !== "undefined") {
    previousIndex = Number(window.sessionStorage.getItem(storageKey) || "-1");
  }

  let nextIndex = Math.floor(Math.random() * total);

  if (nextIndex === previousIndex) {
    nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (total - 1))) % total;
  }

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(storageKey, String(nextIndex));
  }

  return { ...(LOCAL_CMO_ACTIONS[nextIndex] || LOCAL_CMO_ACTIONS[0]), source: "local" as const };
}


function cleanMissionCashText(value?: string, fallback = "") {
  const text = String(value || "")
    .replace(/\*\*/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text || fallback;
}

function missionCashDiagnostic(result: CmoDashboardResult | null) {
  return cleanMissionCashText(
    result?.diagnostic,
    "Alex n’a pas encore assez de contexte pour poser un diagnostic précis. Lance une analyse IA Live ou complète Coach Alex pour obtenir une Mission Cash vraiment personnalisée."
  );
}

function missionCashOpportunity(result: CmoDashboardResult | null) {
  return cleanMissionCashText(
    result?.why_this_action,
    "L’opportunité du jour est de transformer une intention en action visible : un message, un contenu, un email ou une relance capable de créer une réponse concrète."
  );
}

function missionCashExpectedResult(result: CmoDashboardResult | null) {
  return cleanMissionCashText(
    result?.next_best_action,
    "Obtenir au moins un signal mesurable aujourd’hui : réponse, commentaire, DM, clic, email préparé ou prospect relancé."
  );
}

function missionCashMistake(result: CmoDashboardResult | null) {
  return cleanMissionCashText(
    result?.risk_to_avoid,
    "Ne transforme pas cette action en grand chantier. Une Mission Cash doit rester courte, concrète et exécutable aujourd’hui."
  );
}

function missionCashCta(result: CmoDashboardResult | null) {
  return cleanMissionCashText(
    result?.generated_content?.cta,
    "Passer à l’action maintenant"
  );
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function createMissionCashActionId() {
  return `mc_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function readMissionCashHistory(): MissionCashActionRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LGD_MISSION_CASH_HISTORY_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item): MissionCashActionRecord => {
        const statusRaw = String(item.status || "");
        const moduleRaw = String(item.module || "");
        const module: CmoModuleKey = ["coach", "emailing", "editor", "lead_engine"].includes(moduleRaw)
          ? (moduleRaw as CmoModuleKey)
          : "coach";
        const status: MissionCashActionStatus = ["generated", "started", "completed"].includes(statusRaw)
          ? (statusRaw as MissionCashActionStatus)
          : "generated";

        return {
          id: String(item.id || createMissionCashActionId()),
          date: String(item.date || todayISODate()),
          createdAt: String(item.createdAt || new Date().toISOString()),
          updatedAt: String(item.updatedAt || new Date().toISOString()),
          source: item.source === "live" ? "live" : "local",
          status,
          module,
          moduleLabel: String(item.moduleLabel || "Coach Alex"),
          missionTitle: String(item.missionTitle || "Mission Cash"),
          diagnostic: String(item.diagnostic || ""),
          opportunity: String(item.opportunity || ""),
          expectedResult: String(item.expectedResult || ""),
          mistakeToAvoid: String(item.mistakeToAvoid || ""),
          immediateAction: String(item.immediateAction || ""),
          cta: String(item.cta || ""),
        };
      })
      .slice(0, 20);
  } catch {
    return [];
  }
}

function writeMissionCashHistory(history: MissionCashActionRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LGD_MISSION_CASH_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

function summarizeMissionCashHistory(history: MissionCashActionRecord[]) {
  const recent = history.slice(0, 6);
  if (!recent.length) {
    return "Aucune Mission Cash exécutée récemment.";
  }

  return recent
    .map((item) => {
      const status =
        item.status === "completed"
          ? "terminée"
          : item.status === "started"
            ? "démarrée"
            : "générée";

      return [
        `${item.date} — ${item.missionTitle}`,
        `Module : ${item.moduleLabel}`,
        `Statut : ${status}`,
        item.immediateAction ? `Action suivante : ${item.immediateAction}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join("\n");
}


function createRealActionId() {
  return `ra_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeRealActionModule(value: unknown): RealActionModule {
  const raw = String(value || "");
  if (["editor", "emailing", "lead_engine", "coach", "planner", "library"].includes(raw)) {
    return raw as RealActionModule;
  }
  return "coach";
}

function readRealActionsHistory(): RealActionRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LGD_REAL_ACTIONS_HISTORY_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map((item): RealActionRecord => ({
        id: String(item.id || createRealActionId()),
        date: String(item.date || todayISODate()),
        createdAt: String(item.createdAt || new Date().toISOString()),
        module: normalizeRealActionModule(item.module),
        action: String(item.action || "action_completed"),
        label: String(item.label || "Action réalisée"),
        title: String(item.title || item.label || "Action réalisée"),
        details: item.details ? String(item.details) : "",
        source: item.source ? String(item.source) : "lgd",
        missionCashActionId: item.missionCashActionId ? String(item.missionCashActionId) : "",
        missionCashTitle: item.missionCashTitle ? String(item.missionCashTitle) : "",
      }))
      .slice(0, 30);
  } catch {
    return [];
  }
}

function writeRealActionsHistory(history: RealActionRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LGD_REAL_ACTIONS_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
}

function summarizeRealActionsHistory(history: RealActionRecord[]) {
  const recent = history.slice(0, 8);
  if (!recent.length) {
    return "Aucune action réelle détectée récemment.";
  }

  return recent
    .map((item) => {
      const moduleLabel: Record<RealActionModule, string> = {
        editor: "Éditeur intelligent",
        emailing: "Emailing IA",
        lead_engine: "Lead Engine",
        coach: "Coach Alex",
        planner: "Planner",
        library: "Bibliothèque",
      };

      return [
        `${item.date} — ${item.label || item.title}`,
        `Module : ${moduleLabel[item.module] || item.module}`,
        item.missionCashTitle ? `Mission liée : ${item.missionCashTitle}` : "",
        item.details ? `Détail : ${item.details}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join("\n");
}

async function patchCoachProfileRealActionsHistory(history: RealActionRecord[]) {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const token = getStoredToken();
  if (!token) return;

  try {
    await fetch(`${base}/coach-profile`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        profile: {
          real_actions_history: history.slice(0, 20),
          real_action_last: history[0] || null,
          real_actions_last_sync_at: new Date().toISOString(),
        },
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.warn("Real actions history sync skipped", error);
  }
}

function syncDailyProgressFromRealActions(progress: DailyProgress): DailyProgress {
  const history = readRealActionsHistory();
  if (!history.length) return progress;

  const today = todayISODate();
  const todayActions = history.filter((item) => item.date === today);
  if (!todayActions.length) return progress;

  const hasEditor = todayActions.some((item) => item.module === "editor");
  const hasEmailing = todayActions.some((item) => item.module === "emailing");
  const hasLeadEngine = todayActions.some((item) => item.module === "lead_engine");

  return {
    ...progress,
    idea: progress.idea || hasLeadEngine || hasEditor || hasEmailing,
    content: progress.content || hasEditor,
    email: progress.email || hasEmailing,
    offer: progress.offer || hasLeadEngine,
  };
}

type BusinessJournalSummary = {
  totalActions: number;
  contentCreated: number;
  emailsGenerated: number;
  leadMagnetsCreated: number;
  missionsCompleted: number;
  recentActions: RealActionRecord[];
  insightTitle: string;
  insightText: string;
  nextPriority: string;
};

function getCurrentWeekStartISO() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day + 1);
  return monday.toISOString().slice(0, 10);
}

function isSameOrAfterISO(date: string, minDate: string) {
  return String(date || "") >= minDate;
}

function buildBusinessJournalSummary(
  actions: RealActionRecord[],
  missions: MissionCashActionRecord[]
): BusinessJournalSummary {
  const weekStart = getCurrentWeekStartISO();
  const weekActions = actions.filter((item) => isSameOrAfterISO(item.date, weekStart));
  const weekMissions = missions.filter((item) => isSameOrAfterISO(item.date, weekStart));

  const contentCreated = weekActions.filter((item) => item.module === "editor").length;
  const emailsGenerated = weekActions.filter((item) => item.module === "emailing").length;
  const leadMagnetsCreated = weekActions.filter((item) => item.module === "lead_engine").length;
  const missionsCompleted =
    weekMissions.filter((item) => item.status === "completed").length ||
    weekActions.filter((item) => item.missionCashActionId).length;

  let insightTitle = "Premiers signaux détectés";
  let insightText =
    "LGD commence à mémoriser tes actions réelles. Plus tu exécutes dans les modules, plus Mission Cash pourra proposer l’étape utile au bon moment.";
  let nextPriority = "Exécuter une première action complète dans un module LGD.";

  if (contentCreated >= 3 && emailsGenerated === 0) {
    insightTitle = "Tu crées, maintenant il faut convertir";
    insightText =
      "Cette semaine, tu as surtout avancé côté contenu. Le prochain levier n’est pas de produire encore plus, mais de transformer cette attention en conversation ou en relance.";
    nextPriority = "Créer une relance email ou un DM de suivi pour les personnes intéressées.";
  } else if (emailsGenerated >= 2 && contentCreated === 0) {
    insightTitle = "Bonne dynamique email";
    insightText =
      "Tu as déjà travaillé la relance et la conversion. Il manque maintenant une source d’attention régulière pour alimenter ces campagnes.";
    nextPriority = "Créer un post ou carrousel qui amène vers cette campagne.";
  } else if (leadMagnetsCreated >= 1 && emailsGenerated === 0) {
    insightTitle = "Actif de capture créé";
    insightText =
      "Tu as posé une base de conversion avec un lead magnet. Le prochain mouvement logique est de préparer la séquence qui transforme ces contacts en prospects chauds.";
    nextPriority = "Créer la séquence email associée au lead magnet.";
  } else if (contentCreated > 0 && emailsGenerated > 0 && leadMagnetsCreated > 0) {
    insightTitle = "Système business en construction";
    insightText =
      "Tu as touché les trois leviers : attraction, capture et relance. La priorité devient maintenant le suivi commercial et l’optimisation de ce qui fonctionne.";
    nextPriority = "Analyser les réponses, commentaires ou clics puis relancer les prospects les plus chauds.";
  } else if (weekActions.length > 0) {
    insightTitle = "Momentum en cours";
    insightText =
      "LGD détecte déjà des actions réelles cette semaine. Continue à enchaîner une action courte par jour pour créer un vrai rythme d’exécution.";
    nextPriority = "Lancer une nouvelle Mission Cash IA pour choisir l’étape suivante.";
  }

  return {
    totalActions: weekActions.length,
    contentCreated,
    emailsGenerated,
    leadMagnetsCreated,
    missionsCompleted,
    recentActions: actions.slice(0, 4),
    insightTitle,
    insightText,
    nextPriority,
  };
}

function BusinessJournalMetric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4 text-center">
      <div className="text-2xl font-extrabold text-yellow-300">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{label}</div>
    </div>
  );
}

function BusinessJournalCard({ summary }: { summary: BusinessJournalSummary }) {
  return (
    <div className="mt-7 w-full border-t border-yellow-600/15 pt-6">
      <div className="rounded-[28px] border border-yellow-600/20 bg-gradient-to-br from-[#101010] via-[#090909] to-[#15110a] p-5 text-left shadow-[0_0_42px_rgba(255,184,0,0.07)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
              <FaBolt className="text-yellow-300" />
              Journal Business IA
            </div>
            <h3 className="mt-4 text-2xl font-extrabold text-[#ffb800]">
              📈 Tes vraies actions de la semaine
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
              LGD ne se contente plus de générer des idées : il mémorise ce que tu exécutes réellement pour orienter les prochaines missions.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-600/15 bg-black/35 px-4 py-3 text-sm text-yellow-100">
            <span className="font-bold">{summary.totalActions}</span> action{summary.totalActions > 1 ? "s" : ""} détectée{summary.totalActions > 1 ? "s" : ""} cette semaine
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <BusinessJournalMetric value={summary.contentCreated} label="Contenus" />
          <BusinessJournalMetric value={summary.emailsGenerated} label="Emails" />
          <BusinessJournalMetric value={summary.leadMagnetsCreated} label="Lead magnets" />
          <BusinessJournalMetric value={summary.missionsCompleted} label="Missions finies" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-yellow-600/15 bg-black/35 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4c84a]">Analyse IA locale</p>
            <p className="mt-2 text-base font-bold text-yellow-100">{summary.insightTitle}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">{summary.insightText}</p>
            <div className="mt-4 rounded-2xl border border-yellow-500/25 bg-[#151515] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Priorité conseillée</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-yellow-100">{summary.nextPriority}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-600/15 bg-black/35 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4c84a]">Dernières actions détectées</p>
            {summary.recentActions.length ? (
              <div className="mt-3 space-y-3">
                {summary.recentActions.map((action) => (
                  <div key={action.id} className="rounded-2xl border border-yellow-600/10 bg-[#0b0b0b] px-4 py-3">
                    <p className="text-sm font-semibold text-white/85">{action.label || action.title}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {action.date} • {action.module === "lead_engine" ? "Lead Engine" : action.module === "emailing" ? "Emailing IA" : action.module === "editor" ? "Éditeur" : action.module}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-white/55">
                Aucune action réelle détectée pour le moment. Lance une Mission Cash, exécute-la dans un module, puis reviens ici.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildMissionCashRecord(
  result: CmoDashboardResult | null,
  target: CmoModuleTarget,
  status: MissionCashActionStatus
): MissionCashActionRecord {
  const now = new Date().toISOString();

  return {
    id: createMissionCashActionId(),
    date: todayISODate(),
    createdAt: now,
    updatedAt: now,
    source: result?.source === "live" ? "live" : "local",
    status,
    module: target.key,
    moduleLabel: target.label,
    missionTitle: cleanMissionCashText(
      result?.priority_action,
      "Lancer Coach Alex pour clarifier ton action la plus rentable."
    ),
    diagnostic: missionCashDiagnostic(result),
    opportunity: missionCashOpportunity(result),
    expectedResult: missionCashExpectedResult(result),
    mistakeToAvoid: missionCashMistake(result),
    immediateAction: cleanMissionCashText(result?.next_best_action, target.label),
    cta: missionCashCta(result),
  };
}

function addMissionCashHistoryRecord(record: MissionCashActionRecord) {
  const history = readMissionCashHistory();
  const next = [record, ...history.filter((item) => item.id !== record.id)].slice(0, 20);
  writeMissionCashHistory(next);
  return next;
}

async function patchCoachProfileMissionCashHistory(history: MissionCashActionRecord[]) {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const token = getStoredToken();
  if (!token) return;

  try {
    await fetch(`${base}/coach-profile`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        profile: {
          mission_cash_history: history.slice(0, 12),
          mission_cash_last_action: history[0] || null,
          mission_cash_last_sync_at: new Date().toISOString(),
        },
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.warn("Mission Cash history sync skipped", error);
  }
}



function ActivityProgressWorkspace({
  dailyProgress,
  summary,
  missions,
  onOpenCoach,
}: {
  dailyProgress: DailyProgress;
  summary: BusinessJournalSummary;
  missions: MissionCashActionRecord[];
  onOpenCoach: () => void;
}) {
  const completedToday = [
    dailyProgress.idea,
    dailyProgress.content,
    dailyProgress.email,
    dailyProgress.offer,
  ].filter(Boolean).length;

  const coachDays = Array.from({ length: 7 }, (_, index) => {
    const mission = missions[index];
    const done = Boolean(mission?.status === "completed" || index < Math.min(summary.missionsCompleted, 7));

    return {
      day: index + 1,
      label: mission?.missionTitle || `Mission Coach Alex J${index + 1}`,
      done,
    };
  });

  const completedCoachDays = coachDays.filter((item) => item.done).length;
  const productivity = Math.min(100, Math.round(((summary.totalActions + completedToday) / 8) * 100));
  const assiduity = Math.min(100, Math.round((completedCoachDays / 7) * 100));
  const execution = Math.min(100, Math.round((completedToday / 4) * 100));

  const bars = [
    { label: "Productivité", value: productivity, color: "from-green-400 to-emerald-500" },
    { label: "Assiduité", value: assiduity, color: "from-yellow-300 to-yellow-500" },
    { label: "Exécution du jour", value: execution, color: "from-blue-400 to-cyan-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.32 }}
      className="mx-auto mt-10 w-full max-w-[1120px] max-sm:max-w-none px-2 max-sm:px-0 sm:px-4"
    >
      <div className="rounded-[32px] border border-yellow-600/25 bg-gradient-to-br from-[#101010] via-[#090909] to-[#15110a] p-5 shadow-[0_0_70px_rgba(255,184,0,0.10)] max-sm:rounded-none max-sm:border-x-0 max-sm:px-3 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] font-semibold text-yellow-100">
              📊 Activité Progression
            </div>
            <h2 className="mt-4 text-3xl font-black text-[#ffb800] sm:text-4xl">
              Progression Business IA
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
              Suis ton rythme d’exécution sur 7 jours : missions Coach Alex, actions Mission Cash, productivité et assiduité.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCoach}
            className="w-full rounded-2xl border border-yellow-500/25 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-500/15 sm:w-auto"
          >
            Ouvrir Coach Alex
          </button>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-yellow-600/15 bg-black/35 p-4 text-center">
            <div className="text-3xl font-black text-yellow-300">{summary.totalActions}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.15em] text-white/45">actions</div>
          </div>
          <div className="rounded-2xl border border-yellow-600/15 bg-black/35 p-4 text-center">
            <div className="text-3xl font-black text-green-300">{completedToday}/4</div>
            <div className="mt-1 text-xs uppercase tracking-[0.15em] text-white/45">jour</div>
          </div>
          <div className="rounded-2xl border border-yellow-600/15 bg-black/35 p-4 text-center">
            <div className="text-3xl font-black text-blue-300">{completedCoachDays}/7</div>
            <div className="mt-1 text-xs uppercase tracking-[0.15em] text-white/45">missions</div>
          </div>
          <div className="rounded-2xl border border-yellow-600/15 bg-black/35 p-4 text-center">
            <div className="text-3xl font-black text-yellow-100">{productivity}%</div>
            <div className="mt-1 text-xs uppercase tracking-[0.15em] text-white/45">productivité</div>
          </div>
        </div>

        <div className="mt-7 rounded-[28px] border border-yellow-600/20 bg-black/35 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300/80">
                Coach Alex IA
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Progression 7 jours
              </h3>
            </div>
            <div className="w-fit rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-100">
              {completedCoachDays}/7 missions
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {coachDays.map((item) => (
              <div
                key={item.day}
                className={[
                  "flex items-start gap-3 rounded-2xl border px-4 py-3",
                  item.done
                    ? "border-green-400/25 bg-green-400/10"
                    : "border-yellow-600/12 bg-[#080808]",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black",
                    item.done ? "bg-green-400 text-black" : "bg-white/10 text-white/45",
                  ].join(" ")}
                >
                  {item.day}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-5 text-white/90">{item.label}</p>
                  <p className={["mt-1 text-xs", item.done ? "text-green-200" : "text-white/40"].join(" ")}>
                    {item.done ? "Mission accomplie" : "À compléter"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 rounded-[28px] border border-yellow-600/20 bg-black/35 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-300/80">
            Mission Cash IA
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            Activité, productivité et assiduité
          </h3>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <div className="space-y-5">
              {bars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-white/80">{bar.label}</span>
                    <span className="font-black text-yellow-100">{bar.value}%</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-yellow-600/15 bg-[#080808] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Analyse IA</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-yellow-100">
                {summary.insightTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {summary.nextPriority}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Illustrations vectorielles autonomes : aucun fichier public ni dépendance supplémentaire.
function LgdJourneyIllustration({ step }: { step: number }) {
  const metal = `lgd-journey-metal-${step}`;
  const accent = `lgd-journey-accent-${step}`;
  return (
    <svg viewBox="0 0 200 180" className="h-28 w-32 shrink-0 sm:h-36 sm:w-40" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#637080"/><stop offset="1" stopColor="#1b222c"/></linearGradient>
        <linearGradient id={accent} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe783"/><stop offset="1" stopColor="#ffbd16"/></linearGradient>
      </defs>
      <ellipse cx="100" cy="157" rx="78" ry="13" fill="#000" opacity=".3"/>
      <path d="M18 139 98 111 183 140 102 170Z" fill="#202834" stroke="#3b4654"/>
      <path d="m18 139 84 27 81-26" fill="none" stroke="#ffcc33" strokeWidth="3"/>
      {step === 1 ? <>
        <path d="M25 23h55a9 9 0 0 1 9 9v29a9 9 0 0 1-9 9H50L34 82V70h-9a9 9 0 0 1-9-9V32a9 9 0 0 1 9-9Z" fill={`url(#${metal})`} stroke="#8591a1"/>
        <path d="M119 19h47a10 10 0 0 1 10 10v30a10 10 0 0 1-10 10h-5v13l-16-13h-26a10 10 0 0 1-10-10V29a10 10 0 0 1 10-10Z" fill={`url(#${accent})`}/>
        <g fill="#e7edf5"><circle cx="35" cy="46" r="4"/><circle cx="52" cy="46" r="4"/><circle cx="69" cy="46" r="4"/></g>
        <g fill="#28313d"><circle cx="126" cy="43" r="4"/><circle cx="143" cy="43" r="4"/><circle cx="160" cy="43" r="4"/></g>
        <circle cx="99" cy="106" r="47" fill="#ffce37"/><circle cx="99" cy="106" r="39" fill={`url(#${metal})`} stroke="#acb6c2" strokeWidth="2"/>
        <path d="m118 78-9 38-29 18 9-38Z" fill={`url(#${accent})`}/><path d="m99 106-19 28 9-38Z" fill="#f5f7fa"/><circle cx="99" cy="106" r="5" fill="#111722"/>
      </> : step === 2 ? <>
        <circle cx="85" cy="91" r="60" fill={`url(#${metal})`} stroke="#8c98a8" strokeWidth="2"/><circle cx="85" cy="91" r="44" fill="#e0e5ec"/><circle cx="85" cy="91" r="30" fill="#27303c"/><circle cx="85" cy="91" r="16" fill={`url(#${accent})`}/>
        <path d="m85 91 66-66m-17 17 2-23 18-12-2 20 20-1-16 18Z" stroke="#ffcd38" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="110" y="103" width="65" height="48" rx="9" fill={`url(#${metal})`} stroke="#758295"/><rect x="120" y="114" width="23" height="24" rx="4" fill="#ffcd38"/><path d="m124 126 5 5 10-12" fill="none" stroke="#252c36" strokeWidth="3"/><path d="M151 119h14m-14 10h10" stroke="#d8e0ea" strokeWidth="3"/>
      </> : step === 3 ? <>
        <rect x="20" y="48" width="52" height="96" rx="10" fill={`url(#${metal})`} stroke="#8995a5"/><rect x="75" y="30" width="52" height="114" rx="10" fill={`url(#${metal})`} stroke="#8995a5"/><rect x="130" y="48" width="52" height="96" rx="10" fill={`url(#${metal})`} stroke="#8995a5"/>
        <rect x="29" y="77" width="34" height="33" rx="3" fill="#e4eaf1"/><path d="m30 108 12-18 9 10 7-7 5 15" fill="#ffcc33"/><circle cx="55" cy="85" r="4" fill="#ffcc33"/>
        <path d="M88 70v26a13 13 0 0 0 26 0V70" fill="none" stroke="#ffcc33" strokeWidth="10"/><path d="M88 70v11m26-11v11" stroke="#f1f4f8" strokeWidth="10"/>
        <rect x="138" y="80" width="36" height="28" rx="3" fill={`url(#${accent})`}/><path d="m139 82 17 13 17-13" fill="none" stroke="#303946" strokeWidth="3"/>
      </> : step === 4 ? <>
        <rect x="35" y="33" width="109" height="112" rx="12" fill={`url(#${metal})`} stroke="#8a97a7" strokeWidth="2"/><path d="M47 33h85a12 12 0 0 1 12 12v20H35V45a12 12 0 0 1 12-12Z" fill={`url(#${accent})`}/><path d="M59 24v22m60-22v22" stroke="#d8e1ec" strokeWidth="8" strokeLinecap="round"/>
        {[0,1,2].map(row => [0,1,2].map(col => <rect key={`${row}-${col}`} x={49+col*29} y={78+row*21} width="18" height="13" rx="3" fill={row===1&&col===1?"#ffcd38":"#d7dfe8"}/>))}
        <path d="M119 148q35 0 47-38m-22 4 31-19-5 36-10-15Z" fill="#ffcc33" stroke="#ffcc33" strokeWidth="5" strokeLinejoin="round"/>
      </> : <>
        <rect x="46" y="32" width="94" height="104" rx="9" fill={`url(#${metal})`} stroke="#8190a1"/><rect x="57" y="45" width="89" height="90" rx="6" fill="#b7c4d4"/><rect x="68" y="58" width="87" height="78" rx="5" fill="#f0f4fa"/><path d="M80 73h53m-53 12h43" stroke="#9aa9bb" strokeWidth="4"/>
        <path d="M29 77h44l12 13h79l-15 55H38Z" fill={`url(#${accent})`} stroke="#ffdf70" strokeWidth="2"/>
        <path d="M48 154h103" stroke="#748195" strokeWidth="3"/>
        <circle cx="48" cy="154" r="11" fill="#ffcc33"/><circle cx="98" cy="154" r="11" fill="#ffcc33"/><circle cx="151" cy="154" r="11" fill="#242d39" stroke="#e7edf5" strokeWidth="2"/>
        <path d="m42 154 4 4 7-8m39 4 4 4 7-8" fill="none" stroke="#222b36" strokeWidth="2.5"/>
      </>}
    </svg>
  );
}

// Illustration de parcours, indépendante de la progression réelle de l’utilisateur.
function LgdProjectHeroArtwork() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden border-t border-white/10 bg-[#f5f1e7] px-4 py-5 lg:border-l lg:border-t-0 lg:py-8" aria-hidden="true">
      <svg viewBox="0 0 480 440" className="relative w-full max-w-[420px] max-lg:max-w-[250px]" focusable="false">
        <defs>
          <radialGradient id="lgd-hero-halo"><stop stopColor="#ffe188"/><stop offset="1" stopColor="#f5f1e7" stopOpacity="0"/></radialGradient>
          <linearGradient id="lgd-hero-yellow" x2="1" y2="1"><stop stopColor="#ffde67"/><stop offset="1" stopColor="#ffbd18"/></linearGradient>
          <filter id="lgd-hero-shadow" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#443922" floodOpacity=".13"/></filter>
        </defs>
        <circle cx="240" cy="216" r="220" fill="url(#lgd-hero-halo)"/>
        <circle cx="240" cy="216" r="165" fill="none" stroke="#d8ccb1" strokeDasharray="3 8"/>
        <path d="M108 102C290 75 392 153 365 287S170 383 105 300" fill="none" stroke="#e5d6b7" strokeWidth="2"/>
        <g filter="url(#lgd-hero-shadow)">
          <rect x="89" y="123" width="304" height="224" rx="22" fill="#fff" stroke="#e7e1d6" transform="rotate(-5 241 235)"/>
          <rect x="91" y="117" width="304" height="224" rx="22" fill="#fff" stroke="#e4dfd4"/>
        </g>
        <rect x="112" y="138" width="42" height="42" rx="13" fill="#141b26"/>
        <path d="m125 160 6 6 12-15" fill="none" stroke="#ffce38" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="167" y="155" fill="#7c7e84" fontSize="10" fontWeight="700" letterSpacing="2">AVEC COACH ALEX</text>
        <text x="167" y="175" fill="#161d28" fontSize="18" fontWeight="800">Ton projet, pas à pas.</text>
        <path d="M113 197h258" stroke="#ece8df"/>
        <g fontSize="13" fontWeight="600" fill="#333b47">
          <circle cx="125" cy="224" r="12" fill="#fff0bf"/><text x="125" y="228" textAnchor="middle" fontSize="11">1</text><text x="148" y="229">Une idée à clarifier</text>
          <circle cx="125" cy="261" r="12" fill="#fff0bf"/><text x="125" y="265" textAnchor="middle" fontSize="11">2</text><text x="148" y="266">Une offre à construire</text>
          <circle cx="125" cy="298" r="12" fill="#fff0bf"/><text x="125" y="302" textAnchor="middle" fontSize="11">3</text><text x="148" y="303">Une action à réaliser</text>
        </g>
        <g filter="url(#lgd-hero-shadow)">
          <rect x="35" y="65" width="150" height="63" rx="17" fill="#fff" stroke="#e8e1d5"/>
          <circle cx="65" cy="96" r="17" fill="#fff1bd"/><path d="M60 99q-8-10 3-14 12-2 8 10l-4 5v5h-7Z" fill="none" stroke="#8b6610" strokeWidth="2"/><text x="91" y="101" fontSize="14" fontWeight="700" fill="#202731">Ton idée</text>
          <rect x="285" y="73" width="153" height="52" rx="16" fill="#18212c" transform="rotate(6 361 99)"/>
          <text x="361" y="104" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="600" transform="rotate(6 361 99)">Ta prochaine étape ↗</text>
          <rect x="247" y="316" width="191" height="64" rx="18" fill="url(#lgd-hero-yellow)" transform="rotate(-5 342 348)"/>
          <text x="342" y="354" textAnchor="middle" fill="#202124" fontSize="15" fontWeight="800" transform="rotate(-5 342 348)">Du concret, chaque jour.</text>
        </g>
        <path d="m55 260 4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" fill="#eebc32"/>
        <circle cx="422" cy="216" r="5" fill="#ddb74c"/>
        <text x="240" y="414" textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="2" fill="#80745e">CLARIFIER · CRÉER · AVANCER</text>
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [projectState, setProjectState] = useState<"loading" | "empty" | "started" | "ready" | "unavailable">("loading");
  useEffect(() => {
    let cancelled = false;
    const token = getStoredToken();
    if (!token) return;
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
    fetchCoachProfileSnapshot(base, token).then((snapshot) => {
      if (cancelled) return;
      if (!snapshot) { setProjectState("unavailable"); return; }
      const { context, mission } = extractCoachV2Profile(snapshot);
      const offer = firstProfileString(context, "offerDescription", "offer", "offerName", "product", "service");
      const audience = firstProfileString(context, "targetAudienceDescription", "audience", "target", "targetAudience");
      const goal = firstProfileString(context, "businessGoal", "goal", "objective", "intent") || snapshot.intent;
      // Un contexte exploitable, pas une validation de toutes les étapes du questionnaire.
      setProjectState((offer && audience) || firstProfileString(mission || {}, "title") ? "ready" : offer || audience || goal ? "started" : "empty");
    });
    return () => { cancelled = true; };
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [plan, setPlan] = useState<Plan>("none");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(DEFAULT_PROGRESS);
  const [progressHydrated, setProgressHydrated] = useState(false);
  const [cmoResult, setCmoResult] = useState<CmoDashboardResult | null>(null);
  const [cmoLoading, setCmoLoading] = useState(false);
  const [cmoError, setCmoError] = useState<string | null>(null);
  const [aiQuota, setAiQuota] = useState<AiQuotaSnapshot | null>(null);
  const [, setMobileMenuOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<DashboardWorkspace>("home");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("workspace") === "activity") {
      setActiveWorkspace("activity");
    } else {
      setActiveWorkspace("home");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = getStoredToken();
      if (!token) {
        if (!cancelled) {
          setIsLoggedIn(false);
          setPlan("none");
          setLoadingPlan(false);
        }
        return;
      }

      if (!cancelled) setIsLoggedIn(true);

      try {
        const [p, quota] = await Promise.all([fetchPlanFromBackend(), fetchAiQuotaSnapshot()]);
        if (!cancelled) {
          setPlan(p);
          setAiQuota(quota);
        }
      } catch {
        const fallback = getPlanFromLocalStorage();
        if (!cancelled) setPlan(fallback);
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const saved = syncDailyProgressFromRealActions(readDailyProgress());
    setDailyProgress(saved);
    writeDailyProgress(saved);
    setCmoResult(getRandomLocalCmoAction());
    setProgressHydrated(true);
  }, []);

  useEffect(() => {
    if (!progressHydrated) return;
    writeDailyProgress(dailyProgress);
  }, [dailyProgress, progressHydrated]);

  const hasPaidAccess = useMemo(() => isLoggedIn, [isLoggedIn]);

  const heroTitle =
    "Ton IA Business qui transforme tes idées en actions rentables.";

  const cmoModuleTarget = useMemo(() => getCmoModuleTarget(cmoResult, dailyProgress), [cmoResult, dailyProgress]);

  const businessJournalSummary = useMemo(
    () => buildBusinessJournalSummary(readRealActionsHistory(), readMissionCashHistory()),
    [dailyProgress, cmoResult]
  );

  const iconGlow =
    "text-4xl text-[#ffb800] drop-shadow-[0_0_12px_rgba(255,184,0,0.35)]";

  function openModal(key: ModalKey) {
    setActiveModal(key);
  }

  function closeModal() {
    setActiveModal(null);
  }

  function go(path: string) {
    setMobileMenuOpen(false);
    router.push(path);
  }

  function openAffiliationProgram() {
    setMobileMenuOpen(false);
    openExternal(SYSTEMEIO_AFFILIATION_URL);
  }

  function openPlans() {
    setMobileMenuOpen(false);
    openSystemeioPlans();
  }

  function openSettings() {
    setMobileMenuOpen(false);

    if (!isLoggedIn) {
      openModal("settings");
      return;
    }

    go("/dashboard/settings");
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("lgd_token");
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("jwt");
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("lgd_user");
      document.cookie = "access_token=; Max-Age=0; path=/";
      document.cookie = "token=; Max-Age=0; path=/";
      document.cookie = "lgd_token=; Max-Age=0; path=/";
    }

    setMobileMenuOpen(false);
    setIsLoggedIn(false);
    router.push(LOGIN_PATH);
  }

  function accessOrExplain(key: "editor" | "coach" | "emailing" | "lead_engine") {
    if (!isLoggedIn) {
      openModal(key);
      return;
    }

    if (key === "coach") {
      go("/dashboard/coach-ia");
      return;
    }

    if (key === "editor") {
      markContentCreated();
      go("/dashboard/automatisations/reseaux_sociaux/editor-intelligent");
      return;
    }

    if (key === "emailing") {
      go("/dashboard/email-campaigns");
      return;
    }

    if (key === "lead_engine") {
      go("/dashboard/lead-engine");
      return;
    }
  }



  function accessPlanner() {
    if (!isLoggedIn) {
      openModal("planner");
      return;
    }

    go("/dashboard/automatisations/reseaux_sociaux/planner");
  }

  function accessLibrary() {
    if (!isLoggedIn) {
      openModal("library");
      return;
    }

    go("/dashboard/library");
  }

  function refreshLocalCmoAction() {
    setCmoError(null);
    setCmoResult(getRandomLocalCmoAction());
  }

  async function loadCmoLive() {
    setCmoLoading(true);
    setCmoError(null);

    try {
      const result = await fetchCmoDashboardStrategy();
      setCmoResult(result);

      try {
        const quota = await fetchAiQuotaSnapshot();
        if (quota) setAiQuota(quota);
      } catch {}
    } catch (error) {
      console.error(error);
      setCmoError("Stratège IA Live indisponible pour le moment. Tu peux continuer avec Coach Alex.");
    } finally {
      setCmoLoading(false);
    }
  }

  function executeCmoModuleAuto() {
    const target = getCmoModuleTarget(cmoResult, dailyProgress);
    const actionRecord = buildMissionCashRecord(cmoResult, target, "started");
    const updatedHistory = addMissionCashHistoryRecord(actionRecord);
    void patchCoachProfileMissionCashHistory(updatedHistory);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LGD_ACTIVE_MISSION_CASH_ACTION_KEY, JSON.stringify(actionRecord));
      window.localStorage.setItem(
        CMO_AUTO_PAYLOAD_KEY,
        JSON.stringify({
          created_at: new Date().toISOString(),
          source: "dashboard_cmo_v5",
          target: target.key,
          module: target.key,
          targetModule: target.key,
          destination: target.key,
          priority_action: cmoResult?.priority_action || "",
          diagnostic: cmoResult?.diagnostic || "",
          why_this_action: cmoResult?.why_this_action || "",
          next_best_action: cmoResult?.next_best_action || "",
          generated_content: cmoResult?.generated_content || {},
          mission_cash_action: actionRecord,
        })
      );
    }

    if (target.key === "editor") {
      markContentCreated();
    }

    if (target.key === "emailing") {
      setDailyProgress((prev) => {
        const updated = { ...prev, email: true };
        writeDailyProgress(updated);
        return updated;
      });
    }

    if (target.key === "lead_engine") {
      setDailyProgress((prev) => {
        const updated = { ...prev, idea: true, offer: true };
        writeDailyProgress(updated);
        return updated;
      });
    }

    if (target.key === "coach") {
      setDailyProgress((prev) => {
        const updated = { ...prev, idea: true };
        writeDailyProgress(updated);
        return updated;
      });
    }

    go(target.path);
  }

  function toggleProgressItem(key: keyof DailyProgress) {
    setDailyProgress((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function markContentCreated() {
    const updated: DailyProgress = {
      ...dailyProgress,
      content: true,
    };
    setDailyProgress(updated);
    writeDailyProgress(updated);
  }

  const journeySteps = [
    {
      title: "Clarifie ton projet",
      description: "Avec Coach Alex, précise ton objectif, ton offre et les personnes que tu veux aider. Si tu as déjà commencé, reprends ton projet avec lui.",
      outcome: "Une direction claire et un plan adapté à ton projet.",
      actions: [{ label: "Ouvrir Coach Alex", onClick: () => accessOrExplain("coach") }],
    },
    {
      title: "Choisis ta prochaine action",
      description: "Consulte ta mission du jour. Si tu as besoin de revoir ta priorité, utilise le Stratège IA Live depuis les détails de la mission.",
      outcome: "Une action concrète sur laquelle te concentrer maintenant.",
      actions: [{ label: "Voir ma priorité", onClick: () => {
        setActiveWorkspace("home");
        requestAnimationFrame(() => document.getElementById("lgd-workspace-top")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      } }],
    },
    {
      title: "Crée avec le bon outil",
      description: "L’Éditeur pour tes posts et carrousels, Lead Engine pour ton tunnel et ton lead magnet, Emailing IA pour tes emails. Choisis uniquement l’outil utile à ta mission.",
      outcome: "Un contenu ou un support commercial prêt à être utilisé.",
      actions: [
        { label: "Éditeur Intelligent", onClick: () => accessOrExplain("editor") },
        { label: "Lead Engine", onClick: () => accessOrExplain("lead_engine") },
        { label: "Emailing IA", onClick: () => accessOrExplain("emailing") },
      ],
    },
    {
      title: "Passe à la diffusion",
      description: "Organise tes publications avec le Planner, puis publie sur tes canaux. Utilise aussi tes créations dans Systeme.io pour mettre en place tes pages et tes campagnes.",
      outcome: "Ton travail mis en circulation auprès de ton audience.",
      actions: [{ label: "Ouvrir le Planner", onClick: accessPlanner }],
    },
    {
      title: "Fais le point et avance",
      description: "Retrouve tes créations dans la Bibliothèque, consulte ta progression et partage tes résultats ou tes blocages avec Alex pour préparer la suite.",
      outcome: "Une prochaine étape qui tient compte du travail accompli.",
      actions: [
        { label: "Ma Bibliothèque", onClick: accessLibrary },
        { label: "Ma progression", onClick: () => {
          setActiveWorkspace("activity");
          requestAnimationFrame(() => document.getElementById("lgd-workspace-top")?.scrollIntoView({ behavior: "smooth", block: "start" }));
        } },
      ],
    },
  ];

  const dashboardPresentation = (
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto w-full max-w-[1500px]"
        >
          <div className="overflow-hidden rounded-[34px] border border-[#2a2418] bg-[radial-gradient(circle_at_15%_15%,rgba(255,184,0,0.08),transparent_28%),linear-gradient(135deg,#05080d_0%,#080b10_48%,#0d1118_100%)] shadow-[0_30px_100px_rgba(0,0,0,0.42)] max-sm:rounded-[24px]">
            <div className="grid grid-cols-1 gap-0 xl:grid-cols-[1.04fr_0.96fr]">
              <div className="flex flex-col justify-center px-6 py-10 text-left sm:px-10 sm:py-14 lg:px-14 xl:px-16 xl:py-16">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="text-5xl font-black tracking-[-0.08em] text-white sm:text-6xl">LGD</div>
                      <span className="mt-1 inline-block h-0 w-0 border-b-[9px] border-l-[14px] border-t-[9px] border-b-transparent border-l-[#ffb800] border-t-transparent" />
                    </div>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.08em] text-white/85">
                      Le <span className="text-[#ffb800]">Générateur</span> Digital
                    </p>
                    <p className="mt-1 text-xs text-white/55">Ton business. Ton succès. Notre IA.</p>
                  </div>

                  <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-xs text-white/70 xl:hidden">
                    <FaRobot className="text-xl text-[#ffb800]" />
                    <span><strong className="text-white">Plateforme business IA francophone</strong><br />propulsée par OpenAI</span>
                  </div>
                </div>

                <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-[#ffb800]/55 bg-[#ffb800]/5 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.11em] text-white sm:text-xs">
                  <FaBolt className="text-[#ffb800]" />
                  Tu n’as pas besoin d’être expert pour commencer
                </div>

                <h1 className="mt-6 max-w-4xl text-[2.25rem] font-black leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.4rem] xl:text-[3.65rem]">
                  Tu as acheté des formations.<br />
                  Tu veux te lancer dans le digital.
                  <span className="mt-2 block text-[#ffb000]">Mais tu ne sais toujours pas quoi faire aujourd’hui.</span>
                </h1>

                <div className="mt-5 h-1 w-14 rounded-full bg-[#ffb800]" />

                <p className="mt-5 max-w-3xl text-lg font-bold leading-7 text-white sm:text-xl sm:leading-8">
                  Ici, tu vas enfin avancer étape par étape, grâce à ton <span className="text-[#ffb800]">coach IA personnalisé</span> et à des <span className="text-[#ffb800]">outils interconnectés</span> qui travaillent autour de ton projet.
                </p>

                <p className="mt-4 max-w-3xl text-sm font-medium leading-6 text-[#d8d8d8] sm:text-base sm:leading-7">
                  LGD part de ton niveau, clarifie ton objectif et transforme ce que tu dois apprendre en actions concrètes : créer ton contenu, développer ta présence, attirer tes premiers prospects et avancer vers tes premières ventes.
                </p>

                <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {[
                    ["🎯", "Clarifie ton objectif"],
                    ["✏️", "Crée ton contenu"],
                    ["👥", "Attire tes prospects"],
                    ["✉️", "Développe ta présence"],
                    ["📈", "Progresse vers tes ventes"],
                  ].map(([icon, label]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center">
                      <div className="text-xl">{icon}</div>
                      <p className="mt-2 text-xs font-bold leading-4 text-white/85">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => (isLoggedIn ? accessOrExplain("coach") : goToTrial())}
                    className="inline-flex min-h-16 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ffb000] to-[#ffc83d] px-7 text-base font-black text-black shadow-[0_14px_36px_rgba(255,184,0,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(255,184,0,0.30)]"
                  >
                    {isLoggedIn ? "🤖  Lancer Coach Alex IA" : "🤖  Commencer avec Coach Alex IA"}
                  </button>

                  <button
                    type="button"
                    onClick={() => (isLoggedIn ? setActiveWorkspace("activity") : goToLogin())}
                    className="inline-flex min-h-16 flex-1 items-center justify-center rounded-2xl border border-white/20 bg-white/[0.035] px-7 text-base font-extrabold text-white transition hover:-translate-y-0.5 hover:border-[#ffb800]/45 hover:bg-[#ffb800]/5"
                  >
                    {isLoggedIn ? "📊  Voir ma progression" : "J’ai déjà un compte"}
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/58">
                  <span className="inline-flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Aucun prérequis</span>
                  <span className="inline-flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Adapté aux débutants</span>
                  <span className="inline-flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Progression sauvegardée</span>
                </div>
              </div>

              <div className="border-t border-white/10 bg-[#f7f4ed] p-5 sm:p-8 xl:border-l xl:border-t-0 xl:p-9">
                <div className="mb-5 hidden items-center justify-end xl:flex">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-[#d8d1c5] bg-white px-5 py-3 shadow-sm">
                    <FaRobot className="text-2xl text-[#d99000]" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#25231f]">La plateforme business IA francophone</p>
                      <p className="mt-1 text-sm font-semibold text-[#625d53]">Propulsée par <span className="font-black text-[#171717]">OpenAI</span></p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#ded7ca] bg-[#fbfaf7] p-4 shadow-[0_20px_50px_rgba(35,28,14,0.08)] sm:p-6">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
                    <div>
                      <span className="inline-flex rounded-full bg-[#5f6670] px-5 py-2 text-xs font-black uppercase tracking-[0.06em] text-white">Aujourd’hui</span>
                      <p className="mt-2 text-sm font-bold text-[#27231d]">Tu galères…</p>
                    </div>
                    <div />
                    <div>
                      <span className="inline-flex rounded-full bg-emerald-700 px-5 py-2 text-xs font-black uppercase tracking-[0.06em] text-white">Avec LGD</span>
                      <p className="mt-2 text-sm font-bold text-emerald-700">Tu avances !</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      ["🌀", "Je ne sais pas quoi vendre.", "🎯", "Un objectif clair", "Tu sais ce que tu construis."],
                      ["📱", "Je ne sais pas quoi publier.", "🤖", "Coach Alex IA te guide", "Tu n’es plus seul."],
                      ["🧭", "Je n’ai pas d’objectif clair.", "📅", "Une mission concrète chaque jour", "Tu sais quoi faire maintenant."],
                      ["🔋", "Je commence puis j’abandonne.", "🧊", "Des outils qui t’aident à exécuter", "Contenu, email, prospection, organisation…"],
                      ["📚", "J’ai plein de formations, mais je n’avance pas.", "📈", "Tu avances avec régularité", "Vers tes premiers prospects et tes premières ventes."],
                    ].map(([leftIcon, problem, rightIcon, solution, detail]) => (
                      <div key={problem} className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-3">
                        <div className="flex items-center gap-3 rounded-2xl border border-[#ded8ce] bg-white px-3 py-4 sm:px-4">
                          <span className="text-2xl">{leftIcon}</span>
                          <p className="text-xs font-bold leading-5 text-[#27231d] sm:text-sm">{problem}</p>
                        </div>
                        <div className="flex items-center justify-center px-1 text-xl font-black text-[#e49b00]">→</div>
                        <div className="flex items-center gap-3 rounded-2xl border border-emerald-700/20 bg-white px-3 py-4 sm:px-4">
                          <span className="text-2xl">{rightIcon}</span>
                          <div>
                            <p className="text-xs font-black leading-5 text-emerald-700 sm:text-sm">{solution}</p>
                            <p className="mt-0.5 text-[11px] leading-4 text-[#4f4a42] sm:text-xs">{detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e0d7c6] bg-[#f3eee5] px-4 py-4">
                    <div className="text-2xl">🛡️</div>
                    <div>
                      <p className="text-sm font-black text-[#24211d]">Méthode claire <span className="text-[#d99000]">•</span> Actions concrètes <span className="text-[#d99000]">•</span> Résultats mesurables</p>
                      <p className="mt-1 text-xs leading-5 text-[#5e584e]">Tout est réuni pour que tu passes enfin à l’action et que tu obtiennes tes premières ventes.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[28px] border border-[#ded7ca] bg-white p-5 shadow-[0_16px_40px_rgba(35,28,14,0.06)] sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#111] text-2xl shadow-sm">🤖</div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#c78300]">Tu n’as plus à avancer seul</p>
                      <h3 className="mt-1 text-lg font-black leading-tight text-[#171717] sm:text-xl">Coach Alex transforme ton flou en prochaine action.</h3>
                      <p className="mt-2 text-xs leading-5 text-[#5e584e] sm:text-sm">Il part de ton niveau, de ton objectif et de ton blocage pour t’indiquer quoi faire maintenant — sans te demander de devenir expert en marketing.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      ["1", "Tu expliques", "Ta situation"],
                      ["2", "Alex clarifie", "Ta priorité"],
                      ["3", "Tu exécutes", "Dans le bon outil"],
                    ].map(([step, title, detail]) => (
                      <div key={step} className="rounded-2xl border border-[#e4ded3] bg-[#f8f6f1] px-3 py-3 text-center">
                        <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#ffb800] text-xs font-black text-black">{step}</div>
                        <p className="mt-2 text-xs font-black text-[#211f1b]">{title}</p>
                        <p className="mt-1 text-[10px] leading-4 text-[#6a645a] sm:text-[11px]">{detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#111] px-4 py-3 text-center">
                    <p className="text-xs font-bold leading-5 text-white sm:text-sm">🎯 Ton objectif n’est pas de tout maîtriser. <span className="text-[#ffb800]">C’est de savoir quoi faire ensuite et de le faire.</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-black/30 px-6 py-4 text-center sm:px-10">
              <p className="text-sm font-semibold text-white/80 sm:text-base">
                💛 Tu n’as probablement pas besoin d’une formation de plus. <span className="font-black text-[#ffb800]">Tu as besoin d’un système qui t’aide enfin à passer à l’action.</span>
              </p>
            </div>
          </div>
        </motion.section>
  );

  return (
    <div className="min-h-screen bg-[#080a0e] text-white">
      <style>{`
        body > header,
        header {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(184,129,6,0.10),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.015),transparent_38%)]" />



      <main id="lgd-workspace-top" className="relative z-[2147483645] px-4 pb-16 pt-4 sm:px-6 lg:pr-8 lg:pt-4">
        {!loadingPlan && !isLoggedIn ? dashboardPresentation : null}
        {loadingPlan ? <div role="status" className="mx-auto max-w-[1200px] py-16 text-white/70">Chargement de ton espace…</div> : null}


        {isLoggedIn && activeWorkspace === "activity" ? (
          <div className="mx-auto max-w-[1200px]">
          <button type="button" onClick={() => setActiveWorkspace("home")} className="my-5 rounded-xl border border-white/15 px-4 py-3 text-sm text-white/75">← Retour à ma priorité</button>
          <ActivityProgressWorkspace
            dailyProgress={dailyProgress}
            summary={businessJournalSummary}
            missions={readMissionCashHistory()}
            onOpenCoach={() => accessOrExplain("coach")}
          />
          </div>
        ) : isLoggedIn ? (
          <div className="mx-auto w-full max-w-[1200px] py-5 sm:py-8">
            {projectState === "loading" ? (
              <div role="status" className="rounded-3xl border border-white/10 bg-[#111318] p-8 text-white/70">Chargement de ton projet…</div>
            ) : projectState !== "ready" ? (
              <section className="relative overflow-hidden rounded-[28px] border border-yellow-400/20 bg-[#11151c] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <div className="grid lg:grid-cols-[1.15fr_1fr]">
                  <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffcf39]">LE GÉNÉRATEUR DIGITAL · TON ESPACE DE TRAVAIL</p>
                    <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">{projectState === "started" ? <>Ton projet avance.<br /><span className="text-[#ffcf39]">Reprenons le fil.</span></> : projectState === "unavailable" ? <>Ton projet t’attend.<br /><span className="text-[#ffcf39]">Retrouve Alex.</span></> : <>Ton projet prend forme.<br /><span className="text-[#ffcf39]">Une action à la fois.</span></>}</h1>
                    <p className="mt-6 max-w-lg text-base leading-7 text-white/70">{projectState === "unavailable" ? "Ton profil n’a pas pu être chargé ici. Ouvre Coach Alex pour retrouver ton accompagnement." : "Avec Coach Alex et les outils LGD, clarifie ta direction et transforme tes idées en réalisations concrètes."}</p>
                    <div className="mt-7 max-w-sm"><PrimaryButton onClick={() => accessOrExplain("coach")}>{projectState === "empty" ? "Définir mon projet avec Alex →" : "Reprendre avec Coach Alex →"}</PrimaryButton></div>
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-white/50"><span>À ton rythme, étape par étape.</span><button type="button" onClick={() => setActiveWorkspace("activity")} className="min-h-8 text-white/75 underline underline-offset-4 hover:text-yellow-300">Voir ma progression ↗</button></div>
                  </div>
                  <LgdProjectHeroArtwork />
                </div>
              </section>
            ) : (
              <section className="overflow-hidden rounded-[28px] border border-yellow-400/25 bg-[#11151c] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
                <div className="grid lg:grid-cols-[1.5fr_1fr]">
                  <div className="p-6 sm:p-9">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400">TA MISSION DU JOUR</p>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">{cmoLoading ? "Analyse en cours…" : cmoResult?.source === "live" ? "● IA Business Active" : "Suggestion locale · à adapter"}</span>
                    </div>
                    <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{cmoResult?.priority_action || "Clarifie ta prochaine action avec Coach Alex."}</h1>
                    <p className="mt-5 text-sm leading-7 text-white/65">{cmoResult?.next_best_action || "Retrouve ton projet avec Alex pour préparer la suite."}</p>
                    <div className="mt-7 max-w-sm"><PrimaryButton onClick={executeCmoModuleAuto}>{cmoModuleTarget.label} →</PrimaryButton></div>
                    <button type="button" onClick={() => setActiveWorkspace("activity")} className="mt-4 min-h-8 text-xs text-white/65 underline underline-offset-4 hover:text-yellow-300">Voir ma progression ↗</button>
                    {cmoError ? <p role="alert" className="mt-4 text-sm text-red-300">{cmoError}</p> : null}
                  </div>
                  <div className="border-t border-white/10 bg-white/[0.025] p-6 sm:p-9 lg:border-l lg:border-t-0">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">À LA FIN DE CETTE ACTION</p>
                    <p className="mt-5 text-lg font-semibold leading-8 text-white">{missionCashExpectedResult(cmoResult)}</p>
                    <p className="mt-6 text-sm leading-6 text-white/50">Un livrable utile pour faire avancer ton projet aujourd’hui.</p>
                  </div>
                </div>
                <details className="border-t border-white/10 px-6 py-5 sm:px-9">
                  <summary className="cursor-pointer text-sm font-semibold text-white/75">Comprendre cette mission et ajuster ma priorité</summary>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div><p className="text-sm font-bold text-yellow-300">Pourquoi cette action ?</p><p className="mt-2 text-sm leading-6 text-white/65">{missionCashDiagnostic(cmoResult)}</p></div>
                    <div><p className="text-sm font-bold text-yellow-300">L’erreur à éviter</p><p className="mt-2 text-sm leading-6 text-white/65">{missionCashMistake(cmoResult)}</p></div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={loadCmoLive} disabled={cmoLoading} className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white disabled:opacity-50">{cmoLoading ? "Analyse en cours…" : "Personnaliser avec le Stratège IA Live"}</button>
                    <button type="button" onClick={refreshLocalCmoAction} disabled={cmoLoading} className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white disabled:opacity-50">Autre suggestion locale</button>
                  </div>
                </details>
              </section>
            )}

            <section className="mt-6 rounded-3xl border border-white/10 bg-[#101216] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold text-white">Mes repères du jour</h2><span className="text-xs text-white/45">Étapes à cocher selon ton avancement</span></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProgressItem done={dailyProgress.idea} label="Idée trouvée" onClick={() => toggleProgressItem("idea")} />
                <ProgressItem done={dailyProgress.content} label="Contenu créé" onClick={() => toggleProgressItem("content")} />
                <ProgressItem done={dailyProgress.email} label="Email généré" onClick={() => toggleProgressItem("email")} />
                <ProgressItem done={dailyProgress.offer} label="Offre envoyée" onClick={() => toggleProgressItem("offer")} />
              </div>
            </section>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-white/45">
              <span>{aiQuota ? `Quota IA disponible : ${formatQuotaNumber(aiQuota.remaining)} / ${formatQuotaNumber(aiQuota.limit)} · ${aiQuota.planLabel}` : "Quota IA : synchronisation…"}</span>
              <button type="button" onClick={() => accessOrExplain("coach")} className="text-white/65 underline underline-offset-4">Revoir mon projet avec Alex</button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.32 }}
            className="max-w-6xl mx-auto mt-10"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
              <CardLuxe className="h-full px-6 py-7 sm:px-8 sm:py-8">
                <div className="flex h-full flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                    <FaBolt className="text-yellow-300" />
                    Action prioritaire du jour
                  </div>

                  <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#ffb800]">
                    Ton plan du jour est prêt
                  </h2>

                  <p className="mt-3 max-w-xl text-white/75 text-sm sm:text-base">
                    Lance Coach AlexIA et exécute ton action la plus rentable aujourd’hui.
                    LGD te guide pour passer plus vite de l’idée à l’action, puis de l’action à la vente.
                  </p>

                  <div className="mt-6 w-full max-w-md">
                    <PrimaryButton onClick={() => accessOrExplain("coach")}>
                      Lancer Coach AlexIA
                    </PrimaryButton>
                  </div>

                  <div className="mt-7 w-full border-t border-yellow-600/15 pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                        <FaRobot className="text-yellow-300" />
                        Progression du jour
                      </div>

                      <p className="mt-3 max-w-xl text-white/70 text-sm">
                        Clique sur une étape pour la cocher ou la décocher. Ta progression reste enregistrée
                        même si tu recharges la page.
                      </p>

                      <div className="mt-5 grid w-full grid-cols-1 sm:grid-cols-2 gap-4">
                        <ProgressItem done={dailyProgress.idea} label="Idée trouvée" onClick={() => toggleProgressItem("idea")} />
                        <ProgressItem done={dailyProgress.content} label="Contenu créé" onClick={() => toggleProgressItem("content")} />
                        <ProgressItem done={dailyProgress.email} label="Email généré" onClick={() => toggleProgressItem("email")} />
                        <ProgressItem done={dailyProgress.offer} label="Offre envoyée" onClick={() => toggleProgressItem("offer")} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardLuxe>

              <CardLuxe className="h-full px-6 py-7 sm:px-8 sm:py-8">
                <div className="flex h-full flex-col">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ffb800]">
                    Essai gratuit 7 jours 🚀
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                    Découvre LGD gratuitement pendant 7 jours, sans carte bancaire. Teste les fonctionnalités clés
                    et lance ton business avec l’IA.
                  </p>

                  <div className="mt-6 space-y-3 text-sm font-semibold text-white/90">
                    <div>🗓️ 7 jours gratuits</div>
                    <div>💳 Sans carte bancaire</div>
                    <div>🎫 10 000 jetons IA / jour</div>
                    <div>🧠 Mémoire LGD activée</div>
                    <div>⏱️ Reprise du compte à tout moment</div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-yellow-600/20 bg-yellow-500/10 p-4 text-sm leading-6 text-white/85">
                    💛 À la fin de ton essai, ton travail reste sauvegardé. Tu peux revenir à tout moment
                    et activer ton plan Essentielle, Pro ou Ultime.
                  </div>

                  <div className="mt-auto pt-8">
                    <button
                      type="button"
                      onClick={goToTrial}
                      className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 px-5 py-4 font-extrabold text-white shadow-[0_0_35px_rgba(255,184,0,0.22)] transition-all hover:-translate-y-0.5 hover:brightness-110"
                    >
                      Activer mon essai gratuit 🚀
                    </button>
                  </div>
                </div>
              </CardLuxe>
            </div>
          </motion.div>
        )}



        {isLoggedIn ? (
          <details className="mx-auto mt-6 w-full max-w-[1200px] rounded-2xl border border-white/10 bg-[#101216] p-4 text-white/70 sm:p-6">
            <summary className="cursor-pointer rounded-lg text-sm font-semibold text-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400">Comment fonctionne LGD ? Ton parcours en 5 étapes</summary>
            <section aria-labelledby="lgd-journey-title" className="mt-8">
              <div className="mx-auto mb-8 max-w-3xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">LE GÉNÉRATEUR DIGITAL</p>
                <h2 id="lgd-journey-title" className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Ton parcours pour avancer avec LGD</h2>
                <p className="mt-3 text-sm leading-7 text-white/65 sm:text-base">Une étape à la fois. Le bon outil au bon moment.<br />Commence avec Alex, puis utilise chaque module selon les besoins de ton projet.</p>
              </div>
              <ol className="space-y-4">
                {journeySteps.map((step, index) => (
                  <li key={step.title} className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#161b23] to-[#0b0e13] p-5 sm:p-6">
                    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
                      <div className="self-center sm:self-auto"><LgdJourneyIllustration step={index + 1} /></div>
                      <div className="min-w-0 flex-1 sm:border-l sm:border-white/10 sm:pl-6">
                        <span className="text-3xl font-extrabold text-[#ffcc33]">{String(index + 1).padStart(2, "0")}</span>
                        <h3 className="mt-1 text-xl font-bold leading-snug text-white sm:text-2xl">{step.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-white/70">{step.description}</p>
                        <p className="mt-3 text-sm leading-6 text-white/85"><span className="font-semibold text-yellow-300">Résultat : </span>{step.outcome}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          {step.actions.map(action => (
                            <button key={action.label} type="button" onClick={action.onClick} className="min-h-11 w-full rounded-xl border border-yellow-400/65 px-4 py-3 text-sm font-semibold text-white transition hover:border-yellow-300 hover:bg-yellow-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400 sm:w-auto">{action.label} <span aria-hidden="true">↗</span></button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-7 text-center text-sm leading-7 text-white/60">Commence avec Alex. Reviens à ce guide quand tu en as besoin.<br />Tu n’as pas besoin d’utiliser tous les outils chaque jour.</p>
            </section>
          </details>
        ) : null}
      </main>

      <ModalShell
        open={activeModal === "editor"}
        title="Éditeur Intelligent — Post + Carrousel V5"
        subtitle="Crée vite, propre, et vend. IA + design premium LGD."
        icon={<FaRobot />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Ce que tu obtiens</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>• Templates + mise en page premium (sans perdre du temps)</li>
              <li>• Copilote IA pour accélérer la création et améliorer la conversion</li>
              <li>• Carrousel + Post, prêt à publier (workflow ultra rapide)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Pourquoi c’est rentable</div>
            <p className="mt-2 text-sm text-white/70">
              Tu produis plus, plus vite, avec une meilleure qualité → plus de constance → plus
              de prospects → plus de ventes.
            </p>
          </div>

          {hasPaidAccess ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton
                onClick={() => {
                  closeModal();
                  markContentCreated();
                  go("/dashboard/automatisations/reseaux_sociaux/editor-intelligent");
                }}
              >
                Accéder maintenant
              </PrimaryButton>
              {plan !== "ultime" ? (
                <SecondaryButton onClick={openSystemeioPlans}>Upgrade</SecondaryButton>
              ) : (
                <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton onClick={goToTrial}>Essai gratuit 7 jours</PrimaryButton>
              <SecondaryButton onClick={goToLogin}>Se connecter</SecondaryButton>
            </div>
          )}
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "coach"}
        title="Coach Alex V2"
        subtitle="1ère vente → scaler. Mission claire, exécution rapide."
        icon={<FaUserAstronaut />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Ce que tu obtiens</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>• Mission du jour orientée vente (pas de blabla)</li>
              <li>• Parcours guidé : setup → action → feedback → optimisation</li>
              <li>• IA + quotas synchronisés (pilotage propre)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Pourquoi c’est rentable</div>
            <p className="mt-2 text-sm text-white/70">
              Tu exécutes chaque jour l’action qui augmente ta probabilité de vente.
              Résultat : momentum → cash → scale.
            </p>
          </div>

          {hasPaidAccess ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton
                onClick={() => {
                  closeModal();
                  go("/dashboard/coach-ia");
                }}
              >
                Accéder maintenant
              </PrimaryButton>
              {plan !== "ultime" ? (
                <SecondaryButton onClick={openSystemeioPlans}>Upgrade</SecondaryButton>
              ) : (
                <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton onClick={goToTrial}>Essai gratuit 7 jours</PrimaryButton>
              <SecondaryButton onClick={goToLogin}>Se connecter</SecondaryButton>
            </div>
          )}
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "emailing"}
        title="Campagnes E-mailing IA"
        subtitle="Séquences prêtes à vendre — bientôt dans LGD."
        icon={<FaEnvelope />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Ce que tu obtiens</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>• Séquences 7 / 14 / 30 jours générées avec angle business</li>
              <li>• Relances, objections, CTA et structure orientée conversion</li>
              <li>• Campagnes prêtes à envoyer pour vendre, relancer et fidéliser</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Pourquoi c’est rentable</div>
            <p className="mt-2 text-sm text-white/70">
              L’email reste l’un des canaux les plus rentables : plus de suivi, plus de relances,
              plus de ventes avec moins de friction.
            </p>
          </div>

          {hasPaidAccess ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton
                onClick={() => {
                  closeModal();
                  go("/dashboard/email-campaigns");
                }}
              >
                Accéder maintenant
              </PrimaryButton>
              {plan !== "ultime" ? (
                <SecondaryButton onClick={openSystemeioPlans}>Upgrade</SecondaryButton>
              ) : (
                <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PrimaryButton onClick={goToTrial}>Essai gratuit 7 jours</PrimaryButton>
              <SecondaryButton onClick={goToLogin}>Se connecter</SecondaryButton>
            </div>
          )}
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "lead_engine"}
        title="Lead Engine IA"
        subtitle="Transforme ton contenu en machine à capturer des emails."
        icon={<FaEnvelope />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Ce que LGD va générer</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li>• Un lead magnet orienté conversion (checklist, mini-guide, template, ebook)</li>
              <li>• Une page de capture premium prête à collecter des emails</li>
              <li>• Des CTA optimisés à injecter dans tes posts, carrousels et contenus</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Pourquoi c’est stratégique</div>
            <p className="mt-2 text-sm text-white/70">
              Les followers peuvent disparaître. Une liste email reste ton actif.
              Lead Engine a été pensé pour transformer ton audience en base email durable, exploitable et rentable.
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-white/80">
            <div className="text-yellow-200 font-semibold">Bientôt dans LGD</div>
            <p className="mt-2 text-sm text-white/70">
              Génération d’aimant à prospects, page de capture, angle de promesse, CTA, puis connexion logique avec l’emailing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <PrimaryButton
                onClick={() => {
                  if (hasPaidAccess) {
                    window.location.href = "/dashboard/lead-engine";
                    return;
                  }
                  goToTrial();
                }}
              >
                {hasPaidAccess ? "Créer mon Lead Engine" : "Essai gratuit 7 jours"}
              </PrimaryButton>
              <p className="mt-2 text-center text-xs text-white/50">
                Génère ton premier aimant à prospects en quelques clics
              </p>
            </div>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "planner"}
        title="Planner IA"
        subtitle="Planifie et retrouve tes publications programmées."
        icon={<FaBolt />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Accès réservé aux utilisateurs connectés</div>
            <p className="mt-2">
              Connecte-toi pour accéder au Planner IA, retrouver tes publications et organiser ton calendrier de contenu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={goToLogin}>Se connecter</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "library"}
        title="Bibliothèque LGD"
        subtitle="Retrouve tes créations, archives et contenus sauvegardés."
        icon={<FaBook />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Accès réservé aux utilisateurs connectés</div>
            <p className="mt-2">
              Connecte-toi pour accéder à ta Bibliothèque LGD, retrouver tes créations sauvegardées et réutiliser tes contenus dans les modules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={goToLogin}>Se connecter</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "settings"}
        title="Paramètres du compte"
        subtitle="Connecte-toi pour gérer ton abonnement, ton plan et les informations de ton compte."
        icon={<FaLock />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="font-semibold text-yellow-200">Accès réservé aux utilisateurs connectés</div>
            <p className="mt-2">
              Les paramètres contiennent les informations de compte, le plan actif et la gestion d’abonnement.
              Connecte-toi pour y accéder en toute sécurité.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PrimaryButton onClick={goToLogin}>Se connecter</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "ebook"}
        title="Ebook Viral 4.0 IA"
        subtitle="Lead magnet premium + low ticket — bientôt."
        icon={<FaBook />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Ce que ça va débloquer</div>
            <p className="mt-2">
              Créer un ebook qui attire, convertit et peut être vendu (7–27€) ou offert
              comme aimant à prospects.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={closeModal}>OK</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "multiplier"}
        title="Content Multiplier IA"
        subtitle="1 contenu → 20 formats — bientôt."
        icon={<FaSyncAlt />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Pourquoi ça cartonne</div>
            <p className="mt-2">
              Les US utilisent le repurposing massif : un angle devient carrousel + email +
              post + reel + thread. Visibilité x10.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={closeModal}>OK</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "offer"}
        title="Créateur d’Offre Magnétique"
        subtitle="Offre claire = ventes rapides — bientôt."
        icon={<FaGem />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Objectif</div>
            <p className="mt-2">
              Transformer “je sais faire X” en offre vendable : promesse, preuve, bonus,
              prix, angle de vente.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={closeModal}>OK</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        open={activeModal === "funnel"}
        title="Funnel Express IA"
        subtitle="Capture → vente → relance — bientôt."
        icon={<FaFilter />}
        onClose={closeModal}
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-sm text-white/75">
            <div className="text-yellow-200 font-semibold">Ce que ça apporte</div>
            <p className="mt-2">
              Un mini tunnel simple (pas un clone de systeme.io) : structure, copy, emails
              de relance, checklist d’exécution.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PrimaryButton onClick={closeModal}>OK</PrimaryButton>
            <SecondaryButton onClick={closeModal}>Fermer</SecondaryButton>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}
