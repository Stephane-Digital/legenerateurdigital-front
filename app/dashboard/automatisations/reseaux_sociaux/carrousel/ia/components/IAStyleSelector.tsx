"use client";

import { motion } from "framer-motion";

// =============================================================
// 🎨 STYLES VISUELS — LGD Ultra-Premium v5.3
// =============================================================
const STYLES = [
  "Luxe Noir & Or (LGD Signature)",
  "Minimaliste & Aéré",
  "Bold / Impact Visuel",
  "Éducatif Structuré",
  "Émotionnel / Storytelling",
  "Professionnel Corporate (LinkedIn)",
  "Creator Moderne (TikTok / Insta)",
  "Vente directe High-Converting",
];

export default function IAStyleSelector({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-12"
    >
      {/* TITLE */}
      <h3 className="text-xl text-yellow-300 font-semibold mb-5 tracking-wide">
        Style visuel du carrousel
      </h3>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {STYLES.map((style, idx) => {
          const selected = value === style;

          return (
            <motion.button
              key={style}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(style)}
              className={`
                w-full text-left px-5 py-4 rounded-xl border text-sm
                backdrop-blur-sm transition-all duration-300
                ${
                  selected
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-semibold border-yellow-300 shadow-xl shadow-yellow-500/30"
                    : "bg-black/40 border-yellow-600/30 text-gray-200 hover:border-yellow-400 hover:bg-black/50"
                }
              `}
            >
              {style}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
