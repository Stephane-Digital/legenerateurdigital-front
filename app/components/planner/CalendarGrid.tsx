"use client";

import PostCard from "./PostCard";

export default function CalendarGrid({ matrix, posts }) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
        <div
          key={d}
          className="text-center text-yellow-300 font-semibold text-sm"
        >
          {d}
        </div>
      ))}

      {matrix.map((week, wi) =>
        week.map((day, di) => {
          const dayPosts = posts.filter(
            (p) => p.date_programmee?.slice(0, 10) === day.full
          );

          return (
            <div
              key={`${wi}-${di}`}
              className="border border-yellow-500/20 rounded-xl min-h-[140px] p-2 bg-[#111]"
            >
              <p className="text-xs text-gray-400 mb-1">{day.day}</p>

              <div className="flex flex-col gap-2">
                {dayPosts.map((p) => (
                  <PostCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
