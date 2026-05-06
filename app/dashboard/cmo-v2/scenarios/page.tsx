"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type OfferType = "formation" | "ebook" | "coaching" | "saas" | "service";
type ProspectLevel = "debutant" | "bloque" | "avance_non_rentable";

type ScenarioForm = {
  offer: string;
  target: string;
  objective: string;
  blocker: string;
  offerType: OfferType;
  prospectLevel: ProspectLevel;
};

type Scenario = {
  id: string;
  badge: string;
  title: string;
  objective: string;
  angle: string;
  realProblem: string;
  context: string;
  whyItConverts: string;
  recommended?: boolean;
};

const initialForm: ScenarioForm = {
  offer: "",
  target: "",
  objective: "",
  blocker: "",
  offerType: "formation",
  prospectLevel: "bloque",
};

const offerTypeLabels: Record<OfferType, string> = {
  formation: "Formation",
  ebook: "Ebook",
  coaching: "Coaching",
  saas: "SaaS",
  service: "Service",
};

const prospectLevelLabels: Record<ProspectLevel, string> = {
  debutant: "Débutant",
  bloque: "Bloqué",
  avance_non_rentable: "Avancé mais pas rentable",
};

function clean(value: string, fallback: string) {
  const text = value.trim();
  return text || fallback;
}

function buildScenarios(form: ScenarioForm): Scenario[] {
  const offer = clean(form.offer, "ton offre");
  const target = clean(form.target, "ta cible");
  const objective = clean(form.objective, "obtenir un résultat concret");
  const blocker = clean(form.blocker, "elle hésite à passer à l’action");
  const offerType = offerTypeLabels[form.offerType].toLowerCase();
  const level = prospectLevelLabels[form.prospectLevel].toLowerCase();

  return [
    {
      id: "awareness",
      badge: "Action prioritaire recommandée",
      title: "Prise de conscience directe",
      recommended: true,
      objective: `Faire comprendre à ${target} que le vrai frein n’est pas le manque d’envie, mais le blocage qui l’empêche d’avancer vers ${objective}.`,
      angle: "Le prospect ne manque pas forcément de motivation. Il manque d’un déclic clair pour arrêter de subir la même situation.",
      realProblem: blocker,
      context: `${target} veut avancer, mais reste coincé dans une situation frustrante. ${offer} doit être présenté comme une réponse concrète, simple et actionnable pour l’aider à sortir du flou.`,
      whyItConverts: "Ce scénario fonctionne parce qu’il crée une identification immédiate avant de présenter l’offre comme une solution naturelle.",
    },
    {
      id: "mistake",
      badge: "Erreur invisible",
      title: "L’erreur qui bloque les résultats",
      objective: `Montrer à ${target} qu’elle répète probablement une erreur invisible qui l’éloigne de ${objective}.`,
      angle: `Elle croit que le problème vient d’elle, alors qu’elle utilise peut-être la mauvaise approche pour son niveau : ${level}.`,
      realProblem: blocker,
      context: `${offer} est positionné comme un ${offerType} qui remet de la clarté là où la cible se disperse, doute ou repousse la décision.`,
      whyItConverts: "Ce scénario transforme la culpabilité en prise de conscience, ce qui réduit la résistance à l’achat.",
    },
    {
      id: "objection",
      badge: "Objection réelle",
      title: "Lever la peur d’investir encore",
      objective: `Rassurer ${target} sur le fait qu’elle peut tester une nouvelle approche sans se sentir piégée.`,
      angle: "La vraie peur n’est pas l’offre. C’est de revivre une déception, perdre du temps ou payer pour quelque chose qui ne change rien.",
      realProblem: blocker,
      context: `${offer} doit être présenté comme une décision légère, progressive et vérifiable, pas comme une promesse magique.`,
      whyItConverts: "Ce scénario traite l’objection avant qu’elle bloque la décision.",
    },
    {
      id: "solution",
      badge: "Solution concrète",
      title: "La solution claire",
      objective: `Faire comprendre comment ${offer} aide concrètement ${target} à avancer vers ${objective}.`,
      angle: "Pas plus de théorie. Pas plus de confusion. Une méthode ou un cadre pour faire le prochain bon geste.",
      realProblem: blocker,
      context: `Ce scénario doit expliquer simplement ce que ${target} va pouvoir faire grâce à ${offer}, avec des actions visibles et réalistes.`,
      whyItConverts: "Il rend l’offre tangible. Le prospect comprend ce qu’il achète et pourquoi cela peut l’aider maintenant.",
    },
    {
      id: "projection",
      badge: "Projection réaliste",
      title: "Ce qui change vraiment",
      objective: `Aider ${target} à visualiser ce qui peut changer si elle prend une décision maintenant.`,
      angle: "La transformation n’est pas présentée comme un rêve lointain, mais comme une première étape réaliste.",
      realProblem: blocker,
      context: `${offer} devient le pont entre la situation actuelle et une version plus claire, plus structurée et plus active de la cible.`,
      whyItConverts: "Ce scénario aide le prospect à se projeter sans tomber dans la promesse exagérée.",
    },
  ];
}

