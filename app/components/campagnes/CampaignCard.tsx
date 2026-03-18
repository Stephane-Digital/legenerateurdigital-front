"use client";

import { motion } from "framer-motion";
import { Calendar, FileText } from "lucide-react";
import Link from "next/link";
import CampaignStatusBadge from "./CampaignStatusBadge";

type Props = {
  item: {
    id: number;
    titre: string;
    type: string;
    objectif: string;
    created_at?: string;
    statut?: string;
  };
};

export default function CampaignCard({ item }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="
        bg-[#111]
        border border-yellow-400/20
        rounded-2xl
        p-6
        shadow-lg
        hover:shadow-yellow-400/20
        transition
        flex
        flex-col
        justify-between
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
          <FileText size={20} className="text-yellow-300" />
          {item.titre}
        </h3>

        {/* BADGE STATUT */}
        <CampaignStatusBadge statut={item.statut || "en-cours"} />
      </div>

      {/* TYPE */}
      <p className="uppercase text-xs text-gray-400 tracking-wide mb-2">
        {item.type}
      </p>

      {/* OBJECTIF */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
        <span className="font-semibold text-yellow-400">Objectif :</span>{" "}
        {item.objectif}
      </p>

      {/* DATE */}
      {item.created_at && (
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString("fr-FR")}
        </p>
      )}

      {/* CTA */}
      <div className="flex justify-end mt-5">
        <Link
          href={`/dashboard/campagnes/${item.id}`}
          className="
            bg-gradient-to-r
            from-yellow-500 to-yellow-300
            text-black
            px-4 py-2
            rounded-lg
            text-sm font-semibold
            hover:shadow-yellow-400/40
            transition
          "
        >
          Voir
        </Link>
      </div>
    </motion.div>
  );
}
