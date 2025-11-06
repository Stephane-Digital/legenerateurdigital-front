"use client";

import { motion } from "framer-motion";

export default function AutomatisationsPage() {
  return (
    <div className="fade-in w-full max-w-5xl mx-auto py-16 px-4">
      {/* Titre principal */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="dashboard-title text-center text-4xl mb-6"
      >
        Automatisations intelligentes 🤖
      </motion.h1>

      <p className="text-center text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
        Ici, vous pourrez bientôt créer, gérer et suivre vos automatisations marketing
        intelligentes. Ce module sera connecté à l’IA et au backend FastAPI pour automatiser vos processus.
      </p>

      {/* Section de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[1, 2, 3].map((n) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: n * 0.1 }}
            className="card-luxe text-center"
          >
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
              Automatisation #{n}
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              Fonctionnalité à venir — cette section affichera vos scénarios d’automatisation.
            </p>
            <button disabled className="btn-luxe opacity-60 cursor-not-allowed">
              En développement
            </button>
          </motion.div>
        ))}
      </div>

      {/* Footer local */}
      <div className="text-center text-gray-500 mt-16 text-sm">
        © 2025 <span className="text-yellow-400">Le Générateur Digital</span> — Automatisations IA à venir.
      </div>
    </div>
  );
}