export default function CMOScenariosPage() {
  const router = useRouter();
  const [form, setForm] = useState<ScenarioForm>(initialForm);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const scenarios = useMemo(() => buildScenarios(form), [form]);
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedId) || null;

  const canGenerate =
    form.offer.trim().length > 2 &&
    form.target.trim().length > 2 &&
    form.objective.trim().length > 2 &&
    form.blocker.trim().length > 2;

  function updateField<K extends keyof ScenarioForm>(key: K, value: ScenarioForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function generateScenarios() {
    if (!canGenerate) return;
    setHasGenerated(true);
    setSelectedId("awareness");
  }

  function useScenario(scenario: Scenario) {
    const payload = {
      source: "scenario-generator",
      targetModule: "emailing",
      objective: scenario.objective,
      blocker: scenario.realProblem,
      context: scenario.context,
      angle: scenario.angle,
      offer: form.offer,
      target: form.target,
      offerType: form.offerType,
      prospectLevel: form.prospectLevel,
      recommendedScenario: scenario.title,
      generatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem("lgd_cmo_module_auto_payload", JSON.stringify(payload));
    } catch {
      // Si le stockage échoue, la redirection reste possible.
    }

    router.push("/dashboard/cmo-v2");
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-14 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col items-center">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black text-[#ffcc00] sm:text-4xl">
            Centre de contrôle LGD
          </h1>

          <p className="mt-3 text-sm text-zinc-300 sm:text-base">
            Crée du contenu • Attire des prospects • Génère tes premières ventes avec l’IA
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold">
            <span className="rounded-full border border-[#c99a16]/50 bg-[#100d04] px-4 py-1.5 text-[#ffcc00]">
              ⚡ Scénarios prêts à envoyer au CMO
            </span>
            <span className="rounded-full border border-[#c99a16]/50 bg-[#100d04] px-4 py-1.5 text-[#ffcc00]">
              👑 Angles adaptés selon l’objectif
            </span>
            <span className="rounded-full border border-[#c99a16]/50 bg-[#100d04] px-4 py-1.5 text-[#ffcc00]">
              🎯 Objectif : angle clair → conversion
            </span>
          </div>

          <p className="mt-5 text-sm font-bold">
            Plan actuel : <span className="text-[#ffcc00]">PRO</span>
          </p>
        </header>

        <section className="w-full rounded-[32px] border border-[#80610d] bg-[#090806] px-5 py-8 shadow-[0_35px_120px_rgba(0,0,0,0.75)] sm:px-8 lg:px-10">
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full border border-[#80610d] bg-black px-4 py-1.5 text-[11px] font-bold text-[#ffcc00]">
              ⚡ Mode CMO IA
            </span>

            <h2 className="mt-5 text-3xl font-black text-[#ffcc00] sm:text-4xl">
              Ton générateur de scénarios travaille pour toi
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-zinc-300">
              LGD analyse ton offre, ta cible et ton blocage pour préparer des angles marketing directement exploitables dans le CMO.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[24px] border border-[#80610d] bg-[#050505] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ffcc00]">
                    🎯 Base stratégique
                  </p>
                  <h3 className="mt-3 text-xl font-black text-white">
                    Prépare ton scénario CMO
                  </h3>
                </div>
              </div>

              <p className="mb-6 text-sm leading-6 text-zinc-400">
                Remplis les champs essentiels. LGD transforme ensuite ta situation en angles clairs, utiles et activables.
              </p>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white">Offre à vendre</span>
                  <input
                    value={form.offer}
                    onChange={(event) => updateField("offer", event.target.value)}
                    placeholder="Ex : coaching perte de poids, ebook productivité, formation crypto..."
                    className="w-full rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#ffcc00]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white">Cible</span>
                  <input
                    value={form.target}
                    onChange={(event) => updateField("target", event.target.value)}
                    placeholder="Ex : débutants motivés qui n’ont encore aucun résultat"
                    className="w-full rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#ffcc00]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white">Objectif business</span>
                  <textarea
                    value={form.objective}
                    onChange={(event) => updateField("objective", event.target.value)}
                    placeholder="Ex : vendre un abonnement, obtenir une première vente, réserver un appel découverte..."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#ffcc00]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white">Blocage principal</span>
                  <textarea
                    value={form.blocker}
                    onChange={(event) => updateField("blocker", event.target.value)}
                    placeholder="Ex : peur d’investir encore, manque de confiance, peur de perdre de l’argent, dispersion..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#ffcc00]"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-white">Type d’offre</span>
                    <select
                      value={form.offerType}
                      onChange={(event) => updateField("offerType", event.target.value as OfferType)}
                      className="w-full rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ffcc00]"
                    >
                      <option value="formation">Formation</option>
                      <option value="ebook">Ebook</option>
                      <option value="coaching">Coaching</option>
                      <option value="saas">SaaS</option>
                      <option value="service">Service</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-white">Niveau prospect</span>
                    <select
                      value={form.prospectLevel}
                      onChange={(event) => updateField("prospectLevel", event.target.value as ProspectLevel)}
                      className="w-full rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ffcc00]"
                    >
                      <option value="debutant">Débutant</option>
                      <option value="bloque">Bloqué</option>
                      <option value="avance_non_rentable">Avancé mais pas rentable</option>
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={generateScenarios}
                  disabled={!canGenerate}
                  className="w-full rounded-2xl bg-[#ffc400] px-5 py-4 text-sm font-black text-black transition hover:bg-[#ffd84a] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Générer mes scénarios
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#80610d] bg-[#050505] p-5 sm:p-6">
              <div className="mb-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ffcc00]">
                  ⚡ Exécution rapide
                </p>
                <h3 className="mt-3 text-xl font-black text-white">
                  Scénarios prêts à utiliser
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Choisis un angle. LGD le transmet au CMO pour préparer la suite.
                </p>
              </div>

              {!hasGenerated ? (
                <div className="flex min-h-[430px] items-center justify-center rounded-[22px] border border-dashed border-[#80610d] bg-black/50 p-8 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#80610d] bg-[#1a1404] text-xl text-[#ffcc00]">
                      ✨
                    </div>
                    <h4 className="text-lg font-black text-white">
                      Tes scénarios apparaîtront ici
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      Renseigne l’offre, la cible, l’objectif et le blocage pour générer une base marketing exploitable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {scenarios.map((scenario) => (
                    <article
                      key={scenario.id}
                      onClick={() => setSelectedId(scenario.id)}
                      className={`cursor-pointer rounded-2xl border p-5 transition ${
                        selectedId === scenario.id
                          ? "border-[#ffcc00] bg-[#1a1404]"
                          : "border-[#80610d] bg-black hover:border-[#ffcc00]"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ffcc00]">
                          {scenario.badge}
                        </span>
                        {scenario.recommended ? (
                          <span className="rounded-full border border-[#80610d] px-3 py-1 text-[11px] font-bold text-[#ffcc00]">
                            conseillé
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-lg font-black text-white">
                        {scenario.title}
                      </h4>

                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {scenario.angle}
                      </p>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          useScenario(scenario);
                        }}
                        className="mt-5 w-full rounded-xl border border-[#80610d] px-4 py-3 text-sm font-black text-[#ffcc00] transition hover:bg-[#ffc400] hover:text-black"
                      >
                        Utiliser ce scénario
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedScenario ? (
            <div className="mt-8 border-t border-[#80610d] pt-8">
              <div className="mb-5 text-center">
                <span className="rounded-full border border-[#80610d] bg-black px-4 py-1.5 text-[11px] font-bold text-[#ffcc00]">
                  👁 Aperçu scénario
                </span>
                <p className="mt-4 text-sm text-zinc-300">
                  Ce bloc simule ce que LGD transmettra au CMO.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#80610d] bg-[#120f06] p-4">
                  <p className="text-sm font-black text-white">Objectif CMO</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {selectedScenario.objective}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#80610d] bg-[#120f06] p-4">
                  <p className="text-sm font-black text-white">Blocage enrichi</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {selectedScenario.realProblem}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#80610d] bg-[#120f06] p-4 md:col-span-2">
                  <p className="text-sm font-black text-white">Contexte stratégique</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {selectedScenario.context}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
