"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function SalesCreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    product: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const create = async () => {
    if (!form.title.trim()) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sales-pages/create`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) onCreated();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-[#111] border border-yellow-600/40 rounded-2xl p-8 w-full max-w-lg shadow-xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">
          Nouvelle page de vente
        </h2>

        {/* Titre */}
        <div className="mb-4">
          <label className="text-sm opacity-80">Titre</label>
          <input
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-4 py-2 text-sm"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Ex : Masterclass IA 2025"
          />
        </div>

        {/* Produit */}
        <div className="mb-8">
          <label className="text-sm opacity-80">Produit / Offre</label>
          <input
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-4 py-2 text-sm"
            value={form.product}
            onChange={(e) => update("product", e.target.value)}
            placeholder="Ex : Formation complète – Le Générateur Digital"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            className="bg-gray-700 px-5 py-2 rounded-lg"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            className="bg-yellow-600 text-black px-5 py-2 rounded-lg hover:bg-yellow-500 transition"
            onClick={create}
          >
            Créer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
