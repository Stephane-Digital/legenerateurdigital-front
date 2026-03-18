"use client";

import { motion } from "framer-motion";

export default function AidesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-[#ffb800] mb-6 text-center"
      >
        Aides & Obligations légales 💡
      </motion.h1>

      <div className="max-w-3xl mx-auto bg-black/40 p-6 rounded-2xl border border-[#2a2a2a] shadow-lg shadow-black/40">

        <p className="text-gray-300 leading-relaxed mb-3">
          Retrouvez ici les aides financières, exonérations, accompagnements
          et obligations légales liées à la création d'entreprise.
        </p>

        <h2 className="text-xl font-bold text-[#ffb800] mb-3">Aides disponibles :</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>ACRE — Exonération de début d'activité</li>
          <li>Aides régionales & départementales</li>
          <li>Fonds dédiés aux entrepreneurs</li>
          <li>Aides à la formation & reconversion</li>
        </ul>

        <div className="mt-6 bg-black/20 p-4 rounded-xl border border-[#333]">
          <p className="text-gray-400 italic">
            🚧 Le contenu détaillé sera ajouté prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}
