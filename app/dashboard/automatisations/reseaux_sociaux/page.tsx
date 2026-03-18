"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SocialAutomationPage() {
  const router = useRouter();

  // Préparation future : restrictions selon abonnement
  const [plan] = useState<"essential" | "pro" | "ultimate">("ultimate");

  return (
    <div className="min-h-screen w-full text-white px-6 pb-24">

      {/* ========================== RETOUR ========================== */}
      <div className="max-w-5xl mx-auto mt-20 mb-6">
        <button
          onClick={() => router.push("/dashboard/automatisations")}
          className="text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          ← Retour aux automatisations
        </button>
      </div>

      {/* ========================== HEADER ========================== */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-3">
          Automatisation Réseaux sociaux
        </h1>
        <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
          Planifiez, générez et archivez vos posts automatiquement avec l’IA.
          Optimisé pour Facebook, Instagram, TikTok, LinkedIn et plus.
        </p>
      </motion.div>

      {/* ========================== BOUTONS PRINCIPAUX ========================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="flex flex-col md:flex-row justify-center gap-6 max-w-3xl mx-auto mb-12"
      >
        <button
          onClick={() =>
            router.push("/dashboard/automatisations/reseaux_sociaux/ia-generator")
          }
          className="px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300
                     text-black font-semibold shadow-lg hover:shadow-yellow-400/40
                     hover:-translate-y-[2px] transition-all"
        >
          🤖 Générer avec IA
        </button>

        <button
          onClick={() =>
            router.push("/dashboard/automatisations/reseaux_sociaux/planner")
          }
          className="px-6 py-4 rounded-xl bg-[#1a1a1a] border border-yellow-400/40
                     text-yellow-300 font-semibold shadow-lg hover:bg-[#222]
                     hover:-translate-y-[2px] transition-all"
        >
          🗓️ Planner IA
        </button>

        <button
          onClick={() =>
            router.push("/dashboard/automatisations/reseaux_sociaux/nouveau-post")
          }
          className="px-6 py-4 rounded-xl bg-[#1a1a1a] border border-yellow-400/40
                     text-yellow-300 font-semibold shadow-lg hover:bg-[#222]
                     hover:-translate-y-[2px] transition-all"
        >
          ✍️ Nouveau post manuel
        </button>
      </motion.div>

      {/* ========================== SECTION IA (OPTION A) ========================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="max-w-5xl mx-auto mb-16"
      >
        <h2 className="text-2xl font-semibold text-yellow-300 mb-6 text-center">
          ✨ Section IA — Génération intelligente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* IA Texte */}
          <div className="bg-[#111] border border-yellow-900/30 rounded-2xl p-6 shadow-lg shadow-yellow-500/5 flex flex-col justify-between">
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-2">🤖 Générateur Texte IA</h3>
              <p className="text-gray-400 text-sm">
                Génère des posts optimisés pour Instagram, TikTok, LinkedIn...
              </p>
            </div>

            <button
              onClick={() =>
                router.push("/dashboard/automatisations/reseaux_sociaux/ia-generator")
              }
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold hover:shadow-yellow-400/40 hover:-translate-y-[2px] transition-all"
            >
              Ouvrir
            </button>
          </div>

          {/* IA Carrousel */}
          <div className="bg-[#111] border border-yellow-900/30 rounded-2xl p-6 shadow-lg shadow-yellow-500/5 flex flex-col justify-between">
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-2">🧠 Générateur Carrousel IA</h3>
              <p className="text-gray-400 text-sm">
                Crée un carrousel complet, slide par slide, avec contenus optimisés.
              </p>
            </div>

            <button
              onClick={() =>
                router.push("/dashboard/automatisations/reseaux_sociaux/carrousel/ia")
              }
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold hover:shadow-yellow-400/40 hover:-translate-y-[2px] transition-all"
            >
              Ouvrir
            </button>
          </div>

          {/* IA Image (soon) */}
          <div className="bg-[#111] border border-yellow-900/30 rounded-2xl p-6 shadow-lg shadow-yellow-500/5 flex flex-col justify-between opacity-60">
            <div>
              <h3 className="text-yellow-400 font-bold text-lg mb-2">🎨 Générateur Image IA</h3>
              <p className="text-gray-400 text-sm">
                Génère des visuels professionnels adaptés aux réseaux. (à venir)
              </p>
            </div>

            <button
              disabled
              className="mt-4 px-4 py-2 rounded-xl border border-yellow-500/20 text-yellow-300 cursor-not-allowed"
            >
              Bientôt disponible
            </button>
          </div>

        </div>
      </motion.div>

      {/* ========================== SECTION POSTS ========================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        <h2 className="text-xl font-semibold text-yellow-300 mb-6">
          Vos posts enregistrés
        </h2>

        <div
          className="
            bg-[#111] border border-yellow-900/30
            rounded-2xl p-10 text-center text-gray-400
          "
        >
          Aucun post enregistré.
        </div>
      </motion.div>

      {/* ========================== FUTUR : IMAGE IMPORT ========================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="max-w-5xl mx-auto mt-20"
      >
        <h2 className="text-xl font-semibold text-yellow-300 mb-4">
          📸 Importation d’images (à venir)
        </h2>

        <p className="text-gray-400 mb-6">
          Vous pourrez bientôt importer vos images au format optimisé pour :
          <span className="text-yellow-400"> Reels, Stories, Posts, Thumbnails...</span>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-gray-300">
          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-yellow-900/20">
            📱 Reels
            <div className="text-[12px] mt-1">1080×1920</div>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-yellow-900/20">
            🖼️ Post carré
            <div className="text-[12px] mt-1">1080×1080</div>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-yellow-900/20">
            🖼️ Post horizontal
            <div className="text-[12px] mt-1">1920×1080</div>
          </div>
          <div className="p-4 bg-[#1a1a1a] rounded-xl border border-yellow-900/20">
            📚 Story
            <div className="text-[12px] mt-1">1080×1920</div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
