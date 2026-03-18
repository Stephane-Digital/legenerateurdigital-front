"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { motion } from "framer-motion";
import AffiliationSubnav from "./components/AffiliationSubnav";
import CopyBlock from "./components/CopyBlock";

export default function AffiliationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center text-center px-6 pt-[120px] bg-[#0a0a0a] text-white">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-3">Affiliation LGD</h1>
        <p className="text-gray-300">
          Gagne{" "}
          <span className="text-yellow-200 font-semibold">60% de commission récurrente à vie</span>{" "}
          tant que l’abonné reste actif. Paiement : net 30, le 10 du mois suivant.
        </p>
      </motion.div>

      <AffiliationSubnav />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl w-full mx-auto"
      >
        {/* TON LIEN */}
        <CardLuxe className="min-w-[280px] w-full px-6 pt-6 pb-7 text-left">
          <h2 className="text-lg font-semibold text-[#ffb800] mb-3">Ton lien d’affiliation</h2>
          <p className="text-sm text-gray-300 mb-4">
            Colle ici ton lien personnel (à connecter plus tard au backend). Pour l’instant, utilise ton lien externe.
          </p>

          <CopyBlock
            title="Lien"
            hint="Remplace par ton lien réel"
            text="https://lgd.app/?ref=TONCODE"
          />

          <div className="mt-4 rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
            <p className="text-yellow-200 font-semibold text-sm">Règle d’or</p>
            <p className="mt-1 text-sm text-gray-300">
              Affiliation = accessible sans abonnement. Les modules IA restent réservés aux abonnés (tokens).
            </p>
          </div>
        </CardLuxe>

        {/* COMMENT ÇA MARCHE */}
        <CardLuxe className="min-w-[280px] w-full px-6 pt-6 pb-7 text-left">
          <h2 className="text-lg font-semibold text-[#ffb800] mb-3">Comment ça marche</h2>

          <div className="space-y-3 text-sm text-gray-200">
            <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
              <p className="text-yellow-200 font-semibold">1) Partage ton lien</p>
              <p className="mt-1 text-gray-300">Sur tes réseaux, par DM, par email.</p>
            </div>
            <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
              <p className="text-yellow-200 font-semibold">2) Un abonné s’inscrit</p>
              <p className="mt-1 text-gray-300">Il choisit un plan Essentiel / Pro / Ultime.</p>
            </div>
            <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
              <p className="text-yellow-200 font-semibold">3) Tu touches 60% de commission  chaque mois</p>
              <p className="mt-1 text-gray-300">Tant que l’abonné reste actif (style Systeme.io).</p>
            </div>
            <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
              <p className="text-yellow-200 font-semibold">4) Paiement</p>
              <p className="mt-1 text-gray-300">Net 30 jours, le 10 du mois suivant.</p>
            </div>
          </div>

          {/* ✅ Boutons supprimés comme demandé */}
          <div className="mt-6 rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
            <p className="text-sm text-gray-300">
              👉 Va dans <span className="text-yellow-200 font-semibold">Kit Marketing</span> pour récupérer les ressources
              (Google Docs + Canva) et publier dès aujourd’hui.
            </p>
          </div>
        </CardLuxe>

        {/* QUICK START */}
        <CardLuxe className="min-w-[280px] w-full px-6 pt-6 pb-7 text-left lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#ffb800] mb-3">Quick Start (5 minutes)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
              <p className="text-yellow-200 font-semibold">Étape 1</p>
              <p className="mt-1 text-gray-300">Copie ton lien</p>
            </div>
            <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
              <p className="text-yellow-200 font-semibold">Étape 2</p>
              <p className="mt-1 text-gray-300">Choisis 1 script prêt</p>
            </div>
            <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
              <p className="text-yellow-200 font-semibold">Étape 3</p>
              <p className="mt-1 text-gray-300">Publie + DM + CTA lien</p>
            </div>
          </div>
        </CardLuxe>
      </motion.div>

      <p className="mt-10 mb-10 text-xs text-gray-500">© 2026 Le Générateur Digital — Affiliation</p>
    </div>
  );
}
