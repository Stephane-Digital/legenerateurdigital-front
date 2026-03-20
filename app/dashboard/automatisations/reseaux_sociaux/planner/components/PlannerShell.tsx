"use client";

import { useCallback, useMemo, useState } from "react";
import DayView from "./DayView";
import MonthView from "./MonthView";
import PlannerHeader from "./PlannerHeader";
import WeekView from "./WeekView";

type ViewMode = "month" | "week" | "day";

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

export default function PlannerShell() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [view, setView] = useState<ViewMode>("week");

  const onSelectDate = useCallback((date: Date) => {
    setCurrentDate(date);
    setView("day");
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  }, []);

  const prev = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "month") return addMonths(d, -1);
      if (view === "week") return addDays(d, -7);
      return addDays(d, -1);
    });
  }, [view]);

  const next = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "month") return addMonths(d, 1);
      if (view === "week") return addDays(d, 7);
      return addDays(d, 1);
    });
  }, [view]);

  const monthForHeader = useMemo(() => currentDate, [currentDate]);

  return (
    <div className="max-w-6xl mx-auto">
      <PlannerHeader
        month={monthForHeader}
        viewMode={view}
        onChangeView={(v) => setView(v)}
        onPrev={prev}
        onNext={next}
      />

      <div className="mt-8">
        {view === "month" && (
          <MonthView currentDate={currentDate} onSelectDate={onSelectDate} />
        )}

        {view === "week" && (
          <WeekView currentDate={currentDate} onSelectDate={onSelectDate} />
        )}

      {view === "day" && <DayView currentDate={date_actuelle} />}
      </div>
    </div>
  );
}
