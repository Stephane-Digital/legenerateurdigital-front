export type AlexIntent = "argent_vite" | "quitter_job" | "complement" | "discipline";
export type AlexLevel = "debutant" | "sans_resultat" | "quelques_ventes";
export type TimePerDay = 30 | 60 | 90;

export type AlexPlatform = "instagram" | "facebook" | "pinterest";
export type MissionType = "content" | "conversation" | "vente";
export type MissionFormat = "post" | "carrousel" | "story" | "dm_script";

export type BusinessPhase = "FIRST_SALE" | "STABILIZE" | "SCALE" | "AMBASSADOR";

export type AlexStage =
  | "WELCOME"
  | "ONBOARDING"
  | "PLAN_OVERVIEW"
  | "MISSION_TODAY"
  | "COMMIT_REQUIRED"
  | "EXECUTION"
  | "FEEDBACK"
  | "OPTIMIZE"
  | "PARCOURS";

export type NetworkProgress = {
  instagram: true;
  facebookUnlocked: boolean;
  pinterestUnlocked: boolean;
};

export type AlexContext = {
  version: 2;
  intent: AlexIntent;
  level: AlexLevel;
  timePerDay: TimePerDay;
  businessPhase?: BusinessPhase;
  platformLock: "instagram";
  networkProgress: NetworkProgress;
  startedAtISO: string;
  lastUpdatedAtISO: string;
};

export type MissionBrief = {
  platform: AlexPlatform;
  type: MissionType;
  format: MissionFormat;
  goal: "attract" | "engage" | "convert";
  businessModel: "MMR" | "MLR" | "CONTENT";
  title: string;
  objective: string;
  checklist: string[];
  kpiLabel: string;
  durationMin: number;
  tone: "direct" | "calme" | "motivant";
  // payload libre pour l’éditeur intelligent (pas de dépendance côté éditeur)
  editorPayload: Record<string, any>;
};

export type DayPlan = {
  dayIndex: number; // 1..7
  title: string;
  objective: string;
  checklist: string[];
  kpiLabel: string;
  durationMin: number;
  missionType: MissionType;
  format: MissionFormat;
  businessModel: MissionBrief["businessModel"];
};

export type WeekPlan = {
  weekIndex: number; // 1..4
  label: string;
  days: DayPlan[]; // 7 jours
};

export type AlexRoadmap = {
  version: 2;
  createdAtISO: string;
  weeks: WeekPlan[];
};

export type AlexToday = {
  version: 2;
  weekIndex: number;
  dayIndex: number;
  mission: MissionBrief;
  commitRequired: true;
  committedAtISO?: string;
  startedAtISO?: string;
  completedAtISO?: string;
};

export type DailyLog = {
  version: 2;
  weekIndex: number;
  dayIndex: number;
  done: boolean;
  kpiValue: number;
  blocker:
    | "idees"
    | "oser"
    | "pas_de_reponses"
    | "temps"
    | "message"
    | "autre";
  note?: string;
  createdAtISO: string;
};
