"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import IASection from "./IASection";

export default function ModalNewAuto() {
  const [title, setTitle] = useState("");
  const [network, setNetwork] = useState("Facebook");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [archive, setArchive] = useState(false);
  const [deleteAfter, setDeleteAfter] = useState(false);

  const handleSave = () => {
    console.log("Post sauvegardé:", { title, network, content, date, archive, deleteAfter });
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 rounded-2xl border border-yellow-900/40 shadow-[0_0_30px_rgba(255,184,0,0.2)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-2xl font-bold text-[#ffb800] mb-6">Nouveau post automatisé</h2>

      <label className="block mb-2 text-sm">Titre du post :</label>
      <input
        className="w-full mb-4 p-2 rounded-md bg-[#1a1a1a] border border-gray-700 focus:border-[#ffb800]"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="block mb-2 text-sm">Réseau :</label>
      <select
        className="w-full mb-4 p-2 rounded-md bg-[#1a1a1a] border border-gray-700 focus:border-[#ffb800]"
        value={network}
        onChange={(e) => setNetwork(e.target.value)}
      >
        <option>Facebook</option>
        <option>Instagram</option>
        <option>LinkedIn</option>
        <option>X (Twitter)</option>
      </select>

      {/* 🧠 Bloc IA intégré */}
      <IASection onGenerated={setContent} />

      <label className="block mb-2 text-sm">Contenu :</label>
      <textarea
        className="w-full mb-4 p-3 rounded-md bg-[#1a1a1a] border border-gray-700 focus:border-[#ffb800] min-h-[150px]"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <label className="block mb-2 text-sm">Date de publication :</label>
      <input
        type="datetime-local"
        className="w-full mb-4 p-2 rounded-md bg-[#1a1a1a] border border-gray-700 focus:border-[#ffb800]"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="flex flex-col gap-2 mb-6 text-sm">
        <label>
          <input type="checkbox" checked={archive} onChange={(e) => setArchive(e.target.checked)} />{" "}
          Archiver automatiquement dans la bibliothèque
        </label>
        <label>
          <input type="checkbox" checked={deleteAfter} onChange={(e) => setDeleteAfter(e.target.checked)} />{" "}
          Supprimer après envoi
        </label>
      </div>

      <div className="flex justify-end gap-4">
        <button className="text-gray-400 hover:text-[#ffb800] transition-colors">Annuler</button>
        <button onClick={handleSave} className="btn-luxe px-6 py-2">
          Enregistrer
        </button>
      </div>
    </motion.div>
  );
}
