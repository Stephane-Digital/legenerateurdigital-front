import type { AlexContext, AlexRoadmap, AlexStage, AlexToday, DailyLog } from "./types";
import { getCoachProfile, patchCoachProfile } from "../../lib/coachProfileApi";
import { LS_ALEX_V2_LOGS, getV2Context, getV2Logs, getV2Roadmap, getV2Stage, getV2Today, setV2Context, setV2Roadmap, setV2Stage, setV2Today } from "./storage";

export type CoachV2Snapshot = {
  version: 1;
  updatedAtISO: string;
  stage: AlexStage;
  context: AlexContext;
  roadmap: AlexRoadmap;
  today: AlexToday;
  logs: DailyLog[];
};

const PROFILE_KEY = "coach_v2";

// NOTE: storage.ts exposes addV2Log/getV2Logs but not setV2Logs.
// For server sync we need to overwrite the logs cache safely.
function setV2LogsUnsafe(logs: DailyLog[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_ALEX_V2_LOGS, JSON.stringify(logs || []));
  } catch {
    // ignore
  }
}

/** Build a minimal snapshot from current local state (source: localStorage). */
export function buildLocalSnapshot(): CoachV2Snapshot | null {
  const context = getV2Context();
  const roadmap = getV2Roadmap();
  const today = getV2Today();
  const stage = getV2Stage() || "WELCOME";
  const logs = getV2Logs();

  if (!context || !roadmap || !today) return null;

  const updatedAtISO =
    (context as any)?.lastUpdatedAtISO ||
    (today as any)?.completedAtISO ||
    (today as any)?.startedAtISO ||
    (today as any)?.committedAtISO ||
    (roadmap as any)?.createdAtISO ||
    new Date().toISOString();

  return {
    version: 1,
    updatedAtISO,
    stage,
    context,
    roadmap,
    today,
    logs,
  };
}

/** Apply snapshot to localStorage (becomes local cache). */
export function applySnapshotToLocal(snapshot: CoachV2Snapshot) {
  if (!snapshot) return;
  setV2Context(snapshot.context);
  setV2Roadmap(snapshot.roadmap);
  setV2Today(snapshot.today);
  setV2Stage(snapshot.stage);
  setV2LogsUnsafe(snapshot.logs || []);
}

/** Compare ISO timestamps safely. Returns true if a > b. */
function isAfter(a?: string, b?: string) {
  if (!a) return false;
  if (!b) return true;
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (!Number.isFinite(da) || !Number.isFinite(db)) return false;
  return da > db;
}

function safeSnapshot(raw: any): CoachV2Snapshot | null {
  if (!raw || typeof raw !== "object") return null;
  if (raw.version !== 1) return null;
  if (!raw.context || !raw.roadmap || !raw.today) return null;
  if (!raw.stage) return null;
  if (!raw.updatedAtISO) return null;
  return raw as CoachV2Snapshot;
}

export type SyncResult = {
  mode: "server->local" | "local->server" | "noop";
  reason: string;
};

/**
 * One-shot sync at boot:
 * - If server has snapshot and it's newer -> apply to local
 * - Else if local exists -> push to server
 * - Else noop
 */
export async function syncCoachV2AtBoot(): Promise<SyncResult> {
  let server: any = null;
  try {
    server = await getCoachProfile();
  } catch {
    // server unreachable -> keep local only
    return { mode: "noop", reason: "server_unavailable" };
  }

  const serverSnap = safeSnapshot((server?.profile || {})[PROFILE_KEY]);
  const localSnap = buildLocalSnapshot();

  if (serverSnap && localSnap) {
    if (isAfter(serverSnap.updatedAtISO, localSnap.updatedAtISO)) {
      applySnapshotToLocal(serverSnap);
      return { mode: "server->local", reason: "server_newer" };
    }
    // local is same/newer -> push local to server (keep truth aligned)
    await patchCoachProfile({
      intent: (localSnap.context as any)?.intent,
      level: (localSnap.context as any)?.level,
      time_per_day: (localSnap.context as any)?.timePerDay,
      profile: {
        ...(server?.profile || {}),
        [PROFILE_KEY]: localSnap,
      },
    });
    return { mode: "local->server", reason: "local_newer" };
  }

  if (serverSnap && !localSnap) {
    applySnapshotToLocal(serverSnap);
    return { mode: "server->local", reason: "local_empty" };
  }

  if (!serverSnap && localSnap) {
    await patchCoachProfile({
      intent: (localSnap.context as any)?.intent,
      level: (localSnap.context as any)?.level,
      time_per_day: (localSnap.context as any)?.timePerDay,
      profile: {
        ...(server?.profile || {}),
        [PROFILE_KEY]: localSnap,
      },
    });
    return { mode: "local->server", reason: "server_empty" };
  }

  return { mode: "noop", reason: "both_empty" };
}

/** Debounced updater: push current in-memory snapshot to server. */
export async function pushCoachV2SnapshotToServer(snapshot: CoachV2Snapshot) {
  if (!snapshot) return;
  await patchCoachProfile({
    intent: (snapshot.context as any)?.intent,
    level: (snapshot.context as any)?.level,
    time_per_day: (snapshot.context as any)?.timePerDay,
    profile: {
      [PROFILE_KEY]: snapshot,
    },
  });
}