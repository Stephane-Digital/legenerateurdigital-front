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
    <div className="max-w-3xl mx-auto bg-[#111]/80 border border-yellow-500/20 rounded-2xl shadow-lg p-8 backdrop-blur-md">
      {/* Étape 1 */}
      {step === 1 && (
        <>
          <h2 className="text-xl text-yellow-400 font-semibold mb-4">
            Introduction
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Ce guide IA t’aide à choisir le meilleur statut juridique pour ton
            activité, comprendre les démarches URSSAF et obtenir des conseils
            personnalisés selon ton profil.
          </p>
          <button
            onClick={() => setStep(2)}
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all"
          >
            Commencer le guide →
          </button>
        </>
      )}

      {/* Étape 2 : Choix du statut */}
      {step === 2 && (
        <>
          <h2 className="text-xl text-yellow-400 font-semibold mb-6">
            Choisis ton statut :
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {["Micro-entreprise", "EURL", "SARL"].map((statut) => (
              <button
                key={statut}
                onClick={() => setSelectedStatut(statut)}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  selectedStatut === statut
                    ? "bg-yellow-400 text-black border-yellow-400 shadow-lg"
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
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all disabled:opacity-50"
          >
            {loading ? "Génération en cours..." : "🔮 Générer mes conseils IA"}
          </button>
        </>
      )}

      {/* Étape 3 : Résultat IA */}
      {step === 3 && (
        <>
          <h2 className="text-xl text-yellow-400 font-semibold mb-6">
            Conseils IA — {selectedStatut}
          </h2>

          {aiAdvice ? (
            <p className="whitespace-pre-wrap text-gray-200 leading-relaxed mb-6">
              {aiAdvice}
            </p>
          ) : (
            <p className="text-gray-400 italic">Aucun résultat IA trouvé.</p>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep(4)}
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all"
            >
              Étape suivante →
            </button>
          </div>
        </>
      )}

      {/* Étape 4 : Guide URSSAF */}
      {step === 4 && (
        <>
          <h2 className="text-xl text-yellow-400 font-semibold mb-4">
            Guide URSSAF
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Pour déclarer ton activité et payer tes cotisations sociales, rends-toi
            sur le site officiel de l’URSSAF :
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
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all"
            >
              Étape suivante →
            </button>
          </div>
        </>
      )}

      {/* Étape 5 : Résumé */}
      {step === 5 && (
        <>
          <h2 className="text-xl text-yellow-400 font-semibold mb-4">
            Résumé
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            ✅ Tu as sélectionné le statut : <strong>{selectedStatut}</strong>.
            <br />
            🧠 L’IA t’a fourni des conseils personnalisés.  
            🏛️ Tu sais maintenant comment t’enregistrer à l’URSSAF.
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
