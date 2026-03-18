"use client";

import { motion } from "framer-motion";

export default function UrssafPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-[#ffb800] mb-6 text-center"
      >
        Déclaration URSSAF & Création d’entreprise 🏛️
      </motion.h1>

      <div className="max-w-3xl mx-auto bg-black/40 p-6 rounded-2xl border border-[#2a2a2a] shadow-lg shadow-black/40">

        <p className="text-gray-300 mb-4 leading-relaxed">
          Cette section vous guide à travers toutes les démarches nécessaires pour déclarer
          votre entreprise auprès de l’URSSAF ou du guichet unique.
        </p>

        <h2 className="text-xl font-bold text-[#ffb800] mb-3">Étapes couvertes :</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Choisir votre activité et votre régime</li>
          <li>Déclarer correctement votre entreprise</li>
          <li>Comprendre les obligations fiscales</li>
          <li>Accéder aux bons formulaires URSSAF</li>
        </ul>

        <div className="mt-6 bg-black/20 p-4 rounded-xl border border-[#333]">
          <p className="text-gray-400 italic">
            🚧 Module en construction — disponible dans une prochaine version.
          </p>
        </div>

      </div>
    </div>
  );
}
