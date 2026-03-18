"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function ModalFullPageAI({
  onClose,
  onGenerated,
}: {
  onClose: () => void;
  onGenerated: (blocks: { html: string }[]) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generateFull = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/content-engine/generate-full-page`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        }
      );

      const data = await res.json();

      if (data?.blocks) {
        onGenerated(data.blocks);
      }
    } catch (err) {
      console.error("Erreur génération page complète IA :", err);
    }

    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#111] border border-yellow-600/40 rounded-2xl p-8 w-full max-w-3xl shadow-xl"
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.85 }}
        >
          <h2 className="text-yellow-400 text-2xl font-bold mb-5">
            Génération IA — Page complète
          </h2>

          <p className="text-gray-400 text-sm mb-3">
            Exemples : “Page de vente pour une formation IA”, “Tunnel AIDA
            complet”, “Page storytelling avec CTA”.
          </p>

          <textarea
            className="w-full h-48 bg-black border border-yellow-700/20 rounded-lg px-4 py-3 text-sm mb-6"
            placeholder="Décris le style, le ton, le produit, la cible, la promesse…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              onClick={onClose}
            >
              Annuler
            </button>

            <button
              className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition"
              onClick={generateFull}
              disabled={loading}
            >
              {loading ? "Génération…" : "Générer la page complète ⚡"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
