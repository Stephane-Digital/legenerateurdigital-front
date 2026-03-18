"use client";

import CardLuxe from "@/components/ui/CardLuxe";
import { motion } from "framer-motion";
import AffiliationSubnav from "../components/AffiliationSubnav";
import CopyBlock from "../components/CopyBlock";

const LINKS = {
  googleDocs: "https://docs.google.com/document/d/TON_DOC_ID/edit",
  canvaKit: "https://www.canva.com/design/TON_CANVA_ID/view",
};

export default function AffiliationKitPage() {
  // ✅ Force centrage texte + centrage contenu bouton (même si parent text-left)
  const buttonPrimary =
    "inline-flex items-center justify-center text-center whitespace-nowrap w-full max-w-[420px] py-3 px-6 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold rounded-2xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5 transition-all duration-300";

  return (
    <div className="min-h-screen flex flex-col items-center text-center px-6 pt-[120px] bg-[#0a0a0a] text-white">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-3">
          Kit Marketing Affiliation (Officiel)
        </h1>
        <p className="text-gray-300">
          Scripts + campagnes emailing (Google Docs) et visuels officiels (Canva view-only).
        </p>
      </motion.div>

      <AffiliationSubnav />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl w-full mx-auto"
      >
        {/* GOOGLE DOCS */}
        <CardLuxe className="min-w-[280px] w-full px-6 pt-6 pb-7 text-left flex flex-col items-center">
          <div className="w-full text-left">
            <h2 className="text-lg font-semibold text-[#ffb800] mb-2">
              Google Docs — Campagnes & Scripts
            </h2>
            <p className="text-sm text-gray-300 mb-4">
              Séquences emailing, scripts DM, hooks, objections et CTA.
            </p>

            <CopyBlock
              title="Lien Google Docs"
              hint="À ouvrir dans un nouvel onglet"
              text={LINKS.googleDocs}
            />
          </div>

          <div className="mt-6 w-full flex justify-center">
            <a
              href={LINKS.googleDocs}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonPrimary}
            >
              Ouvrir Google Docs
            </a>
          </div>

          <div className="mt-6 w-full rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
            <p className="text-yellow-200 font-semibold text-sm">Conseil</p>
            <p className="mt-1 text-sm text-gray-300">
              Commence par la séquence “7 jours” + 10 DM/jour.
            </p>
          </div>
        </CardLuxe>

        {/* CANVA */}
        <CardLuxe className="min-w-[280px] w-full px-6 pt-6 pb-7 text-left flex flex-col items-center">
          <div className="w-full text-left">
            <h2 className="text-lg font-semibold text-[#ffb800] mb-2">
              Canva — Visuels Officiels (non modifiables)
            </h2>
            <p className="text-sm text-gray-300 mb-4">
              Stories, posts, carrousels, reels covers. Cohérence premium.
            </p>

            <CopyBlock
              title="Lien Canva"
              hint="À ouvrir dans un nouvel onglet"
              text={LINKS.canvaKit}
            />
          </div>

          <div className="mt-6 w-full flex justify-center">
            <a
              href={LINKS.canvaKit}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonPrimary}
            >
              Ouvrir Canva (view-only)
            </a>
          </div>

          <div className="mt-6 w-full rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4">
            <p className="text-yellow-200 font-semibold text-sm">Règle</p>
            <p className="mt-1 text-sm text-gray-300">
              Visuels non modifiables = cohérence de marque + conversion stable.
            </p>
          </div>
        </CardLuxe>
      </motion.div>

      <p className="mt-12 mb-10 text-xs text-gray-500">
        © 2026 Le Générateur Digital — Kit Marketing
      </p>
    </div>
  );
}
