"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  createCarrousel,
  createCarrouselFromIASlides,
  generateCarrouselPreset,
  updateCarrousel,
} from "@/lib/api_carrousel";

import IAAdvancedSettings from "./components/IAAdvancedSettings";
import IABackgroundUploader from "./components/IABackgroundUploader";
import IACategorySelector from "./components/IACategorySelector";
import IAGoalSelector from "./components/IAGoalSelector";
import IAPreview from "./components/IAPreview";
import IAResult from "./components/IAResult";
import IAStyleSelector from "./components/IAStyleSelector";
import IASubcategorySelector from "./components/IASubcategorySelector";

type IAResultState = {
  title: string;
  slides: any[];
  raw: string;
};

export default function IACarrouselPage() {
  const router = useRouter();

  // =========================================================
  // 🔥 STATE
  // =========================================================
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [slidesCount, setSlidesCount] = useState(6);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IAResultState | null>(null);
  const [error, setError] = useState("");

  // =========================================================
  // ⭐ CONDITIONS DE GÉNÉRATION IA
  // =========================================================
  const isValid = useMemo(() => {
    return (
      category.trim() !== "" &&
      subcategory.trim() !== "" &&
      goal.trim() !== "" &&
      style.trim() !== ""
    );
  }, [category, subcategory, goal, style]);

  // =========================================================
  // 🔥 GENERATION IA
  // =========================================================
  async function handleGenerate() {
    if (!isValid) {
      setError("Veuillez compléter les paramètres essentiels avant de générer.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const fullPrompt = `
        Catégorie : ${category}
        Sous-catégorie : ${subcategory}
        Objectif : ${goal}
        Style : ${style}
        Instructions personnalisées : ${prompt}
        Background souhaité : ${backgroundPrompt}
      `;

      const data = await generateCarrouselPreset({
        prompt: fullPrompt,
        slides_count: slidesCount,
      });

      console.log("📌 RESULTAT IA =", data);

      const slides: any[] = (data as any)?.slides || [];

      const titleFromApi: string | undefined =
        typeof (data as any)?.title === "string" ? (data as any).title : undefined;

      setResult({
        title: titleFromApi || `Carrousel ${category}`,
        slides,
        raw: JSON.stringify(slides, null, 2),
      });
    } catch (err: any) {
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.detail || "Erreur inconnue");
      } catch {
        setError(err.message || "Erreur inconnue");
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // 🟦 CRÉATION DU CARROUSEL DANS LA BASE + REDIRECTION
  // =========================================================
  async function handleBuildCarrousel() {
    if (!result) return;

    try {
      setLoading(true);

      const finalIA = await createCarrouselFromIASlides({
        title: result.title,
        slides: result.slides,
      });

      const dbCarrousel = await createCarrousel({
        title: (finalIA as any)?.title || result.title,
        description: "",
      });

      await updateCarrousel(dbCarrousel.id, {
        title: (finalIA as any)?.title || result.title,
        slides: (finalIA as any)?.slides || result.slides,
      });

      router.push(
        `/dashboard/automatisations/reseaux_sociaux/carrousel/${dbCarrousel.id}`
      );
    } catch (err: any) {
      console.error("Erreur création carrousel :", err);
      alert("Erreur lors de la construction du carrousel.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // 🖼️ UI (design LGD intact)
  // =========================================================
  return (
    <div className="min-h-screen w-full text-white px-6 pb-24 max-w-6xl mx-auto pt-28">
      {/* HEADER */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-yellow-400 mb-10"
      >
        Générateur IA — Carrousel Premium v5.5
      </motion.h1>

      {/* PARAMÈTRES */}
      <IACategorySelector value={category} onChange={setCategory} />
      <IASubcategorySelector
        category={category}
        value={subcategory}
        onChange={setSubcategory}
      />
      <IAGoalSelector value={goal} onChange={setGoal} />
      <IAStyleSelector value={style} onChange={setStyle} />

      <IAAdvancedSettings
        slides={slidesCount}
        onSlidesChange={setSlidesCount}
        prompt={prompt}
        onPromptChange={setPrompt}
      />

      <IABackgroundUploader
        value={backgroundPrompt}
        onChange={setBackgroundPrompt}
      />

      {/* BOUTON IA */}
      <motion.button
        disabled={!isValid || loading}
        onClick={handleGenerate}
        className={`mt-6 px-8 py-4 rounded-xl font-bold shadow-lg transition
          ${
            isValid
              ? "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
      >
        {loading ? "Génération en cours..." : "Générer le carrousel IA"}
      </motion.button>

      {/* PRÉVISUALISATION */}
      {result?.slides?.length > 0 && <IAPreview slides={result.slides} />}

      {/* VALIDATION */}
      {result?.slides?.length > 0 && (
        <IAResult data={result} onValidate={handleBuildCarrousel} />
      )}

      {error && (
        <div className="mt-6 text-red-400 text-sm whitespace-pre-wrap">{error}</div>
      )}
    </div>
  );
}
