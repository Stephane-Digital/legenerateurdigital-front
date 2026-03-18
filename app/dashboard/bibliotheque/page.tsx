"use client";

import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import FloatingAddButton from "@/components/FloatingAddButton";
import EmptyState from "@/components/library/EmptyState";
import LibraryCard from "@/components/library/LibraryCard";
import LibraryFilters from "@/components/library/LibraryFilters";

type LibraryItem = {
  id: number;
  type: string;
  titre: string;
  contenu: string;
  created_at: string;
};

export default function BibliothequePage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filtered, setFiltered] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");

  // ---------------------------------------------------------
  // 🔄 Chargement des éléments via backend LGD
  // ---------------------------------------------------------
  const load = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/library`, {
        credentials: "include",
      });

      const data = await res.json();

      setItems(data);
      setFiltered(data);
    } catch (err) {
      console.error("Erreur chargement bibliothèque :", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // 🟡 Application d’un filtre
  // ---------------------------------------------------------
  const applyFilter = (type: string) => {
    setActiveFilter(type);

    if (type === "all") {
      setFiltered(items);
    } else {
      setFiltered(items.filter((i) => i.type === type));
    }
  };

  // ---------------------------------------------------------
  // 🚀 Initialisation
  // ---------------------------------------------------------
  useEffect(() => {
    load();
  }, []);

  // ---------------------------------------------------------
  // 🖥️ RENDER
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen pt-[40px] px-6 bg-[#0a0a0a] text-white relative">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto mb-10 text-center"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-3 flex justify-center gap-2">
          <BookOpen className="text-yellow-300" /> Bibliothèque IA
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto">
          Retrouvez ici toutes vos créations IA : emails, posts, séquences,
          pages de vente et plus encore.
        </p>
      </motion.div>

      {/* FILTRES */}
      <LibraryFilters active={activeFilter} onSelect={applyFilter} />

      {/* CONTENU */}
      {loading ? (
        <div className="flex justify-center mt-20 text-gray-300">
          <Loader2 className="animate-spin mr-2" /> Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
            max-w-6xl
            mx-auto
            pb-20
          "
        >
          {filtered.map((item) => (
            <LibraryCard key={item.id} item={item} />
          ))}
        </motion.div>
      )}

      {/* BOUTON FLOTTANT */}
      <FloatingAddButton />
    </div>
  );
}
