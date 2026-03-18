"use client";

import DayCell from "./DayCell";

// ✅ Helpers locaux (../utils/date n’exporte plus isSameDay / normalizeDate)
function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarGrid({
  days,
  posts = [],
  onSelectPost,
  loading = false,
}: any) {
  if (loading) {
    return (
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-400">
        Chargement du calendrier...
      </div>
    );
  }

  const today = normalizeDate(new Date());

  // ✅ FIX TS minimal: DayCell Props n’expose pas forcément "isToday"
  const DayCellAny = DayCell as any;

  return (
    <div className="grid grid-cols-7 gap-1 w-full">
      {days.map((obj: any, index: number) => {
        const date = obj.date;
        const isCurrentMonth = obj.isCurrentMonth;

        const normalized = normalizeDate(date);
        const isToday = isSameDay(normalized, today);

        const postsOfDay = posts.filter((p: any) => {
          if (!p.date_programmee) return false;
          const d = normalizeDate(new Date(p.date_programmee));
          return isSameDay(d, normalized);
        });

        return (
          <DayCellAny
            key={index}
            date={date}
            posts={postsOfDay}
            isCurrentMonth={isCurrentMonth}
            isToday={isToday}
            onSelectPost={onSelectPost}
          />
        );
      })}
    </div>
  );
}
