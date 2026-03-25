"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { FaEnvelopeOpenText } from "react-icons/fa";

type LeadEngineBlockProps = {
  onDiscover?: () => void;
};

export default function LeadEngineBlock({ onDiscover }: LeadEngineBlockProps) {
  return (
    <CardLuxe className="min-h-[230px] flex flex-col items-center justify-between px-6 py-6 text-center">
      <div className="flex flex-col items-center">
        <FaEnvelopeOpenText className="text-4xl text-[#ffb800] drop-shadow-[0_0_12px_rgba(255,184,0,0.35)]" />

        <h3 className="mt-3 text-xl font-bold text-[#ffb800]">
          Générateur de Leads IA
        </h3>

        <p className="mt-2 text-white/70 max-w-[420px]">
          Transforme ton contenu en machine à capturer des emails.
          Crée automatiquement un lead magnet, une page de capture et
          des CTA optimisés pour convertir.
        </p>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-3 py-1 text-[12px] text-white/60">
          <span className="text-yellow-300">⚡</span>
          Fonction révolutionnaire — Maintenant disponible
        </div>
      </div>

      <div className="w-full mt-6">
        <button
          type="button"
          onClick={onDiscover}
          className="w-full rounded-2xl px-5 py-3 font-semibold bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
        >
          Découvrir
        </button>
      </div>
    </CardLuxe>
  );
}
