"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function IASection({ onGenerated }: { onGenerated: (text: string) => void }) {
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("Humanisé");
  const [tone, setTone] = useState("Coach");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

const handleGenerate = async () => {
  if (!theme.trim()) return alert("Ajoute un thème avant de générer !");
  setLoading(true);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ia/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme, style, tone, count }),
    });

    const data = await res.json();
    if (data?.content) onGenerated(data.content);
  } catch (err) {
    console.error("Erreur IA:", err);
    alert("Erreur pendant la génération IA.");
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div
      className="w-full mt-6 mb-4 p-5 rounded-xl border border-yellow-900/40 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-[0_0_25px_rgba(255,184,0,0.1)]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-[#ffb800] mb-4 flex items-center gap-2">
        🤖 Génération IA — Créez automatiquement votre post
      </h3>

      <label className="block text-sm mb-1">🎯 Thème / sujet :</label>
      <input
        className="w-full p-2 rounded-md bg-[#1a1a1a] border border-gray-700 focus:border-[#ffb800] mb-3"
        placeholder="Ex: Comment augmenter son engagement sur Facebook"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      />

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-sm mb-1">💬 Style d’écriture :</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full p-2 rounded-md bg-[#1a1a1a] border border-gray-700 focus:border-[#ffb800]"
          >
            <option>Humanisé</option>
            <option>Viral</option>
            <option>Éducatif</option>
            <option>Storytelling</option>
            <option>Stoïque</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm mb-1">🗣️ Ton :</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full p-2 rounded-md bg-[#1a1a1a] border border-gray-700 focus:border-[#ffb800]"
          >
            <option>Coach</option>
            <option>Expert</option>
            <option>Storyteller</option>
            <option>Humoristique</option>
          </select>
        </div>
      </div>

      <label className="block text-sm mb-1">🔢 Nombre de variantes :</label>
      <select
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        className="w-full p-2 rounded-md bg-[#1a1a1a] border border-gray-700 focus:border-[#ffb800] mb-4"
      >
        {[1, 2, 3, 5, 10].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`btn-luxe w-full py-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {loading ? "⚙️ Génération en cours..." : "⚡ Générer avec l’IA"}
      </button>
    </motion.div>
  );
}
