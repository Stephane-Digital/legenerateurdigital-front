"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { FaEnvelope } from "react-icons/fa";

type LeadEngineBlockProps = {
  onDiscover: () => void;
};

export default function LeadEngineBlock({ onDiscover }: LeadEngineBlockProps) {
  return (
    <CardLuxe className="min-h-[230px] flex flex-col items-center justify-between px-6 py-6 text-center">
      <div className="flex flex-col items-center">
        <FaEnvelope className="text-4xl text-[#ffb800] drop-shadow-[0_0_12px_rgba(255,184,0,0.35)]" />
        <h3 className="mt-3 text-xl font-bold text-[#ffb800]">
          Générateur de Leads IA
        </h3>
        <p className="mt-2 text-white/70 max-w-[420px]">
          Transforme ton contenu en machine à capturer des emails.
        </p>
      </div>

      <div className="w-full mt-6">
        <button
          type="button"
          onClick={onDiscover}
          className="w-full rounded-2xl px-5 py-3 font-semibold border border-yellow-600/25 bg-[#0b0b0b] text-white/85 hover:bg-yellow-500/10 transition-all"
        >
          Accéder
        </button>
      </div>
    </CardLuxe>
  );
}
