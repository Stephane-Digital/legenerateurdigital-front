"use client";

import { motion } from "framer-motion";
import CardLuxe from "@/components/ui/CardLuxe";
import AffiliationSubnav from "../components/AffiliationSubnav";

const GOOGLE_DOCS_LINK =
  "https://docs.google.com/document/d/17VMKD7tfE1lLoMI9GGFF2NzgLy1MQxi00Rs2wPBRyxY/edit?usp=sharing";

const CANVA_LINK = "https://canva.link/t5x0lkqdf3z76v4";

const buttonPrimary =
  "inline-flex items-center justify-center text-center whitespace-nowrap w-full sm:w-auto min-w-[240px] py-3 px-6 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold rounded-2xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5 transition-all duration-300";

export default function AffiliationKitPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-12 pt-[120px] text-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-6 max-w-4xl text-center"
        >
          <h1 className="mb-3 text-3xl font-bold text-yellow-400 sm:text-4xl lg:text-5xl">
            Kit Marketing Affiliation LGD
          </h1>
          <p className="mx-auto max-w-3xl text-sm text-gray-300 leading-relaxed sm:text-base">
            Tout le contenu marketing affilié LGD est désormais centralisé dans un Google Docs
            premium, plus simple à consulter, copier et mettre à jour.
          </p>
        </motion.div>

        <AffiliationSubnav />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="space-y-8"
        >
          <CardLuxe className="w-full px-6 pb-8 pt-8 text-center sm:px-8">
            <div className="mx-auto max-w-4xl">
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-yellow-300/80">
                Affiliate Conversion Hub
              </p>
              <h2 className="text-2xl font-bold leading-tight text-[#ffb800] sm:text-3xl lg:text-4xl">
                Accède à tout ton kit marketing affilié depuis un document central unique.
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-300 leading-relaxed sm:text-base">
                Emails, scripts DM, hooks, CTA, posts réseaux sociaux, angles de vente, scripts
                Reels et ressources de promotion : tout est regroupé dans le Google Docs officiel.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 lg:flex-row">
              <a
                href={GOOGLE_DOCS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonPrimary}
              >
                Ouvrir le Google Docs
              </a>

              <a
                href={CANVA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonPrimary}
              >
                Ouvrir les visuels Canva
              </a>
            </div>
          </CardLuxe>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <CardLuxe className="w-full px-6 pb-7 pt-6 text-left">
              <h3 className="text-xl font-semibold text-[#ffb800]">Contenu du document</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base">
                Le document contient l’ensemble du kit marketing affilié LGD prêt à l’emploi :
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Emails prêts à envoyer",
                  "DM Instagram / Messenger",
                  "Scripts WhatsApp",
                  "Scripts LinkedIn",
                  "Posts réseaux sociaux",
                  "Hooks courts",
                  "CTA affiliés",
                  "Promesses et angles de vente",
                  "Scripts Reels / Stories",
                  "Structure de conversion",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-3 text-sm text-yellow-100"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </CardLuxe>

            <CardLuxe className="w-full px-6 pb-7 pt-6 text-left">
              <h3 className="text-xl font-semibold text-[#ffb800]">Utilisation recommandée</h3>

              <div className="mt-5 space-y-4">
                {[
                  {
                    title: "1) Ouvre le Google Docs",
                    text: "Choisis le type de contenu dont tu as besoin selon ton canal de promotion.",
                  },
                  {
                    title: "2) Copie le script adapté",
                    text: "Sélectionne un email, un DM, un hook, un post ou un script Reel selon ton objectif.",
                  },
                  {
                    title: "3) Ajoute ton lien affilié",
                    text: "Utilise toujours ton lien affilié officiel dans tes messages et publications.",
                  },
                  {
                    title: "4) Passe à l’action",
                    text: "Publie, envoie ou relance rapidement sans surcharger l’interface LGD.",
                  },
                ].map((step) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-yellow-200 sm:text-base">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">{step.text}</p>
                  </div>
                ))}
              </div>
            </CardLuxe>
          </div>
        </motion.div>

        <p className="mt-12 text-center text-xs text-gray-500">
          © 2026 Le Générateur Digital — Kit Marketing Affiliation
        </p>
      </div>
    </div>
  );
}
