"use client";

import { motion } from "framer-motion";
import { useState } from "react";

// Icônes premium dorées
import { FaCheckCircle, FaCircle } from "react-icons/fa";

function StepContentView({ step }: { step: number }) {
  return (
    <div className="w-full rounded-2xl border border-yellow-500/20 bg-black/40 p-6">
      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[#ffb800]">
            Étape 1 — Votre activité
          </h3>
          <p className="text-gray-300">
            Décris ton activité (type de service/produit, volume estimé, etc.).
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[#ffb800]">
            Étape 2 — Votre situation
          </h3>
          <p className="text-gray-300">
            Indique ta situation actuelle (salarié, étudiant, déjà entrepreneur,
            etc.).
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[#ffb800]">
            Étape 3 — Recommandation IA
          </h3>
          <p className="text-gray-300">
            LGD analysera tes réponses et te proposera le statut le plus adapté.
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[#ffb800]">
            Étape 4 — Résumé final
          </h3>
          <p className="text-gray-300">
            Récapitulatif de ton choix + prochaines actions (feature à finaliser).
          </p>
        </div>
      )}
    </div>
  );
}

export default function StepperStatut() {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, label: "Votre activité" },
    { id: 2, label: "Votre situation" },
    { id: 3, label: "Recommandation IA" },
    { id: 4, label: "Résumé final" },
  ];

  const nextStep = () => {
    if (step < steps.length) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ============================ STEP HEADER ============================ */}
      <div className="flex justify-between items-center mb-10">
        {steps.map((s) => (
          <div key={s.id} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: step === s.id ? 1.1 : 1,
                opacity: 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {step > s.id ? (
                <FaCheckCircle className="text-[#ffb800] text-3xl drop-shadow-[0_0_8px_rgba(255,184,0,0.4)]" />
              ) : step === s.id ? (
                <FaCircle className="text-[#ffb800] text-3xl drop-shadow-[0_0_8px_rgba(255,184,0,0.4)]" />
              ) : (
                <FaCircle className="text-gray-600 text-3xl" />
              )}
            </motion.div>

            <p
              className={`mt-2 text-sm ${
                step === s.id ? "text-[#ffb800]" : "text-gray-400"
              }`}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ============================ CONTENU DE L’ÉTAPE ============================ */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StepContentView step={step} />
      </motion.div>

      {/* ============================ BOUTONS ============================ */}
      <div className="flex justify-between mt-10">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="px-5 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition"
          >
            ⬅ Retour
          </button>
        ) : (
          <div />
        )}

        {step < steps.length ? (
          <button
            onClick={nextStep}
            className="
              px-6 py-2
              rounded-lg
              bg-gradient-to-r from-[#ffb800] to-[#ffcc4d]
              text-black font-semibold
              shadow-lg shadow-yellow-500/20
              hover:shadow-yellow-400/40
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            Suivant ➜
          </button>
        ) : (
          <button
            onClick={() => alert("🎉 Synthèse générée ! (fonctionnalité future)")}
            className="
              px-6 py-2 rounded-lg
              bg-green-500 text-white
              font-semibold
              shadow-md hover:bg-green-600
              transition
            "
          >
            Générer la synthèse 📄
          </button>
        )}
      </div>
    </div>
  );
}
