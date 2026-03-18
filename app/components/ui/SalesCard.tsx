"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function SalesCard({ item }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="w-full bg-black/40 border border-gold-600/40 rounded-2xl p-6 shadow-lg hover:shadow-gold-500/20 transition"
    >
      <h3 className="text-2xl font-bold text-gold-400 mb-3">{item.title}</h3>

      <p className="text-gray-300 text-sm mb-5 line-clamp-3">
        {item.subtitle}
      </p>

      <div className="flex justify-between items-center mt-5">
        <Link
          href={`/dashboard/sales-pages/${item.id}`}
          className="px-4 py-2 rounded-lg bg-gold-500 text-black font-semibold hover:bg-gold-400"
        >
          Éditer
        </Link>

        <span className="text-xs text-gray-400">
          Dernière màj: {new Date(item.updated_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}
