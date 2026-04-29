"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildPayload } from "../lib/buildPayload";
import type { CMOModule } from "../types";
import StepBlocker from "./StepBlocker";
import StepGoal from "./StepGoal";
import StepModule from "./StepModule";

export default function CMOWizard() {
  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState("");
  const [blocker, setBlocker] = useState("");
  const [module, setModule] = useState<CMOModule | null>(null);
  const router = useRouter();

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleFinish = () => {
    if (!module) return;

    const payload = buildPayload(module, objective, blocker);

    localStorage.setItem(
      "lgd_cmo_module_auto_payload",
      JSON.stringify(payload)
    );

    const routes: Record<CMOModule, string> = {
      email: "/dashboard/email-campaigns",
      lead: "/dashboard/lead-engine",
      editor:
        "/dashboard/automatisations/reseaux_sociaux/editor-intelligent",
      coach: "/dashboard/coach-ia",
    };

    router.push(routes[module]);
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <StepGoal value={objective} onChange={setObjective} onNext={next} />
      )}
      {step === 2 && (
        <StepBlocker
          value={blocker}
          onChange={setBlocker}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 3 && (
        <StepModule
          value={module}
          onChange={setModule}
          onBack={back}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}
