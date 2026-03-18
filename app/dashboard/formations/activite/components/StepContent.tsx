"use client";

import { useState } from "react";

interface StepContentProps {
  step: number;
  setStep: (n: number) => void;
}

export default function StepContent({ step, setStep }: StepContentProps) {
  const [selectedStatut, setSelectedStatut] = useState("");
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const generateAdvice = async () => {
    if (!selectedStatut) {
      alert("Choisis un statut pour continuer.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/statut_ia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: selectedStatut }),
      });
      const data = await res.json();
      setAiAdvice(data.advice || "Aucun conseil généré.");
      setStep(3);
    } catch (err) {
      alert("Erreur lors de la génération IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-yellow-500/20 bg-[#111]/80 p-8 shadow-lg backdrop-blur-md">
      {/* Étape 1 */}
      {step === 1 && (
        <>
          <h2 className="mb-4 text-xl font-semibold text-yellow-400">Introduction</h2>
          <p className="mb-6 leading-relaxed text-gray-300">
            Ce guide IA t’aide à choisir le meilleur statut juridique pour ton activité, comprendre
            les démarches URSSAF et obtenir des conseils personnalisés selon ton profil.
          </p>
          <button
            onClick={() => setStep(2)}
            className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black transition-all hover:bg-yellow-300"
          >
            Commencer le guide →
          </button>
        </>
      )}

      {/* Étape 2 : Choix du statut */}
      {step === 2 && (
        <>
          <h2 className="mb-6 text-xl font-semibold text-yellow-400">Choisis ton statut :</h2>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {["Micro-entreprise", "EURL", "SARL"].map((statut) => (
              <button
                key={statut}
                onClick={() => setSelectedStatut(statut)}
                className={`rounded-xl border p-4 transition-all duration-300 ${
                  selectedStatut === statut
                    ? "border-yellow-400 bg-yellow-400 text-black shadow-lg"
                    : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-400/10"
                }`}
              >
                {statut}
              </button>
            ))}
          </div>

          <button
            onClick={generateAdvice}
            disabled={loading}
            className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black transition-all hover:bg-yellow-300 disabled:opacity-50"
          >
            {loading ? "Génération en cours..." : "🔮 Générer mes conseils IA"}
          </button>
        </>
      )}

      {/* Étape 3 : Résultat IA */}
      {step === 3 && (
        <>
          <h2 className="mb-6 text-xl font-semibold text-yellow-400">
            Conseils IA — {selectedStatut}
          </h2>

          {aiAdvice ? (
            <p className="mb-6 leading-relaxed whitespace-pre-wrap text-gray-200">{aiAdvice}</p>
          ) : (
            <p className="text-gray-400 italic">Aucun résultat IA trouvé.</p>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep(4)}
              className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black transition-all hover:bg-yellow-300"
            >
              Étape suivante →
            </button>
          </div>
        </>
      )}

      {/* Étape 4 : Guide URSSAF */}
      {step === 4 && (
        <>
          <h2 className="mb-4 text-xl font-semibold text-yellow-400">Guide URSSAF</h2>
          <p className="mb-6 leading-relaxed text-gray-300">
            Pour déclarer ton activité et payer tes cotisations sociales, rends-toi sur le site
            officiel de l’URSSAF :
          </p>
          <a
            href="https://www.autoentrepreneur.urssaf.fr"
            target="_blank"
            className="text-yellow-400 underline hover:text-yellow-300"
          >
            www.autoentrepreneur.urssaf.fr
          </a>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setStep(5)}
              className="rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black transition-all hover:bg-yellow-300"
            >
              Étape suivante →
            </button>
          </div>
        </>
      )}

      {/* Étape 5 : Résumé */}
      {step === 5 && (
        <>
          <h2 className="mb-4 text-xl font-semibold text-yellow-400">Résumé</h2>
          <p className="mb-6 leading-relaxed text-gray-300">
            ✅ Tu as sélectionné le statut : <strong>{selectedStatut}</strong>.
            <br />
            🧠 L’IA t’a fourni des conseils personnalisés. 🏛️ Tu sais maintenant comment
            t’enregistrer à l’URSSAF.
            <br />
            Félicitations 🎉, tu es prêt à lancer ton activité !
          </p>
          <button
            onClick={() => setStep(1)}
            className="text-yellow-400 underline hover:text-yellow-300"
          >
            🔁 Reprendre depuis le début
          </button>
        </>
      )}
    </div>
  );
}
