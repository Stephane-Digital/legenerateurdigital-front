"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState("chatgpt");

  const tools = [
    {
      id: "chatgpt",
      label: "ChatGPT",
      desc: "Crée du contenu, rédige des posts, ou optimise tes textes avec l’IA LGD.",
      action: "Lancer ChatGPT intégré",
      link: "#", // tu pourras y mettre ton intégration plus tard
    },
    {
      id: "canva",
      label: "Canva",
      desc: "Conçois des visuels pros pour tes campagnes et publications LGD.",
      action: "Créer avec Canva",
      link: "https://www.canva.com/",
    },
    {
      id: "zapier",
      label: "Zapier",
      desc: "Automatise tes process entre LGD, emails, et réseaux sociaux.",
      action: "Connecter Zapier",
      link: "https://zapier.com/",
    },
    {
      id: "systemeio",
      label: "Système.io",
      desc: "Crée ton tunnel de vente et gère ton business avec Système.io.",
      action: "Créer un compte GRATUIT!",
      link: "https://systeme.io/?sa=sa123456", // https://systeme.io/fr?sa=sa0002231987aa1d615980fb12bbe9e2d52bd9dfd110
    },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl my-[10px] px-6">
      <h2 className="text-center text-3xl font-extrabold text-white mb-[30px]">
        Outils intelligents LGD
      </h2>

      {/* Onglets */}
      <div className="flex justify-center gap-[20px] mb-[40px] flex-wrap">
        {tools.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-[25px] py-[12px] rounded-md font-semibold transition-all duration-300 border-b-2 ${
              activeTab === tab.id
                ? "text-[#ffb800] border-[#ffb800]"
                : "text-gray-300 border-transparent hover:text-[#ffb800]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Carte active */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#0d2a3b]/90 text-center rounded-[12px] border border-[#184b6e] shadow-lg py-[40px] px-[60px] max-w-[600px] mx-auto"
      >
        {tools.map(
          (tool) =>
            tool.id === activeTab && (
              <div key={tool.id}>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffb800] to-[#ff6b00] mb-3">
                  {tool.label}
                </h3>
                <p className="text-cyan-200 mb-6">{tool.desc}</p>
                <Link
                  href={tool.link}
                  target="_blank"
                  className="inline-block bg-gradient-to-r from-[#ffb800] to-[#ff6b00] text-[#0a2230] font-bold px-6 py-3 rounded-md hover:opacity-90 transition"
                >
                  {tool.action}
                </Link>
              </div>
            )
        )}
      </motion.div>
    </section>
  );
}
