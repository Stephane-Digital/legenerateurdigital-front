"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
      badge: "Recommandé",
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
      badge: "Objection",
      title: "Lever la peur d’investir encore",
      objective: `Rassurer ${target} sur le fait qu’elle peut tester une nouvelle approche sans se sentir piégée.`,
      angle: "La vraie peur n’est pas l’offre. C’est de revivre une déception, perdre du temps ou payer pour quelque chose qui ne change rien.",
      realProblem: blocker,
      context: `${offer} doit être présenté comme une décision légère, progressive et vérifiable, pas comme une promesse magique.`,
      whyItConverts: "Ce scénario est puissant pour les prospects froids ou méfiants, car il traite l’objection avant qu’elle bloque la décision.",
    },
    {
      id: "solution",
      badge: "Solution",
      title: "La solution concrète",
      objective: `Faire comprendre comment ${offer} aide concrètement ${target} à avancer vers ${objective}.`,
      angle: "Pas plus de théorie. Pas plus de confusion. Une méthode ou un cadre pour faire le prochain bon geste.",
      realProblem: blocker,
      context: `Ce scénario doit expliquer simplement ce que ${target} va pouvoir faire grâce à ${offer}, avec des actions visibles et réalistes.`,
      whyItConverts: "Il rend l’offre tangible. Le prospect comprend ce qu’il achète et pourquoi cela peut l’aider maintenant.",
    },
    {
      id: "projection",
      badge: "Projection",
      title: "Projection réaliste",
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
      // Sécurité navigateur : si le stockage échoue, on redirige quand même vers le CMO.
    }

    router.push("/dashboard/cmo-v2");
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10">
        <header className="mt-8 max-w-4xl text-center">
          <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-[#c9a449]/40 bg-[#c9a449]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#ffd43b] shadow-[0_0_30px_rgba(201,164,73,0.12)]">
            CMO IA · Scénarios
          </div>

          <h1 className="bg-gradient-to-r from-[#f7df9e] via-[#d6ad45] to-[#fff2bd] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
            Générateur de Scénarios Marketing
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            Tu ne manques pas d’idées. Tu manques d’angle. LGD prépare des scénarios prêts à envoyer dans le CMO, que tu peux utiliser ou modifier.
          </p>
        </header>

        <section className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[28px] border border-[#f4c542]/30 bg-[#090909] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:p-7">
            <div className="mb-6">
              <h2 className="text-xl font-black text-[#ffd43b]">Créer une base stratégique</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Remplis les champs essentiels. LGD transforme ensuite ta situation en scénarios exploitables.
              </p>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-200">Offre à vendre</span>
                <input
                  value={form.offer}
                  onChange={(event) => updateField("offer", event.target.value)}
                  placeholder="Ex : coaching perte de poids, ebook productivité, formation crypto..."
                  className="w-full rounded-2xl border border-[#f4c542]/25 bg-[#030303] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#ffd43b]/80 focus:shadow-[0_0_0_4px_rgba(255,212,59,0.10)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-200">Cible</span>
                <input
                  value={form.target}
                  onChange={(event) => updateField("target", event.target.value)}
                  placeholder="Ex : débutants motivés qui n’ont encore aucun résultat"
                  className="w-full rounded-2xl border border-[#f4c542]/25 bg-[#030303] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#ffd43b]/80 focus:shadow-[0_0_0_4px_rgba(255,212,59,0.10)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-200">Objectif business</span>
                <textarea
                  value={form.objective}
                  onChange={(event) => updateField("objective", event.target.value)}
                  placeholder="Ex : vendre un abonnement, obtenir une première vente, réserver un appel découverte..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-[#f4c542]/25 bg-[#030303] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#ffd43b]/80 focus:shadow-[0_0_0_4px_rgba(255,212,59,0.10)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-zinc-200">Blocage principal</span>
                <textarea
                  value={form.blocker}
                  onChange={(event) => updateField("blocker", event.target.value)}
                  placeholder="Ex : peur d’investir encore, manque de confiance, peur de perdre de l’argent, dispersion..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-[#f4c542]/25 bg-[#030303] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#ffd43b]/80 focus:shadow-[0_0_0_4px_rgba(255,212,59,0.10)]"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-zinc-200">Type d’offre</span>
                  <select
                    value={form.offerType}
                    onChange={(event) => updateField("offerType", event.target.value as OfferType)}
                    className="w-full rounded-2xl border border-[#f4c542]/25 bg-[#030303] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ffd43b]/80 focus:shadow-[0_0_0_4px_rgba(255,212,59,0.10)]"
                  >
                    <option value="formation">Formation</option>
                    <option value="ebook">Ebook</option>
                    <option value="coaching">Coaching</option>
                    <option value="saas">SaaS</option>
                    <option value="service">Service</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-zinc-200">Niveau prospect</span>
                  <select
                    value={form.prospectLevel}
                    onChange={(event) => updateField("prospectLevel", event.target.value as ProspectLevel)}
                    className="w-full rounded-2xl border border-[#f4c542]/25 bg-[#030303] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ffd43b]/80 focus:shadow-[0_0_0_4px_rgba(255,212,59,0.10)]"
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
                className="w-full rounded-2xl border border-[#f1cf76]/50 bg-gradient-to-r from-[#f4c542] via-[#ffd43b] to-[#f4c542] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_18px_45px_rgba(214,173,69,0.18)] transition hover:scale-[1.01] hover:shadow-[0_24px_70px_rgba(214,173,69,0.25)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                Générer mes scénarios
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#f4c542]/30 bg-[#090909] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#ffd43b]">Scénarios prêts à utiliser</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Choisis un angle. LGD le transmet au CMO pour préparer la suite.
                </p>
              </div>

              {hasGenerated ? (
                <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {scenarios.length} scénarios générés
                </span>
              ) : null}
            </div>

            {!hasGenerated ? (
              <div className="flex min-h-[520px] items-center justify-center rounded-[24px] border border-dashed border-[#f4c542]/25 bg-[#030303] p-8 text-center">
                <div className="max-w-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a449]/30 bg-[#c9a449]/10 text-2xl">
                    ✨
                  </div>
                  <h3 className="text-lg font-bold text-white">Tes scénarios apparaîtront ici</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Renseigne l’offre, la cible, l’objectif et le blocage pour générer une base marketing exploitable.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {scenarios.map((scenario) => (
                  <article
                    key={scenario.id}
                    onClick={() => setSelectedId(scenario.id)}
                    className={`group cursor-pointer rounded-[1.5rem] border p-5 transition ${
                      selectedId === scenario.id
                        ? "border-[#f1cf76]/70 bg-[#161109] shadow-[0_0_45px_rgba(214,173,69,0.14)]"
                        : "border-[#c9a449]/15 bg-black/25 hover:border-[#c9a449]/45 hover:bg-[#111]/80"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[#c9a449]/25 bg-[#c9a449]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffd43b]">
                        {scenario.badge}
                      </span>
                      {scenario.recommended ? (
                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                          conseillé
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-[#f7df9e]">
                      {scenario.title}
                    </h3>

                    <div className="mt-4 space-y-4 text-sm leading-6 text-zinc-300">
                      <div>
                        <p className="font-bold text-[#ffd43b]">Objectif</p>
                        <p className="mt-1 text-zinc-400">{scenario.objective}</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#ffd43b]">Angle</p>
                        <p className="mt-1 text-zinc-400">{scenario.angle}</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#ffd43b]">Pourquoi ça convertit</p>
                        <p className="mt-1 text-zinc-400">{scenario.whyItConverts}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        useScenario(scenario);
                      }}
                      className="mt-5 w-full rounded-2xl border border-[#c9a449]/35 bg-[#c9a449]/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-[#f7df9e] transition hover:border-[#f1cf76]/70 hover:bg-[#c9a449]/20"
                    >
                      Utiliser ce scénario
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {selectedScenario ? (
          <section className="w-full max-w-6xl rounded-[2rem] border border-[#c9a449]/20 bg-gradient-to-br from-[#12100b] via-[#090909] to-[#050505] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <span className="rounded-full border border-[#c9a449]/30 bg-[#c9a449]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#ffd43b]">
                  Aperçu scénario
                </span>
                <h2 className="mt-4 text-2xl font-black text-white">{selectedScenario.title}</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Ce bloc simule ce que LGD transmettra au CMO. L’utilisateur garde le contrôle et peut modifier avant génération.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[#c9a449]/15 bg-black/30 p-5">
                <div className="space-y-5 text-sm leading-7">
                  <div>
                    <p className="font-bold text-[#ffd43b]">Objectif CMO</p>
                    <p className="mt-1 text-zinc-300">{selectedScenario.objective}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#ffd43b]">Blocage enrichi</p>
                    <p className="mt-1 text-zinc-300">{selectedScenario.realProblem}</p>
                  </div>
                  <div>
                    <p className="font-bold text-[#ffd43b]">Contexte stratégique</p>
                    <p className="mt-1 text-zinc-300">{selectedScenario.context}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
