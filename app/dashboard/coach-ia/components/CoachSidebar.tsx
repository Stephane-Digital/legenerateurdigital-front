"use client";

import * as React from "react";

export default function CoachSidebar({
  objective,
  onOpenObjective,
  onClickA,
  onClickB,
  onClickC,
}: {
  objective: string;
  onOpenObjective: () => void;
  onClickA: () => void;
  onClickB: () => void;
  onClickC: () => void;
}) {
  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/60 p-4">
      <div className="mb-3 text-sm font-semibold text-white/90">Salut Stéphane 👋</div>
      <div className="mb-4 text-xs text-white/55">Aujourd’hui, on attaque : exécuter, mesurer, avancer.</div>

      <div className="mb-4 rounded-2xl border border-[#2a2416] bg-black/20 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-white/80">Progression du jour</div>
          <div className="text-[11px] text-white/45">0/2 tâches</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={onClickA} className="rounded-xl bg-yellow-400 px-3 py-2 text-xs font-semibold text-black">
            A — Créer mon plan
          </button>
          <button
            onClick={onClickB}
            className="rounded-xl border border-[#2a2416] bg-white/5 px-3 py-2 text-xs font-semibold text-yellow-300 hover:bg-white/10"
          >
            B — Analyse
          </button>
          <button
            onClick={onClickC}
            className="col-span-2 rounded-xl border border-[#2a2416] bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            C — Réajuster mon plan
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-3">
        <div className="mb-1 text-xs font-semibold text-white/80">Objectif du moment</div>
        <div className="mb-3 text-[11px] text-white/55">Donne un objectif clair : Alex l’utilise pour guider ton plan.</div>
        <button
          onClick={onOpenObjective}
          className="w-full rounded-xl border border-[#2a2416] bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          Définir / mettre à jour mon objectif
        </button>

        {objective?.trim() ? (
          <div className="mt-3 rounded-xl border border-[#2a2416] bg-[#14100a]/50 px-3 py-2 text-[11px] text-white/75">
            {objective.trim()}
          </div>
        ) : null}
      </div>
    </div>
  );
}
