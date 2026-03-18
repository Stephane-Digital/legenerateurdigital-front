"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { getBehaviorTags, makeOptimizationRecFromBlocker } from "../lib/alexBehaviorEngine";
import {
  canRegenPlan,
  commitPlanRegen,
  getCoachPlanLimits,
  getUpgradeHintForPlanRegen,
  tierFromPlanLabel,
  type PlanTier,
} from "../lib/planPolicy";
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

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#2a2416] bg-black/20 px-3 py-1 text-xs text-white/60">
      {children}
    </span>
  );
}

export default function StageRenderer(props: {
  stage: AlexStage;
  planLabel?: string;
  context: AlexContext | null;
  roadmap: AlexRoadmap | null;
  today: AlexToday | null;
  logs: DailyLog[];
  onStartOnboarding: () => void;
  onSubmitOnboarding: (data: { intent: AlexIntent; level: AlexLevel; timePerDay: TimePerDay }) => void;
  onOpenPlan: () => void;
  onGoMission: () => void;
  onAskCommit: () => void;
  onFeedbackDone: () => void;
  onFeedbackNotYet: () => void;
  onSubmitFeedback: (data: { done: boolean; kpiValue: number; blocker: DailyLog["blocker"] }) => void;
  onGenerateNext: () => void;
  onOpenParcours: () => void;
}) {
  const {
    stage,
    planLabel,
    context,
    roadmap,
    today,
    logs,
    onStartOnboarding,
    onSubmitOnboarding,
    onOpenPlan,
    onGoMission,
    onAskCommit,
    onFeedbackDone,
    onFeedbackNotYet,
    onSubmitFeedback,
    onGenerateNext,
    onOpenParcours,
  } = props;

  const planTier: PlanTier = tierFromPlanLabel(planLabel);
  const planLimits = getCoachPlanLimits(planTier);

  // ===== WELCOME
  if (stage === "WELCOME") {
    const doneCount = logs.filter((l) => l.done).length;
    const pct = Math.min(100, Math.round((doneCount / 7) * 100));

    return (
      <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-3xl font-semibold text-yellow-400">Alex V2 · Coach IA</div>
            <div className="mt-1 text-sm text-white/55">
              MMR · MLR · Contenu — Focus Instagram. Résultats mesurés.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill>Instagram</Pill>
            <Pill>Ventes</Pill>
            <Pill>Workflow</Pill>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
            <div className="text-white/85 font-semibold">Bon retour 👋</div>
            <div className="mt-1 text-sm text-white/55">
              {today
                ? `Mission en cours : Semaine ${today.weekIndex} · Jour ${today.dayIndex}`
                : "Tu peux reprendre là où tu t’es arrêté."}
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/50">Progression semaine</div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-xs text-white/55">{doneCount}/7</div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={onGoMission}
                className="flex-1 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
              >
                Reprendre la mission
              </button>
              <button
                onClick={onOpenParcours}
                className="flex-1 rounded-2xl border border-[#2a2416] bg-black/20 px-4 py-3 text-sm text-white/75 hover:border-yellow-400/30 hover:text-yellow-200 transition"
              >
                Voir mon parcours
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
            <div className="text-white/85 font-semibold">Nouveau ici ?</div>
            <div className="mt-1 text-sm text-white/55">2 minutes pour démarrer. Aucun blabla.</div>

            <button
              onClick={onStartOnboarding}
              className="mt-5 w-full rounded-2xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/15 transition"
            >
              Commencer le parcours
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== ONBOARDING
  if (stage === "ONBOARDING") {
    return <OnboardingCard onSubmit={onSubmitOnboarding} />;
  }

  // ===== PLAN
  if (stage === "PLAN_OVERVIEW") {
    return (
      <PlanOverview
        roadmap={roadmap}
        planTier={planTier}
        planLimits={planLimits}
        onStart={onGoMission}
        onRegen={onStartOnboarding}
      />
    );
  }

  // ===== MISSION
  if (stage === "MISSION_TODAY") {
    return <MissionCard today={today} onAskCommit={onAskCommit} onOpenParcours={onOpenParcours} />;
  }

  // ===== FEEDBACK
  if (stage === "FEEDBACK") {
    return <FeedbackCard today={today} onDone={onFeedbackDone} onNotYet={onFeedbackNotYet} onSubmit={onSubmitFeedback} />;
  }

  // ===== OPTIMIZE
  if (stage === "OPTIMIZE") {
    return <OptimizeCard today={today} logs={logs} ctx={context} planLimits={planLimits} onNext={onGenerateNext} />;
  }

  // EXECUTION / COMMIT_REQUIRED are handled by Shell (modal + redirect)
  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-white/80">Chargement…</div>
    </div>
  );
}

function OnboardingCard(props: { onSubmit: (data: { intent: AlexIntent; level: AlexLevel; timePerDay: TimePerDay }) => void }) {
  const { onSubmit } = props;
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<AlexIntent>("argent_vite");
  const [level, setLevel] = useState<AlexLevel>("debutant");
  const [timePerDay, setTimePerDay] = useState<TimePerDay>(30);

  const canNext = useMemo(() => true, []);

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-3xl font-semibold text-yellow-400">Démarrage rapide</div>
      <div className="mt-1 text-sm text-white/55">Alex t’emmène vers des ventes : MMR · MLR · Contenu.</div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        {step === 0 ? (
          <>
            <div className="text-white/85 font-semibold">Pourquoi tu veux réussir maintenant ?</div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow checked={intent === "argent_vite"} onClick={() => setIntent("argent_vite")} label="Gagner de l’argent rapidement" />
              <PickRow checked={intent === "quitter_job"} onClick={() => setIntent("quitter_job")} label="Quitter mon travail" />
              <PickRow checked={intent === "complement"} onClick={() => setIntent("complement")} label="Complément de revenu" />
              <PickRow checked={intent === "discipline"} onClick={() => setIntent("discipline")} label="Arrêter de procrastiner" />
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className="text-white/85 font-semibold">Où en es-tu aujourd’hui ?</div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow checked={level === "debutant"} onClick={() => setLevel("debutant")} label="Je débute totalement" />
              <PickRow checked={level === "sans_resultat"} onClick={() => setLevel("sans_resultat")} label="J’ai essayé sans résultats" />
              <PickRow checked={level === "quelques_ventes"} onClick={() => setLevel("quelques_ventes")} label="J’ai déjà fait quelques ventes" />
            </div>
          </>
        ) : (
          <>
            <div className="text-white/85 font-semibold">Temps disponible par jour</div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow checked={timePerDay === 30} onClick={() => setTimePerDay(30)} label="30 minutes" />
              <PickRow checked={timePerDay === 60} onClick={() => setTimePerDay(60)} label="1 heure" />
              <PickRow checked={timePerDay === 90} onClick={() => setTimePerDay(90)} label="1h30+" />
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={
              "rounded-2xl border px-4 py-3 text-sm transition " +
              (step === 0
                ? "border-white/10 bg-white/5 text-white/30"
                : "border-[#2a2416] bg-black/20 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Retour
          </button>

          {step < 2 ? (
            <button
              onClick={() => {
                if (!canNext) return;
                setStep((s) => Math.min(2, s + 1));
              }}
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={() => onSubmit({ intent, level, timePerDay })}
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Générer mon plan
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
        <div className="text-xs text-white/50">Réseaux</div>
        <div className="mt-1 text-sm text-white/70">Instagram d’abord. Facebook ensuite. Pinterest plus tard.</div>
      </div>
    </div>
  );
}

function PickRow(props: { checked: boolean; label: string; onClick: () => void }) {
  const { checked, label, onClick } = props;
  return (
    <button
      onClick={onClick}
      className={
        "w-full rounded-2xl border px-4 py-3 text-left text-sm transition " +
        (checked
          ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
          : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
      }
    >
      {label}
    </button>
  );
}

function PlanOverview(props: {
  roadmap: AlexRoadmap | null;
  planTier: PlanTier;
  planLimits: ReturnType<typeof getCoachPlanLimits>;
  onStart: () => void;
  onRegen: () => void;
}) {
  const { roadmap, planTier, planLimits, onStart, onRegen } = props;
  const regenCheck = useMemo(() => canRegenPlan(planLimits), [planLimits]);
  const upgradeHint = useMemo(() => getUpgradeHintForPlanRegen(planTier), [planTier]);

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-3xl font-semibold text-yellow-400">Ton plan global</div>
      <div className="mt-1 text-sm text-white/55">Non éditable. Tu exécutes, tu mesures, tu avances.</div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {(roadmap?.weeks || []).slice(0, 4).map((w) => (
          <div key={w.weekIndex} className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
            <div className="text-white/85 font-semibold">Semaine {w.weekIndex}</div>
            <div className="mt-1 text-sm text-white/55">{w.label}</div>
            <div className="mt-3 space-y-2">
              {w.days.slice(0, 3).map((d) => (
                <div key={d.dayIndex} className="text-sm text-white/65">
                  <span className="text-white/45">Jour {d.dayIndex} :</span> {d.title}
                </div>
              ))}
              <div className="text-xs text-white/45">+ {Math.max(0, w.days.length - 3)} autres jours…</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button onClick={onStart} className="flex-1 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition">
          Commencer aujourd’hui
        </button>
        <button
          onClick={() => {
            const ok = canRegenPlan(planLimits);
            if (!ok.ok) return;
            commitPlanRegen(planLimits);
            onRegen();
          }}
          disabled={!regenCheck.ok}
          className={
            "flex-1 rounded-2xl border px-5 py-3 text-sm transition " +
            (regenCheck.ok
              ? "border-[#2a2416] bg-black/20 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200"
              : "border-white/10 bg-white/5 text-white/35 cursor-not-allowed")
          }
        >
          Recommencer (onboarding)
        </button>
      </div>

      {!regenCheck.ok ? (
        <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
          <div className="text-sm text-yellow-200 font-semibold">{upgradeHint?.title || "Limite atteinte"}</div>
          <div className="mt-1 text-sm text-white/55">{upgradeHint?.body || "Tu pourras relancer ton onboarding plus tard selon ton plan."}</div>
        </div>
      ) : null}
    </div>
  );
}

function MissionCard(props: { today: AlexToday | null; onAskCommit: () => void; onOpenParcours: () => void }) {
  const { today, onAskCommit, onOpenParcours } = props;

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-3xl font-semibold text-yellow-400">Ta mission aujourd’hui</div>
          <div className="mt-1 text-sm text-white/55">Objectif business. Pas de bavardage.</div>
        </div>
        <button
          onClick={onOpenParcours}
          className="rounded-2xl border border-[#2a2416] bg-black/20 px-4 py-2 text-sm text-white/70 hover:border-yellow-400/30 hover:text-yellow-200 transition"
        >
          Mon parcours
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        <div className="text-yellow-200 text-lg font-semibold">{today?.mission.title || "—"}</div>
        <div className="mt-1 text-xs text-white/50">{today ? `Semaine ${today.weekIndex} · Jour ${today.dayIndex}` : ""}</div>
        <div className="mt-3 text-sm text-white/70">{today?.mission.objective || ""}</div>

        {today?.mission.checklist?.length ? (
          <div className="mt-4 space-y-2">
            {today.mission.checklist.map((it, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-white/70">
                <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-yellow-400/80" />
                <span>{it}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-xs text-white/50">KPI</div>
            <div className="mt-1 text-sm text-white/80">{today?.mission.kpiLabel || "—"}</div>
          </div>
          <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-xs text-white/50">Durée</div>
            <div className="mt-1 text-sm text-white/80">{today ? `${today.mission.durationMin} min` : "—"}</div>
          </div>
        </div>

        <button onClick={onAskCommit} className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition">
          Je veux faire cette mission
        </button>

        <div className="mt-3 text-xs text-white/45">Accès à l’éditeur intelligent uniquement après validation.</div>
      </div>
    </div>
  );
}

function FeedbackCard(props: {
  today: AlexToday | null;
  onDone: () => void;
  onNotYet: () => void;
  onSubmit: (data: { done: boolean; kpiValue: number; blocker: DailyLog["blocker"] }) => void;
}) {
  const { today, onDone, onNotYet, onSubmit } = props;
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [kpiValue, setKpiValue] = useState<number>(0);
  const [blocker, setBlocker] = useState<DailyLog["blocker"] | null>(null);

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-3xl font-semibold text-yellow-400">Feedback</div>
      <div className="mt-1 text-sm text-white/55">30 secondes. On mesure. On optimise.</div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        <div className="text-white/85 font-semibold">Mission terminée ?</div>
        <div className="mt-1 text-sm text-white/55">{today?.mission.title || ""}</div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setAnswered(true);
              onDone();
            }}
            className={
              "rounded-2xl border px-4 py-3 text-sm font-semibold transition " +
              (answered === true
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
                : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Oui
          </button>
          <button
            onClick={() => {
              setAnswered(false);
              onNotYet();
            }}
            className={
              "rounded-2xl border px-4 py-3 text-sm font-semibold transition " +
              (answered === false
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
                : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Pas encore
          </button>
        </div>

        {answered === true ? (
          <>
            <div className="mt-5 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
              <div className="text-sm text-white/70">{today?.mission.kpiLabel || "KPI"}</div>
              <input
                type="number"
                value={Number.isFinite(kpiValue) ? kpiValue : 0}
                onChange={(e) => setKpiValue(Number(e.target.value || 0))}
                className="mt-2 w-full rounded-2xl border border-[#2a2416] bg-[#070a10] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/40"
                placeholder="0"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
              <div className="text-sm text-white/70">Blocage principal</div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <PickRow checked={blocker === "idees"} onClick={() => setBlocker("idees")} label="Trouver des idées" />
                <PickRow checked={blocker === "oser"} onClick={() => setBlocker("oser")} label="Oser publier" />
                <PickRow checked={blocker === "pas_de_reponses"} onClick={() => setBlocker("pas_de_reponses")} label="Personne ne répond" />
                <PickRow checked={blocker === "temps"} onClick={() => setBlocker("temps")} label="Manque de temps" />
                <PickRow checked={blocker === "message"} onClick={() => setBlocker("message")} label="Je ne savais pas quoi dire" />
                <PickRow checked={blocker === "autre"} onClick={() => setBlocker("autre")} label="Aucun blocage" />
              </div>
            </div>

            <button
              onClick={() => onSubmit({ done: true, kpiValue, blocker: (blocker ?? "autre") })}
              className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Valider
            </button>
          </>
        ) : answered === false ? (
          <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-sm text-white/70">OK. Reviens une fois la mission terminée.</div>
            <div className="mt-1 text-xs text-white/50">Alex te remettra exactement sur cette mission.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OptimizeCard(props: {
  today: AlexToday | null;
  logs: DailyLog[];
  ctx: AlexContext | null;
  planLimits: ReturnType<typeof getCoachPlanLimits>;
  onNext: () => void;
}) {
  const { today, logs, ctx, planLimits, onNext } = props;

  const lastDone = useMemo(() => logs.slice().reverse().find((l) => l.done), [logs]);

  const blockerKey = (lastDone?.blocker ?? null) as DailyLog["blocker"] | null;
  const hasBlocker = blockerKey !== null && blockerKey !== "autre";

  const behaviorTags = useMemo(() => {
    try {
      return getBehaviorTags(ctx, logs);
    } catch {
      return [];
    }
  }, [ctx, logs]);

  const rec = useMemo(() => {
    if (!hasBlocker) return null;
    try {
      return makeOptimizationRecFromBlocker(blockerKey as DailyLog["blocker"]);

    } catch {
      return null;
    }
  }, [hasBlocker, blockerKey, behaviorTags]);

  const applyToEditor = () => {
    if (!rec) return;
    try {
      const briefId = "opt_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
const payload = {
  source: "coach-alex-v2",
  network: "instagram",
  objective: "ventes_mmr_mlr",
  blocker: blockerKey,
  tags: behaviorTags,
  recommendationTitle: rec.title,
  cause: rec.cause,
  action: rec.action,
  brief: rec.brief,
  editorMode: rec.editorMode,
  createdAtISO: new Date().toISOString(),
  briefId,
};
localStorage.setItem("lgd_editor_intelligent_brief", JSON.stringify(payload));
    } catch {
      // ignore
    }
    window.location.href = "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
  };

  const analysis = useMemo(() => {
    if (!hasBlocker) {
      return {
        win: "Tu avances. Continue le rythme.",
        fix: "Mesure ton KPI chaque jour.",
        next: "On enchaîne avec la prochaine mission.",
      };
    }

    // We keep existing logic as a fallback, but behavior tags can slightly adjust the tone.
    const b = blockerKey;

    if (b === "message") {
      return {
        win: "Tu as exécuté. C’est ce qui compte.",
        fix: "Demain : un script plus simple, 1 question ouverte.",
        next: "On passe à une mission conversation guidée.",
      };
    }
    if (b === "pas_de_reponses") {
      return {
        win: "Tu es visible. On optimise le CTA.",
        fix: "Demain : hook + question + CTA DM plus clair.",
        next: "On améliore la conversion, pas le volume.",
      };
    }
    if (b === "idees") {
      return {
        win: "Tu as démarré. On structure.",
        fix: "Demain : 1 template simple (problème → solution → preuve).",
        next: "On enlève la friction d’inspiration.",
      };
    }
    if (b === "temps") {
      return {
        win: "Tu as identifié le vrai problème.",
        fix: "Demain : mission 20 minutes, 1 seule tâche.",
        next: "On privilégie la régularité.",
      };
    }
    if (b === "oser") {
      return {
        win: "Tu progresses. On sécurise.",
        fix: "Demain : format plus léger (story ou mini post).",
        next: "On gagne en confiance par petites victoires.",
      };
    }

    return {
      win: "Tu as exécuté. Bien.",
      fix: "Demain : on optimise un seul levier.",
      next: "On enchaîne.",
    };
  }, [hasBlocker, blockerKey]);

  if (!hasBlocker) {
    return (
      <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
        <div className="text-3xl font-semibold text-yellow-400">Optimisation</div>
        <div className="mt-1 text-sm text-white/55">Aucun blocage détecté. Parfait — on garde le rythme.</div>

        <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-sm text-white/80 font-semibold">Ton ajustement pour demain</div>
          <div className="mt-2 text-sm text-white/60">Répète exactement le même mouvement. La régularité crée les ventes.</div>

          <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
            <div className="text-xs text-white/50">Action</div>
            <div className="mt-2 text-sm text-white/80">Passe à la mission suivante.</div>
          </div>

          <button onClick={onNext} className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition">
            Mission suivante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-6">
      <div className="text-3xl font-semibold text-yellow-400">Optimisation</div>
      <div className="mt-1 text-sm text-white/55">Alex ajuste ton focus. Réseau : Instagram. Modèles : MMR/MLR/Contenu.</div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">Ce qui a marché</div>
          <div className="mt-2 text-sm text-white/80">{analysis.win}</div>
        </div>
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">À corriger</div>
          <div className="mt-2 text-sm text-white/80">{analysis.fix}</div>
        </div>
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">Priorité</div>
          <div className="mt-2 text-sm text-white/80">{analysis.next}</div>
        </div>
      </div>

      {/* WOW card computed by Alex Behavior Engine */}
      {rec ? (
        <div className="mt-5 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-sm text-white/80 font-semibold">Ton ajustement pour demain</div>
          <div className="mt-2 text-sm text-white/60">{rec.title}</div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Cause probable</div>
              <div className="mt-2 text-sm text-white/80">{rec.cause}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Fix concret</div>
              <div className="mt-2 text-sm text-white/80">{rec.action}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Action maintenant</div>
              <div className="mt-2 text-sm text-white/80">{rec.brief}</div>
            </div>
          </div>

          <button onClick={applyToEditor} className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition">
            Appliquer dans l’éditeur intelligent
          </button>

          {planLimits.optimizeDepth <= 1 ? (
            <div className="mt-3 text-xs text-white/50">Astuce : passe en Pro/Ultime pour recevoir plus d’optimisations (hooks, scripts, closing).</div>
          ) : null}
        </div>
      ) : null}

      {planLimits.optimizeDepth >= 2 ? (
        <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-5">
          <div className="text-sm text-white/80 font-semibold">Boost Pro</div>
          <div className="mt-2 text-sm text-white/60">Ajout : 1 recommandation concrète (hook/CTA) pour augmenter les réponses.</div>
          <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/20 p-4">
            <div className="text-xs text-white/50">Action recommandée</div>
            <div className="mt-2 text-sm text-white/80">Teste 2 hooks différents sur le même sujet (A/B) et garde celui qui obtient le plus de commentaires/DM.</div>
          </div>
        </div>
      ) : null}

      {planLimits.optimizeDepth >= 3 ? (
        <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-5">
          <div className="text-sm text-white/80 font-semibold">Boost Ultime</div>
          <div className="mt-2 text-sm text-white/60">Ajout : plan de micro-optimisation (contenu → DM → closing) pour scaler.</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">Contenu</div>
              <div className="mt-1 text-sm text-white/80">1 post valeur + 1 story question aujourd’hui.</div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">DM</div>
              <div className="mt-1 text-sm text-white/80">3 relances courtes (question ouverte + micro engagement).</div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">Closing</div>
              <div className="mt-1 text-sm text-white/80">Propose une étape suivante simple (audio/mini call).</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/15 p-5">
        <div className="text-sm text-white/70">Dernière mission</div>
        <div className="mt-2 text-lg font-semibold text-yellow-200">{today?.mission.title || "—"}</div>
        <div className="mt-1 text-sm text-white/55">
          Intent actuel : <span className="text-white/80 font-semibold">{ctx?.intent || "—"}</span>
        </div>
        {behaviorTags?.length ? (
          <div className="mt-2 text-xs text-white/45">Contexte Alex : {behaviorTags.join(" · ")}</div>
        ) : null}
      </div>

      <button onClick={onNext} className="mt-6 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition">
        Générer la mission suivante
      </button>
    </div>
  );
}
