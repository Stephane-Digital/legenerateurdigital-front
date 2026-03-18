"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function EmailForm({ onEmail, onSequence }) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Champs
  const [form, setForm] = useState({
    tone: "professionnel",
    goal: "",
    audience: "grand public",
    product: "",
    style: "copywriting",
    cta: "",
    format: "court",
    template_id: null,
    count: 3,
  });

  // Load templates
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/email-templates/list`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setTemplates(data || []))
      .catch(() => {});
  }, []);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const submitEmail = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/email-generator/generate-one`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();
    setLoading(false);
    onEmail(data);
  };

  const submitSequence = async () => {
    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/email-generator/generate-sequence`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();
    setLoading(false);
    onSequence(data);
  };

  return (
    <motion.div
      className="w-full max-w-3xl bg-[#111] border border-yellow-600/20 rounded-2xl p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-semibold mb-4">⚙️ Paramètres de génération</h2>

      <div className="grid grid-cols-1 gap-4">
        {/* Template */}
        <div>
          <label className="text-sm opacity-80">Template (optionnel)</label>
          <select
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            onChange={(e) => update("template_id", e.target.value || null)}
          >
            <option value="">Aucun</option>
            {templates.map((t) => (
              <option value={t.id} key={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Produit */}
        <div>
          <label className="text-sm opacity-80">Produit</label>
          <input
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.product}
            onChange={(e) => update("product", e.target.value)}
          />
        </div>

        {/* Tone */}
        <div>
          <label className="text-sm opacity-80">Ton</label>
          <select
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.tone}
            onChange={(e) => update("tone", e.target.value)}
          >
            <option>professionnel</option>
            <option>friendly</option>
            <option>storytelling</option>
            <option>motivation</option>
          </select>
        </div>

        {/* Objectif */}
        <div>
          <label className="text-sm opacity-80">Objectif</label>
          <textarea
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2 h-24"
            value={form.goal}
            onChange={(e) => update("goal", e.target.value)}
          ></textarea>
        </div>

        {/* Audience */}
        <div>
          <label className="text-sm opacity-80">Audience</label>
          <input
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.audience}
            onChange={(e) => update("audience", e.target.value)}
          />
        </div>

        {/* CTA */}
        <div>
          <label className="text-sm opacity-80">CTA</label>
          <input
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.cta}
            onChange={(e) => update("cta", e.target.value)}
          />
        </div>

        {/* Format */}
        <div>
          <label className="text-sm opacity-80">Format</label>
          <select
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.format}
            onChange={(e) => update("format", e.target.value)}
          >
            <option>court</option>
            <option>long</option>
            <option>storytelling</option>
          </select>
        </div>

        {/* Séquence */}
        <div>
          <label className="text-sm opacity-80">Séquence (3 / 5 / 7)</label>
          <select
            className="w-full bg-black border border-yellow-600/30 rounded-lg px-3 py-2"
            value={form.count}
            onChange={(e) => update("count", Number(e.target.value))}
          >
            <option value={3}>3 emails</option>
            <option value={5}>5 emails</option>
            <option value={7}>7 emails</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={submitEmail}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-500 px-5 py-2 rounded-xl text-black font-semibold"
        >
          {loading ? "Génération..." : "✨ Générer 1 email"}
        </button>

        <button
          onClick={submitSequence}
          disabled={loading}
          className="bg-yellow-700 hover:bg-yellow-600 px-5 py-2 rounded-xl text-black font-semibold"
        >
          {loading ? "Génération..." : "🔥 Générer une séquence"}
        </button>
      </div>
    </motion.div>
  );
}
