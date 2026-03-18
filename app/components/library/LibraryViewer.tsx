"use client";

import formatDate from "@/utils/formatDate";
import { motion } from "framer-motion";
import { Calendar, FileText } from "lucide-react";

export default function LibraryViewer({ item }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        max-w-3xl
        mx-auto
        bg-[#111]
        p-8
        rounded-2xl
        border border-yellow-400/20
        shadow-lg
      "
    >
      {/* TITRE */}
      <div className="flex items-center gap-2 mb-4">
        <FileText size={28} className="text-yellow-300" />
        <h1 className="text-2xl font-bold text-yellow-400">{item.titre}</h1>
      </div>

      {/* META INFOS */}
      <div className="flex items-center gap-4 mb-6 text-gray-400 text-sm">
        <span className="uppercase tracking-wide">{item.type}</span>

        <span className="flex items-center gap-1 text-gray-500">
          <Calendar size={16} /> {formatDate(item.created_at)}
        </span>
      </div>

      {/* CONTENU */}
      <div
        className="
          bg-[#1a1a1a]
          p-6
          rounded-xl
          border border-yellow-400/10
          text-gray-300
          whitespace-pre-wrap
          leading-relaxed
          text-sm
        "
      >
        {item.contenu}
      </div>
    </motion.div>
  );
}
