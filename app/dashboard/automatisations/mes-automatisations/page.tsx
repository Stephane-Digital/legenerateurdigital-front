"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import ModalLuxe from "@/components/ui/ModalLuxe";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AutoItem = {
  id: number;
  title: string;
  description?: string;
};

export default function MesAutomatisationsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const [items, setItems] = useState<AutoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState<AutoItem | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // ===============================
  //   FETCH AUTOMATIONS (GET)
  // ===============================
  const loadItems = async () => {
    try {
      const res = await fetch(`${API_URL}/automations/`, {
        credentials: "include",
      });
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Erreur GET automations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // ===============================
  //   CREATE (POST)
  // ===============================
  const onCreate = async () => {
    if (!title.trim()) return;

    try {
      const body = {
        title: title.trim(),
        description: desc.trim(),
      };

      const res = await fetch(`${API_URL}/automations/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erreur création automation");

      await loadItems();
      setShowNew(false);
      setTitle("");
      setDesc("");
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  //   UPDATE (PUT)
  // ===============================
  const onUpdate = async () => {
    if (!showEdit) return;

    try {
      const body = {
        title: title.trim(),
        description: desc.trim(),
      };

      const res = await fetch(`${API_URL}/automations/${showEdit.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erreur mise à jour");

      await loadItems();
      setShowEdit(null);
      setTitle("");
      setDesc("");
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  //   DELETE (DELETE)
  // ===============================
  const onDelete = async (id: number) => {
    if (!confirm("Supprimer cette automatisation ?")) return;

    try {
      const res = await fetch(`${API_URL}/automations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Erreur suppression");

      await loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  //   RENDER
  // ===============================
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 pt-20 flex flex-col items-center">

      {/* HEADER */}
      <div className="max-w-3xl w-full mb-10 text-center">
        <button
          onClick={() => router.push("/dashboard/automatisations")}
          className="text-sm text-yellow-400 hover:text-yellow-300 mb-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Retour aux automatisations
        </button>

        <h1 className="text-3xl font-bold text-yellow-400 mb-3">
          Mes automatisations 📁
        </h1>
        <p className="text-gray-300 mb-8">
          Gérez ici vos automatisations intelligentes connectées au backend LGD.
        </p>

        <button
          onClick={() => {
            setTitle("");
            setDesc("");
            setShowNew(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-300
                     text-black font-semibold rounded-xl shadow-lg
                     hover:shadow-yellow-400/30 transition-all"
        >
          + Nouvelle automatisation
        </button>
      </div>

      {/* LISTE */}
      {loading ? (
        <p className="text-gray-400">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 mt-10">Aucune automatisation enregistrée.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl w-full justify-items-center">
          {items.map((item) => (
            <CardLuxe key={item.id} className="flex flex-col">
              <h2 className="text-xl font-bold mb-2">{item.title}</h2>

              {item.description && (
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {item.description}
                </p>
              )}

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => {
                    setShowEdit(item);
                    setTitle(item.title);
                    setDesc(item.description || "");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#f5d77b] text-black text-sm hover:bg-[#ffeb9e] transition"
                >
                  Éditer
                </button>

                <button
                  onClick={() => onDelete(item.id)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"
                >
                  Supprimer
                </button>
              </div>
            </CardLuxe>
          ))}
        </div>
      )}

      {/* ===============================
          MODAL AJOUT
      =============================== */}
      <AnimatePresence>
        {showNew && (
          <ModalLuxe
  open={showNew}
  onClose={() => setShowNew(false)}
  title="Nouvelle automatisation"
>
            <input
              className="w-full mb-4 p-3 rounded bg-black border border-gray-700 text-white"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full mb-4 p-3 rounded bg-black border border-gray-700 text-white"
              placeholder="Description"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <button
              onClick={onCreate}
              className="px-6 py-3 rounded-xl font-semibold bg-[#f5d77b] text-black
                         hover:bg-[#ffeb9e] transition w-full"
            >
              Créer
            </button>
          </ModalLuxe>
        )}
      </AnimatePresence>

      {/* ===============================
          MODAL EDIT
      =============================== */}
      <AnimatePresence>
        {showEdit && (
          <ModalLuxe
  open={showNew}
  onClose={() => setShowNew(false)}
  title="Nouvelle automatisation"
>
            <input
              className="w-full mb-4 p-3 rounded bg-black border border-gray-700 text-white"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full mb-4 p-3 rounded bg-black border border-gray-700 text-white"
              placeholder="Description"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <button
              onClick={onUpdate}
              className="px-6 py-3 rounded-xl font-semibold bg-[#f5d77b] text-black
                         hover:bg-[#ffeb9e] transition w-full"
            >
              Mettre à jour
            </button>
          </ModalLuxe>
        )}
      </AnimatePresence>
    </div>
  );
}
