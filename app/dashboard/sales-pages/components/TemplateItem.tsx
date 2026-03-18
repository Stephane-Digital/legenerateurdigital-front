"use client";

import { motion } from "framer-motion";

export default function TemplateItem({ template, onClick }) {
  return (
    <motion.button
      onClick={() => onClick(template)}
      whileHover={{ scale: 1.02 }}
      className="
        w-full text-left bg-[#111] border border-yellow-700/20
        px-4 py-3 rounded-xl
        hover:border-yellow-500 hover:bg-[#1a1a1a]
        hover:shadow-yellow-500/20
        transition shadow-sm
      "
    >
      <p className="text-yellow-400 font-medium">{template.label}</p>
      <p className="text-xs opacity-60 mt-1">{template.id}</p>
    </motion.button>
  );
}
