"use client";

import { motion } from "framer-motion";

export default function StepperStatut({ step }: { step: number }) {
  const steps = [
    "Introduction",
    "Choisir son statut",
    "Guide URSSAF",
    "Résumé",
  ];

  return (
    <div className="flex justify-center mb-10">
      <div className="flex items-center gap-6 sm:gap-10">
        {steps.map((title, index) => {
          const active = step === index + 1;
          return (
            <div key={title} className="flex items-center">
              <motion.div
                animate={{
                  scale: active ? 1.2 : 1,
                  backgroundColor: active ? "#d4af37" : "#222",
                  boxShadow: active
                    ? "0 0 12px rgba(212, 175, 55, 0.8)"
                    : "0 0 6px rgba(212,175,55,0.3)",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black"
              >
                {index + 1}
              </motion.div>

              <span
                className={`ml-3 text-sm ${
                  active ? "text-yellow-400" : "text-gray-400"
                }`}
              >
                {title}
              </span>

              {index < steps.length - 1 && (
                <div className="w-12 sm:w-20 h-[2px] mx-3 bg-gradient-to-r from-yellow-500/60 to-yellow-500/10"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
