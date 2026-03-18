// app/components/campagnes/CampaignForm.tsx
"use client";

import { useState } from "react";

type CampaignFormValues = {
  titre: string;
  type: string;
  objectif: string;
};

type CampaignFormProps = {
  onSubmit: (data: CampaignFormValues) => void;
  loading?: boolean;
};

const TYPE_OPTIONS = [
  { value: "social", label: "Réseaux sociaux" },
  { value: "email", label: "Email marketing" },
  { value: "tunnel", label: "Tunnel de vente" },
  { value: "sequence", label: "Séquences" },
];

export default function CampaignForm({ onSubmit, loading }: CampaignFormProps) {
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("social");
  const [objectif, setObjectif] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ titre, type, objectif });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Titre */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Titre de la campagne</label>
        <input
          type="text"
          className="w-full rounded-xl bg-[#111] border border-yellow-400/25 px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/60"
          placeholder="Ex : Low Ticket 4.0"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Type de campagne</label>
        <select
          className="w-full rounded-xl bg-[#111] border border-yellow-400/25 px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/60"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Objectif */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Objectif</label>
        <textarea
          className="w-full rounded-xl bg-[#111] border border-yellow-400/25 px-4 py-3 text-sm text-white min-h-[120px] resize-none focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/60"
          placeholder="Ex : Créer un lead magnet pour la promotion de ma formation..."
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          required
        />
      </div>

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold py-3 rounded-xl shadow-lg shadow-yellow-500/30 hover:shadow-yellow-400/50 hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Création en cours..." : "Créer la campagne"}
      </button>
    </form>
  );
}
