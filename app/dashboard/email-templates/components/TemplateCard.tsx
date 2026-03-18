"use client";

import { motion } from "framer-motion";

export default function TemplateCard({ template, onEdit, onDelete }) {
  return (
    <motion.div
      className="bg-[#111] border border-yellow-600/20 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold text-yellow-400 mb-3">
        {template.name}
      </h2>

      <p className="text-sm opacity-80 mb-2">
        <span className="font-semibold">Structure :</span><br />
        {template.structure.slice(0, 120)}...
      </p>

      <p className="text-sm opacity-60 mb-4">
        <span className="font-semibold">Variables :</span><br />
        {template.variables}
      </p>

      <div className="flex gap-4 mt-4">
        <button
          className="bg-yellow-600 text-black px-4 py-2 rounded-lg"
          onClick={onEdit}
        >
          Éditer
        </button>

        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
          onClick={onDelete}
        >
          Supprimer
        </button>
      </div>
    </motion.div>
  );
}
