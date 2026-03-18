"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AutomatisationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center pt-24 px-6">

      {/* ======================= HEADER ======================= */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-3">
          Automatisations intelligentes ⚙️
        </h1>

        <p className="text-gray-300 max-w-2xl mx-auto">
          Centralisez, créez et orchestrez vos automatisations IA depuis un seul espace.
          Sélectionnez une catégorie pour ouvrir son module dédié.
        </p>
      </motion.div>

      {/* ======================= GRID ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl w-full">

        {/* ====== Réseaux sociaux (1 seul bouton) ====== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="bg-[#111] border border-yellow-400/20 rounded-2xl p-8 shadow-xl text-center"
        >
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Réseaux sociaux
          </h2>

          <p className="text-gray-400 mb-6">
            Créez, générez et planifiez vos posts automatiquement.
          </p>

          <button
            onClick={() => router.push("/dashboard/automatisations/reseaux_sociaux")}
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-yellow-300/40 transition-all"
          >
            Ouvrir module
          </button>
        </motion.div>

        {/* ====== Email marketing ====== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="bg-[#111] border border-yellow-400/20 rounded-2xl p-8 shadow-xl text-center"
        >
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Email marketing
          </h2>

          <p className="text-gray-400 mb-6">
            Générez et automatisez vos campagnes email IA.
          </p>

          <button
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-yellow-300/40 transition-all"
          >
            Ouvrir
          </button>
        </motion.div>

        {/* ====== Tunnel de vente ====== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bg-[#111] border border-yellow-400/20 rounded-2xl p-8 shadow-xl text-center"
        >
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Tunnel de vente
          </h2>

          <p className="text-gray-400 mb-6">
            Créez vos pages de vente performantes et humanisées.
          </p>

          <button
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-yellow-300/40 transition-all"
          >
            Ouvrir
          </button>
        </motion.div>

        {/* ====== Création de contenu ====== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="bg-[#111] border border-yellow-400/20 rounded-2xl p-8 shadow-xl text-center"
        >
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Création de contenu
          </h2>

          <p className="text-gray-400 mb-6">
            Générez des articles, e-books et scripts grâce à l’IA.
          </p>

          <button
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-yellow-300/40 transition-all"
          >
            Ouvrir
          </button>
        </motion.div>

        {/* ====== Bibliothèque IA ====== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.20 }}
          className="bg-[#111] border border-yellow-400/20 rounded-2xl p-8 shadow-xl text-center"
        >
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Bibliothèque IA
          </h2>

          <p className="text-gray-400 mb-6">
            Archivez et réutilisez vos automatisations enregistrées.
          </p>

          <button
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-yellow-300/40 transition-all"
          >
            Ouvrir
          </button>
        </motion.div>

        {/* ====== Statut IA ====== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="bg-[#111] border border-yellow-400/20 rounded-2xl p-8 shadow-xl text-center"
        >
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">
            Statut IA
          </h2>

          <p className="text-gray-400 mb-6">
            Surveillez et optimisez les performances de vos IA connectées.
          </p>

          <button
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-yellow-300/40 transition-all"
          >
            Ouvrir
          </button>
        </motion.div>

      </div>
    </div>
  );
}
