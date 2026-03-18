"use client";

import { motion } from "framer-motion";

interface PreviewProps {
  slides: any[];
}

export default function IAPreview({ slides = [] }: PreviewProps) {
  // ----------------------------------------------------------
  // 🔥 Plus de return null → toujours un affichage
  // ----------------------------------------------------------

  return (
    <div className="mt-14 p-6 rounded-2xl bg-black/40 border border-yellow-500/40 shadow-xl">
      <h3 className="text-2xl font-bold text-yellow-300 mb-6">
        Aperçu instantané du carrousel IA
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slides.length > 0 ? (
          slides.map((slide, index) => {
            const title =
              typeof slide === "string"
                ? slide
                : slide.title || `Slide ${index + 1}`;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="p-5 rounded-xl bg-black/50 border border-yellow-600/30 shadow-inner"
              >
                <p className="font-semibold text-yellow-400 mb-2">
                  {`Slide ${index + 1}`}
                </p>

                <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                  {title}
                </p>
              </motion.div>
            );
          })
        ) : (
          // ----------------------------------------------------------
          // 🟦 Fallback visible même si aucune slide n'est générée
          // ----------------------------------------------------------
          <div className="text-gray-400 italic">
            Aucune slide générée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
