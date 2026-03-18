"use client";

import { motion } from "framer-motion";

// ✅ FIX TS minimal : ../utils/date n’exporte plus formatDayMini
function formatDayMini(date: Date) {
  // Affiche juste le jour du mois (ex: 23)
  return String(date.getDate());
}

export default function DayCell({
  date,
  isCurrentMonth,
  posts = [],
  isSelected,
  onClick,
}: {
  date: Date | null;
  isCurrentMonth: boolean;
  posts?: any[];
  isSelected?: boolean;
  onClick?: () => void;
}) {
  // Pas de date = case vide (jours hors grille)
  if (!date) {
    return <div className="h-28 rounded-xl bg-transparent" />;
  }

  return (
    <div
      onClick={onClick}
      className={`
        group
        cursor-pointer
        h-28
        rounded-xl
        p-2
        flex flex-col

        transition-all duration-200

        ${!isCurrentMonth ? "opacity-40 pointer-events-none" : ""}
        ${
          isSelected
            ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30"
            : "bg-[#141414] border border-[#1f1f1f]"
        }
      `}
    >
      {/* ===== NUMÉRO DU JOUR ===== */}
      <div
        className={`
          text-sm font-semibold
          mb-1
          ${isSelected ? "text-black" : "text-zinc-300"}
        `}
      >
        {formatDayMini(date)}
      </div>

      {/* ===== POSTS DU JOUR ===== */}
      <div className="flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-1">
        {posts.length > 0 &&
          posts.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="
                text-xs
                px-2 py-1
                rounded-md
                bg-zinc-800
                text-zinc-300
                border border-zinc-700
                truncate
                group-hover:bg-zinc-700
              "
            >
              {p.titre || "Sans titre"}
            </motion.div>
          ))}

        {posts.length === 0 && (
          <div className="text-[11px] text-zinc-600 italic mt-auto mb-1">—</div>
        )}
      </div>

      {/* ===== HOVER GLOW GOLD ===== */}
      {!isSelected && (
        <div
          className="
            absolute inset-0
            rounded-xl
            opacity-0
            group-hover:opacity-100
            transition-all duration-300
            pointer-events-none
            shadow-[0_0_25px_rgba(255,200,50,0.25)]
          "
        />
      )}
    </div>
  );
}
