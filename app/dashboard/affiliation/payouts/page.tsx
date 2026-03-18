"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { motion } from "framer-motion";
import AffiliationSubnav from "../components/AffiliationSubnav";

export default function AffiliationPayoutsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center text-center px-6 pt-[120px] bg-[#0a0a0a] text-white">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-3">Paiements & Commissions</h1>
        <p className="text-gray-300">
          60% récurrent à vie tant que l’abonné reste actif. Paiement net 30, le 10 du mois suivant.
        </p>
      </motion.div>

      <AffiliationSubnav />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl w-full mx-auto"
      >
        <CardLuxe className="min-w-[280px] w-full px-6 pt-6 pb-7 text-left">
          <h2 className="text-lg font-semibold text-[#ffb800] mb-3">Règles de commission</h2>
          <ul className="space-y-2 text-gray-200 text-sm leading-relaxed">
            <li>• Commission : <span className="text-yellow-200 font-semibold">60%</span> sur l’abonnement.</li>
            <li>• Récurrente : <span className="text-yellow-200 font-semibold">à vie</span> tant que l’abonné reste actif.</li>
            <li>• Si l’abonné se désabonne : la commission s’arrête.</li>
            <li>• Si remboursement/chargeback : commission annulée pour la période concernée.</li>
          </ul>
        </CardLuxe>

        <CardLuxe className="min-w-[280px] w-full px-6 pt-6 pb-7 text-left">
          <h2 className="text-lg font-semibold text-[#ffb800] mb-3">Calendrier de paiement</h2>
          <ul className="space-y-2 text-gray-200 text-sm leading-relaxed">
            <li>• Délai : <span className="text-yellow-200 font-semibold">net 30</span> (validation anti-fraude/chargeback).</li>
            <li>• Paiement : le <span className="text-yellow-200 font-semibold">10 du mois suivant</span>.</li>
            <li>• Exemple : ventes en Mars → payées le 10 Mai.</li>
            <li>• Seuil minimum recommandé : 50€ (paramétrable plus tard).</li>
          </ul>
        </CardLuxe>

        <CardLuxe className="min-w-[280px] w-full px-6 pt-6 pb-7 text-left lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#ffb800] mb-3">Bonnes pratiques (anti-blocage)</h2>
          <ul className="space-y-2 text-gray-200 text-sm leading-relaxed">
            <li>• Pas de spam (DM massif sans consentement).</li>
            <li>• Pas de promesses irréalistes (“argent garanti”).</li>
            <li>• Pas d’usurpation de marque / pub trompeuse.</li>
            <li>• Le message gagnant : “outil que j’utilise + démo + bénéfices + lien”.</li>
          </ul>
        </CardLuxe>
      </motion.div>

      <p className="mt-10 mb-10 text-xs text-gray-500">© 2026 Le Générateur Digital — Paiements</p>
    </div>
  );
}
