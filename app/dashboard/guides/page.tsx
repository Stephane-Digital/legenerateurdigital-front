"use client";

import { useState, useEffect } from "react";
import { Loader2, FileDown, CheckCircle2 } from "lucide-react";

export default function GuidesPage() {
  const [guides, setGuides] = useState<{ key: string; title: string }[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await fetch(`${API_URL}/guides/list`);
        const data = await res.json();
        setGuides(data.guides);
      } catch (err) {
        setError("Impossible de charger la liste des guides.");
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    fetchGuides();
  }, [API_URL]);

  const handleDownload = async () => {
    if (!selectedGuide) return;

    setDownloading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_URL}/guides/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guide: selectedGuide,
          include_checklist: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur : ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guide_${selectedGuide}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setSuccess("✅ Guide téléchargé avec succès !");
    } catch (err: any) {
      setError("Une erreur est survenue lors de la génération du PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 text-white">
      {/* ---- HEADER ---- */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="mb-4 text-3xl font-bold text-yellow-400 md:mb-0">
          📚 Guides & Documents Officiels
        </h1>
        <p className="text-sm text-gray-400">Génère et télécharge les guides pratiques en PDF</p>
      </div>

      {/* ---- ZONE DE CONTENU ---- */}
      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="animate-spin text-yellow-400" size={32} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((g) => (
            <div
              key={g.key}
              onClick={() => setSelectedGuide(g.key)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                selectedGuide === g.key
                  ? "border-yellow-400 bg-yellow-500/10"
                  : "border-gray-700 hover:border-yellow-400"
              }`}
            >
              <h2 className="mb-2 text-xl font-semibold text-yellow-300">{g.title}</h2>
              <p className="text-sm text-gray-400">
                {g.key === "urssaf"
                  ? "Procédure complète pour te déclarer en micro-entreprise."
                  : "Comparatif clair pour choisir ton statut juridique."}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ---- ACTION ---- */}
      {selectedGuide && (
        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black transition-all hover:bg-yellow-600 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Génération du guide...
              </>
            ) : (
              <>
                <FileDown size={18} />
                Télécharger le PDF
              </>
            )}
          </button>

          {success && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
