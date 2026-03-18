"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function TemplateForm({ template, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: template?.name || "",
    structure: template?.structure || "",
    variables: template?.variables || "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const url = template
      ? `${process.env.NEXT_PUBLIC_API_URL}/email-templates/update/${template.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/email-templates/create`;

    await fetch(url, {
      method: template ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onSaved();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-[#111] border border-yellow-600/30 p-8 rounded-2xl w-full max-w-xl shadow-xl"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">
          {template ? "Modifier Template" : "Créer Template"}
        </h2>

        {/* NAME */}
        <div className="mb-4">
          <label className="text-sm opacity-80">Nom</label>
          <input
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        {/* STRUCTURE */}
        <div className="mb-4">
          <label className="text-sm opacity-80">Structure</label>
          <textarea
            className="w-full h-32 bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.structure}
            onChange={(e) => update("structure", e.target.value)}
          />
        </div>

        {/* VARIABLES */}
        <div className="mb-6">
          <label className="text-sm opacity-80">Variables (JSON)</label>
          <textarea
            className="w-full h-24 bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.variables}
            onChange={(e) => update("variables", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            className="px-5 py-2 bg-gray-700 rounded-lg"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            className="px-5 py-2 bg-yellow-600 text-black rounded-lg"
            onClick={save}
          >
            Enregistrer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
