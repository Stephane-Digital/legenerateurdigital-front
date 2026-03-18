"use client";

import { NETWORK_LABELS, SOCIAL_FORMATS } from "@/lib/socialFormats";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export default function SocialMediaPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ✅ FIX TS: on évite des types manquants (FormatKey/NetworkKey non exportés)
  const [reseau, setReseau] = useState<string>("instagram");
  const [format, setFormat] = useState<string>("post_square");

  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ FIX TS: SOCIAL_FORMATS indexé dynamiquement => any[]
  const formatsForNetwork = useMemo<any[]>(() => {
    const all = SOCIAL_FORMATS as any;
    return (all?.[reseau] as any[]) || [];
  }, [reseau]);

  // ✅ FIX TS: find sur any[]
  const currentFmt = useMemo<any | null>(() => {
    return formatsForNetwork.find((f: any) => f?.key === format) || null;
  }, [formatsForNetwork, format]);

  const onPick = () => fileRef.current?.click();

  const onFileChange = (file: File) => {
    setImgFile(file);
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setResizedUrl(null);
  };

  const resizeImage = async () => {
    if (!imgUrl || !currentFmt) return;

    setLoading(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = Number(currentFmt.width);
      canvas.height = Number(currentFmt.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas error");

      // COVER resize (remplissage sans bandes)
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, w, h);

      const out = canvas.toDataURL("image/png", 1.0);
      setResizedUrl(out);
    } catch (e) {
      console.error(e);
      alert("Erreur de redimensionnement.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResized = () => {
    if (!resizedUrl || !currentFmt) return;
    const a = document.createElement("a");
    a.href = resizedUrl;
    a.download = `${reseau}-${currentFmt.key}-${currentFmt.width}x${currentFmt.height}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen pt-20 px-6 bg-[#0a0a0a] text-white flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-4xl w-full mb-8"
      >
        <button
          onClick={() =>
            router.push("/dashboard/automatisations/reseaux_sociaux")
          }
          className="text-sm text-yellow-400 hover:text-yellow-300 mb-4"
        >
          ← Retour au module Réseaux sociaux
        </button>

        <h1 className="text-3xl font-bold mb-2 text-yellow-400">
          Media & formats réseaux sociaux
        </h1>
        <p className="text-gray-300">
          Importe une image, choisis un format standard, et LGD te la
          redimensionne automatiquement.
        </p>
      </motion.div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start text-left">
        {/* Controls */}
        <div className="bg-[#111] border border-yellow-400/20 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-yellow-300 mb-6">
            Choix réseau & format
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm mb-2">Réseau</label>
              <select
                value={reseau} // ✅ FIX TS: string
                onChange={(e) => {
                  const n = e.target.value as string;
                  setReseau(n);

                  // ✅ FIX TS: reset format vers 1er format dispo
                  const nextFormats = ((SOCIAL_FORMATS as any)?.[n] as any[]) || [];
                  const nextKey = nextFormats?.[0]?.key || "post_square";
                  setFormat(String(nextKey));

                  setResizedUrl(null);
                }}
                className="w-full bg-[#1a1a1a] p-3 rounded-lg border border-gray-700 text-white"
              >
                {Object.entries(NETWORK_LABELS as any).map(([k, v]) => (
                  <option key={k} value={k}>
                    {String(v)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Format</label>
              <select
                value={format} // ✅ FIX TS: string
                onChange={(e) => {
                  setFormat(e.target.value as string);
                  setResizedUrl(null);
                }}
                className="w-full bg-[#1a1a1a] p-3 rounded-lg border border-gray-700 text-white"
              >
                {/* ✅ FIX TS: map sur any[] */}
                {formatsForNetwork.map((f: any) => (
                  <option key={String(f.key)} value={String(f.key)}>
                    {String(f.label)} — {String(f.ratio)}
                  </option>
                ))}
              </select>

              {currentFmt && (
                <p className="text-xs text-gray-400 mt-2">
                  {currentFmt.width}×{currentFmt.height}px • Ratio{" "}
                  {currentFmt.ratio}
                </p>
              )}
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
            }}
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onPick}
              className="flex-1 bg-[#111] border border-yellow-500/30 text-yellow-300 font-semibold px-4 py-2 rounded-xl hover:bg-[#1a1a1a] transition-all"
            >
              📥 Importer une image
            </button>

            <button
              onClick={resizeImage}
              disabled={!imgFile || loading}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-yellow-400/30 transition-all disabled:opacity-60"
            >
              {loading ? "Redimensionnement…" : "✨ Redimensionner"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Redimensionnement “cover” : la zone est remplie automatiquement,
            sans bandes, en gardant le ratio.
          </p>
        </div>

        {/* Preview */}
        <div className="bg-[#0f0f0f] border border-yellow-400/20 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-yellow-300 mb-6">Aperçu</h2>

          {!imgUrl ? (
            <div className="text-gray-500 text-sm">
              Importe une image pour voir l’aperçu.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Original</p>
                <img
                  src={imgUrl}
                  alt="original"
                  className="w-full rounded-xl border border-yellow-400/10"
                />
              </div>

              {resizedUrl && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Redimensionné</p>
                  <img
                    src={resizedUrl}
                    alt="resized"
                    className="w-full rounded-xl border border-yellow-400/20"
                  />

                  <button
                    onClick={downloadResized}
                    className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-yellow-400/30 transition-all"
                  >
                    ⬇️ Télécharger le fichier
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
