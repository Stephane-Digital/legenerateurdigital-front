"use client";

import { motion } from "framer-motion";

const filters = [
  { id: "all", label: "Tous" },
  { id: "email", label: "Emails" },
  { id: "social", label: "Réseaux sociaux" },
  { id: "sequence", label: "Séquences" },
  { id: "salespage", label: "Pages de vente" },
  { id: "guide", label: "Guides" },
  { id: "ebook", label: "E-books" },
];

export default function LibraryFilters({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (f: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      {filters.map((f) => (
        <motion.button
          key={f.id}
          onClick={() => onSelect(f.id)}
          whileHover={{ scale: 1.05 }}
          className={`px-4 py-2 rounded-full border text-sm transition-all ${
            active === f.id
              ? "bg-yellow-500 text-black border-yellow-500 shadow-yellow-600/40 shadow-lg"
              : "border-white/10 text-gray-300 hover:border-yellow-500 hover:text-yellow-500"
          }`}
        >
          {f.label}
        </motion.button>
      ))}
    </div>
  );
}
