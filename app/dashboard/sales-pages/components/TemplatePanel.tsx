"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function TemplatePanel({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (html: string) => void;
}) {
  const templates = [
    {
      name: "Titre principal",
      html: `<h1 style="font-size: 42px; font-weight: bold; margin-bottom: 20px;">Titre puissant ici</h1>`,
    },
    {
      name: "Sous-titre émotionnel",
      html: `<h2 style="font-size: 28px; opacity: 0.85; margin-bottom: 20px;">Sous-titre engageant pour captiver immédiatement</h2>`,
    },
    {
      name: "Paragraphe Storytelling",
      html: `<p style="line-height: 1.6; margin-bottom: 20px;">
      Voici une histoire captivante qui montre votre expertise, crée de la connexion et inspire votre prospect...
      </p>`,
    },
    {
      name: "Liste Bullet Points",
      html: `
      <ul style="margin-bottom: 20px; padding-left: 20px;">
        <li>✔ Avantage clair et puissant</li>
        <li>✔ Bénéfice émotionnel immédiat</li>
        <li>✔ Résultat concret et mesurable</li>
      </ul>`,
    },
    {
      name: "Bloc Témoignage",
      html: `
      <div style="padding: 20px; border-left: 4px solid #ffb800; margin-bottom: 20px;">
        <p style="font-style: italic;">"Ce produit a complètement transformé mon activité !"</p>
        <p style="text-align: right; margin-top: 10px;">– Client satisfait</p>
      </div>`,
    },
    {
      name: "CTA Hero",
      html: `
      <div style="text-align:center; padding: 40px; background:#111; border-radius:10px;">
        <h2 style="font-size:32px; margin-bottom:20px;">Passez à l'action maintenant</h2>
        <a href="#" style="background:#ffb800; color:#000; padding:12px 28px; border-radius:8px; font-weight:bold; text-decoration:none;">
          Démarrer maintenant
        </a>
      </div>`,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#111] border border-yellow-600/30 rounded-2xl p-10 w-full max-w-4xl shadow-xl"
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.85 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-yellow-400 text-2xl font-bold">
              Sélection d’un Template
            </h2>
            <button
              className="px-4 py-1 bg-gray-700 rounded-lg hover:bg-gray-600"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {/* LISTE DES TEMPLATES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2">
            {templates.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d0d0d] border border-yellow-700/20 rounded-xl p-5 cursor-pointer hover:border-yellow-400 transition"
                onClick={() => onSelect(t.html)}
              >
                <h3 className="text-yellow-400 mb-3 font-semibold">
                  {t.name}
                </h3>
                <div
                  className="prose prose-invert text-sm"
                  dangerouslySetInnerHTML={{ __html: t.html }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
