"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";

export default function ActivitePage() {
  const [texte, setTexte] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Responsive
  const [isWide, setIsWide] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 1200;
  });

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 1200);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Gestion du téléchargement PDF
  const handleDownload = async () => {
    if (!texte.trim()) return;
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export_pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Business Plan IA",
          content: texte,
        }),
      });

      const data = await response.json();
      if (data.status === "success" && data.file_path) {
        window.open(`${process.env.NEXT_PUBLIC_API_URL}/${data.file_path}`, "_blank");
      } else {
        setMessage("Erreur : impossible de générer le PDF.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Une erreur est survenue lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* === HEADER GLOBAL === */}
      <Header />

      {/* === CONTENU PAGE === */}
      <div className="mt-[80px] mb-[100px] flex w-full max-w-[1200px] flex-col items-center space-y-8 px-4 text-center">
        {/* TITRE PRINCIPAL */}
        <h1 className="flex items-center justify-center gap-2 text-4xl font-bold text-[#ffb800]">
          <FileText className="h-10 w-10 text-[#ffb800]" />
          Générer mon Business Plan IA
        </h1>

        <p className="mt-1 max-w-[700px] text-sm text-gray-300">
          Rédige ton texte ou colle le contenu généré par l’IA, puis télécharge ton PDF premium.
        </p>

        {/* TEXTAREA */}
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Exemple : Ce document présente la vision stratégique de mon entreprise numérique..."
          className="h-[250px] w-full max-w-[800px] rounded-xl border border-[#222] bg-[#111] p-4 text-white placeholder-gray-500 shadow-lg focus:ring-2 focus:ring-[#ffb800] focus:outline-none"
        />

        {/* BOUTON STYLE DASHBOARD */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={loading}
          className="btn-luxe-blue mx-auto mt-[20px] flex items-center justify-center px-6 py-3 text-center font-semibold"
        >
          {loading ? (
            "Génération en cours..."
          ) : (
            <>
              ✨ <span className="ml-2">Télécharger le PDF IA</span>
            </>
          )}
        </motion.button>

        {/* MESSAGE D’ÉTAT */}
        {message && <p className="mt-4 text-red-400">{message}</p>}

        {/* DÉCO */}
        <Sparkles className="mt-6 h-6 w-6 animate-pulse text-[#ffb800]" />
      </div>
    </div>
  );
}
