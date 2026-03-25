"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CardLuxe from "@/components/ui/CardLuxe";
import { FaEnvelopeOpenText } from "react-icons/fa";

export default function LeadEngineBlock() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto mt-10"
    >
      <CardLuxe className="px-6 py-8 text-center flex flex-col items-center">
        <FaEnvelopeOpenText className="text-4xl text-[#ffb800] drop-shadow-[0_0_12px_rgba(255,184,0,0.35)]" />

        <h2 className="mt-4 text-2xl font-extrabold text-[#ffb800]">
          Générateur de Leads IA
        </h2>

        <p className="mt-3 text-white/70 max-w-[600px]">
          Transforme ton contenu en machine à capturer des emails.
          Crée automatiquement un lead magnet, une page de capture et
          des CTA optimisés pour convertir.
        </p>

        <div className="mt-4 text-sm text-yellow-300">
          🔥 Fonction révolutionnaire — bientôt disponible
        </div>

        <button
          onClick={() => alert("Bientôt disponible")}
          className="mt-6 rounded-2xl px-6 py-3 font-semibold bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black hover:shadow-lg"
        >
          Découvrir
        </button>
      </CardLuxe>
    </motion.div>
  );
}
