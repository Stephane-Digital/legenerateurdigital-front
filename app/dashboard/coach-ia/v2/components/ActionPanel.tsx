"use client";

import type { AlexToday } from "../lib/types";
import { resetAlexV2All } from "../lib/storage";

export default function ActionPanel(props: {
  today: AlexToday | null;
  onOpenCommit?: () => void;
  onOpenParcours: () => void;
  onResume?: () => void;
  onResetAlex?: () => void | Promise<void>;
  quotaLoading?: boolean;
  planLabel?: string;
  used?: number;
  limit?: number;
  remaining?: number;
}) {
  const { today, onOpenCommit, onOpenParcours, onResume, onResetAlex } = props;

  function handleResume() {
    if (onResume) {
      onResume();
      return;
    }

    if (today?.committedAtISO && !today?.completedAtISO && onOpenCommit) {
      onOpenCommit();
      return;
    }

    onOpenParcours();
  }

  async function onResetLocal() {
    const ok = window.confirm(
      "Réinitialiser Alex V2 pour ce compte ?\n\nCela efface le contexte, le plan, la mission du jour et les logs Alex."
    );
    if (!ok) return;

    if (onResetAlex) {
      await onResetAlex();
      return;
    }

    resetAlexV2All({ includeLegacy: true });
    window.location.assign("/dashboard/coach-ia/v2");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-white/80 font-semibold">Action du jour</div>
            <div className="mt-1 text-sm text-white/55">Simple, concrète, orientée vente.</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/20 p-4">
          <div className="text-sm text-yellow-200 font-semibold">{today?.mission.title || "—"}</div>
          <div className="mt-1 text-xs text-white/50">{today ? `Semaine ${today.weekIndex} · Jour ${today.dayIndex}` : "—"}</div>
          <div className="mt-3 text-sm text-white/65">{today?.mission.objective || ""}</div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-xs text-white/50">KPI</div>
            <div className="mt-1 text-sm text-white/80">{today?.mission.kpiLabel || "—"}</div>
          </div>

          <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-xs text-white/50">Durée</div>
            <div className="mt-1 text-sm text-white/80">{today ? `${today.mission.durationMin} min` : "—"}</div>
          </div>
        </div>

        <button
          onClick={handleResume}
          className="mt-4 w-full rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
        >
          Reprendre maintenant
        </button>

        <button
          onClick={onResetLocal}
          className="mt-2 w-full rounded-2xl border border-[#3a2d12] bg-black/30 px-4 py-3 text-sm text-yellow-200 hover:bg-black/50 transition"
        >
          Réinitialiser Alex
        </button>

        <div className="mt-2 text-[11px] text-white/45">
          Astuce : si tu vois des étapes verrouillées ou une progression incohérente, ce reset remet Alex V2 à zéro pour le compte connecté.
        </div>
      </div>

      <div className="rounded-3xl border border-[#2a2416] bg-gradient-to-r from-[#0b0f16] to-[#0b1220] p-5">
        <div className="text-white/80 font-semibold">Focus réseaux</div>
        <div className="mt-2 text-sm text-white/55">Instagram d’abord. Facebook ensuite. Pinterest plus tard.</div>
      </div>
    </div>
  );
}
