"use client";

import { SOCIAL_NETWORKS } from "@/utils/socialNetworks";
import { motion } from "framer-motion";

export default function PostCardLuxe({ post, onSupprimer, onArchiver }: any) {
  const network = SOCIAL_NETWORKS[post.reseau] || SOCIAL_NETWORKS["Facebook"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm rounded-2xl p-5 bg-[#111] border border-yellow-500/20 shadow-xl"
    >
      <h3 className="text-[var(--lgd-gold)] font-bold text-xl mb-3">
        {post.titre}
      </h3>

      <div className="flex items-center gap-2 text-gray-300 mb-2">
        <span style={{ color: network.color, fontSize: "1.2rem" }}>
          {network.icon}
        </span>
        <span>{post.reseau}</span>
      </div>

      <p className="text-sm text-gray-400 mb-3">{post.contenu}</p>

      <div className="flex gap-4 mt-4">
        <button
          onClick={onArchiver}
          className="text-yellow-400 hover:text-yellow-200 transition"
        >
          Archiver
        </button>

        <button
          onClick={onSupprimer}
          className="text-red-500 hover:text-red-300 transition"
        >
          Supprimer
        </button>
      </div>
    </motion.div>
  );
}
