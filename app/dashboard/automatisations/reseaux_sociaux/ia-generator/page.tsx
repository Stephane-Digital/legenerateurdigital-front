"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaCopy, FaPaperPlane, FaRegImage } from "react-icons/fa";

export default function IAGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [length, setLength] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generateContent = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/generate-social-post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            topic,
            tone,
            platform,
            length,
          }),
        }
      );

      const data = await response.json();
      setResult(data.result || "Aucun résultat généré.");
    } catch (error) {
      setResult("❌ Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="min-h-screen w-full text-white px-6 pb-24">
      {/* ====================================================== */}
      {/* TITRE PAGE */}
      {/* ====================================================== */}
      <div className="max-w-3xl mx-auto text-center mt-16 mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-yellow-400"
        >
          Générateur IA — Réseaux Sociaux
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-gray-300 mt-3"
        >
          Crée du contenu optimisé pour chaque réseau, en un clic.
        </motion.p>
      </div>

      {/* ====================================================== */}
      {/* PARAMÈTRES POST */}
      {/* ====================================================== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-[#111] border border-yellow-500/20 rounded-2xl p-8 shadow-xl"
      >
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Sujet du post</label>
          <textarea
            className="w-full p-3 bg-[#0c0c0c] border border-gray-700 rounded-lg focus:border-yellow-500 outline-none"
            rows={2}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex : Comment créer un business en ligne…"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold">
            Ton / Style d’écriture
          </label>
          <input
            className="w-full p-3 bg-[#0c0c0c] border border-gray-700 rounded-lg focus:border-yellow-500 outline-none"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="Ex : motivant, humoristique, expert, storytelling…"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block mb-2 font-semibold">Plateforme</label>
            <select
              className="w-full p-3 bg-[#0c0c0c] border border-gray-700 rounded-lg focus:border-yellow-500 outline-none"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="x">X (Twitter)</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Longueur</label>
            <input
              type="range"
              min={1}
              max={3}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-sm mt-1 text-gray-400">
              {length === 1 && "Court"}
              {length === 2 && "Moyen"}
              {length === 3 && "Long"}
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* BOUTON GENERER */}
        {/* ====================================================== */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateContent}
            className="px-10 py-4 bg-yellow-500 text-black rounded-xl font-bold text-lg shadow-lg hover:bg-yellow-400 transition-all"
          >
            Générer le contenu
          </motion.button>
        </div>
      </motion.div>

      {/* ====================================================== */}
      {/* LOADER IA */}
      {/* ====================================================== */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto text-center mt-10"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-yellow-400 font-semibold"
            >
              L’IA rédige ton contenu…
            </motion.div>
            <div className="mt-4 flex justify-center">
              <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================== */}
      {/* RESULTAT IA */}
      {/* ====================================================== */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-[#111] border border-yellow-500/20 rounded-2xl p-8 mt-12 shadow-xl"
          >
            <h3 className="text-xl font-bold mb-4 text-yellow-400">
              🎉 Contenu généré
            </h3>
            <p className="whitespace-pre-line text-gray-200 mb-6">{result}</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#222] rounded-lg hover:bg-[#333] transition"
              >
                <FaCopy /> Copier
              </button>

              <button className="flex items-center justify-center gap-2 w-full py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition">
                <FaPaperPlane /> Envoyer au Planner
              </button>

              <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#333] text-gray-500 rounded-lg cursor-not-allowed">
                <FaRegImage /> Publier (bientôt)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================== */}
      {/* MODULE IMAGE IA — BIENTÔT */}
      {/* ====================================================== */}
      <div className="max-w-3xl mx-auto mt-16 text-center opacity-40">
        <FaRegImage className="mx-auto text-4xl mb-2" />
        <p>Module Image IA — bientôt disponible</p>
      </div>
    </div>
  );
}
