"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import CardLuxe from "@/app/components/ui/CardLuxe";

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
    <div className="min-h-screen flex flex-col justify-start items-center text-white px-6 pt-[60px]">
      {/* Conteneur central */}
      <div className="flex flex-col items-center justify-center w-full max-w-[600px] mx-auto text-center">
        
        {/* Titre */}
        <h1 className="text-4xl font-bold text-gradient mb-2">
          🎓 Formations LGD
        </h1>
        <p className="text-[#ffb800] text-lg mb-6">
          Le Générateur Digital
        </p>

        {/* Bouton d’ajout centré */}
        <div className="w-full flex justify-center mb-[25px]">
          <button
            onClick={addFormation}
            className="btn-luxe w-[320px] py-4 text-xl font-semibold rounded-xl"
          >
            + Nouvelle formation
          </button>
        </div>

        {/* Liste des formations */}
        {loading ? (
          <p className="text-gray-400 mt-10">Chargement…</p>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-[30px] mt-[10px]">
            <AnimatePresence>
              {formations.map((formation) => (
                <CardLuxe key={formation.id}>
                  <h3 className="font-semibold text-lg text-[#ffb800] mb-3">
                    {formation.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-5">{formation.status}</p>
                  <button
                    onClick={() => deleteFormation(formation.id)}
                    className="btn-luxe-blue w-[140px] py-2 text-sm rounded-lg mt-auto mb-2"
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
