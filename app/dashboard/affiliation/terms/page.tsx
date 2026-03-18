"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { motion } from "framer-motion";
import AffiliationSubnav from "../components/AffiliationSubnav";

export default function AffiliationTermsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center text-center px-6 pt-[120px] bg-[#0a0a0a] text-white">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-3">Conditions — Affiliation LGD</h1>
        <p className="text-gray-300">
          Règles de participation, anti-fraude, calendrier de paiement. À valider juridiquement si besoin.
        </p>
      </motion.div>

      <AffiliationSubnav />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        className="max-w-6xl w-full mx-auto"
      >
        <CardLuxe className="w-full px-6 pt-6 pb-7 text-left">
          <h2 className="text-lg font-semibold text-[#ffb800] mb-3">1) Objet</h2>
          <p className="text-gray-200 text-sm leading-relaxed">
            Le programme d’affiliation LGD permet de recommander LGD et de percevoir une commission récurrente
            à vie tant que les abonnés référés restent actifs.
          </p>

          <h2 className="text-lg font-semibold text-[#ffb800] mt-6 mb-3">2) Commission</h2>
          <ul className="space-y-2 text-gray-200 text-sm leading-relaxed">
            <li>• Taux : 60% sur l’abonnement (selon les règles commerciales en vigueur).</li>
            <li>• Récurrent : chaque mois tant que l’abonné reste actif.</li>
            <li>• Annulation : remboursements/chargebacks peuvent annuler la commission.</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#ffb800] mt-6 mb-3">3) Paiement</h2>
          <ul className="space-y-2 text-gray-200 text-sm leading-relaxed">
            <li>• Délai : net 30 (validation).</li>
            <li>• Versement : le 10 du mois suivant.</li>
            <li>• Seuil : un minimum de paiement peut être appliqué (ex : 50€).</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#ffb800] mt-6 mb-3">4) Attribution</h2>
          <ul className="space-y-2 text-gray-200 text-sm leading-relaxed">
            <li>• Attribution via lien d’affiliation (cookie, last click).</li>
            <li>• En cas de fraude ou attribution abusive : suspension.</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#ffb800] mt-6 mb-3">5) Interdictions</h2>
          <ul className="space-y-2 text-gray-200 text-sm leading-relaxed">
            <li>• Spam (emails/DM non sollicités de masse).</li>
            <li>• Publicité trompeuse, fausses promesses, faux avis.</li>
            <li>• Usurpation de marque, imitation du site, domain squatting.</li>
            <li>• Brand bidding (achat de mots-clés “LGD” si interdit dans la policy future).</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#ffb800] mt-6 mb-3">6) Suspension / résiliation</h2>
          <p className="text-gray-200 text-sm leading-relaxed">
            LGD se réserve le droit de suspendre/résilier un affilié en cas de non-respect des règles,
            fraude, ou pratiques nuisibles.
          </p>

          <p className="mt-6 text-xs text-gray-400">
            Version UI : texte à relire/valider selon ton cadre juridique et ton moyen de paiement (Stripe, etc.).
          </p>
        </CardLuxe>
      </motion.div>

      <p className="mt-10 mb-10 text-xs text-gray-500">© 2026 Le Générateur Digital — Conditions</p>
    </div>
  );
}
