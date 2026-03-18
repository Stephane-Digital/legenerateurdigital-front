"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { generateCarrouselPreset } from "@/lib/api_carrousel";

// ✅ SAFE IMPORT (évite de dépendre d’un export nommé qui n’existe pas)
// On récupère la config via fallback : default -> IAStylesConfig -> module
import * as IAStylesModule from "../utils/IAStylesConfig";

const IAStylesConfig: any =
  (IAStylesModule as any).default ??
  (IAStylesModule as any).IAStylesConfig ??
  (IAStylesModule as any);

export default function CarrouselAIPresetsModal({
  show,
  onClose,
  onGenerated,
}: {
  show: boolean;
  onClose: () => void;
  onGenerated: (slides: any[]) => void;
}) {
  const [category, setCategory] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [preset, setPreset] = useState("");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================================================
  // 🎯 LISTES DYNAMIQUES
  // ============================================================
  const cfg = IAStylesConfig as Record<string, any>;

  const subtopics =
    category && cfg[category] ? cfg[category].subtopics : null;

  const presets =
    category && subtopic
      ? cfg[category].subtopics[subtopic]?.presets ?? null
      : null;

  // ============================================================
  // 🎨 CHANGEMENT DE CATÉGORIE
  // ============================================================
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubtopic("");
    setPreset("");
  };

  // ============================================================
  // 🚀 GÉNÉRATION IA FULL PREMIUM
  // ============================================================
  const launchPresetGeneration = async () => {
    if (!category || !subtopic || !preset || !topic.trim()) {
      alert("Merci de remplir tous les champs avant de générer.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Adapte au contrat API actuel: { prompt, slides_count }
      const slides_count =
        cfg?.[category]?.subtopics?.[subtopic]?.presets?.[preset]?.slides_count ??
        cfg?.[category]?.subtopics?.[subtopic]?.slides_count ??
        6;

      const categoryLabel = cfg?.[category]?.label ?? category;
      const subtopicLabel = subtopics?.[subtopic]?.label ?? subtopic;
      const presetLabel = presets?.[preset]?.label ?? preset;

      const prompt =
        `Génère un carrousel PREMIUM (design luxe sombre doré LGD).\n` +
        `Catégorie: ${categoryLabel}\n` +
        `Sous-thème: ${subtopicLabel}\n` +
        `Modèle: ${presetLabel}\n` +
        `Sujet: ${topic.trim()}\n\n` +
        `Contraintes:\n` +
        `- Slide 1: accroche forte\n` +
        `- Slides suivantes: valeur/actionnable\n` +
        `- Dernière slide: conclusion + CTA\n` +
        `- Ton cohérent avec le modèle choisi\n`;

      const res = await generateCarrouselPreset({
        prompt,
        slides_count,
      });

      onGenerated(res.slides);
      onClose();
    } catch (error) {
      console.error("Erreur IA :", error);
      alert("Erreur IA lors de la génération. Vérifie la console.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI — MODALE PREMIUM
  // ============================================================
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0d0d0d] border border-yellow-500/30 rounded-2xl p-8 w-full max-w-2xl text-white shadow-2xl shadow-yellow-500/10"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
          >
            {/* TITLE */}
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">
              ✨ Génération IA — Thèmes avancés
            </h2>

            {/* FORM */}
            <div className="flex flex-col gap-6">
              {/* 1️⃣ CATÉGORIE */}
              <div>
                <label className="text-yellow-300 text-sm">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-3 mt-1"
                >
                  <option value="">-- Choisir une catégorie --</option>

                  {Object.keys(cfg || {}).map((key) => (
                    <option key={key} value={key}>
                      {cfg?.[key]?.label ?? key}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2️⃣ SOUS-THÈME */}
              <div>
                <label className="text-yellow-300 text-sm">Sous-thème</label>
                <select
                  value={subtopic}
                  onChange={(e) => {
                    setSubtopic(e.target.value);
                    setPreset("");
                  }}
                  disabled={!category}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-3 mt-1 disabled:opacity-40"
                >
                  <option value="">-- Choisir un sous-thème --</option>

                  {subtopics &&
                    Object.keys(subtopics).map((key) => (
                      <option key={key} value={key}>
                        {subtopics[key]?.label ?? key}
                      </option>
                    ))}
                </select>
              </div>

              {/* 3️⃣ MODÈLE / PRESET */}
              <div>
                <label className="text-yellow-300 text-sm">Modèle IA</label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  disabled={!subtopic}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-3 mt-1 disabled:opacity-40"
                >
                  <option value="">-- Choisir un modèle --</option>

                  {presets &&
                    Object.keys(presets).map((key) => (
                      <option key={key} value={key}>
                        {presets[key]?.label ?? key}
                      </option>
                    ))}
                </select>
              </div>

              {/* 4️⃣ SUJET */}
              <div>
                <label className="text-yellow-300 text-sm">Sujet précis</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex : Comment gérer son stress au travail"
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-3 mt-1 placeholder-gray-500"
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition"
              >
                Annuler
              </button>

              <button
                onClick={launchPresetGeneration}
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold shadow-lg hover:scale-[1.04] transition disabled:opacity-40"
              >
                {loading ? "⏳ Génération..." : "🚀 Générer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
