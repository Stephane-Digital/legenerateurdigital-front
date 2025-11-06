"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/dashboard/Header";
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/export_pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Business Plan IA",
            content: texte,
          }),
        }
      );

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
    <div className="w-full flex flex-col items-center">
      {/* === HEADER GLOBAL === */}
      <Header />

      {/* === CONTENU PAGE === */}
      <div className="w-full max-w-[1200px] flex flex-col items-center text-center space-y-8 mt-[80px] mb-[100px] px-4">
        {/* TITRE PRINCIPAL */}
        <h1 className="text-4xl font-bold text-[#ffb800] flex items-center justify-center gap-2">
          <FileText className="text-[#ffb800] w-10 h-10" />
          Générer mon Business Plan IA
        </h1>

        <p className="text-gray-300 text-sm mt-1 max-w-[700px]">
          Rédige ton texte ou colle le contenu généré par l’IA, puis télécharge ton
          PDF premium.
        </p>

        {/* TEXTAREA */}
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Exemple : Ce document présente la vision stratégique de mon entreprise numérique..."
          className="w-full max-w-[800px] h-[250px] bg-[#111] border border-[#222] text-white p-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ffb800] placeholder-gray-500"
        />

        {/* BOUTON STYLE DASHBOARD */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={loading}
          className="mt-[20px] btn-luxe-blue flex justify-center items-center text-center mx-auto px-6 py-3 font-semibold"
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
        {message && <p className="text-red-400 mt-4">{message}</p>}

        {/* DÉCO */}
        <Sparkles className="text-[#ffb800] w-6 h-6 mt-6 animate-pulse" />
      </div>
    </div>
  );
}
