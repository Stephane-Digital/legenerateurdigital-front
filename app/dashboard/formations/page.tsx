"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import CardLuxe from "@/components/ui/CardLuxe";

type Formation = { id: number; name: string; status: string };

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const res = await fetch("/api/formations", { cache: "no-store" });
        const data = await res.json();
        setFormations(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addFormation = async () => {
    const res = await fetch("/api/formations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Nouvelle formation ${formations.length + 1}`,
        status: "Active",
      }),
    });
    const created = await res.json();
    setFormations((prev) => [...prev, created]);
  };

  const deleteFormation = async (id: number) => {
    setFormations((prev) => prev.filter((f) => f.id !== id));
    await fetch(`/api/formations/${id}`, { method: "DELETE" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-6 pt-[60px] text-white">
      {/* Conteneur central */}
      <div className="mx-auto flex w-full max-w-[600px] flex-col items-center justify-center text-center">
        {/* Titre */}
        <h1 className="text-gradient mb-2 text-4xl font-bold">🎓 Formations LGD</h1>
        <p className="mb-6 text-lg text-[#ffb800]">Le Générateur Digital</p>

        {/* Bouton d’ajout centré */}
        <div className="mb-[25px] flex w-full justify-center">
          <button
            onClick={addFormation}
            className="btn-luxe w-[320px] rounded-xl py-4 text-xl font-semibold"
          >
            + Nouvelle formation
          </button>
        </div>

        {/* Liste des formations */}
        {loading ? (
          <p className="mt-10 text-gray-400">Chargement…</p>
        ) : (
          <div className="mt-[10px] flex w-full flex-col items-center justify-center gap-[30px]">
            <AnimatePresence>
              {formations.map((formation) => (
                <CardLuxe key={formation.id}>
                  <h3 className="mb-3 text-lg font-semibold text-[#ffb800]">{formation.name}</h3>
                  <p className="mb-5 text-sm text-gray-300">{formation.status}</p>
                  <button
                    onClick={() => deleteFormation(formation.id)}
                    className="btn-luxe-blue mt-auto mb-2 w-[140px] rounded-lg py-2 text-sm"
                  >
                    Supprimer
                  </button>
                </CardLuxe>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
