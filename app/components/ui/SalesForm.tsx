"use client";

import { useState } from "react";
import EditorLuxe from "./EditorLuxe";

export default function SalesForm({ mode = "create", data = null }) {
  const [title, setTitle] = useState(data?.title || "");
  const [subtitle, setSubtitle] = useState(data?.subtitle || "");
  const [content, setContent] = useState(data?.content || "");
  const [ctaLabel, setCtaLabel] = useState(data?.cta_label || "");
  const [ctaUrl, setCtaUrl] = useState(data?.cta_url || "");

  const handleSubmit = async () => {
    const payload = {
      title,
      subtitle,
      content,
      cta_label: ctaLabel,
      cta_url: ctaUrl,
    };

    const url =
      mode === "edit"
        ? `${process.env.NEXT_PUBLIC_API_URL}/sales-pages/${data.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/sales-pages`;

    const method = mode === "edit" ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Page enregistrée !");
  };

  return (
    <div className="bg-black/30 p-8 rounded-2xl border border-gold-600/40 shadow-xl">
      <div className="space-y-6">
        <div>
          <label className="text-gray-300 text-sm">Titre principal</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl bg-black/40 border border-gold-600/40 text-white"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm">Sous-titre</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl bg-black/40 border border-gold-600/40 text-white"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm">Contenu IA</label>
          <EditorLuxe value={content} onChange={setContent} />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-300 text-sm">Texte du bouton</label>
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl bg-black/40 border border-gold-600/40 text-white"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm">URL du bouton</label>
            <input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl bg-black/40 border border-gold-600/40 text-white"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-4 bg-gold-500 text-black font-bold rounded-xl hover:bg-gold-400"
        >
          {mode === "edit" ? "Mettre à jour" : "Créer la page"}
        </button>
      </div>
    </div>
  );
}
