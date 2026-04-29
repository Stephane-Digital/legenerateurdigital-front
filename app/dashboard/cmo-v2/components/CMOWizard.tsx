"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buildPayload } from "../lib/buildPayload";
import type { CMOModule } from "../types";

import StepGoal from "./StepGoal";
import StepBlocker from "./StepBlocker";
import StepModule from "./StepModule";

export default function CMOWizard() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState("");
  const [blocker, setBlocker] = useState("");
  const [module, setModule] = useState<CMOModule | null>(null);

  const handleFinish = () => {
    if (!module) return;

    const payload = buildPayload(module, objective, blocker);

    localStorage.setItem(
      "lgd_cmo_module_auto_payload",
      JSON.stringify(payload)
    );

    const routes = {
      email: "/dashboard/email-campaigns",
      lead: "/dashboard/lead-engine",
      editor:
        "/dashboard/automatisations/reseaux_sociaux/editor-intelligent",
      coach: "/dashboard/coach-ia",
    };

    router.push(routes[module]);
  };

  return (
    <div className="bg-[#0B0B0F] border border-yellow-500/20 rounded-2xl p-6 shadow-xl space-y-6">
      {step === 1 && (
        <StepGoal value={objective} onChange={setObjective} onNext={() => setStep(2)} />
      )}

      {step === 2 && (
        <StepBlocker
          value={blocker}
          onChange={setBlocker}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <StepModule
          value={module}
          onChange={setModule}
          onBack={() => setStep(2)}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}
