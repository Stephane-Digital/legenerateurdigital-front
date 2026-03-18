"use client";

import type { AlexStage } from "../lib/types";

type StepKey = "onboarding" | "plan" | "action" | "execution" | "feedback" | "optim";

type Props = {
  currentStage: AlexStage;
  completedKeys: Set<string>;

  /**
   * 🔒 Important: optionnel pour ne pas casser les usages existants.
   * Si fourni, permet de rendre les étapes "cliquables" (retour onboarding, etc.)
   */
  onGoStage?: (stage: AlexStage) => void;
};

const STEPS: Array<{
  key: StepKey;
  label: string;
  sub: string;
  stage: AlexStage;
}> = [
  { key: "onboarding", label: "Onboarding", sub: "Démarrage", stage: "ONBOARDING" },
  { key: "plan", label: "Plan", sub: "Plan global", stage: "PLAN_OVERVIEW" },
  { key: "action", label: "Action", sub: "Mission du jour", stage: "MISSION_TODAY" },
  { key: "execution", label: "Exécution", sub: "Engagement requis", stage: "MISSION_TODAY" },
  { key: "feedback", label: "Feedback", sub: "Retour du jour", stage: "FEEDBACK" },
  { key: "optim", label: "Optimisation", sub: "Ajustement", stage: "OPTIMIZE" },
];

function isActive(stage: AlexStage, stepStage: AlexStage, key: StepKey) {
  // mapping souple : certaines étapes partagent le même stage
  if (stage === stepStage) return true;
  if (key === "execution" && stage === "MISSION_TODAY") return true;
  if (key === "action" && stage === "MISSION_TODAY") return true;
  return false;
}

export default function Stepper({ currentStage, completedKeys, onGoStage }: Props) {
  return (
    <div className="rounded-3xl border border-[#2a2416] bg-gradient-to-b from-[#0b0f16] to-[#0b1220] p-5">
      <div className="mb-3">
        <div className="text-white font-semibold">Parcours Alex</div>
        <div className="text-white/55 text-sm">MMR · MLR · Contenu (Instagram → Facebook → Pinterest)</div>
      </div>

      <div className="space-y-3">
        {STEPS.map((s, idx) => {
          const done = completedKeys.has(s.key);
          const active = isActive(currentStage, s.stage, s.key);

          const disabled = !onGoStage; // si pas de handler, on reste non-cliquable

          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onGoStage?.(s.stage)}
              disabled={disabled}
              className={[
                "w-full rounded-2xl border px-4 py-3 text-left transition",
                active
                  ? "border-yellow-500/35 bg-yellow-500/10"
                  : "border-yellow-500/15 bg-black/20 hover:bg-black/30",
                disabled ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                      done ? "bg-[#ffb800] text-black" : "bg-black/40 text-white/70 border border-yellow-500/20",
                    ].join(" ")}
                  >
                    {done ? "✓" : String(idx + 1)}
                  </div>

                  <div>
                    <div className="text-white font-semibold">{s.label}</div>
                    <div className="text-white/55 text-xs">{s.sub}</div>
                  </div>
                </div>

                <div className="text-xs text-white/55">{done ? "Terminé" : active ? "En cours" : "À faire"}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-yellow-500/10 bg-black/20 p-3">
        <div className="text-yellow-200 font-semibold text-sm">Règle d’or</div>
        <div className="text-white/55 text-xs mt-1">1 mission = 1 engagement = 1 résultat mesuré.</div>
      </div>
    </div>
  );
}
