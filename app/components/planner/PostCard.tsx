"use client";

import { motion } from "framer-motion";

export default function PostCard({ post }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-[#1a1a1a] border border-yellow-500/30 rounded-xl p-2 shadow-lg cursor-pointer"
    >
      {post.image_url ? (
        <img
          src={post.image_url}
          className="w-full h-24 object-cover rounded-lg mb-2"
        />
      ) : (
        <div className="w-full h-24 bg-[#222] rounded-lg flex items-center justify-center text-gray-500 text-xs">
          Aucun visuel
        </div>
      )}

      <p className="text-xs text-yellow-300 font-semibold leading-tight">
        {post.titre.length > 40 ? post.titre.slice(0, 40) + "…" : post.titre}
      </p>
    </motion.div>
  );
}
