"use client";

import CampaignAIGenerator from "@/components/ai/CampaignAIGenerator";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Stars } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Campaign = {
  id: number;
  titre: string;
  type: string;
  objectif?: string;
  notes?: string;
  status: string;
  generated_content?: string;
};

function SocialCampaignPageInner() {
  const params = useSearchParams();
  const id = params.get("id");

  const [data, setData] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  const [titre, setTitre] = useState("");
  const [objectif, setObjectif] = useState("");
  const [generatedText, setGeneratedText] = useState("");

  // -------------------------------
  // 🔄 Charger la campagne
  // -------------------------------
  const load = async () => {
    if (!id) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${id}`, {
        credentials: "include",
      });

      const d = await res.json();
      setData(d);
      setTitre(d.titre);
      setObjectif(d.objectif || "");
      setGeneratedText(d.generated_content || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // 💾 Sauvegarder contenu IA
  // -------------------------------
  const saveGenerated = async (text: string) => {
    if (!id) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre,
          objectif,
          generated_content: text,
        }),
      });

      setGeneratedText(text);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------
  // 💾 Sauvegarder paramètres
  // -------------------------------
  const saveParams = async () => {
    if (!id) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre,
          objectif,
          generated_content: generatedText || "",
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id)
    return <div className="text-center text-red-400 mt-20">❌ Aucun ID fourni.</div>;

  if (loading)
    return (
      <div className="text-center text-gray-400 mt-20">
        Chargement de la campagne social...
      </div>
    );

  if (!data)
    return (
      <div className="text-center text-red-400 mt-20">
        ❌ Campagne introuvable.
      </div>
    );

  // ✅ FIX TS minimal : Props du composant ne contiennent pas label/placeholder
  const CampaignAIGeneratorAny = CampaignAIGenerator as any;

  return (
    <div className="min-h-screen pt-[40px] px-6 bg-[#0a0a0a] text-white">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto mb-10"
      >
        <Link
          href="/dashboard/campagnes"
          className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Retour aux campagnes
        </Link>

        <h1 className="text-3xl font-bold text-yellow-400 mt-4 mb-3 flex items-center gap-3">
          Campagne Réseaux sociaux
          <Share2 size={26} className="text-yellow-300" />
        </h1>

        <p className="text-gray-300">
          Générez vos posts Facebook, Instagram, LinkedIn et X automatiquement.
        </p>
      </motion.div>

      {/* PARAMÈTRES */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="
          max-w-3xl mx-auto
          bg-[#111]
          border border-yellow-400/20
          rounded-2xl
          p-8
          mb-12
        "
      >
        <h2 className="text-xl font-semibold text-yellow-400 mb-6">
          Paramètres de la campagne
        </h2>

        <label className="block text-sm mb-2">Titre</label>
        <input
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white"
        />

        <label className="block text-sm mb-2">Objectif</label>
        <input
          type="text"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          className="w-full bg-[#1a1a1a] p-3 rounded-lg mb-4 border border-gray-700 text-white"
        />

        <button
          onClick={saveParams}
          className="
            bg-gradient-to-r
            from-yellow-500
            to-yellow-300
            text-black
            font-semibold
            px-6 py-2
            rounded-xl
            hover:shadow-yellow-400/30
            transition
          "
        >
          Enregistrer
        </button>
      </motion.div>

      {/* SECTION IA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="
          max-w-3xl mx-auto
          bg-[#111]
          border border-yellow-400/20
          rounded-2xl
          p-8
          mb-20
        "
      >
        <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
          Génération IA <Stars size={20} className="text-yellow-300" />
        </h2>

        <CampaignAIGeneratorAny
          label="Brief IA"
          placeholder="Décris le type de post social que tu veux générer (accroche, storytelling, CTA, ton, cible…)."
          onGenerated={saveGenerated}
        />

        {generatedText && (
          <div
            className="
              mt-6 bg-[#1a1a1a] p-4 rounded-xl
              border border-yellow-400/10 text-gray-300 whitespace-pre-wrap
            "
          >
            {generatedText}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function SocialCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-[40px] px-6 bg-[#0a0a0a] text-white">
          <div className="text-center text-gray-400 mt-20">Chargement…</div>
        </div>
      }
    >
      <SocialCampaignPageInner />
    </Suspense>
  );
}
