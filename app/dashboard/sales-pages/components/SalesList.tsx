"use client";

import { motion } from "framer-motion";

export default function SalesList({ pages, loading, onSelect, onUpdated }) {
  return (
    <div className="bg-[#0f0f0f] border border-yellow-600/30 rounded-xl p-6">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        Vos Pages de Vente
      </h2>

      {loading && (
        <p className="text-yellow-400 opacity-70">Chargement…</p>
      )}

      {!loading && pages.length === 0 && (
        <p className="text-gray-400 text-sm">Aucune page pour l’instant.</p>
      )}

      <div className="space-y-3 mt-4">
        {Array.isArray(pages) &&
          pages.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl bg-[#111] border border-yellow-600/20 cursor-pointer hover:bg-[#1a1a1a] transition flex justify-between items-center"
              onClick={() => onSelect(p)}
            >
              <div>
                <h3 className="text-yellow-400 font-semibold">
                  {p.title || "Sans titre"}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  ID : {p.id}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales-pages/${p.id}`, {
                    method: "DELETE",
                    credentials: "include",
                  }).then(() => onUpdated());
                }}
                className="text-red-500 hover:text-red-400"
              >
                Supprimer
              </button>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
