"use client";

import formatDate from "@/utils/formatDate";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function LibraryCard({ item }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
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
      <div>
        <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2 mb-2">
          <FileText size={20} className="text-yellow-300" />
          {item.titre}
        </h3>

        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
          {item.type}
        </p>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
          {item.contenu}
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {formatDate(item.created_at)}
        </span>

        <Link
          href={`/dashboard/bibliotheque/${item.id}`}
          className="
            text-sm
            bg-gradient-to-r
            from-yellow-500
            to-yellow-300
            text-black
            px-3 py-1
            rounded-lg
            font-semibold
            hover:shadow-yellow-400/30
            transition
          "
        >
          Voir
        </Link>
      </div>
    </motion.div>
  );
}
