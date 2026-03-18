"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const tabs = [
  "Tous",
  "Emails",
  "Réseaux sociaux",
  "Séquences",
  "Pages de vente",
  "Guides",
  "E-books",
];

export default function LibraryTabs() {
  const [active, setActive] = useState("Réseaux sociaux");

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {tabs.map((tab) => (
        <motion.button
          key={tab}
          onClick={() => setActive(tab)}
          whileHover={{ scale: 1.05 }}
          className={`px-4 py-2 rounded-full border transition-all ${
            active === tab
              ? "bg-yellow-500 text-black shadow-lg shadow-yellow-600/40"
              : "border-white/10 text-gray-300 hover:border-yellow-500 hover:text-yellow-500"
          }`}
        >
          {tab}
        </motion.button>
      ))}
    </div>
  );
}
