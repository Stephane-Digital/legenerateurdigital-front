"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buildPayload, moduleToTarget } from "../lib/buildPayload";
import { requestCMODispatch } from "../lib/cmoDispatchClient";
import { buildFallbackDispatch } from "../lib/buildStrategy";
import { saveCMOPayload } from "../lib/storage";
import type { CMODispatchResult, CMOModule } from "../types";

import StepBlocker from "./StepBlocker";
import StepGoal from "./StepGoal";
import StepModule from "./StepModule";
import StepStrategy from "./StepStrategy";

const routes: Record<CMOModule, string> = {
  email: "/dashboard/email-campaigns",
  lead: "/dashboard/lead-engine",
  editor: "/dashboard/automatisations/reseaux_sociaux/editor-intelligent",
  coach: "/dashboard/coach-ia",
};

export default function CMOWizard() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState("");
  const [blocker, setBlocker] = useState("");
  const [module, setModule] = useState<CMOModule | null>(null);
  const [dispatch, setDispatch] = useState<CMODispatchResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [safeModeNotice, setSafeModeNotice] = useState("");

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
      setError("Indique le blocage principal pour que le CMO prépare un brief utile.");
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
    setLoading(true);
    setError("");
    setSafeModeNotice("");

    try {
      const liveDispatch = await requestCMODispatch({ objective, blocker, targetModule });
      const payload = buildPayload(module, objective, blocker, liveDispatch);
      setDispatch(payload.dispatch);
      setStep(4);
    } catch (err) {
      const fallback = buildFallbackDispatch(objective, blocker, targetModule);
      setDispatch(fallback);
      setSafeModeNotice(
        err instanceof Error
          ? `Mode SAFE activé : ${err.message}`
          : "Mode SAFE activé : l’API CMO Dispatch est indisponible."
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

    const finalDispatch = dispatch || buildFallbackDispatch(objective, blocker, moduleToTarget(module));
    const payload = buildPayload(module, objective, blocker, finalDispatch);
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

      {loading && step !== 4 && (
        <div className="mb-5 rounded-xl border border-yellow-500/20 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
          Analyse CMO en cours : objectif, blocage, offre, promesse, angle, CTA et payload module.
        </div>
      )}

      {step === 1 && <StepGoal value={objective} onChange={setObjective} onNext={goStep2} />}

      {step === 2 && (
        <StepBlocker
          value={blocker}
          onChange={setBlocker}
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
