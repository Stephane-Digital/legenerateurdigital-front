"use client";

import { motion } from "framer-motion";

// =====================================================
// IAResult — Ultra Premium WOW Edition v5.5
// Affichage textuel détaillé + CTA vers l’éditeur
// =====================================================
export default function IAResult({ data, onValidate }) {
  if (!data || !data.slides || data.slides.length === 0) return null;

  const slides = data.slides;

  return (
    <div className="mt-16 p-8 rounded-2xl bg-black/40 border border-yellow-500/50 shadow-2xl shadow-yellow-500/10 backdrop-blur-sm">

      {/* ===== TITRE ===== */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl text-yellow-300 font-bold mb-8 tracking-wide"
      >
        Résultat généré par l’IA
      </motion.h3>

      {/* ===== LISTE DES SLIDES ===== */}
      <div className="space-y-6">
        {slides.map((slide, idx) => {
          const title =
            typeof slide === "string"
              ? `Slide ${idx + 1}`
              : slide.title || `Slide ${idx + 1}`;

          const content =
            typeof slide === "string"
              ? slide
              : slide.content || "";

          const bullets =
            typeof slide === "object" && Array.isArray(slide.bullets)
              ? slide.bullets
              : [];

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="p-6 rounded-xl bg-black/50 border border-yellow-600/40 hover:border-yellow-400/70 transition-all shadow-inner"
            >
              {/* === HEADER SLIDE === */}
              <p className="text-lg text-yellow-400 font-semibold mb-2">
                {title}
              </p>

              {/* === TEXTE PRINCIPAL === */}
              {content && (
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line mb-3">
                  {content}
                </p>
              )}

              {/* === BULLETS === */}
              {bullets.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ===== CTA POUR ENVOYER DANS L'ÉDITEUR ===== */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onValidate}
        className="mt-10 px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-300
                   text-black font-bold rounded-2xl text-lg tracking-wide
                   shadow-lg hover:shadow-yellow-400/20 transition"
      >
        🚀 Construire ce carrousel dans l’éditeur
      </motion.button>

    </div>
  );
}
