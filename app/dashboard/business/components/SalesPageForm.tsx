"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import SalesPagePreview from "./SalesPagePreview";

export default function SalesPageForm({ salesPage, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: salesPage?.title || "",
    subtitle: salesPage?.subtitle || "",
    audience: salesPage?.audience || "",
    product: salesPage?.product || "",
    offer: salesPage?.offer || "",
    tone: salesPage?.tone || "professionnel",
    structure: salesPage?.structure || "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const url = salesPage
      ? `${process.env.NEXT_PUBLIC_API_URL}/sales-pages/update/${salesPage.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/sales-pages/create`;

    await fetch(url, {
      method: salesPage ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSaved();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-[#111] border border-yellow-600/30 p-8 rounded-2xl w-full max-w-4xl shadow-xl grid grid-cols-2 gap-6"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {/* FORMULAIRE */}
        <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            {salesPage ? "Modifier Page" : "Nouvelle Page"}
          </h2>

          {[
            ["title", "Titre"],
            ["subtitle", "Sous-titre"],
            ["audience", "Audience"],
            ["product", "Produit"],
            ["offer", "Offre"],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="text-sm opacity-80">{label}</label>
              <input
                className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
                value={form[k]}
                onChange={(e) => update(k, e.target.value)}
              />
            </div>
          ))}

          {/* STRUCTURE */}
          <div>
            <label className="text-sm opacity-80">Structure (optionnelle)</label>
            <textarea
              className="w-full h-32 bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
              value={form.structure}
              onChange={(e) => update("structure", e.target.value)}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-3">
            <button className="bg-gray-700 px-5 py-2 rounded-lg" onClick={onClose}>
              Annuler
            </button>
            <button className="bg-yellow-600 text-black px-5 py-2 rounded-lg" onClick={save}>
              Enregistrer
            </button>
          </div>
        </div>

        {/* PREVIEW IA */}
        <SalesPagePreview form={form} />
      </motion.div>
    </motion.div>
  );
}
