"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function NewPostModal({
  date,
  onClose,
  onSave,
  onGenerateAI,
}: {
  date: Date;
  onClose: () => void;
  onSave: (post: any) => void;
  onGenerateAI: (prompt: string, setContent: Function) => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const savePost = () => {
    if (!content.trim()) return;
    onSave({
      contenu: content,
      date_programmee: date.toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 w-full max-w-xl rounded-xl p-6 border border-zinc-700"
      >
        <h2 className="text-xl font-bold text-yellow-400 mb-4">
          Nouveau post – {date.toLocaleDateString("fr-FR")}
        </h2>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-40 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white mb-4"
          placeholder="Écris ou génère un contenu pour ce jour..."
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600"
          >
            Annuler
          </button>

          <button
            onClick={() => {
              setLoading(true);
              onGenerateAI(content, setContent);
              setLoading(false);
            }}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400"
          >
            Générer avec IA
          </button>

          <button
            onClick={savePost}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-bold"
          >
            Enregistrer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
