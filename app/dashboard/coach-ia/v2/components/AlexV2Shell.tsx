"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import ActionPanel from "./ActionPanel";
import CommitModal from "./CommitModal";
import ParcoursPanel from "./ParcoursPanel";
import StageRenderer from "./StageRenderer";
import Stepper from "./Stepper";

import { coachQuota } from "../../lib/api";

import {
  addV2Log,
  getV2Context,
  getV2Logs,
  getV2Roadmap,
  getV2Stage,
  getV2Today,
  resetAlexV2All,
  setV2Context,
  setV2Roadmap,
  setV2Stage,
  setV2Today,
} from "../lib/storage";

import type {
  AlexAudienceSize,
  AlexBusinessGoal,
  AlexBusinessModel,
  AlexContext,
  AlexIntent,
  AlexLevel,
  AlexMainBlocker,
  AlexRoadmap,
  AlexStage,
  AlexToday,
  DailyLog,
  TimePerDay,
} from "../lib/types";

// =========================
// Server persistence (Coach Profile)
// coach_profile.profile.coach_v2 = snapshot (minimal source of truth)
// =========================
type CoachV2Snapshot = {
  version: number;
  stage: AlexStage;
  context: AlexContext;
  roadmap: AlexRoadmap;
  today: AlexToday;
  logs: DailyLog[];
  updatedAtISO: string;
};

type FormActionParcours =
  | "creation_produit_digital"
  | "mrr"
  | "affiliation"
  | "code_liberte"
  | "non_defini";

type FormActionBusinessProject = {
  offerDescription?: string;
  problemSolved?: string;
  transformationPromise?: string;
  targetAudienceDescription?: string;
  personaName?: string;
  positioning?: string;
  businessModel?: AlexBusinessModel;
  parcours?: FormActionParcours;
  recommendedPlatform?: string;
  platformReason?: string;
  estimatedTimeBeforeSale?: string;
  firstRevenueGoal?: string;
  nextMission?: string;
  missionFollowing?: string;
  contentAngle?: string;
  salesAngle?: string;
  offerReadinessScore?: number;
  updatedAtISO?: string;
};

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readCoachProfile(): Promise<any | null> {
  const base = apiBase();
  if (!base) return null;

  const res = await fetch(`${base}/coach-profile`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
  });

  if (!res.ok) return null;
  return await res.json().catch(() => null);
}

async function readBusinessProject(): Promise<FormActionBusinessProject | null> {
  const base = apiBase();
  if (!base) return null;

  const res = await fetch(`${base}/coach-profile/business-project`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return (data?.business_project ||
    data?.businessProject ||
    data?.project ||
    data ||
    null) as FormActionBusinessProject | null;
}

async function patchBusinessProject(
  project: FormActionBusinessProject,
): Promise<void> {
  const base = apiBase();
  if (!base) return;

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const direct = await fetch(`${base}/coach-profile/business-project`, {
    method: "PATCH",
    headers,
    credentials: "include",
    body: JSON.stringify(project),
  }).catch(() => null);

  if (direct?.ok) return;

  await fetch(`${base}/coach-profile/business-project`, {
    method: "PATCH",
    headers,
    credentials: "include",
    body: JSON.stringify({
      business_project: project,
      businessProject: project,
      project,
    }),
  }).catch(() => {});
}

function extractServerSnapshot(profileOut: any): CoachV2Snapshot | null {
  const p = profileOut?.profile || {};
  const s = p?.coach_v2 || p?.coachV2 || p?.coachV2Snapshot || null;
  if (!s) return null;

  // minimal validation
  if (!s?.today || !s?.context || !s?.roadmap || !s?.updatedAtISO) return null;
  return s as CoachV2Snapshot;
}

async function pushCoachV2SnapshotToServer(
  snapshot: CoachV2Snapshot,
): Promise<void> {
  const base = apiBase();
  if (!base) return;

  await fetch(`${base}/coach-profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({
      profile: {
        coach_v2: snapshot,
      },
    }),
  }).catch(() => {});
}

async function clearCoachV2SnapshotOnServer(): Promise<void> {
  const base = apiBase();
  if (!base) return;

  await fetch(`${base}/coach-profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({
      profile: {
        coach_v2: null,
      },
    }),
  }).catch(() => {});
}

async function readCurrentAccountKey(): Promise<string> {
  const base = apiBase();

  if (base) {
    try {
      const res = await fetch(`${base}/auth/me`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        const raw =
          data?.email || data?.user?.email || data?.id || data?.user?.id || "";

        if (raw) return String(raw).trim().toLowerCase();
      }
    } catch {}
  }

  if (typeof window !== "undefined") {
    const token =
      window.localStorage.getItem("access_token") ||
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("jwt") ||
      "";

    if (token) return `token:${token.slice(0, 32)}`;
  }

  return "anonymous";
}

function resetAlexLocalStateForAccount(accountKey: string) {
  try {
    resetAlexV2All({ includeLegacy: true });
  } catch {
    try {
      resetAlexV2All();
    } catch {}
  }

  try {
    window.localStorage.setItem("lgd_alex_v2_owner", accountKey);
  } catch {}
}

