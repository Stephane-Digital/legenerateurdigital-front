"use client";

import { useMemo, useState } from "react";
import ModalBase from "../../components/modals/ModalBase";
import type { AlexToday } from "../lib/types";

export default function CommitModal(props: {
  open: boolean;
  today: AlexToday | null;
  onClose: () => void;
  onCommit: () => void;
}) {
  const { open, today, onClose, onCommit } = props;
  const [checked, setChecked] = useState(false);

  const duration = useMemo(() => {
    const d = today?.mission.durationMin;
    return typeof d === "number" ? d : 30;
  }, [today]);

  return (
    <ModalBase open={open} title="Validation d’engagement" onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
          <div className="text-white/85 font-semibold">Tu vas entrer en mission.</div>
          <div className="mt-1 text-sm text-white/55">
            Pendant <span className="text-yellow-200 font-semibold">{duration} minutes</span>, tu te concentres uniquement
            sur cette tâche.
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
          <div className="text-sm text-white/70">Mission</div>
          <div className="mt-1 text-lg font-semibold text-yellow-200">{today?.mission.title || "—"}</div>
          <div className="mt-2 text-sm text-white/60">{today?.mission.objective || ""}</div>

          {today?.mission.checklist?.length ? (
            <div className="mt-3 space-y-2">
              {today.mission.checklist.slice(0, 3).map((it, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-yellow-400/80" />
                  <span>{it}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/20 p-3">
            <div className="text-xs text-white/50">KPI à mesurer</div>
            <div className="text-sm text-white/75">{today?.mission.kpiLabel || "—"}</div>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-[#2a2416] bg-black/10 p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 accent-yellow-400"
          />
          <div>
            <div className="text-sm font-semibold text-white/80">Oui, je m’engage à la faire maintenant</div>
            <div className="text-xs text-white/50">Sans distraction. Je valide la mission avant de la lancer.</div>
          </div>
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-[#2a2416] bg-black/20 px-4 py-3 text-sm text-white/75 hover:border-yellow-400/30 hover:text-yellow-200 transition"
          >
            Plus tard
          </button>
          <button
            onClick={() => {
              if (!checked) return;
              onCommit();
              setChecked(false);
            }}
            disabled={!checked}
            className={
              "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition " +
              (checked ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-yellow-400/20 text-yellow-200/40")
            }
          >
            Commencer la mission
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
