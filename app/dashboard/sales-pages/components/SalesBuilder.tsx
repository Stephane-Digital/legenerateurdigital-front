"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import ModalAiBlock from "./ModalAiBlock";
import ModalFullPageAI from "./ModalFullPageAI";
import TemplatePanel from "./TemplatePanel";

export default function SalesBuilder({ page, onUpdated }: any) {
  const existing = !!page;

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<{ html: string }[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [showFullAi, setShowFullAi] = useState(false);

  // CHARGEMENT DES DONNÉES EXISTANTES
  useEffect(() => {
    if (page) {
      setTitle(page.title || "");
      setBlocks(page.blocks || []);
    }
  }, [page]);

  // AJOUT D’UN BLOC
  const addBlock = () => setBlocks((prev) => [...prev, { html: "" }]);

  // SUPPRESSION D’UN BLOC
  const remove = (index: number) =>
    setBlocks((prev) => prev.filter((_, i) => i !== index));

  // SAUVEGARDE
  const save = async () => {
    const body = {
      title,
      blocks,
    };

    const url = existing
      ? `${process.env.NEXT_PUBLIC_API_URL}/sales-pages/update/${page.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/sales-pages/create`;

    const res = await fetch(url, {
      method: existing ? "PUT" : "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onUpdated();
    } else {
      console.error("Erreur sauvegarde :", await res.text());
      alert("Erreur lors de la sauvegarde.");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-[#0d0d0d] border border-yellow-600/30 rounded-2xl p-8 shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-yellow-400 text-2xl font-bold">
            {existing ? "Modifier une page de vente" : "Nouvelle page de vente"}
          </h2>

          <div className="flex gap-4">
            <button className="bg-gray-700 px-4 py-2 rounded-lg" onClick={onUpdated}>
              Fermer
            </button>

            <button
              className="bg-yellow-600 text-black px-4 py-2 rounded-lg"
              onClick={save}
            >
              Enregistrer
            </button>

            {/* EXPORT PDF */}
            {existing && (
              <>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/sales-pages/export/${page.id}?format=pdf`}
                  className="bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm hover:bg-yellow-400"
                >
                  📄 PDF
                </a>

                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/sales-pages/export/${page.id}?format=word`}
                  className="bg-yellow-500 text-black px-3 py-2 rounded-lg text-sm hover:bg-yellow-400"
                >
                  📝 Word
                </a>
              </>
            )}
          </div>
        </div>

        {/* TITRE */}
        <input
          className="w-full bg-black border border-yellow-600/30 rounded-lg px-4 py-2 text-lg mb-6"
          placeholder="Titre de la page"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* ZONE CONTENT */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* COLONNE GAUCHE – BUILDER */}
          <div className="w-1/2 overflow-y-auto pr-4">
            {/* BOUTONS */}
            <div className="flex gap-3 mb-5">
              <button
                className="bg-yellow-600/60 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg"
                onClick={addBlock}
              >
                + Bloc vide
              </button>

              <button
                className="bg-yellow-600/60 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg"
                onClick={() => setShowTemplates(true)}
              >
                + Templates
              </button>

              <button
                className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg"
                onClick={() => setShowAi(true)}
              >
                🚀 Bloc IA
              </button>
            </div>

            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg mb-4"
              onClick={() => setShowFullAi(true)}
            >
              ⚡ Page complète IA
            </button>

            {/* LISTE DES BLOCS */}
            {blocks.map((block, i) => (
              <div
                key={i}
                className="mb-6 bg-[#111] border border-yellow-700/20 rounded-xl p-4"
              >
                <textarea
                  className="w-full h-40 bg-black border border-yellow-700/20 rounded-lg px-3 py-2 text-sm"
                  value={block.html}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b, idx) =>
                        idx === i ? { ...b, html: e.target.value } : b
                      )
                    )
                  }
                />

                <div className="flex justify-end mt-3">
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => remove(i)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* COLONNE DROITE – PREVIEW */}
          <div className="w-1/2 overflow-y-auto p-4 bg-black border border-yellow-700/20 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">Aperçu</h3>

            <div className="prose prose-invert max-w-none">
              <h1>{title}</h1>

              {blocks.map((block, i) => (
                <div
                  key={i}
                  className="mb-10"
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* TEMPLATES */}
        <AnimatePresence>
          {showTemplates && (
            <TemplatePanel
              onClose={() => setShowTemplates(false)}
              onSelect={(html) => setBlocks((prev) => [...prev, { html }])}
            />
          )}
        </AnimatePresence>

        {/* IA BLOCK */}
        <AnimatePresence>
          {showAi && (
            <ModalAiBlock
              onClose={() => setShowAi(false)}
              onGenerated={(html) => setBlocks((prev) => [...prev, { html }])}
            />
          )}
        </AnimatePresence>

        {/* IA FULL PAGE */}
        <AnimatePresence>
          {showFullAi && (
            <ModalFullPageAI
              onClose={() => setShowFullAi(false)}
              onGenerated={(blocksAi) => setBlocks(blocksAi)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