function isISOAfter(a?: string, b?: string) {
  if (!a || !b) return false;
  return new Date(a).getTime() > new Date(b).getTime();
}

async function syncCoachV2AtBoot(args: { local: CoachV2Snapshot | null }) {
  const out = { mode: "noop" as "noop" | "server->local" | "local->server" };

  const server = await readCoachProfile();
  const serverSnap = extractServerSnapshot(server);

  if (!serverSnap && args.local) {
    await pushCoachV2SnapshotToServer(args.local);
    out.mode = "local->server";
    return out;
  }

  if (serverSnap && !args.local) {
    return { mode: "server->local" as const, serverSnap };
  }

  if (serverSnap && args.local) {
    if (isISOAfter(serverSnap.updatedAtISO, args.local.updatedAtISO)) {
      return { mode: "server->local" as const, serverSnap };
    }
    if (isISOAfter(args.local.updatedAtISO, serverSnap.updatedAtISO)) {
      await pushCoachV2SnapshotToServer(args.local);
      out.mode = "local->server";
      return out;
    }
  }

  return out;
}

import { writeEditorBrief } from "../lib/bridgeEditor";
import {
  buildTodayFromRoadmap,
  createInitialContext,
  createInitialRoadmap,
  evolveContextAfterLog,
} from "../lib/engine";
import type { AlexLiveStrategistResult } from "../lib/live-strategist";
import {
  buildAlexLiveFallback,
  generateAlexLiveStrategy,
} from "../lib/live-strategist";

function planLabelFrom(plan?: string, limit?: number) {
  // ✅ Priorité absolue au plan réel renvoyé par IA-Quotas.
  // Ne jamais déduire Essentiel depuis tokens_limit si le plan réel est AZUR/trial/starter.
  if (plan) {
    const p = String(plan).toLowerCase();

    if (
      p.includes("azur") ||
      p.includes("trial") ||
      p.includes("starter") ||
      p.includes("decouverte") ||
      p.includes("découverte")
    ) {
      return "AZUR";
    }

    if (p.includes("ult")) return "Ultime";
    if (p.includes("pro")) return "Pro";
    if (p.includes("ess")) return "Essentiel";
  }

  // Fallback seulement si aucun plan fiable n'est fourni.
  const n = Number(limit || 0);
  if (n === 150_000) return "AZUR";
  if (n === 15_000_000) return "Ultime";
  if (n === 6_000_000) return "Pro";
  if (n === 2_000_000) return "Essentiel";

  return "";
}

function linearDayIndex(weekIndex: number, dayIndex: number) {
  return (weekIndex - 1) * 7 + dayIndex;
}

/**
 * OPTION C — Ensure progression depends ONLY on real daily logs, and cannot "jump ahead".
 */
function clampLogsToToday(
  logs: DailyLog[],
  today: AlexToday | null,
): DailyLog[] {
  if (!logs?.length) return [];
  if (!today) return logs;

  const maxAllowedDoneIndex = Math.max(
    0,
    linearDayIndex(today.weekIndex, today.dayIndex) - 1,
  );

  const doneSet = new Set<number>();
  for (const l of logs) {
    if (!l?.done) continue;
    const idx = linearDayIndex(l.weekIndex, l.dayIndex);
    if (idx <= maxAllowedDoneIndex) doneSet.add(idx);
  }

  let k = 1;
  while (doneSet.has(k)) k++;
  const maxConsecutiveDone = k - 1;

  const todayIdx = linearDayIndex(today.weekIndex, today.dayIndex);

  return logs.filter((l) => {
    const idx = linearDayIndex(l.weekIndex, l.dayIndex);
    if (idx === todayIdx) return true;
    if (l.done && idx >= 1 && idx <= maxConsecutiveDone) return true;
    return false;
  });
}

function buildSnapshotFromState(args: {
  stage: AlexStage;
  context: AlexContext | null;
  roadmap: AlexRoadmap | null;
  today: AlexToday | null;
  logs: DailyLog[];
}): CoachV2Snapshot | null {
  const { stage, context, roadmap, today, logs } = args;
  if (!context || !roadmap || !today) return null;

  const updatedAtISO =
    (context as any)?.lastUpdatedAtISO ||
    today.completedAtISO ||
    today.startedAtISO ||
    today.committedAtISO ||
    (roadmap as any)?.createdAtISO ||
    new Date().toISOString();

  return {
    version: 1,
    updatedAtISO,
    stage,
    context,
    roadmap,
    today,
    logs: logs || [],
  };
}

