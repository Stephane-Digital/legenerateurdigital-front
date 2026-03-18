"use client";

import { useMemo, useState } from "react";
import ModalBase from "../../components/modals/ModalBase";
import type { AlexRoadmap, AlexToday, DailyLog } from "../lib/types";
import MissionRecapModal from "./MissionRecapModal";

function statusForDay(args: {
  weekIndex: number;
  dayIndex: number;
  today: AlexToday | null;
  logs: DailyLog[];
}) {
  const { weekIndex, dayIndex, today, logs } = args;

  const isToday = today?.weekIndex === weekIndex && today?.dayIndex === dayIndex;

  const isDone = (w: number, d: number) =>
    logs.some((l) => l.weekIndex === w && l.dayIndex === d && l.done);

  const done = isDone(weekIndex, dayIndex);
  if (done) return "done";
  if (isToday) return "today";

  // OPTION C — Progression journalière réelle :
  // Un jour est DISPONIBLE uniquement si le jour précédent est terminé (done=true).
  // Le tout premier jour (S1/J1) est disponible par défaut.
  let available = false;

  if (weekIndex === 1 && dayIndex === 1) {
    available = true;
  } else if (dayIndex > 1) {
    available = isDone(weekIndex, dayIndex - 1);
  } else {
    // dayIndex === 1 and weekIndex > 1 => depends on previous week's day 7
    available = isDone(weekIndex - 1, 7);
  }

  if (available) return "todo";
  return "locked";
}

export default function ParcoursPanel(props: {
  open: boolean;
  onClose: () => void;
  roadmap: AlexRoadmap | null;
  today: AlexToday | null;
  logs: DailyLog[];
}) {
  const { open, onClose, roadmap, today, logs } = props;
  const week = roadmap?.weeks?.find((w) => w.weekIndex === (today?.weekIndex || 1)) || roadmap?.weeks?.[0];

  const weekIndex = week?.weekIndex || 1;
  const weekLogs = useMemo(() => logs.filter((l) => l.weekIndex === weekIndex), [logs, weekIndex]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const selectedPlan = useMemo(
    () => week?.days?.find((d) => d.dayIndex === (selectedDayIndex || 0)),
    [week, selectedDayIndex]
  );
  const selectedLog = useMemo(
    () => (selectedDayIndex ? weekLogs.find((l) => l.dayIndex === selectedDayIndex) : undefined),
    [weekLogs, selectedDayIndex]
  );

  const selectedMission = useMemo(() => {
    // If user clicks the current day, we prefer the full mission from `today` (it contains editorPayload).
    if (selectedDayIndex && today?.weekIndex === weekIndex && today?.dayIndex === selectedDayIndex) {
      return today.mission;
    }
    // Otherwise, we reconstruct a display-only mission from roadmap.
    if (!selectedPlan) return null;
    return {
      platform: "instagram",
      type: selectedPlan.missionType,
      format: selectedPlan.format,
      goal: "attract",
      businessModel: selectedPlan.businessModel,
      title: selectedPlan.title,
      objective: selectedPlan.objective,
      checklist: selectedPlan.checklist,
      kpiLabel: selectedPlan.kpiLabel,
      durationMin: selectedPlan.durationMin,
      tone: "direct",
      editorPayload: {},
    } as any;
  }, [selectedDayIndex, today, weekIndex, selectedPlan]);

  return (
    <ModalBase open={open} title="Mon parcours" onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
          <div className="text-white/85 font-semibold">Semaine {week?.weekIndex || 1}</div>
          <div className="mt-1 text-sm text-white/55">{week?.label || "—"}</div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 7 }).map((_, i) => {
            const dayIndex = i + 1;
            const st = statusForDay({ weekIndex, dayIndex, today, logs });
            const label = week?.days?.find((d) => d.dayIndex === dayIndex)?.title || `Jour ${dayIndex}`;

            const badge =
              st === "done" ? "✓" : st === "today" ? "●" : st === "locked" ? "🔒" : "";

            const isClickable = st === "done" || st === "today";

            return (
              <div
                key={dayIndex}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : -1}
                onClick={isClickable ? () => setSelectedDayIndex(dayIndex) : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") setSelectedDayIndex(dayIndex);
                      }
                    : undefined
                }
                className={
                  "rounded-2xl border p-4 flex items-center justify-between gap-3 " +
                  (st === "today"
                    ? "border-yellow-400/50 bg-yellow-400/5"
                    : "border-[#2a2416] bg-black/10") +
                  (isClickable ? " cursor-pointer hover:border-yellow-400/30" : "")
                }
              >
                <div>
                  <div className="text-sm font-semibold text-white/80">
                    Jour {dayIndex} {badge ? <span className="ml-2 text-yellow-200">{badge}</span> : null}
                  </div>
                  <div className="mt-1 text-sm text-white/55">{label}</div>
                </div>

                <div className="text-xs text-white/50">
                  {st === "done" ? "Terminé" : st === "today" ? "Aujourd’hui" : st === "locked" ? "À venir" : "À faire"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
          <div className="text-sm text-white/70">Progression</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{
                  width: `${Math.min(100, Math.round((weekLogs.filter((l) => l.done).length / 7) * 100))}%`,
                }}
              />
            </div>
            <div className="text-xs text-white/55">{weekLogs.filter((l) => l.done).length}/7</div>
          </div>
        </div>
      </div>

      <MissionRecapModal
        open={selectedDayIndex !== null}
        onClose={() => setSelectedDayIndex(null)}
        weekIndex={weekIndex}
        dayIndex={selectedDayIndex || 1}
        mission={selectedMission}
        log={selectedLog}
      />
    </ModalBase>
  );
}
