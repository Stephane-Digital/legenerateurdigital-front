"use client";

import { useEffect, useState } from "react";
import SalesPageForm from "./components/SalesPageForm";
import SalesPageList from "./components/SalesPageList";

export default function SalesPagesPage() {
  const [pages, setPages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales-pages/all`, {
      credentials: "include",
    });
    setPages(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Pages de Vente IA</h1>

        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-yellow-600 text-black px-5 py-2 rounded-lg"
        >
          + Nouvelle Page
        </button>
      </div>

      <SalesPageList
        pages={pages}
        onEdit={(p) => {
          setEditing(p);
          setShowForm(true);
        }}
        onDeleted={load}
      />

      {showForm && (
        <SalesPageForm
          salesPage={editing}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
