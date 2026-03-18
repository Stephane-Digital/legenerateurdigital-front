"use client";

import { motion } from "framer-motion";

export default function IAAdvancedSettings({
  slides,
  onSlidesChange,
  prompt,
  onPromptChange,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        mb-12 p-8 rounded-2xl
        bg-black/40
        border border-yellow-500/40
        shadow-xl shadow-yellow-500/10
        backdrop-blur-sm
      "
    >
      {/* =========================================================
          TITRE
      ========================================================= */}
      <h3 className="text-2xl text-yellow-300 font-semibold mb-8 tracking-wide">
        Paramètres avancés
      </h3>

      {/* =========================================================
          SLIDER (Nombre de slides)
      ========================================================= */}
      <div className="mb-10">
        <label className="block mb-3 text-yellow-200 font-medium">
          Nombre de slides
        </label>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={3}
            max={12}
            value={slides}
            onChange={(e) => onSlidesChange(Number(e.target.value))}
            className="
              w-full accent-yellow-400
              cursor-pointer
            "
          />
          <div className="text-yellow-400 text-lg font-bold w-12 text-right">
            {slides}
          </div>
        </div>

        <p className="text-xs text-yellow-300/70 mt-2 italic">
          Recommandé : entre <span className="text-yellow-400">5</span> et{" "}
          <span className="text-yellow-400">10</span> slides pour un impact optimal.
        </p>
      </div>

      {/* =========================================================
          PROMPT PERSONNALISÉ
      ========================================================= */}
      <div>
        <label className="block mb-3 text-yellow-200 font-medium">
          Instructions personnalisées (IA)
        </label>

        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Ajoutez des instructions spécifiques : ton, style, angle, structure, exemples…"
          className="
            w-full min-h-[140px] p-4 rounded-xl text-sm
            bg-black/40 border border-yellow-600/40
            focus:outline-none focus:border-yellow-400
            transition-all
          "
        />

        {/* Zone d’astuces IA */}
        <div className="mt-4 p-4 rounded-xl bg-black/30 border border-yellow-500/20">
          <p className="text-xs text-yellow-300/80 mb-2 font-semibold">
            Exemples recommandés :
          </p>

          <ul className="list-disc ml-5 text-xs text-gray-300 space-y-1">
            <li>
              « Ton expert mais accessible, structure simple et actionnable. »
            </li>
            <li>
              « Inclure un hook fort pour la slide 1 + CTA final captivant. »
            </li>
            <li>
              « Phrases courtes, visuels explicites, rythme rapide. »
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
