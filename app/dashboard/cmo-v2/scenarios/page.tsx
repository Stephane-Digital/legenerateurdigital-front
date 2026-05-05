"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Scenario = {
  title: string;
  angle: string;
  text: string;
};

export default function CMOScenariosPage() {
  const router = useRouter();

  const [offer, setOffer] = useState("");
  const [target, setTarget] = useState("");
  const [objective, setObjective] = useState("");
  const [blocker, setBlocker] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  function generate() {
    const generated: Scenario[] = [
      {
        title: "Prise de conscience brutale",
        angle: "Le problème n’est pas ce que tu crois",
        text: `${target} pense avancer… mais reste bloqué à cause de ${blocker}.`,
      },
      {
        title: "Erreur invisible",
        angle: "Tu fais probablement ça sans t’en rendre compte",
        text: `Tu fais des efforts… mais ils ne te rapprochent pas de ${objective}.`,
      },
      {
        title: "Objection réelle",
        angle: "La vraie peur",
        text: `Tu hésites parce que ${blocker}, pas parce que l’offre est mauvaise.`,
      },
      {
        title: "Solution concrète",
        angle: "Passer à l’action",
        text: `${offer} te permet d’avancer concrètement sans rester bloqué.`,
      },
      {
        title: "Projection réaliste",
        angle: "Ce qui change vraiment",
        text: `Tu peux enfin avancer vers ${objective} sans tourner en rond.`,
      },
    ];

    setScenarios(generated);
  }

  function useScenario(s: Scenario) {
    const payload = {
      offer,
      target,
      objective,
      blocker,
      angle: s.angle,
      scenario: s.title,
      source: "scenario-generator",
    };

    localStorage.setItem(
      "lgd_cmo_module_auto_payload",
      JSON.stringify(payload)
    );

    router.push("/dashboard/cmo-v2");
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 mb-4 rounded-full border border-yellow-500/30 text-xs tracking-widest text-yellow-400">
            CMO IA • SCÉNARIOS
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400">
            Générateur de Scénarios Marketing
          </h1>

          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            LGD transforme ta situation en angles prêts à convertir.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* FORMULAIRE */}
          <div className="border border-yellow-500/20 rounded-2xl p-6 bg-[#0b0b0b]">
            <h2 className="text-lg font-semibold text-yellow-400 mb-6">
              Créer une base stratégique
            </h2>

            <div className="space-y-5">

              <input
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Offre"
                className="w-full bg-black border border-yellow-500/20 rounded-xl px-4 py-3"
              />

              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Cible"
                className="w-full bg-black border border-yellow-500/20 rounded-xl px-4 py-3"
              />

              <input
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Objectif"
                className="w-full bg-black border border-yellow-500/20 rounded-xl px-4 py-3"
              />

              <textarea
                value={blocker}
                onChange={(e) => setBlocker(e.target.value)}
                placeholder="Blocage"
                className="w-full bg-black border border-yellow-500/20 rounded-xl px-4 py-3"
              />

              <button
                onClick={generate}
                className="w-full mt-4 py-4 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition"
              >
                GÉNÉRER MES SCÉNARIOS
              </button>

            </div>
          </div>

          {/* SCÉNARIOS */}
          <div className="border border-yellow-500/20 rounded-2xl p-6 bg-[#0b0b0b]">

            {scenarios.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                Aucun scénario généré
              </div>
            ) : (
              <div className="space-y-4">
                {scenarios.map((s, i) => (
                  <div
                    key={i}
                    className="border border-yellow-500/20 rounded-xl p-4"
                  >
                    <h3 className="text-yellow-400 font-bold">
                      {s.title}
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                      {s.text}
                    </p>

                    <button
                      onClick={() => useScenario(s)}
                      className="mt-4 w-full py-2 border border-yellow-500 text-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-black transition"
                    >
                      Utiliser ce scénario
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
