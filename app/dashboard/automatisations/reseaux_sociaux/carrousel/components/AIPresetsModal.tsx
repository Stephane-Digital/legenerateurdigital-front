"use client";

import { generateCarrouselPreset } from "@/lib/api_carrousel";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { buildVisualSlides } from "../ia/IAVisualSlideBuilder";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApplySlides: (layers: any[]) => void;
};

export default function AIPresetsModal({ isOpen, onClose, onApplySlides }: Props) {
  const [category, setCategory] = useState("business");
  const [subtopic, setSubtopic] = useState("");
  const [preset, setPreset] = useState("5_erreurs");
  const [topic, setTopic] = useState("");

  const [loading, setLoading] = useState(false);

  const CATEGORIES: Record<
    string,
    { label: string; subtopics: string[] }
  > = {
    business: {
      label: "📈 Business & Marketing",
      subtopics: [
        "Stratégie",
        "Offres irrésistibles",
        "Vente & closing",
        "Branding",
        "Marketing digital",
        "Copywriting",
        "Funnels",
        "Productivité business",
        "Storytelling business",
      ],
    },

    coaching: {
      label: "🎤 Coaching",
      subtopics: [
        "Coaching de vie",
        "Coaching professionnel",
        "Coaching parental",
        "Coaching mindset",
        "Coaching énergétique",
        "Coaching communication",
        "Neurosciences",
      ],
    },

    developpement_personnel: {
      label: "🧘 Développement personnel",
      subtopics: [
        "Confiance en soi",
        "Estime de soi",
        "Gestion du stress",
        "Habitudes gagnantes",
        "Discipline",
        "Loi de l’attraction",
        "Résilience",
        "Motivation",
        "Méditation",
      ],
    },

    bien_etre: {
      label: "🌿 Bien-être & Santé",
      subtopics: [
        "Gestion du stress",
        "Sommeil",
        "Émotions",
        "Calme mental",
        "Routine bien-être",
        "Respiration",
        "Mindfulness",
      ],
    },

    nutrition: {
      label: "🥗 Nutrition",
      subtopics: [
        "Erreurs alimentaires",
        "Aliments brûle-graisse",
        "Rééquilibrage alimentaire",
        "Perte de poids",
        "Plans alimentaires",
        "Micro-nutriments",
        "Index glycémique",
      ],
    },
  };

  const PRESETS = useMemo(
    () => [
      { value: "5_erreurs", label: "❌ 5 erreurs à éviter", slides: 5 },
      { value: "5_etapes", label: "➡️ Méthode en 5 étapes", slides: 5 },
      { value: "avant_apres", label: "🔄 Avant / Après", slides: 6 },
      { value: "checklist", label: "📋 Checklist complète", slides: 7 },
      { value: "conseil_jour", label: "💡 Conseil du jour", slides: 4 },
      { value: "citations", label: "💬 Citations motivantes", slides: 6 },
      { value: "mini_formation", label: "📘 Mini-formation", slides: 8 },
      { value: "mythes", label: "⚡ Mythes vs Réalité", slides: 6 },
      { value: "storytelling", label: "📖 Storytelling", slides: 7 },
      { value: "top_5", label: "⭐ Top 5 astuces", slides: 6 },
    ],
    []
  );

  const subtopics = CATEGORIES[category]?.subtopics || [];

  const presetMeta = useMemo(() => {
    return PRESETS.find((p) => p.value === preset) ?? PRESETS[0];
  }, [PRESETS, preset]);

  const buildPrompt = () => {
    const catLabel = CATEGORIES[category]?.label ?? category;
    const presetLabel = presetMeta?.label ?? preset;

    // Prompt unique (backend attend { prompt, slides_count })
    return [
      "Tu es un expert en copywriting et social media.",
      "Génère un carrousel prêt à publier, en français, clair, impactant, style premium.",
      `Catégorie: ${catLabel}`,
      `Sous-thème: ${subtopic}`,
      `Modèle: ${presetLabel}`,
      `Sujet: ${topic}`,
      "Contraintes:",
      "- 1 idée forte par slide",
      "- titres courts + phrases punchy",
      "- structure logique et progressive",
      "- ajoute une slide d'intro et une slide de conclusion/CTA si pertinent",
      "- pas de blabla",
    ].join("\n");
  };

  const launch = async () => {
    if (!topic.trim()) {
      alert("Veuillez saisir un sujet.");
      return;
    }
    if (!subtopic.trim()) {
      alert("Veuillez sélectionner un sous-thème.");
      return;
    }

    setLoading(true);

    try {
      const prompt = buildPrompt();
      const slides_count = presetMeta?.slides ?? 6;

      const data = await generateCarrouselPreset({
        prompt,
        slides_count,
      });

      // 🔥 CONVERSION DIRECTE → VISUEL LGD
      let allLayers: any[] = [];
      (data?.slides ?? []).forEach((slide: any, index: number) => {
        const visual = buildVisualSlides(slide);
        allLayers = [...allLayers, ...visual];
      });

      onApplySlides(allLayers);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Erreur IA lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#0d0d0d] border border-yellow-500/30 rounded-2xl p-8 w-full max-w-2xl text-white shadow-2xl"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
          >
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">
              ✨ Génération IA — Thèmes avancés
            </h2>

            {/* FORMULAIRE */}
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-yellow-300 text-sm">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-3 mt-1"
                >
                  {Object.keys(CATEGORIES).map((key) => (
                    <option key={key} value={key}>
                      {CATEGORIES[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-yellow-300 text-sm">Sous-thème</label>
                <select
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-3 mt-1"
                >
                  <option value="">-- Choisir un sous-thème --</option>
                  {subtopics.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-yellow-300 text-sm">Modèle IA</label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-3 mt-1"
                >
                  {PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <div className="mt-2 text-xs text-yellow-200/70">
                  Slides estimées : <span className="text-yellow-200 font-semibold">{presetMeta.slides}</span>
                </div>
              </div>

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

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition"
              >
                Annuler
              </button>

              <button
                onClick={launch}
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
