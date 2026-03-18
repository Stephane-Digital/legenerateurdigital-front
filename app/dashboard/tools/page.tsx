"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaBrain, FaCogs, FaLink, FaMagic } from "react-icons/fa";

export default function ToolsPage() {
  const router = useRouter();

  const cardStyle =
    "bg-[#111] border border-yellow-500/20 rounded-2xl shadow-lg shadow-black/40 hover:shadow-yellow-500/20 transition-all duration-300 p-6 flex flex-col justify-between hover:-translate-y-1";

  const iconStyle = "text-4xl mb-3 text-[#ffb800] drop-shadow-[0_0_10px_rgba(255,184,0,0.35)]";

  const buttonStyle =
    "mt-4 py-2 px-6 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold rounded-full shadow-lg hover:shadow-yellow-400/40 hover:-translate-y-0.5 transition-all duration-300 w-fit mx-auto";

  return (
    <div className="min-h-screen flex flex-col items-center justify-start text-center pt-[60px] px-6 bg-[#0a0a0a] text-white">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto mb-12"
      >
        <h1 className="text-4xl font-bold text-[#ffb800] drop-shadow-[0_0_12px_rgba(255,184,0,0.3)]">
          🛠️ Outils LGD
        </h1>
        <p className="text-gray-300 text-base mt-3">
          Accédez aux intégrations essentielles : IA, design, automatisation & funnels.
        </p>
      </motion.div>

      {/* GRILLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-4xl mx-auto">

        {/* ChatGPT */}
        <div className={cardStyle}>
          <div className="flex flex-col items-center">
            <FaBrain className={iconStyle} />
            <h3 className="text-xl font-bold text-[#ffb800]">ChatGPT Assistant</h3>
            <p className="text-gray-400 mt-1 text-sm">
              Génère prompts, scripts et contenus IA.
            </p>
          </div>

          <button onClick={() => router.push("/dashboard/tools/chatgpt")} className={buttonStyle}>
            Ouvrir
          </button>
        </div>

        {/* Canva */}
        <div className={cardStyle}>
          <div className="flex flex-col items-center">
            <FaMagic className={iconStyle} />
            <h3 className="text-xl font-bold text-[#ffb800]">Canva Design</h3>
            <p className="text-gray-400 mt-1 text-sm">
              Crée visuels & carrousels premium.
            </p>
          </div>

          <button onClick={() => router.push("/dashboard/tools/canva")} className={buttonStyle}>
            Ouvrir
          </button>
        </div>

        {/* Zapier */}
        <div className={cardStyle}>
          <div className="flex flex-col items-center">
            <FaCogs className={iconStyle} />
            <h3 className="text-xl font-bold text-[#ffb800]">Zapier Automations</h3>
            <p className="text-gray-400 mt-1 text-sm">
              Connecte LGD à des centaines d’apps.
            </p>
          </div>

          <button onClick={() => router.push("/dashboard/tools/zapier")} className={buttonStyle}>
            Ouvrir
          </button>
        </div>

        {/* Systeme.io */}
        <div className={cardStyle}>
          <div className="flex flex-col items-center">
            <FaLink className={iconStyle} />
            <h3 className="text-xl font-bold text-[#ffb800]">Systeme.io</h3>
            <p className="text-gray-400 mt-1 text-sm">
              Gère et publie tes funnels & campagnes.
            </p>
          </div>

          <button onClick={() => router.push("/dashboard/tools/systemeio")} className={buttonStyle}>
            Ouvrir
          </button>
        </div>

      </div>
    </div>
  );
}
