"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// ============================================================
// 🟦 Catégories principales LGD v5 — Alignées au marché 2025
// ============================================================
const CATEGORIES = [
  "Marketing Digital",
  "Réseaux Sociaux & Contenu",
  "Entrepreneuriat & Business",
  "Productivité & Organisation",
  "Mindset & Psychologie",
  "Finance & Indépendance",
  "Intelligence Artificielle & Automatisation",
];

export default function CategorySelector({ value, onChange }: Props) {
  return (
    <div className="w-full">
      {/* Label Premium */}
      <label className="text-yellow-400 font-bold text-lg mb-2 block border-b border-yellow-600/40 pb-1">
        Catégorie principale
      </label>

      {/* Dropdown luxe sombre doré */}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full bg-black/40 border border-yellow-600/40
          rounded-xl p-3 text-white
          focus:ring-2 focus:ring-yellow-400 focus:outline-none
          transition-all duration-200
          hover:border-yellow-400 cursor-pointer
        "
      >
        {/* Placeholder premium */}
        <option value="" className="text-gray-400">
          — Choisir une catégorie —
        </option>

        {/* Liste des catégories */}
        {CATEGORIES.map((item) => (
          <option key={item} value={item} className="text-black">
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
