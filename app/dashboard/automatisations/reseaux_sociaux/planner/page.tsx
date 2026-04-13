"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import DayView from "./components/DayView";
import MonthView from "./components/MonthView";
import WeekView from "./components/WeekView";

type ViewMode = "month" | "week" | "day";

function safeParseDay(day: string | null): Date | null {
  if (!day) return null;
  const m = day.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!m) return null;
  const d = new Date(`${day}T00:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function safeParseView(v: string | null): ViewMode | null {
  if (v === "month" || v === "week" || v === "day") return v;
  return null;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(base: Date, months: number) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function startOfWeek(base: Date) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12);
  const jsDay = d.getDay(); // 0=dimanche
  const diff = jsDay === 0 ? -6 : 1 - jsDay; // semaine FR lundi -> dimanche
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeek(base: Date) {
  const d = startOfWeek(base);
  d.setDate(d.getDate() + 6);
  return d;
}

function isWithinWeek(target: Date, weekBase: Date) {
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 12);
  const start = startOfWeek(weekBase);
  const end = endOfWeek(weekBase);
  return t >= start && t <= end;
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PlannerPageInner />
    </Suspense>
  );
}

function PlannerPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [view, setView] = useState<ViewMode>("week");

  useEffect(() => {
    const qDay = safeParseDay(searchParams.get("day"));
    const qView = safeParseView(searchParams.get("view"));

    if (qDay) setCurrentDate(qDay);
    if (qView) setView(qView);
  }, [searchParams]);

  const titleMonthLabel = useMemo(
    () =>
      currentDate.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
    [currentDate]
  );

  const handleSelectDate = (date: Date) => {
    setCurrentDate(date);
    setView("day");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToWeek = () => {
    setView("week");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwitchToDay = () => {
    const today = new Date();
    const safeToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);

    setCurrentDate((prev) => {
      const safePrev = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), 12);

      if (sameDay(safePrev, safeToday)) return safePrev;
      if (view === "week" && isWithinWeek(safeToday, safePrev)) return safeToday;
      if (view === "month" && sameMonth(safePrev, safeToday)) return safeToday;

      return safePrev;
    });

    setView("day");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setCurrentDate((d) => {
      if (view === "month") return addMonths(d, -1);
      if (view === "week") return addDays(d, -7);
      return addDays(d, -1);
    });
  };

  const handleNext = () => {
    setCurrentDate((d) => {
      if (view === "month") return addMonths(d, 1);
      if (view === "week") return addDays(d, 7);
      return addDays(d, 1);
    });
  };

  return (
    <div className="min-h-screen w-full text-white px-4 md:px-8 pb-24 pt-0">
      <div className="max-w-6xl mx-auto mt-[120px]">
        {/* ====== RETOURS ====== */}
        <div className="mb-6 flex flex-col gap-2">
          {view === "day" && (
            <button
              onClick={handleBackToWeek}
              className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
            >
              ← Retour semaine
            </button>
          )}

          <button
            onClick={() =>
              router.push(
                "/dashboard/automatisations/reseaux_sociaux/editor-intelligent"
              )
            }
            className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
          >
            ← Retour à l’Éditeur intelligent
          </button>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-8">
          Publications programmées —{" "}
          <span className="text-yellow-400 capitalize">{titleMonthLabel}</span>
        </h1>

        <div className="mt-10 rounded-[28px] border border-yellow-500/20 bg-[linear-gradient(180deg,rgba(18,18,18,0.96),rgba(10,10,10,0.96))] p-6 md:p-7 shadow-[0_0_0_1px_rgba(255,215,0,0.04)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.28em] text-yellow-400/80">
                Planner IA autonome
              </p>
              <h2 className="mt-3 text-xl md:text-2xl font-semibold text-white">
                Calendrier intelligent sans dépendance aux connexions réseaux
              </h2>
              <p className="mt-3 text-sm md:text-[15px] leading-7 text-white/72">
                LGD reste focalisé sur la création, la planification et la réutilisation du contenu.
                Le planner actuel continue de fonctionner, mais le bloc de connexions est remplacé par
                une logique plus premium : génération par lots, veille d&apos;angles viraux et édition rapide
                directement dans le calendrier.
              </p>
            </div>

            <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-yellow-300/80">Auto-remplissage</p>
                <p className="mt-2 text-sm font-semibold text-white">30 jours intelligents</p>
                <p className="mt-2 text-xs leading-6 text-white/55">Prévu pour injecter périodiquement des idées prêtes à retravailler.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-yellow-300/80">Trend Radar</p>
                <p className="mt-2 text-sm font-semibold text-white">Veille + réécriture</p>
                <p className="mt-2 text-xs leading-6 text-white/55">Les futures tendances viendront nourrir le planner sans casser le flux actuel.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-yellow-300/80">Exports</p>
                <p className="mt-2 text-sm font-semibold text-white">PNG / JPEG</p>
                <p className="mt-2 text-xs leading-6 text-white/55">Chaque contenu peut être récupéré en image depuis le modal actuel.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Espacement validé */}
        <div className="mt-[72px]">
          {/* ====== SWITCH + FLÈCHES (FIX) ====== */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Flèche gauche */}
              <button
                onClick={handlePrev}
                className="h-9 w-9 rounded-full bg-black/60 border border-[#252525] grid place-items-center
                           text-yellow-300 hover:text-yellow-200 hover:border-yellow-500/40 transition"
                aria-label="Précédent"
                title="Précédent"
              >
                ‹
              </button>

              {/* Toggle */}
              <div className="inline-flex rounded-full bg-black/60 border border-[#252525] p-1 shadow-lg shadow-black/50">
                <button
                  onClick={() => setView("month")}
                  className={`px-6 py-1.5 text-sm rounded-full transition-all ${
                    view === "month"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setView("week")}
                  className={`px-6 py-1.5 text-sm rounded-full transition-all ${
                    view === "week"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Semaine
                </button>
                <button
                  onClick={handleSwitchToDay}
                  className={`px-6 py-1.5 text-sm rounded-full transition-all ${
                    view === "day"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Jour
                </button>
              </div>

              {/* Flèche droite */}
              <button
                onClick={handleNext}
                className="h-9 w-9 rounded-full bg-black/60 border border-[#252525] grid place-items-center
                           text-yellow-300 hover:text-yellow-200 hover:border-yellow-500/40 transition"
                aria-label="Suivant"
                title="Suivant"
              >
                ›
              </button>
            </div>
          </div>

          {view === "month" && (
            <MonthView currentDate={currentDate} onSelectDate={handleSelectDate} />
          )}

          {view === "week" && (
            <WeekView currentDate={currentDate} onSelectDate={handleSelectDate} />
          )}

          {view === "day" && <DayView currentDate={currentDate} />}
        </div>
      </div>
    </div>
  );
}
