"use client";

import { motion } from "framer-motion";
import { FaShareAlt } from "react-icons/fa";

export default function MulticanalPage() {

  const buttonStyle =
    "mt-4 py-2 px-6 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold rounded-full shadow-lg hover:shadow-yellow-400/40 hover:-translate-y-0.5 transition-all duration-300 w-fit mx-auto";

  return (
    <div className="min-h-screen px-6 pt-[70px] pb-10 text-white bg-[#0a0a0a] flex flex-col items-center">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mb-10"
      >
        <FaShareAlt className="text-6xl mx-auto text-[#ffb800] mb-4 drop-shadow-[0_0_15px_rgba(255,184,0,0.35)]" />
        <h1 className="text-4xl font-bold text-[#ffb800] mb-3">Multicanal IA</h1>
        <p className="text-gray-300 text-lg">
          Préparez automatiquement les formats optimisés pour chaque plateforme.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-[#111] border border-yellow-500/20 rounded-2xl shadow-xl shadow-black/40 p-8 max-w-md w-full text-center"
      >
        <FaShareAlt className="text-3xl mx-auto text-[#ffb800] mb-4" />
        <p className="text-gray-400 text-sm mb-5">
          L'outil multicanal IA arrive bientôt.
        </p>
        <button className={buttonStyle}>Disponible bientôt</button>
      </motion.div>

    </div>
  );
}
