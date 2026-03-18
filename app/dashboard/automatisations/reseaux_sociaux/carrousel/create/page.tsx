"use client";

import ProtectedPage from "@/components/auth/ProtectedPage";
import { createCarrousel } from "@/lib/api_carrousel";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCarrouselPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);

    try {
      const created = await createCarrousel({
        title,
        description: "",
      });

      router.push(
        `/dashboard/automatisations/reseaux_sociaux/carrousel/editor/${created.id}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen text-white px-6 flex flex-col items-center justify-center">

        <div className="bg-[#0f0f0f] border border-yellow-500/20 p-10 rounded-2xl shadow-xl max-w-xl w-full">
          <h1 className="text-2xl font-bold text-yellow-400 mb-6">
            ➕ Nouveau Carrousel
          </h1>

          <input
            type="text"
            placeholder="Titre du carrousel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-yellow-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold py-3 rounded-xl shadow-lg hover:scale-[1.03] transition disabled:opacity-40"
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </div>

      </div>
    </ProtectedPage>
  );
}
