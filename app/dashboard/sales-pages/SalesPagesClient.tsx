"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import SalesBuilder from "./components/SalesBuilder";
import SalesCreateModal from "./components/SalesCreateModal";
import SalesList from "./components/SalesList";

export default function SalesPagesClient() {
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sales-pages/list`,
        { credentials: "include" }
      );
      const data = await res.json();
      setPages(data);
    } catch (e) {
      console.error("Erreur chargement pages de vente :", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPages();
  }, []);

  return (
    <div className="p-6 space-y-10">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-yellow-400"
        >
          Pages de Vente IA
        </motion.h1>

        <motion.button
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setShowCreate(true)}
          className="px-5 py-2 bg-yellow-600 text-black rounded-lg hover:bg-yellow-500 transition shadow"
        >
          + Nouvelle Page de Vente
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <SalesList
            pages={pages}
            loading={loading}
            onSelect={(p) => setSelected(p)}
            onUpdated={loadPages}
          />
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selected ? (
              <SalesBuilder
                key={selected.id}
                page={selected}
                onUpdated={() => {
                  loadPages();
                  setSelected(null);
                }}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#0f0f0f] border border-yellow-600/30 p-10 rounded-2xl text-center text-yellow-400 opacity-60"
              >
                Sélectionnez une page de vente dans la liste ou créez-en une nouvelle.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <SalesCreateModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              loadPages();
              setShowCreate(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
