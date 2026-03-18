"use client";

import { generateCarrouselIA } from "@/lib/api_carrousel";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function CarrouselAIModal({
  show,
  onClose,
  onGenerated,
}: {
  show: boolean;
  onClose: () => void;
  onGenerated: (slides: any[]) => void;
}) {
  const [theme, setTheme] = useState("marketing");
  const [style, setStyle] = useState("instagram");
  const [tone, setTone] = useState("professionnel");
  const [count, setCount] = useState(5);

  const [loading, setLoading] = useState(false);

  const launchGeneration = async () => {
    setLoading(true);
    try {
      const data = await generateCarrouselIA({
        theme,
        style,
        tone,
        slides: count,
      });

      onGenerated(data.slides);
      onClose();
    } catch (error) {
      console.error("Erreur génération IA :", error);
      alert("Erreur IA");
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-[#0d0d0d] border border-yellow-500/30 rounded-2xl p-8 w-full max-w-xl text-white shadow-2xl"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
          >
            {/* TITLE */}
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">
              ✨ Génération IA du Carrousel
            </h2>

            {/* FIELDS */}
            <div className="flex flex-col gap-5">

              {/* THÈME */}
              <div>
                <label className="text-yellow-300 text-sm">Thème</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-2 mt-1"
                >
                  <option value="marketing digital">Marketing Digital</option>
                  <option value="business">Business</option>
                  <option value="mindset">Mindset</option>
                  <option value="productivité">Productivité</option>
                  <option value="motivation">Motivation</option>
                  <option value="copywriting">Copywriting</option>
                </select>
              </div>

              {/* STYLE */}
              <div>
                <label className="text-yellow-300 text-sm">Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-2 mt-1"
                >
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="educatif">Éducatif</option>
                  <option value="storytelling">Storytelling</option>
                </select>
              </div>

              {/* TON */}
              <div>
                <label className="text-yellow-300 text-sm">Ton</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-2 mt-1"
                >
                  <option value="professionnel">Professionnel</option>
                  <option value="motivant">Motivant</option>
                  <option value="inspirant">Inspirant</option>
                  <option value="direct">Direct</option>
                </select>
              </div>

              {/* SLIDES COUNT */}
              <div>
                <label className="text-yellow-300 text-sm">Nombre de slides</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full bg-[#111] border border-yellow-500/30 rounded-xl p-2 mt-1"
                />
              </div>

            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-4 mt-8">

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition"
              >
                Annuler
              </button>

              <button
                onClick={launchGeneration}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold shadow-lg hover:scale-[1.03] transition disabled:opacity-40"
              >
                {loading ? "⏳ Génération..." : "✨ Générer"}
              </button>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
