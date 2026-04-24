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
  setV2Context,
  setV2Roadmap,
  setV2Stage,
  setV2Today,
} from "../lib/storage";

import type {
  AlexContext,
  AlexIntent,
  AlexLevel,
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

function extractServerSnapshot(profileOut: any): CoachV2Snapshot | null {
  const p = profileOut?.profile || {};
  const s = p?.coach_v2 || p?.coachV2 || p?.coachV2Snapshot || null;
  if (!s) return null;

  if (!s?.today || !s?.context || !s?.roadmap || !s?.updatedAtISO) return null;
  return s as CoachV2Snapshot;
}

async function pushCoachV2SnapshotToServer(snapshot: CoachV2Snapshot): Promise<void> {
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

function planLabelFrom(plan?: string, limit?: number) {
  const n = Number(limit || 0);
  if (n === 70_000) return "AZUR";
  if (n === 2_500_000) return "Ultime";
  if (n === 1_000_000) return "Pro";
  if (n === 400_000) return "Essentiel";

  if (!plan) return "";
  const p = plan.toLowerCase();
  if (p.includes("azur") || p.includes("trial") || p.includes("starter") || p.includes("decouverte") || p.includes("découverte")) {
    return "AZUR";
  }
  if (p.includes("ult")) return "Ultime";
  if (p.includes("pro")) return "Pro";
  return "Essentiel";
}

function linearDayIndex(weekIndex: number, dayIndex: number) {
  return (weekIndex - 1) * 7 + dayIndex;
}

function clampLogsToToday(logs: DailyLog[], today: AlexToday | null): DailyLog[] {
  if (!logs?.length) return [];
  if (!today) return logs;

  const maxAllowedDoneIndex = Math.max(0, linearDayIndex(today.weekIndex, today.dayIndex) - 1);

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

  const [booted, setBooted] = useState(false);
  const [serverSynced, setServerSynced] = useState(false);

  const lastPushedSigRef = useRef<string>("");

  const [stage, setStageState] = useState<AlexStage>("WELCOME");
  const [context, setContextState] = useState<AlexContext | null>(null);
  const [roadmap, setRoadmapState] = useState<AlexRoadmap | null>(null);
  const [today, setTodayState] = useState<AlexToday | null>(null);
  const [logs, setLogsState] = useState<DailyLog[]>([]);

  const effectiveLogs = useMemo(() => clampLogsToToday(logs, today), [logs, today]);

  const [commitOpen, setCommitOpen] = useState(false);
  const [parcoursOpen, setParcoursOpen] = useState(false);

  const [quotaLoading, setQuotaLoading] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);
  const [planLabel, setPlanLabel] = useState<string>("");
  const remaining = useMemo(() => Math.max((limit || 0) - (used || 0), 0), [limit, used]);

  const systemePlansUrl =
    process.env.NEXT_PUBLIC_SYSTEME_PLANS_URL || "https://legenerateurdigital.systeme.io/plans";

  const planMonthlyLimit = useMemo(() => {
    const n = Number(limit || 0);
    if (n > 0) return n;
    const p = (planLabel || "").toLowerCase();
    if (p.includes("azur")) return 70_000;
    if (p.includes("ult")) return 2_500_000;
    if (p.includes("pro")) return 1_000_000;
    return 400_000;
  }, [planLabel, limit]);

  const planDailySoft = useMemo(() => {
    if (planMonthlyLimit === 70_000) return 10_000;
    return Math.round(planMonthlyLimit / 30);
  }, [planMonthlyLimit]);

  const remainingValue = useMemo(() => {
    const r = Number.isFinite(remaining) ? remaining : 0;
    return r < 0 ? 0 : r;
  }, [remaining]);

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

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!booted) return;
    if (serverSynced) return;

    (async () => {
      try {
        const localSnap = buildSnapshotFromState({ stage, context, roadmap, today, logs });
        const res = await syncCoachV2AtBoot({ local: localSnap });

        if ((res as any)?.mode === "server->local" && (res as any)?.serverSnap) {
          const s = (res as any).serverSnap as CoachV2Snapshot;
          setV2Stage(s.stage);
          setV2Context(s.context);
          setV2Roadmap(s.roadmap);
          setV2Today(s.today);

          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("lgd_alex_v2_logs", JSON.stringify(s.logs || []));
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
  }, [booted, serverSynced, stage, context, roadmap, today, logs]);

  useEffect(() => {
    if (!booted) return;
    if (!serverSynced) return;

    const snapshot = buildSnapshotFromState({ stage, context, roadmap, today, logs });
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
    }, 450);

    return () => clearTimeout(t);
  }, [booted, serverSynced, stage, context, roadmap, today, logs]);

  async function refreshQuota() {
    setQuotaLoading(true);
    try {
      const q = await coachQuota();
      const nextUsed = Number(q.tokens_used || 0);
      const nextLimit = Number(q.tokens_limit || 0);

      setUsed(nextUsed);
      setLimit(nextLimit);
      setPlanLabel(planLabelFrom(String(q.display_plan || q.plan || ""), nextLimit));
    } catch (e: any) {
      const msg = String(e?.message || e || "");
      if (msg.includes("UNAUTH") || msg.includes("401")) {
        router.replace("/auth/login");
        return;
      }
    } finally {
      setQuotaLoading(false);
    }
  }

  useEffect(() => {
    refreshQuota();
  }, []);

  function goStage(next: AlexStage) {
    setStageState(next);
    setV2Stage(next);
  }

  function onContextSubmit(payload: {
    level: AlexLevel;
    niche: string;
    offerType: string;
    target: string;
    pricing: string;
    objective: AlexIntent;
    timePerDay: TimePerDay;
    channels: string[];
  }) {
    const ctx = createInitialContext(payload);
    const rm = createInitialRoadmap(ctx);
    const td = buildTodayFromRoadmap(rm, []);

    setContextState(ctx);
    setRoadmapState(rm);
    setTodayState(td);
    setLogsState([]);

    setV2Context(ctx);
    setV2Roadmap(rm);
    setV2Today(td);
    setV2Stage("PARCOURS");

    setStageState("PARCOURS");
    setParcoursOpen(true);
  }

  function onValidateToday(commitNote?: string) {
    if (!today || !roadmap || !context) return;

    const completed = {
      ...today,
      committedAtISO: today.committedAtISO || new Date().toISOString(),
      completedAtISO: new Date().toISOString(),
      commitNote: commitNote || today.commitNote,
    };

    const nextLogs = addV2Log({
      weekIndex: completed.weekIndex,
      dayIndex: completed.dayIndex,
      stageName: completed.stageName,
      title: completed.title,
      done: true,
      completedAtISO: completed.completedAtISO,
      commitNote: completed.commitNote,
    });

    const nextContext = evolveContextAfterLog(context, completed, nextLogs);
    const nextToday = buildTodayFromRoadmap(roadmap, nextLogs);

    setLogsState(nextLogs);
    setContextState(nextContext);
    setTodayState(nextToday);

    try {
      if (completed.editorBrief) {
        writeEditorBrief(completed.editorBrief);
      }
    } catch {}

    setV2Today(nextToday);
    setV2Context(nextContext);
    setStageState("RECAP");
    setV2Stage("RECAP");

    refreshQuota().catch(() => {});
  }

  const currentTitle = today?.title || "Ton plan du jour";
  const currentSubtitle = today?.subtitle || "Passe à l'action, reste régulier, avance.";
  const currentStageName = today?.stageName || "Mission du jour";

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#2a2416] bg-[linear-gradient(135deg,#061225_0%,#0b1530_60%,#0b1220_100%)] px-6 py-6 shadow-[0_0_40px_rgba(245,183,0,0.08)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch xl:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-black tracking-tight text-[#ffc61a] md:text-5xl">
              Alex IA 🤖 Digital Coach
            </h1>
            <p className="mt-2 text-base text-white/70 md:text-[28px] md:leading-[1.1]">
              Workflow guidé · Instagram → Facebook → Pinterest · Objectif : ventes MMR/MLR.
            </p>
          </div>

          <div className="w-full xl:max-w-[340px] rounded-3xl border border-[#2a2416] bg-[#0b1220]/80 p-5">
            <div className="text-sm text-white/70">IA-Quotas</div>
            <div className="mt-3 text-[18px] leading-tight text-white/90">
              Plan :{" "}
              <span className="font-semibold text-[#ffcf2e]">
                {planLabel || "Essentiel"}
              </span>{" "}
              <span className="text-white/60">({planMonthlyLimit.toLocaleString("fr-FR")}/mois)</span>
            </div>
            <div className="mt-2 text-[15px] text-white/75">
              Quota / jour : {planDailySoft.toLocaleString("fr-FR")}
            </div>
            <div className="mt-1 text-[15px] text-white/75">
              Restant : {remainingValue.toLocaleString("fr-FR")}
            </div>
            <a
              href={systemePlansUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-[#46370b] bg-black/20 px-4 py-3 text-sm font-semibold text-[#ffcf2e] hover:bg-black/35"
            >
              Voir les plans
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)_280px]">
        <ParcoursPanel
          context={context}
          roadmap={roadmap}
          today={today}
          logs={effectiveLogs}
          onOpen={() => setParcoursOpen(true)}
        />

        <div className="space-y-6">
          <Stepper stage={stage} />
          <StageRenderer
            stage={stage}
            currentTitle={currentTitle}
            currentSubtitle={currentSubtitle}
            currentStageName={currentStageName}
            today={today}
            onOpenCommit={() => setCommitOpen(true)}
            onGoStage={goStage}
            onOpenParcours={() => setParcoursOpen(true)}
            onSubmitContext={onContextSubmit}
          />
        </div>

        <ActionPanel
          today={today}
          onOpenCommit={() => setCommitOpen(true)}
          onOpenParcours={() => setParcoursOpen(true)}
          quotaLoading={quotaLoading}
          planLabel={planLabel}
          used={used}
          limit={limit}
          remaining={remainingValue}
        />
      </div>

      <CommitModal
        open={commitOpen}
        onClose={() => setCommitOpen(false)}
        today={today}
        onConfirm={(note) => {
          setCommitOpen(false);
          onValidateToday(note);
        }}
      />

      <ParcoursPanel
        context={context}
        roadmap={roadmap}
        today={today}
        logs={effectiveLogs}
        open={parcoursOpen}
        onClose={() => setParcoursOpen(false)}
        modal
      />
    </div>
  );
}
