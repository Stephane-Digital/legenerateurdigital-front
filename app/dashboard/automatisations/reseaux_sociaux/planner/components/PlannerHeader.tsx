"use client";

import { motion } from "framer-motion";

export default function PlannerHeader({
  month,
  viewMode,
  onChangeView,
  onNext,
  onPrev,
}: {
  month: Date;
  viewMode: "month" | "week" | "day";
  onChangeView: (view: "month" | "week" | "day") => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const safeMonth = month instanceof Date ? month : new Date();

  const formattedMonth = safeMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full flex flex-col items-center gap-6 pt-4">

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          flex flex-col
          md:flex-row
          items-center
          justify-center
          gap-4 md:gap-8
          text-center
        "
      >
        <h2 className="text-2xl font-semibold text-white whitespace-nowrap">
          Publications programmées –{" "}
          <span className="text-yellow-400 capitalize">{formattedMonth}</span>
        </h2>

        <div className="flex items-center gap-3">
          {[{ id: "month", label: "Mois" },
            { id: "week", label: "Semaine" },
            { id: "day", label: "Jour" },
          ].map((view) => {
            const active = viewMode === view.id;

            return (
              <button
                key={view.id}
                onClick={() => onChangeView(view.id as any)}
                className={`
                  w-28 py-2 rounded-xl font-medium text-sm transition-all
                  ${
                    active
                      ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/30"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }
                `}
              >
                {view.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="
          flex items-center gap-4
          bg-zinc-900 border border-zinc-800 rounded-xl
          px-6 py-2
        "
      >
        <button
          onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition"
        >
          ←
        </button>

        <div className="text-base font-medium text-zinc-300 capitalize">
          {formattedMonth}
        </div>

        <button
          onClick={onNext}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition"
        >
          →
        </button>
      </motion.div>
    </div>
  );
}
