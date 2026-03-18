"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function CampaignForm({ show, onClose, onSave }) {
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("social");
  const [objectif, setObjectif] = useState("");
  const [notes, setNotes] = useState("");
  const [autoLaunch, setAutoLaunch] = useState(false);

  const save = () => {
    if (!titre.trim()) return;
    onSave({
      titre,
      type,
      objectif,
      notes,
      autoLaunch,
      date: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#111111] border border-yellow-400/30 rounded-2xl p-10 w-[95%] max-w-2xl text-left shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">
              Nouvelle campagne IA
            </h2>

            {/* TITRE */}
            <label className="block text-sm font-medium mb-2">Titre</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white"
            />

            {/* TYPE */}
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white"
            >
              <option value="social">Réseaux sociaux</option>
              <option value="email">Email marketing</option>
              <option value="sequence">Séquence IA</option>
            </select>

            {/* OBJECTIF */}
            <label className="block text-sm font-medium mb-2">Objectif</label>
            <input
              type="text"
              value={objectif}
              onChange={(e) => setObjectif(e.target.value)}
              className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white"
            />

            {/* NOTES */}
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white h-32"
            />

            {/* OPTIONS */}
            <div className="flex flex-col gap-4 mb-8">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={autoLaunch}
                  onChange={() => setAutoLaunch(!autoLaunch)}
                  className="h-4 w-4"
                />
                Activer le lancement automatique
              </label>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between mt-6">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                Annuler
              </button>

              <button
                onClick={save}
                className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-yellow-400/30 transition-all"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
