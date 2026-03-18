"use client";

import { useState } from "react";

export default function ContentForm({ onGenerated }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/content-engine/generate`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      }
    );

    const data = await res.json();
    onGenerated(data.response_text);
    setLoading(false);
  };

  return (
    <div className="bg-[#0f0f0f] border border-yellow-600/30 p-6 rounded-2xl">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">
        Générer du contenu
      </h2>

      <textarea
        className="w-full h-40 bg-black border border-yellow-600/30 rounded-lg px-4 py-3 text-sm"
        placeholder="Décris le contenu à générer..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        className="mt-4 px-6 py-2 bg-yellow-600 text-black rounded-lg"
        onClick={generate}
        disabled={loading}
      >
        {loading ? "Génération..." : "Générer"}
      </button>
    </div>
  );
}
