"use client";

import { motion } from "framer-motion";

// =============================================================
// 🎯 Objectifs IA — Ultra-Premium LGD v5.3
// =============================================================
const GOALS = [
  "Informer & Éduquer",
  "Vendre / Convertir",
  "Accrocher l’attention",
  "Inspirer / Motiver",
  "Démontrer une expertise",
  "Storytelling",
  "Casser une objection",
  "Promouvoir une offre",
  "Faire passer à l’action (CTA)",
];

export default function IAGoalSelector({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-12"
    >
      {/* TITLE */}
      <h3 className="text-xl text-yellow-300 font-semibold mb-5 tracking-wide">
        Objectif du contenu
      </h3>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GOALS.map((goal, idx) => {
          const selected = value === goal;

          return (
            <motion.button
              key={goal}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(goal)}
              className={`
                w-full text-left p-4 rounded-xl border transition-all duration-300 text-sm
                backdrop-blur-sm
                ${
                  selected
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-semibold border-yellow-300 shadow-xl shadow-yellow-500/30"
                    : "bg-black/40 border-yellow-600/30 hover:border-yellow-400 hover:bg-black/50 text-gray-200"
                }
              `}
            >
              {goal}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
