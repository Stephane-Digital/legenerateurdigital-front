"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaBalanceScale } from "react-icons/fa";

export default function ChoisirStatutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-16 flex flex-col items-center">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center mb-10"
      >
        <FaBalanceScale className="text-[#ffb800] text-5xl mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,184,0,0.45)]" />
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">
          Choisir le bon statut juridique
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          Répondez à quelques questions rapides et laissez l’IA vous guider vers
          le statut le plus adapté à votre activité.
        </p>
      </motion.div>

      {/* CARTE ACTION */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="
          bg-[#111]
          border border-[#2a2a2a]
          rounded-2xl
          p-8
          w-full
          max-w-xl
          text-center
          shadow-lg shadow-black/40
        "
      >
        <h2 className="text-xl font-semibold text-[#ffb800] mb-4">
          Assistant IA – Questionnaire Statut
        </h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Cet assistant analyse votre situation, vos objectifs, et votre mode de
          travail pour recommander le statut le plus optimal.
        </p>

        <button
          onClick={() => router.push("/dashboard/business/choisir-statut/stepper")}
          className="
            flex items-center justify-center gap-2
            w-full py-3
            bg-gradient-to-r from-[#ffb800] to-[#ffcc4d]
            text-black font-semibold
            rounded-2xl
            shadow-lg shadow-yellow-600/30
            hover:shadow-yellow-400/50
            hover:-translate-y-0.5
            transition-all duration-300
          "
        >
          Commencer le questionnaire
          <FaArrowRight />
        </button>
      </motion.div>

    </div>
  );
}
