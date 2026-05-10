"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { buildPayload } from "./lib/buildPayload";
import { buildFallbackDispatch } from "./lib/buildStrategy";

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

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function getAuthToken(): string {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("lgd_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    ""
  );
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseScenarioContent(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const cleaned = value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function normalizeAiScenarios(value: unknown): Scenario[] {
  const parsed = parseScenarioContent(value) as any;

  const source = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.scenarios)
      ? parsed.scenarios
      : Array.isArray(parsed?.items)
        ? parsed.items
        : Array.isArray(parsed?.data)
          ? parsed.data
          : null;

  if (!source) {
    throw new Error("Réponse IA invalide : aucun tableau de scénarios.");
  }

  return source.slice(0, 5).map((raw: unknown, index: number) => {
    const item = raw as Partial<Scenario>;

    if (
      !item.title ||
      !item.objective ||
      !item.angle ||
      !item.realProblem ||
      !item.context ||
      !item.whyItConverts
    ) {
      throw new Error(`Réponse IA invalide : scénario ${index + 1} incomplet.`);
    }

    return {
      id: item.id || `scenario-${index + 1}`,
      badge:
        item.badge ||
        (index === 0 ? "Action prioritaire recommandée" : "Scénario CMO"),
      title: item.title,
      objective: item.objective,
      angle: item.angle,
      realProblem: item.realProblem,
      context: item.context,
      whyItConverts: item.whyItConverts,
      recommended: Boolean(item.recommended) || index === 0,
    };
  });
}

export default function CMOScenariosPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lgd_cmo_prefill");
      if (!raw) return;

      const parsed = JSON.parse(raw);

      setForm((prev) => ({
        ...prev,
        offer: parsed.offer || prev.offer,
        target: parsed.target || prev.target,
        objective: parsed.objective || prev.objective,
        blocker: parsed.blocker || prev.blocker,
      }));

      localStorage.removeItem("lgd_cmo_prefill");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lgd_cmo_scenarios_session");
      if (!raw) return;

      const session = JSON.parse(raw);

      if (session.form) {
        setForm(session.form);
      }

      if (Array.isArray(session.scenarios)) {
        setScenarios(session.scenarios);
      }

      if (session.selectedId) {
        setSelectedId(session.selectedId);
      }
    } catch {}
  }, []);

  const [form, setForm] = useState<ScenarioForm>(initialForm);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(
        "lgd_cmo_scenarios_session",
        JSON.stringify({
          form,
          scenarios,
          selectedId,
          updatedAt: Date.now(),
        }),
      );
    } catch {}
  }, [form, scenarios, selectedId]);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedId) || null;

  const canGenerate =
    form.offer.trim().length > 5 &&
    form.target.trim().length > 8 &&
    form.objective.trim().length > 10 &&
    form.blocker.trim().length > 10;

  function updateField<K extends keyof ScenarioForm>(
    key: K,
    value: ScenarioForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function generateScenarios() {
    if (!canGenerate || isGenerating) return;

    if (!API_BASE_URL) {
      setErrorMessage(
        "Configuration API manquante : NEXT_PUBLIC_API_URL est vide.",
      );
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setHasGenerated(false);
    setSelectedId(null);
    setScenarios([]);

    try {
      const response = await fetch(`${API_BASE_URL}/cmo-scenarios/generate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          String(data?.detail || "La génération IA des scénarios a échoué."),
        );
      }

      const generated = normalizeAiScenarios(
        data?.content ?? data?.scenarios ?? data,
      );

      setScenarios(generated);
      setHasGenerated(true);
      setSelectedId(generated[0]?.id || null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erreur inconnue pendant la génération IA des scénarios.",
      );
      setScenarios([]);
      setHasGenerated(false);
      setSelectedId(null);
    } finally {
      setIsGenerating(false);
    }
  }

  function useScenario(scenario: Scenario) {
    const mappedLevel =
      form.prospectLevel === "debutant"
        ? "beginner"
        : form.prospectLevel === "avance_non_rentable"
          ? "advanced"
          : "intermediate";

    const enrichedBlocker = `${scenario.realProblem}

Situation actuelle : ${[
      form.offer.trim() ? `Offre : ${form.offer.trim()}` : "",
      form.target.trim() ? `Cible : ${form.target.trim()}` : "",
      scenario.angle.trim() ? `Angle : ${scenario.angle.trim()}` : "",
      scenario.context.trim() ? `Contexte : ${scenario.context.trim()}` : "",
      scenario.whyItConverts.trim()
        ? `Pourquoi cet angle convertit : ${scenario.whyItConverts.trim()}`
        : "",
      scenario.title.trim() ? `Scénario choisi : ${scenario.title.trim()}` : "",
      mappedLevel ? `Niveau prospect IA : ${mappedLevel}` : "",
    ]
      .filter(Boolean)
      .join("\n")}`;

    const scenarioDispatch = buildFallbackDispatch(
      scenario.objective,
      enrichedBlocker,
      "emailing",
    );
    const scenarioPayload = buildPayload(
      "email",
      scenario.objective,
      enrichedBlocker,
      {
        ...scenarioDispatch,
        diagnostic: `Scénario CMO sélectionné : ${scenario.title}. Niveau prospect IA : ${mappedLevel}. ${scenario.context}`,
        context: {
          ...scenarioDispatch.context,
          objective: scenario.objective,
          blocker: scenario.realProblem,
          offer: form.offer,
          audience: form.target,
          pain: scenario.realProblem,
          desire: scenario.objective,
          angle: scenario.angle,
          promise: scenario.whyItConverts,
          mechanism: scenario.context,
          objection: scenario.realProblem,
          cta: scenarioDispatch.context.cta || "Passer à l’action maintenant",
          tone: "premium, humain, direct",
        },
        decision: {
          recommended_module: "emailing",
          priority_action: `Transformer le scénario “${scenario.title}” en séquence email contextualisée.`,
          reason: scenario.whyItConverts,
        },
        meta: {
          ...(scenarioDispatch.meta || {}),
          mode: "scenario_to_cmo",
          module: "emailing",
          content_generation: "module_only",
        },
      },
    );

    const prefillPayload = {
      source: "scenario-generator",
      mode: "scenario_to_cmo",
      module: "email",
      target: "emailing",
      targetModule: "emailing",
      destination: "emailing",
      objective: scenario.objective,
      blocker: scenario.realProblem,
      situation: enrichedBlocker.replace(
        `${scenario.realProblem}

Situation actuelle : `,
        "",
      ),
      context: scenario.context,
      angle: scenario.angle,
      strategy: scenario.whyItConverts,
      offer: form.offer,
      audience: form.target,
      targetAudience: form.target,
      offerType: form.offerType,
      prospectLevel: mappedLevel,
      rawProspectLevel: form.prospectLevel,
      recommendedScenario: scenario.title,
      dispatch: scenarioPayload.dispatch,
      payload: scenarioPayload,
      generatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(
        "lgd_cmo_scenario_payload",
        JSON.stringify(prefillPayload),
      );
      window.localStorage.setItem(
        "lgd_cmo_module_auto_payload",
        JSON.stringify(scenarioPayload),
      );
      window.localStorage.setItem(
        "lgd_cmo_dispatch_payload",
        JSON.stringify(scenarioPayload),
      );
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
            Crée du contenu • Attire des prospects • Génère tes premières ventes
            avec l’IA
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
              LGD analyse ton offre, ta cible et ton blocage pour préparer des
              angles marketing directement exploitables dans le CMO.
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
                Remplis les champs essentiels. LGD transforme ensuite ta
                situation en angles clairs, utiles et activables.
              </p>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white">
                    Offre à vendre
                  </span>
                  <input
                    value={form.offer}
                    onChange={(event) =>
                      updateField("offer", event.target.value)
                    }
                    placeholder="Ex : coaching perte de poids, ebook productivité, formation crypto..."
                    className="w-full rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#ffcc00]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white">
                    Cible
                  </span>
                  <input
                    value={form.target}
                    onChange={(event) =>
                      updateField("target", event.target.value)
                    }
                    placeholder="Ex : débutants motivés qui n’ont encore aucun résultat"
                    className="w-full rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#ffcc00]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white">
                    Objectif business
                  </span>
                  <textarea
                    value={form.objective}
                    onChange={(event) =>
                      updateField("objective", event.target.value)
                    }
                    placeholder="Ex : vendre un abonnement, obtenir une première vente, réserver un appel découverte..."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#ffcc00]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white">
                    Blocage principal
                  </span>
                  <textarea
                    value={form.blocker}
                    onChange={(event) =>
                      updateField("blocker", event.target.value)
                    }
                    placeholder="Ex : peur d’investir encore, manque de confiance, peur de perdre de l’argent, dispersion..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#ffcc00]"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-white">
                      Type d’offre
                    </span>
                    <select
                      value={form.offerType}
                      onChange={(event) =>
                        updateField(
                          "offerType",
                          event.target.value as OfferType,
                        )
                      }
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
                    <span className="mb-2 block text-sm font-bold text-white">
                      Niveau prospect
                    </span>
                    <select
                      value={form.prospectLevel}
                      onChange={(event) =>
                        updateField(
                          "prospectLevel",
                          event.target.value as ProspectLevel,
                        )
                      }
                      className="w-full rounded-2xl border border-[#80610d] bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ffcc00]"
                    >
                      <option value="debutant">Débutant</option>
                      <option value="bloque">Bloqué</option>
                      <option value="avance_non_rentable">
                        Avancé mais pas rentable
                      </option>
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={generateScenarios}
                  disabled={!canGenerate || isGenerating}
                  className="w-full rounded-2xl bg-[#ffc400] px-5 py-4 text-sm font-black text-black transition hover:bg-[#ffd84a] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isGenerating
                    ? "Génération IA en cours..."
                    : "Générer mes scénarios"}
                </button>

                {scenarios.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setScenarios([]);
                      setSelectedId(null);
                      localStorage.removeItem("lgd_cmo_scenarios_session");
                    }}
                    className="w-full rounded-2xl border border-yellow-600/20 bg-black/40 px-5 py-3 text-sm font-bold text-white/80 transition hover:bg-yellow-500/10"
                  >
                    Réinitialiser les scénarios
                  </button>
                ) : null}

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                    {errorMessage}
                  </div>
                ) : null}
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
                  Choisis un angle. LGD le transmet au CMO pour préparer la
                  suite.
                </p>
              </div>

              {isGenerating ? (
                <div className="flex min-h-[430px] items-center justify-center rounded-[22px] border border-dashed border-[#80610d] bg-black/50 p-8 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-2 border-[#ffcc00] border-t-transparent" />
                    <h4 className="text-lg font-black text-white">
                      Le CMO prépare tes scénarios…
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      Analyse de l’offre, de la cible, du blocage et des angles
                      marketing en cours.
                    </p>
                  </div>
                </div>
              ) : !hasGenerated ? (
                <div className="flex min-h-[430px] items-center justify-center rounded-[22px] border border-dashed border-[#80610d] bg-black/50 p-8 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#80610d] bg-[#1a1404] text-xl text-[#ffcc00]">
                      ✨
                    </div>
                    <h4 className="text-lg font-black text-white">
                      Tes scénarios apparaîtront ici
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      Renseigne l’offre, la cible, l’objectif et le blocage pour
                      générer une base marketing exploitable.
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
                  <p className="text-sm font-black text-white">
                    Blocage enrichi
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    {selectedScenario.realProblem}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#80610d] bg-[#120f06] p-4 md:col-span-2">
                  <p className="text-sm font-black text-white">
                    Contexte stratégique
                  </p>
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
