"use client";

import { motion } from "framer-motion";

interface StepContentProps {
  step: number;
}

export default function StepContent({ step }: StepContentProps) {
  const fade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <motion.div
      key={step}
      initial={fade.initial}
      animate={fade.animate}
      transition={fade.transition}
      className="text-center text-gray-300 max-w-2xl mx-auto leading-relaxed pt-4"
    >
      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">
            1️⃣ Présentez votre activité
          </h2>
          <p className="mb-4">
            Décrivez brièvement votre activité afin que LGD puisse analyser
            automatiquement le statut le plus adapté.
          </p>
          <p className="text-sm text-gray-400">
            Exemple : “Vente de formations en ligne”, “Prestation de service
            marketing”, “Photographe freelance”, etc.
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">
            2️⃣ Analyse automatisée
          </h2>
          <p className="mb-4">
            LGD analyse votre profil, votre secteur d'activité et vos besoins
            pour déterminer les statuts recommandés.
          </p>
          <p className="text-sm text-gray-400">
            Pas d’inquiétude : cette étape est 100% guidée.
          </p>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">
            3️⃣ Résultats personnalisés
          </h2>
          <p className="mb-4">
            Découvrez le statut idéal selon votre activité, vos revenus
            estimés et vos obligations futures.
          </p>
          <div className="mt-4 text-left bg-black/30 p-4 rounded-xl border border-yellow-500/20">
            <p className="text-gray-200">
              🔍 <strong>Auto-entrepreneur</strong> — idéal pour démarrer,
              simplicité administrative, charges réduites.
            </p>
            <p className="mt-2 text-gray-200">
              🧾 <strong>EURL / SASU</strong> — parfait pour scaler, meilleure
              protection et crédibilité professionnelle.
            </p>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">
            4️⃣ Récapitulatif + Export
          </h2>
          <p className="mb-4">
            Vous pourrez exporter un PDF récapitulatif professionnel avec les
            recommandations, les obligations légales, les aides disponibles
            et les étapes officielles à suivre.
          </p>
          <p className="text-sm text-gray-400">
            (Le module PDF sera ajouté ensuite dans la V2)
          </p>
        </>
      )}
    </motion.div>
  );
}
