"use client";

import ProtectedPage from "@/components/auth/ProtectedPage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createCarrousel,
  deleteCarrousel,
  getUserCarrousels,
} from "@/lib/api_carrousel";

export default function MesCarrouselsPage() {
  const router = useRouter();

  const [carrousels, setCarrousels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserCarrousels();
        setCarrousels(data);
      } catch (err) {
        console.error("Erreur getCarrousels:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const created = await createCarrousel({
        title: "Nouveau carrousel",
        description: "",
      });
      router.push(
        `/dashboard/automatisations/reseaux_sociaux/carrousel/editor/${created.id}`
      );
    } catch (err) {
      console.error("Erreur createCarrousel:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce carrousel ?")) return;
    try {
      await deleteCarrousel(id);
      setCarrousels((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erreur deleteCarrousel:", err);
    }
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen w-full text-white px-6 pb-20">

        <div className="max-w-6xl mx-auto mt-10 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-400">
            🎠 Mes Carrousels
          </h1>

          <button
            onClick={handleCreate}
            disabled={creating}
            className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold py-2 px-6 rounded-xl shadow-lg hover:scale-[1.03] transition disabled:opacity-40"
          >
            {creating ? "Création..." : "➕ Nouveau Carrousel"}
          </button>
        </div>

        <p className="max-w-6xl mx-auto text-gray-300 mt-2 mb-10">
          Gérez tous vos carrousels créés.
        </p>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {loading &&
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#111] border border-yellow-500/10 h-64 rounded-xl" />
            ))}

          {!loading && carrousels.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-20">
              Aucun carrousel encore 🎨
            </div>
          )}

          {carrousels.map((c) => (
            <div
              key={c.id}
              className="bg-[#0f0f0f] border border-yellow-500/20 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-yellow-500/40 transition"
            >
              <div className="h-48 bg-[#1a1a1a] flex items-center justify-center text-yellow-400 text-xl font-bold">
                Slide 1
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-yellow-400">{c.title}</h3>

                <p className="text-gray-400 text-sm mt-1 mb-4">
                  {c.description || "Aucune description"}
                </p>

                <div className="flex justify-between">
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/automatisations/reseaux_sociaux/carrousel/editor/${c.id}`
                      )
                    }
                    className="text-yellow-300 hover:text-yellow-100 transition"
                  >
                    ✏ Éditer
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </ProtectedPage>
  );
}
