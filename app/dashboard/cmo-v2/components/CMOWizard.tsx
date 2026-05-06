"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { buildPayload, moduleToTarget } from "../lib/buildPayload";
import { requestCMODispatch } from "../lib/cmoDispatchClient";
import { buildFallbackDispatch } from "../lib/buildStrategy";
import { saveCMOPayload } from "../lib/storage";
import type { CMODispatchResult, CMOModule, CMOPayload } from "../types";

import StepBlocker from "./StepBlocker";
import StepGoal from "./StepGoal";
import StepModule from "./StepModule";
import StepStrategy from "./StepStrategy";

const CMO_SCENARIO_PAYLOAD_KEY = "lgd_cmo_scenario_payload";

type CMOScenarioPrefillPayload = {
  source?: string;
  mode?: string;
  target?: string;
  targetModule?: string;
  module?: CMOModule;
  destination?: string;
  objective?: string;
  blocker?: string;
  situation?: string;
  context?: string;
  angle?: string;
  strategy?: string;
  offer?: string;
  audience?: string;
  targetAudience?: string;
  recommendedScenario?: string;
  dispatch?: CMODispatchResult;
  payload?: CMOPayload;
};

function cleanPrefill(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildScenarioSituation(payload: CMOScenarioPrefillPayload) {
  const explicitSituation = cleanPrefill(payload.situation);
  if (explicitSituation) return explicitSituation;

  return [
    cleanPrefill(payload.offer) ? `Offre : ${cleanPrefill(payload.offer)}` : "",
    cleanPrefill(payload.audience || payload.targetAudience)
      ? `Cible : ${cleanPrefill(payload.audience || payload.targetAudience)}`
      : "",
    cleanPrefill(payload.angle) ? `Angle : ${cleanPrefill(payload.angle)}` : "",
    cleanPrefill(payload.context)
      ? `Contexte : ${cleanPrefill(payload.context)}`
      : "",
    cleanPrefill(payload.strategy)
      ? `Pourquoi cet angle convertit : ${cleanPrefill(payload.strategy)}`
      : "",
    cleanPrefill(payload.recommendedScenario)
      ? `Scénario choisi : ${cleanPrefill(payload.recommendedScenario)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function normalizeScenarioModule(
  payload: CMOScenarioPrefillPayload,
): CMOModule {
  if (
    payload.module === "lead" ||
    payload.module === "editor" ||
    payload.module === "coach"
  )
    return payload.module;
  return "email";
}

const routes: Record<CMOModule, string> = {
  email: "/dashboard/email-campaigns",
  lead: "/dashboard/lead-engine",
  editor: "/dashboard/automatisations/reseaux_sociaux/editor-intelligent",
  coach: "/dashboard/coach-ia",
};

const cmoLoadingSteps = [
  "Analyse de ton objectif...",
  "Identification du blocage principal...",
  "Construction de l’offre et de la promesse...",
  "Sélection de l’angle marketing...",
  "Préparation du payload module...",
];

function CMODispatchLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % cmoLoadingSteps.length);
    }, 1100);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-yellow-500/25 bg-yellow-500/[0.05] px-4 py-3 text-sm text-yellow-50/85 shadow-[0_0_28px_rgba(234,179,8,0.08)]">
      <div className="flex items-center gap-3">
        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <div className="absolute h-6 w-6 rounded-full border border-yellow-300/25" />
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-300/80 border-t-transparent shadow-[0_0_18px_rgba(250,204,21,0.35)]" />
        </div>

        <div className="min-w-0">
          <div className="font-semibold text-yellow-200">
            Analyse CMO en cours
          </div>
          <div className="mt-0.5 text-white/65 transition-all">
            {cmoLoadingSteps[index]}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CMOWizard() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState("");
  const [blocker, setBlocker] = useState("");
  const [situation, setSituation] = useState("");
  const [module, setModule] = useState<CMOModule | null>(null);
  const [dispatch, setDispatch] = useState<CMODispatchResult | null>(null);
  const [scenarioFinalPayload, setScenarioFinalPayload] =
    useState<CMOPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [safeModeNotice, setSafeModeNotice] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(CMO_SCENARIO_PAYLOAD_KEY);
      if (!raw) return;

      const payload = JSON.parse(raw) as CMOScenarioPrefillPayload;
      const nextModule = normalizeScenarioModule(payload);
      const nextObjective = cleanPrefill(
        payload.objective || payload.payload?.objective,
      );
      const nextBlocker = cleanPrefill(
        payload.blocker || payload.payload?.blocker,
      );
      const nextSituation = buildScenarioSituation(payload);
      const nextDispatch =
        payload.dispatch || payload.payload?.dispatch || null;

      if (nextObjective) setObjective(nextObjective);
      if (nextBlocker) setBlocker(nextBlocker);
      if (nextSituation) setSituation(nextSituation);

      setModule(nextModule);
      setDispatch(nextDispatch);
      setScenarioFinalPayload(payload.payload || null);
      setSafeModeNotice("");
      setError("");

      if (nextDispatch) {
        setStep(4);
      } else if (nextObjective && nextBlocker && nextSituation) {
        setStep(3);
      } else if (nextObjective && nextBlocker) {
        setStep(2);
      } else if (nextObjective) {
        setStep(1);
      }

      window.localStorage.removeItem(CMO_SCENARIO_PAYLOAD_KEY);
    } catch {
      window.localStorage.removeItem(CMO_SCENARIO_PAYLOAD_KEY);
    }
  }, []);

  const goStep2 = () => {
    if (!objective.trim()) {
      setError("Indique d’abord ce que tu veux obtenir aujourd’hui.");
      return;
    }

    setError("");
    setStep(2);
  };

  const goStep3 = () => {
    if (!blocker.trim()) {
      setError(
        "Indique le blocage principal pour que le CMO prépare un brief utile.",
      );
      return;
    }

    if (!situation.trim()) {
      setError(
        "Ajoute ta situation actuelle pour que le CMO évite les réponses génériques.",
      );
      return;
    }

    setError("");
    setStep(3);
  };

  const goStep4 = async () => {
    if (!module) {
      setError("Choisis le module à exploiter maintenant.");
      return;
    }

    const targetModule = moduleToTarget(module);
    const enrichedBlocker = `${blocker.trim()}\n\nSituation actuelle : ${situation.trim()}`;
    setLoading(true);
    setError("");
    setSafeModeNotice("");

    try {
      const [liveDispatch] = await Promise.all([
        requestCMODispatch({
          objective,
          blocker: enrichedBlocker,
          targetModule,
        }),
        new Promise((resolve) => window.setTimeout(resolve, 1200)),
      ]);

      const payload = buildPayload(
        module,
        objective,
        enrichedBlocker,
        liveDispatch,
      );
      setDispatch(payload.dispatch);
      setStep(4);
    } catch (err) {
      const fallback = buildFallbackDispatch(
        objective,
        enrichedBlocker,
        targetModule,
      );
      setDispatch(fallback);
      setSafeModeNotice(
        err instanceof Error
          ? `Mode SAFE activé : ${err.message}`
          : "Mode SAFE activé : l’API CMO Dispatch est indisponible.",
      );
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (!module) {
      setError("Choisis le module à exploiter maintenant.");
      return;
    }

    const enrichedBlocker = `${blocker.trim()}\n\nSituation actuelle : ${situation.trim()}`;
    const finalDispatch =
      dispatch ||
      buildFallbackDispatch(objective, enrichedBlocker, moduleToTarget(module));
    const payload = buildPayload(
      module,
      objective,
      enrichedBlocker,
      finalDispatch,
    );
    saveCMOPayload(payload);
    router.push(routes[module]);
  };

  return (
    <div className="rounded-3xl border border-yellow-500/20 bg-[#0B0B0F] p-6 shadow-[0_0_55px_rgba(234,179,8,0.08)] md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300/80">
          Étape {step}/4
        </div>

        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-yellow-400 transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {safeModeNotice && (
        <div className="mb-5 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100/80">
          {safeModeNotice}
        </div>
      )}

      {loading && step !== 4 && <CMODispatchLoader />}

      {step === 1 && (
        <StepGoal value={objective} onChange={setObjective} onNext={goStep2} />
      )}

      {step === 2 && (
        <StepBlocker
          value={blocker}
          onChange={setBlocker}
          situation={situation}
          onSituationChange={setSituation}
          onNext={goStep3}
          onBack={() => {
            setError("");
            setStep(1);
          }}
        />
      )}

      {step === 3 && (
        <StepModule
          value={module}
          onChange={setModule}
          onBack={() => {
            setError("");
            setStep(2);
          }}
          onFinish={goStep4}
        />
      )}

      {step === 4 && dispatch && (
        <StepStrategy
          dispatch={dispatch}
          loading={loading}
          onBack={() => {
            setError("");
            setStep(3);
          }}
          onConfirm={handleFinish}
        />
      )}
    </div>
  );
}
