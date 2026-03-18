"use client";

import { motion } from "framer-motion";

// =============================================================
// 🔥 Sous-catégories Ultra-Premium
// =============================================================
const SUBCATEGORIES = {
  "Marketing Digital": [
    "Stratégie marketing",
    "Copywriting",
    "Email marketing",
    "Lancement de produit",
    "Publicité & Acquisition",
  ],
  "Réseaux Sociaux": [
    "Croissance & Engagement",
    "Création de contenu",
    "TikTok / Insta Reels",
    "Branding Social",
    "Community Building",
  ],
  "Business & Entrepreneuriat": [
    "Organisation & Productivité",
    "Vente & Closing",
    "Offres / High Ticket",
    "Automatisation Business",
    "Leadership & Vision",
  ],
  "Psychologie & Mindset": [
    "Motivation",
    "Confiance en soi",
    "Neurosciences",
    "Discipline",
    "Performance Cognitive",
  ],
  "Finance & Argent": [
    "Investissement",
    "Gestion financière",
    "Revenus passifs",
    "Crypto / Web3",
    "Mentalité d'abondance",
  ],
};

export default function IASubcategorySelector({ category, value, onChange }) {
  if (!category) return null;

  const list = SUBCATEGORIES[category] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-12"
    >
      {/* TITLE */}
      <h3 className="text-xl text-yellow-300 font-semibold mb-5 tracking-wide">
        Sous-catégorie
      </h3>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map((item, idx) => {
          const selected = value === item;

          return (
            <motion.button
              key={item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(item)}
              className={`
                w-full text-left p-4 rounded-xl border transition-all duration-300 text-sm
                backdrop-blur-sm
                ${
                  selected
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black font-semibold border-yellow-300 shadow-xl shadow-yellow-500/30"
                    : "bg-black/40 border-yellow-600/30 hover:border-yellow-400 hover:bg-black/50 text-gray-200"
                }
              `}
            >
              {item}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
