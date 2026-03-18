"use client";

import { motion } from "framer-motion";

export default function IABackgroundUploader({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        mb-12 p-8 rounded-2xl
        bg-black/40
        border border-yellow-500/30
        shadow-xl shadow-yellow-500/10
        backdrop-blur-sm
      "
    >
      {/* =========================================================
          TITLE
      ========================================================= */}
      <h3 className="text-2xl text-yellow-300 font-semibold mb-6 tracking-wide">
        Background du carrousel (optionnel)
      </h3>

      {/* =========================================================
          TEXTAREA PROMPT
      ========================================================= */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Décrivez une ambiance : textures, lumières, univers visuel, matière, environnement graphique…"
        className="
          w-full min-h-[120px] p-4 rounded-xl text-sm
          bg-black/40 border border-yellow-600/40
          focus:outline-none focus:border-yellow-400
          transition-all
        "
      />

      {/* =========================================================
          SUGGESTION BOX
      ========================================================= */}
      <div className="mt-4 p-4 rounded-xl bg-black/30 border border-yellow-600/20">
        <p className="text-xs text-yellow-300/80 mb-2 font-semibold">
          Inspirations possibles :
        </p>

        <ul className="list-disc ml-5 text-xs text-gray-300 space-y-1">
          <li>« Texture premium noire + reflets or, ambiance futuriste raffinée. »</li>
          <li>« Fond soft blur violet + lumière néon or. »</li>
          <li>« Papier granuleux sombre, vignettage cinématique, tons chauds. »</li>
          <li>« Style moderne minimaliste : surfaces lisses, teintes monochromes. »</li>
        </ul>
      </div>
    </motion.div>
  );
}
