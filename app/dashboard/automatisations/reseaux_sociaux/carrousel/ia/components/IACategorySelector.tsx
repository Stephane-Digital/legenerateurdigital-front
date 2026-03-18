"use client";

import { motion } from "framer-motion";

const CATEGORIES = [
  {
    key: "Marketing Digital",
    icon: "💡",
    desc: "Stratégies, conversions, copywriting, croissance.",
  },
  {
    key: "Réseaux Sociaux",
    icon: "📱",
    desc: "TikTok, Instagram, engagement, création de contenu.",
  },
  {
    key: "Business & Entrepreneuriat",
    icon: "🚀",
    desc: "Productivité, offres, ventes, leadership.",
  },
  {
    key: "Psychologie & Mindset",
    icon: "🧠",
    desc: "Motivation, discipline, neurosciences, mindset.",
  },
  {
    key: "Finance & Argent",
    icon: "💰",
    desc: "Investissement, gestion, crypto, abondance.",
  },
];

export default function IACategorySelector({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-12"
    >
      {/* TITLE */}
      <h3 className="text-2xl text-yellow-300 font-semibold mb-6 tracking-wide">
        Catégorie principale
      </h3>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, idx) => {
          const selected = value === cat.key;

          return (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(cat.key)}
              className={`
                w-full text-left p-5 rounded-2xl border backdrop-blur-sm
                transition-all duration-300
                ${
                  selected
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black border-yellow-300 shadow-xl shadow-yellow-500/30"
                    : "bg-black/40 border-yellow-600/30 hover:border-yellow-400 hover:bg-black/50"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`text-3xl ${
                    selected ? "drop-shadow-[0_0_6px_rgba(0,0,0,0.3)]" : ""
                  }`}
                >
                  {cat.icon}
                </span>

                <div>
                  <p
                    className={`font-semibold text-lg ${
                      selected ? "text-black" : "text-yellow-200"
                    }`}
                  >
                    {cat.key}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      selected ? "text-black/80" : "text-gray-300/70"
                    }`}
                  >
                    {cat.desc}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
