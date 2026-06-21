"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { motion } from "framer-motion";
import AffiliationSubnav from "../components/AffiliationSubnav";

const buttonPrimary =
  "inline-flex items-center justify-center text-center whitespace-nowrap w-full sm:w-auto min-w-[240px] py-3 px-6 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold rounded-2xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5 transition-all duration-300";

export default function AffiliationAcademyPage() {
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
            Académie Ambassadeur LGD
          </h1>
          <p className="mx-auto max-w-3xl text-sm text-gray-300 leading-relaxed sm:text-base">
            Le parcours de formation ambassadeur arrive ici. Cette page évite la confusion avec le Kit Marketing LGD déjà disponible dans le Centre de Croissance Ambassadeur.
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
                Bientôt disponible
              </p>
              <h2 className="text-2xl font-bold leading-tight text-[#ffb800] sm:text-3xl lg:text-4xl">
                L’Académie Ambassadeur va devenir le parcours guidé pour apprendre à promouvoir LGD.
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-sm text-gray-300 leading-relaxed sm:text-base">
                Le Kit Marketing contient les ressources prêtes à utiliser. L’Académie, elle, servira à structurer l’apprentissage : positionnement, messages, prospection, contenus, lives, relances et passage à l’action.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 lg:flex-row">
              <a href="/dashboard/affiliation/kit" className={buttonPrimary}>
                Ouvrir le Kit Marketing LGD
              </a>

              <a href="/dashboard/affiliation" className={buttonPrimary}>
                Retour au Centre Ambassadeur
              </a>
            </div>
          </CardLuxe>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <CardLuxe className="w-full px-6 pb-7 pt-6 text-left">
              <h3 className="text-xl font-semibold text-[#ffb800]">
                Futur contenu prévu
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Comprendre LGD",
                  "Positionner l’offre",
                  "Créer son message",
                  "Présenter l’essai 7 jours",
                  "Utiliser les scripts",
                  "Poster sans vendre agressivement",
                  "Faire un live simple",
                  "Relancer proprement",
                  "Suivre ses commissions",
                  "Tenir dans la durée",
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
              <h3 className="text-xl font-semibold text-[#ffb800]">
                Rôle de cette page
              </h3>

              <div className="mt-5 space-y-4">
                {[
                  {
                    title: "1) Séparer clairement kit et formation",
                    text: "Le Kit Marketing reste l’espace des ressources prêtes à copier. L’Académie sera l’espace d’apprentissage.",
                  },
                  {
                    title: "2) Éviter les doublons",
                    text: "Le bouton Académie ne renvoie plus vers le Kit Marketing afin de ne pas créer de confusion.",
                  },
                  {
                    title: "3) Préparer la future V1",
                    text: "Cette page pose une base propre pour ajouter ensuite les modules de formation ambassadeur.",
                  },
                ].map((step) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-yellow-200 sm:text-base">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </CardLuxe>
          </div>
        </motion.div>

        <p className="mt-12 text-center text-xs text-gray-500">
          © 2026 Le Générateur Digital — Académie Ambassadeur
        </p>
      </div>
    </div>
  );
}
