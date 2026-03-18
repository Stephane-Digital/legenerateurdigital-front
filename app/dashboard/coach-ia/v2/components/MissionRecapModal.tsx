"use client";

import { useMemo, useState } from "react";
import ModalBase from "../../components/modals/ModalBase";
import type { DailyLog, MissionBrief } from "../lib/types";

function blockerLabel(b?: DailyLog["blocker"]) {
  switch (b) {
    case "idees":
      return "Trouver des idées";
    case "oser":
      return "Oser publier";
    case "pas_de_reponses":
      return "Pas de réponses";
    case "temps":
      return "Manque de temps";
    case "message":
      return "Je ne savais pas quoi dire";
    case "autre":
      return "Autre";
    default:
      return "—";
  }
}

export default function MissionRecapModal(props: {
  open: boolean;
  onClose: () => void;
  weekIndex: number;
  dayIndex: number;
  mission: MissionBrief | null;
  log?: DailyLog;
}) {
  const { open, onClose, weekIndex, dayIndex, mission, log } = props;
  const [copied, setCopied] = useState(false);

  const copyText = useMemo(() => {
    if (!mission) return "";
    const lines: string[] = [];
    lines.push(`Semaine ${weekIndex} · Jour ${dayIndex}`);
    lines.push(mission.title);
    lines.push("");
    lines.push(`Objectif : ${mission.objective}`);
    lines.push("");
    if (mission.checklist?.length) {
      lines.push("Checklist :");
      for (const c of mission.checklist) lines.push(`- ${c}`);
      lines.push("");
    }
    lines.push(`KPI : ${mission.kpiLabel}`);
    lines.push(`Durée : ${mission.durationMin} min`);

    const anyPayload = mission.editorPayload as any;
    const script = anyPayload?.script || anyPayload?.dm_script || anyPayload?.message;
    if (script) {
      lines.push("");
      lines.push("Script :");
      lines.push(String(script));
    }

    if (log) {
      lines.push("");
      lines.push("Résultat :");
      lines.push(`- Terminé : ${log.done ? "Oui" : "Non"}`);
      lines.push(`- KPI saisi : ${log.kpiValue}`);
      lines.push(`- Blocage : ${blockerLabel(log.blocker)}`);
    }

    return lines.join("\n");
  }, [mission, weekIndex, dayIndex, log]);

  async function onCopy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  const hasScript = !!((mission?.editorPayload as any)?.script || (mission?.editorPayload as any)?.dm_script || (mission?.editorPayload as any)?.message);

  return (
    <ModalBase
      open={open}
      title={`Récap mission — Jour ${dayIndex}`}
      onClose={onClose}
      maxWidthClassName="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
          <div className="text-xs text-white/50">Semaine {weekIndex}</div>
          <div className="mt-1 text-lg font-semibold text-yellow-200">{mission?.title || "—"}</div>
          <div className="mt-2 text-sm text-white/70">{mission?.objective || ""}</div>
        </div>

        <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
          <div className="text-sm text-white/80 font-semibold">Checklist</div>
          <ul className="mt-2 space-y-2">
            {(mission?.checklist || []).map((c, idx) => (
              <li key={idx} className="text-sm text-white/65 flex gap-2">
                <span className="text-yellow-200">•</span>
                <span>{c}</span>
              </li>
            ))}
            {(!mission?.checklist || mission.checklist.length === 0) ? (
              <li className="text-sm text-white/45">—</li>
            ) : null}
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
            <div className="text-xs text-white/50">KPI</div>
            <div className="mt-1 text-sm text-white/80">{mission?.kpiLabel || "—"}</div>
          </div>
          <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
            <div className="text-xs text-white/50">Durée</div>
            <div className="mt-1 text-sm text-white/80">{mission ? `${mission.durationMin} min` : "—"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
          <div className="text-sm text-white/80 font-semibold">Résultat</div>
          <div className="mt-2 text-sm text-white/65">
            <div>Terminé : <span className="text-white/80 font-semibold">{log ? (log.done ? "Oui" : "Non") : "—"}</span></div>
            <div className="mt-1">KPI saisi : <span className="text-white/80 font-semibold">{log ? String(log.kpiValue) : "—"}</span></div>
            <div className="mt-1">Blocage : <span className="text-white/80 font-semibold">{log ? blockerLabel(log.blocker) : "—"}</span></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onCopy}
            className="rounded-2xl border border-[#2a2416] bg-black/20 px-4 py-3 text-sm text-white/70 hover:border-yellow-400/40 hover:text-yellow-200 transition"
          >
            {copied ? "Copié ✅" : hasScript ? "Copier le script" : "Copier la mission"}
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
