"use client";

import { motion } from "framer-motion";

export default function CampaignStatusBadge({ statut }: { statut: string }) {
  const map: any = {
    "en-cours": "En cours",
    "en attente": "En attente",
    "terminée": "Terminée",
    "brouillon": "Brouillon",
  };

  const colors: any = {
    "en-cours": "bg-yellow-500 text-black",
    "en attente": "bg-gray-400 text-black",
    "terminée": "bg-green-500 text-black",
    "brouillon": "bg-gray-700 text-gray-300",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        px-3 py-1 rounded-full text-xs font-semibold
        ${colors[statut] || "bg-gray-700 text-gray-300"}
      `}
    >
      {map[statut] || statut}
    </motion.span>
  );
}
