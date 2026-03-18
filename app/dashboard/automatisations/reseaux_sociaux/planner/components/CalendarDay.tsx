"use client";

import { useMemo } from "react";

type CalendarDay = {
  date: Date | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  posts: any[];
};

interface Props {
  days: CalendarDay[];
  onSelectDay: (day: CalendarDay) => void;
}

export default function CalendarGrid({ days, onSelectDay }: Props) {
  const safeDays = useMemo(() => {
    return days.map((day) => ({
      ...day,
      // Sécurité : si la date est null → on force une case vide
      safeDate: day.date ? day.date : null,
    }));
  }, [days]);

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-4">
      {safeDays.map((day, index) => (
        <button
          key={index}
          onClick={() => day.safeDate && onSelectDay(day)}
          className={`
            h-20 sm:h-24 rounded-lg border border-zinc-800 bg-zinc-900/40
            hover:bg-zinc-900 transition-all flex flex-col items-center justify-center
            ${day.isToday ? "border-yellow-500 text-yellow-400 font-bold" : ""}
            ${!day.isCurrentMonth ? "opacity-40" : ""}
          `}
          disabled={!day.safeDate}
        >
          {/* Numéro du jour */}
          <div className="text-sm font-medium text-zinc-300">
            {day.safeDate ? day.safeDate.getDate() : ""}
          </div>

          {/* Posts du jour */}
          {day.posts && day.posts.length > 0 && (
            <div className="text-[10px] text-yellow-400 mt-1">
              {day.posts.length} post(s)
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
