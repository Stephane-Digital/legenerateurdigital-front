"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function ModalNouvelleCampagne({ onClose, onCreated }: Props) {
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("email");
  const [objectif, setObjectif] = useState("");
  const [notes, setNotes] = useState("");
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!titre.trim()) return alert("Veuillez entrer un titre.");

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titre,
          type,
          objectif,
          notes,
          auto_launch: autoLaunch,
        }),
      });

      if (!res.ok) throw new Error("Erreur");
      onCreated();
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="
          bg-[#111]
          border border-yellow-400/30
          rounded-2xl
          p-10
          w-[90%]
          max-w-2xl
          text-left
          shadow-xl shadow-black
        "
      >
        {/* TITRE */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">
          Nouvelle campagne IA 📣
        </h2>

        {/* TITRE */}
        <label className="block text-sm mb-2">Titre</label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white"
          placeholder="Ex : Campagne lancement ebook"
        />

        {/* TYPE */}
        <label className="block text-sm mb-2">Type de campagne</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white"
        >
          <option value="email">Email marketing</option>
          <option value="social">Réseaux sociaux</option>
          <option value="sequence">Séquence automatisée</option>
        </select>

        {/* OBJECTIF */}
        <label className="block text-sm mb-2">Objectif</label>
        <input
          type="text"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white"
          placeholder="Ex : Générer 50 leads en 7 jours"
        />

        {/* NOTES */}
        <label className="block text-sm mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white h-28"
          placeholder="Informations complémentaires..."
        />

        {/* OPTIONS */}
        <div className="flex flex-col gap-3 mb-6">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={autoLaunch}
              onChange={() => setAutoLaunch(!autoLaunch)}
            />
            Lancer automatiquement la campagne
          </label>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            Annuler
          </button>

          <button
            onClick={create}
            disabled={loading}
            className="
              bg-gradient-to-r
              from-yellow-500
              to-yellow-300
              text-black
              font-semibold
              px-6 py-2
              rounded-xl
              shadow-lg
              hover:shadow-yellow-400/40
              transition-all
            "
          >
            {loading ? "Envoi..." : "Créer la campagne"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