export default function AlexV2Shell() {
  const router = useRouter();

  // ✅ Anti-flash hard lock
  const [booted, setBooted] = useState(false);
  const [serverSynced, setServerSynced] = useState(false);
  const [accountKey, setAccountKey] = useState<string>("");

  const lastPushedSigRef = useRef<string>("");
  const quotaRefreshInFlightRef = useRef(false);
  const liveStrategistSigRef = useRef<string>("");

  // ===== data
  const [stage, setStageState] = useState<AlexStage>("WELCOME");
  const [context, setContextState] = useState<AlexContext | null>(null);
  const [roadmap, setRoadmapState] = useState<AlexRoadmap | null>(null);
  const [today, setTodayState] = useState<AlexToday | null>(null);
  const [logs, setLogsState] = useState<DailyLog[]>([]);
  const [businessProject, setBusinessProject] =
    useState<FormActionBusinessProject | null>(null);

  const effectiveLogs = useMemo(
    () => clampLogsToToday(logs, today),
    [logs, today],
  );

  // ===== UI
  const [commitOpen, setCommitOpen] = useState(false);
  const [parcoursOpen, setParcoursOpen] = useState(false);

  // ✅ CMO AUTO — lecture douce du payload sans toucher au moteur Alex V2
  const [cmoCoachBrief, setCmoCoachBrief] = useState<string>("");
  const [cmoCoachPayload, setCmoCoachPayload] = useState<Record<
    string,
    any
  > | null>(null);

  // ✅ Alex Stratège IA Live Premium — couche d'enrichissement, sans remplacer engine.ts
  const [liveStrategy, setLiveStrategy] =
    useState<AlexLiveStrategistResult | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string>("");
  const [liveLastRefreshAtISO, setLiveLastRefreshAtISO] = useState<string>("");
  const [liveStrategyOpen, setLiveStrategyOpen] = useState(false);

  // ===== quota
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);
  const [planLabel, setPlanLabel] = useState<string>("");
  const remaining = useMemo(
    () => Math.max((limit || 0) - (used || 0), 0),
    [limit, used],
  );

  const systemePlansUrl =
    process.env.NEXT_PUBLIC_SYSTEME_PLANS_URL ||
    "https://legenerateurdigital.systeme.io/plans";

  const planMonthlyLimit = useMemo(() => {
    const p = (planLabel || "").toLowerCase();
    if (p.includes("azur")) return 150_000;
    if (p.includes("ult")) return 15_000_000;
    if (p.includes("pro")) return 6_000_000;
    if (p.includes("ess")) return 2_000_000;

    const n = Number(limit || 0);
    if (n > 0) return n;
    return 2_000_000;
  }, [planLabel, limit]);

  const planDailySoft = useMemo(() => {
    const p = (planLabel || "").toLowerCase();
    if (p.includes("azur")) return 20_000;
    if (p.includes("ult") || planMonthlyLimit === 15_000_000) return 500_000;
    if (p.includes("pro") || planMonthlyLimit === 6_000_000) return 250_000;
    return 80_000;
  }, [planLabel, planMonthlyLimit]);

  const remainingValue = useMemo(() => {
    const r = Number.isFinite(remaining) ? remaining : 0;
    return r < 0 ? 0 : r;
  }, [remaining]);

  // ===== init from localStorage (BOOT)

  useEffect(() => {
    try {
      const key = "lgd_dashboard_daily_progress";
      const raw = window.localStorage.getItem(key);
      const current = raw ? JSON.parse(raw) : {};
      const updated = {
        idea: true,
        content: current.content || false,
        email: current.email || false,
        offer: current.offer || false,
      };
      window.localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }, []);

  // ============================================================
  // 🚀 CMO AUTO PAYLOAD — Coach IA
  // ------------------------------------------------------------
  // Patch volontairement minimal :
  // - ne modifie pas le moteur Alex V2,
  // - n'écrit pas directement dans les messages,
  // - affiche une synthèse exploitable par le coach,
  // - nettoie le payload après lecture.
  // ============================================================
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("lgd_cmo_module_auto_payload");
      if (!raw) return;

      const payload = JSON.parse(raw);
      const moduleTarget = String(
        payload?.module || payload?.targetModule || payload?.destination || "",
      ).toLowerCase();

      if (
        moduleTarget &&
        moduleTarget !== "coach" &&
        moduleTarget !== "coach-ia" &&
        moduleTarget !== "coach_ia"
      ) {
        return;
      }

      const offer = String(
        payload?.offer ||
          payload?.offer_name ||
          payload?.product ||
          payload?.title ||
          "ton offre",
      );
      const audience = String(
        payload?.audience ||
          payload?.target ||
          payload?.cible ||
          "ton audience",
      );
      const objective = String(
        payload?.objective ||
          payload?.goal ||
          payload?.objectif ||
          "structurer une stratégie de conversion",
      );
      const channel = String(
        payload?.channel || payload?.canal || payload?.sourceModule || "CMO IA",
      );
      const cta = String(
        payload?.cta || payload?.callToAction || "passer à l'action",
      );

      setCmoCoachPayload({
        offer,
        audience,
        objective,
        channel,
        cta,
      });

      setCmoCoachBrief(
        `CMO IA a préparé un brief stratégique : offre = ${offer}, cible = ${audience}, objectif = ${objective}, canal = ${channel}, CTA = ${cta}.`,
      );

      window.localStorage.removeItem("lgd_cmo_module_auto_payload");
    } catch (error) {
      console.error("CMO Coach payload error", error);
    }
  }, []);
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const currentAccountKey = await readCurrentAccountKey();
      if (cancelled) return;

      setAccountKey(currentAccountKey);

      try {
        const previousOwner =
          window.localStorage.getItem("lgd_alex_v2_owner") || "";
        if (previousOwner && previousOwner !== currentAccountKey) {
          resetAlexLocalStateForAccount(currentAccountKey);
        } else if (!previousOwner) {
          window.localStorage.setItem("lgd_alex_v2_owner", currentAccountKey);
        }
      } catch {}

      const serverBusinessProject = await readBusinessProject().catch(
        () => null,
      );
      if (!cancelled && serverBusinessProject) {
        setBusinessProject(serverBusinessProject);
      }

      const ctx = getV2Context();
      const rm = getV2Roadmap();
      const td = getV2Today();
      const st = getV2Stage();
      const lg = getV2Logs();

      setContextState(ctx);
      setRoadmapState(rm);
      setTodayState(td);
      setLogsState(lg);

      if (!ctx || !rm || !td) {
        setStageState("ONBOARDING");
        setV2Stage("ONBOARDING");
        setBooted(true);
        return;
      }

      if (st) {
        setStageState(st);
        setBooted(true);
        return;
      }

      if (td?.committedAtISO && td?.startedAtISO && !td?.completedAtISO) {
        setStageState("FEEDBACK");
        setV2Stage("FEEDBACK");
        setBooted(true);
        return;
      }

      setStageState("WELCOME");
      setV2Stage("WELCOME");
      setBooted(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== server persistence boot sync
  useEffect(() => {
    if (!booted) return;
    if (serverSynced) return;

    (async () => {
      try {
        const localSnap = buildSnapshotFromState({
          stage,
          context,
          roadmap,
          today,
          logs,
        });
        const res = await syncCoachV2AtBoot({ local: localSnap });

        if (
          (res as any)?.mode === "server->local" &&
          (res as any)?.serverSnap
        ) {
          const s = (res as any).serverSnap as CoachV2Snapshot;
          setV2Stage(s.stage);
          setV2Context(s.context);
          setV2Roadmap(s.roadmap);
          setV2Today(s.today);

          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(
                "lgd_alex_v2_logs",
                JSON.stringify(s.logs || []),
              );
            }
          } catch {}
        }

        if ((res as any).mode === "server->local") {
          const ctx = getV2Context();
          const rm = getV2Roadmap();
          const td = getV2Today();
          const st = getV2Stage();
          const lg = getV2Logs();

          setContextState(ctx);
          setRoadmapState(rm);
          setTodayState(td);
          setLogsState(lg);
          if (st) setStageState(st);
        }
      } catch {
      } finally {
        setServerSynced(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, serverSynced]);

  // Push updates to server (debounced)
  useEffect(() => {
    if (!booted) return;
    if (!serverSynced) return;
    if (!accountKey) return;

    const snapshot = buildSnapshotFromState({
      stage,
      context,
      roadmap,
      today,
      logs,
    });
    if (!snapshot) return;

    const sig = JSON.stringify({
      stage: snapshot.stage,
      updatedAtISO: snapshot.updatedAtISO,
      w: snapshot.today.weekIndex,
      d: snapshot.today.dayIndex,
      c: (snapshot.context as any)?.lastUpdatedAtISO,
      l: snapshot.logs.length,
    });

    if (sig === lastPushedSigRef.current) return;

    const t = setTimeout(() => {
      pushCoachV2SnapshotToServer(snapshot).catch(() => {});
      lastPushedSigRef.current = sig;
    }, 800);

    return () => clearTimeout(t);
  }, [booted, serverSynced, accountKey, stage, context, roadmap, today, logs]);

  // ===== quota fetch
  useEffect(() => {
    void refreshQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(
        "lgd_alex_live_strategy_open",
      );
      setLiveStrategyOpen(saved === "true");
    } catch {}
  }, []);

  function toggleLiveStrategyOpen() {
    setLiveStrategyOpen((current) => {
      const next = !current;
      try {
        window.sessionStorage.setItem(
          "lgd_alex_live_strategy_open",
          String(next),
        );
      } catch {}
      return next;
    });
  }

  async function refreshQuota() {
    if (quotaRefreshInFlightRef.current) return;

    quotaRefreshInFlightRef.current = true;
    setQuotaLoading(true);

    try {
      const q = await coachQuota();
      setUsed(Number(q.tokens_used || 0));
      setLimit(Number(q.tokens_limit || 0));
      setPlanLabel(
        planLabelFrom(
          String(q.display_plan || q.plan_key || q.plan || ""),
          Number(q.tokens_limit || 0),
        ),
      );
    } catch (e: any) {
      const msg = String(e?.message || e || "");
      if (msg.includes("UNAUTH") || msg.includes("401")) {
        router.replace("/auth/login");
        return;
      }
    } finally {
      quotaRefreshInFlightRef.current = false;
      setQuotaLoading(false);
    }
  }

  async function refreshLiveStrategist(args?: {
    force?: boolean;
    signal?: AbortSignal;
  }) {
    if (!context || !today?.mission) {
      setLiveStrategy(null);
      setLiveError("");
      setLiveLastRefreshAtISO("");
      return;
    }

    const sig = JSON.stringify({
      contextUpdatedAtISO: (context as any)?.lastUpdatedAtISO || "",
      weekIndex: today.weekIndex,
      dayIndex: today.dayIndex,
      missionTitle: today.mission.title || "",
      missionObjective: today.mission.objective || "",
    });

    if (!args?.force && liveStrategistSigRef.current === sig) return;
    liveStrategistSigRef.current = sig;

    setLiveLoading(true);
    setLiveError("");

    // Force UX visible: when the user clicks “Régénérer”, we clear the previous card
    // so the skeleton + button state confirm the action immediately, even if the
    // backend returns a very similar analysis.
    if (args?.force) {
      setLiveStrategy(null);
      setLiveLastRefreshAtISO("");
    }

    try {
      const regenerationId = args?.force
        ? `regen_${Date.now()}_${Math.random().toString(36).slice(2)}`
        : undefined;

      const previousStrategy = liveStrategy;
      const regenerationInstruction = args?.force
        ? "Régénération manuelle demandée par l'utilisateur : produire une nouvelle lecture stratégique, avec un angle différent, des formulations différentes et des actions renouvelées, sans changer l'objectif business."
        : undefined;

      let result = await generateAlexLiveStrategy({
        context,
        today,
        currentMission: today.mission,
        signal: args?.signal,
        regenerationId,
        regenerationInstruction,
      });

      // Sécurité UX : si le backend renvoie exactement la même analyse, on force
      // une variation locale premium pour que le clic Régénérer produise toujours
      // un changement visible à l'écran.
      if (args?.force && previousStrategy) {
        const previousSignature = JSON.stringify({
          title: previousStrategy.title,
          diagnostic: previousStrategy.diagnostic,
          realBlocker: previousStrategy.realBlocker,
          premiumMission: previousStrategy.premiumMission,
          mistakeToAvoid: previousStrategy.mistakeToAvoid,
          expectedResult: previousStrategy.expectedResult,
          actionSteps: previousStrategy.actionSteps,
        });

        const nextSignature = JSON.stringify({
          title: result.title,
          diagnostic: result.diagnostic,
          realBlocker: result.realBlocker,
          premiumMission: result.premiumMission,
          mistakeToAvoid: result.mistakeToAvoid,
          expectedResult: result.expectedResult,
          actionSteps: result.actionSteps,
        });

        if (previousSignature === nextSignature) {
          result = buildAlexLiveFallback({
            context,
            today,
            currentMission: today.mission,
            regenerationId,
            regenerationInstruction,
          });
        }
      }

      setLiveStrategy(result);
      setLiveLastRefreshAtISO(new Date().toISOString());

      if (result.mode === "live") {
        void refreshQuota();
      }
    } catch (error: any) {
      if (String(error?.name || "") === "AbortError") return;
      setLiveError(
        "Alex Stratège IA Live est indisponible pour le moment. Le socle Alex 98% reste actif.",
      );
    } finally {
      setLiveLoading(false);
    }
  }

  useEffect(() => {
    if (!booted || !serverSynced || !context || !today?.mission) {
      setLiveStrategy(null);
      setLiveError("");
      return;
    }

    const controller = new AbortController();
    void refreshLiveStrategist({ signal: controller.signal });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, serverSynced, context, today]);

  function goStage(next: AlexStage) {
    setStageState(next);
    setV2Stage(next);
  }

  const completedKeys = useMemo(() => {
    const set = new Set<string>();
    if (context) set.add("onboarding");
    if (roadmap) set.add("plan");
    if (today?.committedAtISO) set.add("action");
    if (today?.startedAtISO) set.add("execution");
    if (today?.completedAtISO) set.add("feedback");
    const hasTodayLog =
      !!today &&
      effectiveLogs.some(
        (l) => l.weekIndex === today.weekIndex && l.dayIndex === today.dayIndex,
      );
    if (today?.completedAtISO && hasTodayLog) set.add("optim");
    return set;
  }, [context, roadmap, today, effectiveLogs]);

  // ===== handlers
  function onStartOnboarding() {
    goStage("ONBOARDING");
  }

  function onSubmitOnboarding(data: {
    intent: AlexIntent;
    level: AlexLevel;
    timePerDay: TimePerDay;
    businessGoal?: AlexBusinessGoal;
    businessModel?: AlexBusinessModel;
    audienceSize?: AlexAudienceSize;
    mainBlocker?: AlexMainBlocker;
    offerDescription?: string;
    targetAudienceDescription?: string;
    primaryChannel?: string;
    channelNotes?: string;
    formActionProject?: FormActionBusinessProject;
  }) {
    const ctx = createInitialContext({
      intent: data.intent,
      level: data.level,
      timePerDay: data.timePerDay,
      businessGoal: data.businessGoal,
      businessModel: data.businessModel,
      audienceSize: data.audienceSize,
      mainBlocker: data.mainBlocker,
      offerDescription: data.offerDescription,
      targetAudienceDescription: data.targetAudienceDescription,
      primaryChannel: data.primaryChannel,
      channelNotes: data.channelNotes,
    });
    const rm = createInitialRoadmap(ctx);
    const td = buildTodayFromRoadmap({
      ctx,
      roadmap: rm,
      weekIndex: 1,
      dayIndex: 1,
    });

    setContextState(ctx);
    setRoadmapState(rm);
    setTodayState(td);
    setLogsState([]);

    setV2Context(ctx);
    setV2Roadmap(rm);
    setV2Today(td);

    if (data.formActionProject) {
      setBusinessProject(data.formActionProject);
      void patchBusinessProject(data.formActionProject);
    }

    goStage("PLAN_OVERVIEW");
  }

  function onOpenPlan() {
    goStage("PLAN_OVERVIEW");
  }

  function onSmartResume() {
    if (cmoCoachBrief) {
      const ctx =
        context ||
        createInitialContext({
          intent: "argent_vite",
          level: "sans_resultat",
          timePerDay: 60,
        });
      const rm = roadmap || createInitialRoadmap(ctx);
      const baseToday =
        today ||
        buildTodayFromRoadmap({ ctx, roadmap: rm, weekIndex: 1, dayIndex: 1 });

      const offer = String(cmoCoachPayload?.offer || "ton offre");
      const audience = String(cmoCoachPayload?.audience || "ton audience");
      const objective = String(
        cmoCoachPayload?.objective ||
          "transformer l’action CMO en stratégie claire",
      );
      const cta = String(cmoCoachPayload?.cta || "passer à l’action");

      const nextToday: AlexToday = {
        ...baseToday,
        committedAtISO: undefined,
        startedAtISO: undefined,
        completedAtISO: undefined,
        mission: {
          ...baseToday.mission,
          title: `Stratégie CMO IA — ${offer}`,
          objective: `Transformer le brief CMO en plan d’action concret pour ${audience}. Objectif : ${objective}.`,
          checklist: [
            `Clarifier l’offre prioritaire : ${offer}`,
            `Adapter le message à la cible : ${audience}`,
            `Structurer l’action autour du CTA : ${cta}`,
          ],
          kpiLabel: "Plan stratégique validé",
          durationMin: 45,
          editorPayload: {
            ...(baseToday.mission.editorPayload || {}),
            source: "cmo-ia",
            offer,
            audience,
            objective,
            cta,
          },
        },
      };

      setContextState(ctx);
      setRoadmapState(rm);
      setTodayState(nextToday);
      setLogsState([]);

      setV2Context(ctx);
      setV2Roadmap(rm);
      setV2Today(nextToday);

      goStage("MISSION_TODAY");
      return;
    }

    if (!context || !roadmap || !today) {
      goStage("ONBOARDING");
      return;
    }
    if (today.startedAtISO && !today.completedAtISO) {
      goStage("FEEDBACK");
      return;
    }
    if (today.committedAtISO && !today.startedAtISO) {
      goStage("COMMIT_REQUIRED");
      return;
    }
    goStage("MISSION_TODAY");
  }

  function onGoMission() {
    if (!context || !roadmap || !today) {
      goStage("ONBOARDING");
      return;
    }
    goStage("MISSION_TODAY");
  }

  function onAskCommit() {
    setCommitOpen(true);
  }

  function onCommit() {
    if (!today) return;

    const ts = new Date().toISOString();
    const next: AlexToday = {
      ...today,
      committedAtISO: ts,
      startedAtISO: ts,
    };

    setTodayState(next);
    setV2Today(next);

    // Bridge to editor intelligent
    writeEditorBrief(next.mission);

    // Move stage to FEEDBACK for when user returns
    goStage("FEEDBACK");

    router.push(
      "/dashboard/automatisations/reseaux_sociaux/editor-intelligent",
    );
  }

  function onFeedbackDone() {}

  function onFeedbackNotYet() {
    goStage("MISSION_TODAY");
  }

  function onSubmitFeedback(data: {
    done: boolean;
    kpiValue: number;
    blocker: DailyLog["blocker"];
  }) {
    if (!today) return;

    const ts = new Date().toISOString();

    const log: DailyLog = {
      version: 2,
      weekIndex: today.weekIndex,
      dayIndex: today.dayIndex,
      done: data.done,
      kpiValue: Number(data.kpiValue || 0),
      blocker: data.blocker,
      createdAtISO: ts,
    };

    addV2Log(log);
    const normalized = getV2Logs();
    setLogsState(normalized);

    const updatedToday: AlexToday = {
      ...today,
      completedAtISO: ts,
    };
    setTodayState(updatedToday);
    setV2Today(updatedToday);

    if (context) {
      const evolved = evolveContextAfterLog(context, {
        done: data.done,
        kpiValue: Number(data.kpiValue || 0),
        blocker: data.blocker,
      });
      setContextState(evolved);
      setV2Context(evolved);
    }

    goStage("OPTIMIZE");
  }

  function onGenerateNext() {
    if (!context || !roadmap || !today) {
      goStage("ONBOARDING");
      return;
    }

    const nextDayIndex = today.dayIndex < 7 ? today.dayIndex + 1 : 1;
    const nextWeekIndex =
      today.dayIndex < 7 ? today.weekIndex : Math.min(9, today.weekIndex + 1);

    const td = buildTodayFromRoadmap({
      ctx: context,
      roadmap,
      weekIndex: nextWeekIndex,
      dayIndex: nextDayIndex,
    });

    setTodayState(td);
    setV2Today(td);

    goStage("MISSION_TODAY");
  }

  async function onResetAlex() {
    const currentAccountKey = accountKey || (await readCurrentAccountKey());

    resetAlexLocalStateForAccount(currentAccountKey);
    await clearCoachV2SnapshotOnServer();

    liveStrategistSigRef.current = "";
    setLiveStrategy(null);
    setLiveError("");
    setLiveLastRefreshAtISO("");

    setServerSynced(false);
    setStageState("ONBOARDING");
    setContextState(null);
    setRoadmapState(null);
    setTodayState(null);
    setLogsState([]);
    setV2Stage("ONBOARDING");

    window.location.assign("/dashboard/coach-ia/v2");
  }

  function onOpenParcours() {
    setParcoursOpen(true);
  }

  // ✅ Anti-flash: render a neutral skeleton until booted.
  if (!booted) {
    return (
      <div className="mx-auto mt-[60px] max-w-7xl px-4">
        <div className="mb-6 rounded-3xl border border-[#2a2416] bg-gradient-to-r from-[#0b0f16] to-[#0b1220] px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-4xl font-semibold text-yellow-400">
                Alex IA 🤖 Digital Coach
              </div>
              <div className="text-sm text-white/55">
                Workflow guidé · Instagram → Facebook → Pinterest · Objectif :
                ventes MMR/MLR.
              </div>
            </div>

            <div className="w-[320px]">
              <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-3">
                <div className="text-xs text-white/50 mb-2">IA-Quotas</div>
                <div className="text-sm text-white/70">Chargement…</div>

                <div className="mt-3">
                  <a
                    href={systemePlansUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-yellow-500/25 bg-black/30 px-4 py-2 text-xs font-semibold text-yellow-200 hover:bg-black/45"
                  >
                    Voir les plans
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-5">
              <div className="h-6 w-40 rounded bg-white/5" />
              <div className="mt-4 space-y-3">
                <div className="h-16 rounded-2xl bg-white/5" />
                <div className="h-16 rounded-2xl bg-white/5" />
                <div className="h-16 rounded-2xl bg-white/5" />
                <div className="h-16 rounded-2xl bg-white/5" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-5">
              <div className="h-8 w-56 rounded bg-white/5" />
              <div className="mt-3 h-4 w-72 rounded bg-white/5" />
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="h-40 rounded-2xl bg-white/5" />
                <div className="h-40 rounded-2xl bg-white/5" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-5">
              <div className="h-6 w-36 rounded bg-white/5" />
              <div className="mt-4 space-y-3">
                <div className="h-20 rounded-2xl bg-white/5" />
                <div className="h-20 rounded-2xl bg-white/5" />
                <div className="h-10 rounded-2xl bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-[60px] max-w-7xl px-4">
      {/* Header */}
      <div className="mb-6 rounded-3xl border border-[#2a2416] bg-gradient-to-r from-[#0b0f16] to-[#0b1220] px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-4xl font-semibold text-yellow-400">
              Alex IA 🤖 Digital Coach
            </div>
            <div className="text-sm text-white/55">
              Workflow guidé · Instagram → Facebook → Pinterest · Objectif :
              ventes MMR/MLR.
            </div>
          </div>

          <div className="w-[320px]">
            <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-3">
              <div className="text-xs text-white/50 mb-2">IA-Quotas</div>

              <div className="text-sm text-white/80">
                Plan :{" "}
                <span className="text-yellow-200 font-semibold">
                  {planLabel || "—"}
                </span>{" "}
                <span className="text-white/55">
                  ({new Intl.NumberFormat("fr-FR").format(planMonthlyLimit)}
                  /mois)
                </span>
              </div>

              <div className="mt-1 text-xs text-white/55">
                Quota / jour :{" "}
                {new Intl.NumberFormat("fr-FR").format(planDailySoft)}
              </div>

              <div className="mt-1 text-xs text-white/55">
                Restant :{" "}
                {new Intl.NumberFormat("fr-FR").format(remainingValue)}
              </div>

              <div className="mt-3">
                <a
                  href={systemePlansUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-yellow-500/25 bg-black/30 px-4 py-2 text-xs font-semibold text-yellow-200 hover:bg-black/45"
                >
                  Voir les plans
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cmoCoachBrief && (
        <div className="mb-6 rounded-3xl border border-yellow-500/25 bg-gradient-to-r from-yellow-500/10 via-[#0b0f16] to-yellow-500/10 p-5 shadow-[0_0_35px_rgba(234,179,8,0.08)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300/80">
                Mode CMO IA actif
              </div>
              <div className="mt-2 text-sm leading-6 text-white/75">
                {cmoCoachBrief}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSmartResume();
                setCommitOpen(true);
              }}
              className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-yellow-400/40 bg-yellow-400 px-5 py-3 text-sm font-black text-black shadow-[0_0_22px_rgba(250,204,21,0.20)] transition hover:brightness-110"
            >
              Lancer la stratégie avec Alex
            </button>
          </div>
        </div>
      )}

      {context && today?.mission && (
        <div className="mb-6 rounded-3xl border border-yellow-500/25 bg-gradient-to-br from-[#111827] via-[#080b10] to-[#050607] p-5 shadow-[0_0_35px_rgba(234,179,8,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-yellow-300/80">
                Alex Stratège IA Live Premium
              </div>
              <h2 className="mt-2 text-2xl font-black text-yellow-400">
                Analyse stratégique du jour
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Diagnostic, blocage réel, erreur à éviter et résultat attendu ce
                soir.
              </p>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={toggleLiveStrategyOpen}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-2 text-sm font-black text-yellow-100 transition hover:-translate-y-0.5 hover:bg-yellow-500/15 hover:text-yellow-200"
                  aria-expanded={liveStrategyOpen}
                >
                  <span className="text-base leading-none">
                    {liveStrategyOpen ? "▲" : "▼"}
                  </span>
                  <span>
                    {liveStrategyOpen ? "Fermer Stratège" : "Ouvrir Stratège"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <div className="rounded-2xl border border-yellow-500/20 bg-black/25 px-4 py-2 text-xs font-bold text-yellow-100">
                {liveLoading
                  ? "Analyse en cours…"
                  : liveStrategy?.mode === "live"
                    ? "Mode IA Live"
                    : "Mode fallback premium"}
              </div>
              <button
                type="button"
                onClick={() => void refreshLiveStrategist({ force: true })}
                disabled={liveLoading}
                className="rounded-2xl border border-yellow-500/30 bg-yellow-400 px-4 py-2 text-xs font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {liveLoading ? "Génération…" : "Régénérer l’analyse"}
              </button>
              {liveLastRefreshAtISO ? (
                <div className="rounded-2xl border border-yellow-500/10 bg-black/15 px-4 py-2 text-[11px] font-semibold text-white/45">
                  Mise à jour :{" "}
                  {new Date(liveLastRefreshAtISO).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div
            className={[
              "grid transition-all duration-300 ease-out",
              liveStrategyOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            ].join(" ")}
          >
            <div className="overflow-hidden">
              {liveError && (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {liveError}
                </div>
              )}

              {liveLoading && !liveStrategy ? (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="h-28 rounded-2xl border border-white/5 bg-white/5" />
                  <div className="h-28 rounded-2xl border border-white/5 bg-white/5" />
                  <div className="h-28 rounded-2xl border border-white/5 bg-white/5" />
                </div>
              ) : liveStrategy ? (
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <div className="rounded-2xl border border-yellow-500/15 bg-black/25 p-4 lg:col-span-4">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300/70">
                      Diagnostic
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/78">
                      {liveStrategy.diagnostic}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/15 bg-black/25 p-4 lg:col-span-4">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300/70">
                      Blocage réel
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/78">
                      {liveStrategy.realBlocker}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/15 bg-black/25 p-4 lg:col-span-4">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300/70">
                      Résultat attendu
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/78">
                      {liveStrategy.expectedResult}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/15 bg-black/25 p-4 lg:col-span-7">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300/70">
                      Mission premium
                    </div>
                    <h3 className="mt-2 text-lg font-black text-yellow-300">
                      {liveStrategy.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      {liveStrategy.premiumMission}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/15 bg-black/25 p-4 lg:col-span-5">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300/70">
                      Erreur à éviter
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {liveStrategy.mistakeToAvoid}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-yellow-500/15 bg-black/25 p-4 lg:col-span-12">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300/70">
                      Actions à exécuter
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {liveStrategy.actionSteps.map((step, index) => (
                        <div
                          key={`${index}-${step}`}
                          className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/78"
                        >
                          <span className="font-black text-yellow-300">
                            {index + 1}.
                          </span>{" "}
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <div className="order-3 lg:order-1 lg:col-span-3">
          <Stepper
            currentStage={stage}
            completedKeys={completedKeys}
            onGoStage={(s) => goStage(s)}
          />
        </div>

        {/* CENTER */}
        <div className="order-1 lg:order-2 lg:col-span-6">
          <StageRenderer
            stage={stage}
            context={context}
            roadmap={roadmap}
            today={today}
            logs={effectiveLogs}
            businessProject={businessProject}
            onStartOnboarding={onStartOnboarding}
            onSubmitOnboarding={onSubmitOnboarding}
            onOpenPlan={onOpenPlan}
            onGoMission={onGoMission}
            onAskCommit={onAskCommit}
            onFeedbackDone={onFeedbackDone}
            onFeedbackNotYet={onFeedbackNotYet}
            onSubmitFeedback={onSubmitFeedback}
            onGenerateNext={onGenerateNext}
            onOpenParcours={onOpenParcours}
          />
        </div>

        {/* RIGHT */}
        <div className="order-2 lg:order-3 lg:col-span-3">
          <ActionPanel
            today={today}
            quota={{
              loading: quotaLoading,
              used,
              limit,
              remaining,
              planLabel,
            }}
            onOpenParcours={onOpenParcours}
            onResume={onSmartResume}
            onResetAlex={onResetAlex}
          />
        </div>
      </div>

      {/* Modals */}
      <CommitModal
        open={commitOpen}
        today={today}
        onClose={() => setCommitOpen(false)}
        onCommit={() => {
          setCommitOpen(false);
          onCommit();
        }}
      />

      <ParcoursPanel
        open={parcoursOpen}
        onClose={() => setParcoursOpen(false)}
        roadmap={roadmap}
        today={today}
        logs={effectiveLogs}
      />
    </div>
  );
}
