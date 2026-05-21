"use client";

import { useMemo, useState } from "react";
import {
  SOCIAL_PROMPT_CATEGORIES,
  SOCIAL_PROMPT_LIBRARY,
  type SocialPromptCategory,
} from "./socialPromptLibrary";

export type SocialAiGeneratedBlock = {
  role: "hook" | "body" | "cta" | "slide" | "title";
  text: string;
};

type ContentFormat = "post" | "carrousel" | "story" | "reel" | "linkedin" | "facebook";
type SocialNetwork = "Instagram" | "Facebook" | "LinkedIn" | "TikTok" | "Multi-réseaux";
type SocialTone = "Premium" | "Humain" | "Expert" | "Émotionnel" | "Punchy" | "Storytelling";
type SocialGoal =
  | "Attention"
  | "Engagement"
  | "Autorité"
  | "Leads"
  | "Vente douce"
  | "Éducation"
  | "Commentaires"
  | "DM";

interface Props {
  open: boolean;
  onClose: () => void;
  onInject: (blocks: SocialAiGeneratedBlock[]) => void;
}

const FORMAT_OPTIONS: { value: ContentFormat; label: string }[] = [
  { value: "post", label: "Post simple" },
  { value: "carrousel", label: "Carrousel" },
  { value: "story", label: "Story" },
  { value: "reel", label: "Reel script" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
];

const GOALS: SocialGoal[] = [
  "Attention",
  "Engagement",
  "Autorité",
  "Leads",
  "Vente douce",
  "Éducation",
  "Commentaires",
  "DM",
];

const NETWORKS: SocialNetwork[] = [
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "Multi-réseaux",
];

const TONES: SocialTone[] = [
  "Premium",
  "Humain",
  "Expert",
  "Émotionnel",
  "Punchy",
  "Storytelling",
];

const QUICK_ADVICE_CATEGORIES: { label: string; category: SocialPromptCategory; helper: string }[] = [
  { label: "Conseils", category: "Conseils", helper: "1 idée forte, utile, mobile-first" },
  { label: "Algorithmes", category: "Algorithmes", helper: "Hook, rétention, commentaires, sauvegardes" },
  { label: "Viralité", category: "Viralité", helper: "Relatable, partageable, zéro cringe" },
  { label: "90 jours", category: "Conseils 90 jours", helper: "Plan LIVE IA long terme" },
];

function cleanText(value: unknown) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/\r/g, "")
    .replace(/^\s*(HOOK|BODY|CTA|TITRE|LÉGENDE|LEGENDE|SLIDE)\s*[:：-]\s*/gim, "")
    .replace(/\n{4,}/g, "\n\n")
    .trim();
}

function compact(value: unknown) {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

function inferOffer(prompt: string) {
  const text = compact(prompt);
  if (!text) return "";

  const offerMatch = text.match(/(?:je\s+vends|je\s+propose|offre\s*:|produit\s*:|service\s*:|formation\s*:|programme\s*:)([^.\n;]+)/i);
  if (offerMatch?.[1]) return offerMatch[1].trim();

  if (/mrr|master resale|produits digitaux|formation/i.test(text)) return "formation / produit digital / MRR";

  return text.length > 140 ? `${text.slice(0, 137).trim()}...` : text;
}

function inferAudience(prompt: string) {
  const text = compact(prompt);
  const audienceMatch = text.match(/(?:cible\s*:|audience\s*:|pour\s+des?|pour\s+les|j'aide\s+les?|j’aide\s+les?)([^.\n;]+)/i);
  if (audienceMatch?.[1]) return audienceMatch[1].trim();

  if (/mrr|master resale|formation|produits digitaux|affiliation/i.test(text)) {
    return "débutants MRR / produits digitaux qui consomment beaucoup de contenus mais publient peu";
  }

  return "personnes qui veulent avancer mais restent bloquées au moment d’agir";
}

function inferPain(prompt: string) {
  const text = compact(prompt);
  const painMatch = text.match(/(?:douleur\s*:|problème\s*:|probleme\s*:|blocage\s*:|peur\s*:)([^.\n;]+)/i);
  if (painMatch?.[1]) return painMatch[1].trim();

  if (/mrr|master resale|formation|produits digitaux|affiliation/i.test(text)) {
    return "trop apprendre, trop regarder de vidéos, ne pas publier, ne pas générer de prospects ni de ventes";
  }

  if (/page blanche|quoi publier|contenu/i.test(text)) return "la page blanche au moment de publier";

  return "savoir quoi faire en théorie, mais ne pas passer à l’action";
}

function inferPromise(prompt: string) {
  const text = compact(prompt);
  const promiseMatch = text.match(/(?:promesse\s*:|résultat\s*:|resultat\s*:|objectif\s*:|transformation\s*:)([^.\n;]+)/i);
  if (promiseMatch?.[1]) return promiseMatch[1].trim();

  if (/vente|vendre|prospect|lead/i.test(text)) return "publier un message plus clair qui peut attirer des prospects et des ventes";

  return "passer d’une idée floue à un contenu publiable immédiatement";
}

function normalizeBlocks(value: unknown): SocialAiGeneratedBlock[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const obj = item as Partial<SocialAiGeneratedBlock>;
      const role = String(obj.role || "body").toLowerCase();
      const safeRole: SocialAiGeneratedBlock["role"] =
        role === "hook" || role === "cta" || role === "slide" || role === "title" ? role : "body";
      const text = cleanText(obj.text);
      return text ? { role: safeRole, text } : null;
    })
    .filter(Boolean) as SocialAiGeneratedBlock[];
}

function apiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    ""
  ).replace(/\/$/, "");
}

async function generateLiveSocialAi(payload: Record<string, unknown>) {
  const baseUrl = apiBaseUrl();
  const response = await fetch(`${baseUrl}/social-ai/live/generate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Erreur LIVE IA Social AI.";
    try {
      const errorData = await response.json();
      message = typeof errorData?.detail === "string" ? errorData.detail : JSON.stringify(errorData?.detail || errorData);
    } catch {
      message = await response.text();
    }
    throw new Error(message || "Erreur LIVE IA Social AI.");
  }

  return response.json();
}

export default function SocialAiModal({ open, onClose, onInject }: Props) {
  const [format, setFormat] = useState<ContentFormat>("post");
  const [goal, setGoal] = useState<SocialGoal>("Attention");
  const [network, setNetwork] = useState<SocialNetwork>("Instagram");
  const [tone, setTone] = useState<SocialTone>("Premium");
  const [activeCategory, setActiveCategory] = useState<SocialPromptCategory>("Hooks");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<SocialAiGeneratedBlock[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const templates = useMemo(
    () => SOCIAL_PROMPT_LIBRARY.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  if (!open) return null;

  const buildPayload = () => {
    const selectedTemplate = templates.find((template) => template.prompt === prompt);
    const finalPrompt = cleanText(prompt || selectedTemplate?.prompt || "");

    return {
      format,
      network,
      goal,
      objective: goal,
      category: activeCategory,
      tone,
      prompt: finalPrompt,
      brief: finalPrompt,
      context: finalPrompt,
      offer: inferOffer(finalPrompt),
      subject: inferOffer(finalPrompt),
      audience: inferAudience(finalPrompt),
      target: inferAudience(finalPrompt),
      pain: inferPain(finalPrompt),
      promise: inferPromise(finalPrompt),
      cta: "CTA court, humain, naturel, sans pression commerciale.",
    };
  };

  const generate = async () => {
    setError("");
    setIsGenerating(true);
    try {
      const data = await generateLiveSocialAi(buildPayload());
      const blocks = normalizeBlocks(data?.blocks);
      if (!blocks.length) throw new Error("La réponse LIVE IA ne contient aucun bloc exploitable.");
      setGenerated(blocks);
    } catch (err) {
      setGenerated([]);
      setError(err instanceof Error ? err.message : "Erreur LIVE IA inconnue.");
    } finally {
      setIsGenerating(false);
    }
  };

  const inject = async () => {
    if (generated.length) {
      onInject(generated);
      return;
    }

    setError("");
    setIsGenerating(true);
    try {
      const data = await generateLiveSocialAi(buildPayload());
      const blocks = normalizeBlocks(data?.blocks);
      if (!blocks.length) throw new Error("La réponse LIVE IA ne contient aucun bloc exploitable.");
      setGenerated(blocks);
      onInject(blocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur LIVE IA inconnue.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-3 py-5 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-yellow-500/25 bg-[#070707] shadow-[0_0_80px_rgba(255,184,0,0.16)]">
        <div className="flex items-start justify-between border-b border-yellow-500/15 bg-gradient-to-r from-yellow-500/10 to-transparent px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300/80">
              Social Copilot LIVE
            </div>
            <h2 className="mt-1 text-xl font-bold text-yellow-200">IA Réseaux Sociaux Expert</h2>
            <p className="mt-1 text-sm text-yellow-50/65">
              LIVE IA uniquement : zéro fallback, zéro pavé, contenu mobile-first directement publiable.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-yellow-500/20 px-3 py-2 text-yellow-100 hover:bg-yellow-500/10"
          >
            ✕
          </button>
        </div>

        <div className="grid max-h-[78vh] grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-[330px_1fr]">
          <aside className="border-b border-yellow-500/15 p-4 lg:border-b-0 lg:border-r">
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFormat(item.value)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    format === item.value
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : "border-yellow-500/20 bg-yellow-500/5 text-yellow-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-sm text-yellow-300">
                Objectif
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as SocialGoal)}
                  className="mt-2 w-full rounded-xl border border-yellow-500/20 bg-black px-3 py-2 text-yellow-50"
                >
                  {GOALS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-yellow-300">
                Réseau
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as SocialNetwork)}
                  className="mt-2 w-full rounded-xl border border-yellow-500/20 bg-black px-3 py-2 text-yellow-50"
                >
                  {NETWORKS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-yellow-300">
                Ton
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as SocialTone)}
                  className="mt-2 w-full rounded-xl border border-yellow-500/20 bg-black px-3 py-2 text-yellow-50"
                >
                  {TONES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.04] p-3 text-xs leading-5 text-yellow-50/65">
              Le frontend ne génère plus localement. Toute génération passe par le backend LIVE IA.
            </div>
          </aside>

          <main className="p-4">
            <div className="mb-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] p-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-yellow-300">
                Conseils audience & croissance
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {QUICK_ADVICE_CATEGORIES.map((item) => (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(item.category);
                      setPrompt(SOCIAL_PROMPT_LIBRARY.find((template) => template.category === item.category)?.prompt || "");
                    }}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      activeCategory === item.category
                        ? "border-yellow-400 bg-yellow-400 text-black"
                        : "border-yellow-500/25 bg-black/30 text-yellow-50 hover:border-yellow-400/60 hover:bg-yellow-500/10"
                    }`}
                  >
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className={`mt-1 text-[11px] leading-4 ${activeCategory === item.category ? "text-black/70" : "text-yellow-50/55"}`}>
                      {item.helper}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {SOCIAL_PROMPT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    activeCategory === category
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : "border-yellow-500/20 text-yellow-100 hover:bg-yellow-500/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {templates.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPrompt(item.prompt)}
                  className="rounded-2xl border border-yellow-500/15 bg-white/[0.03] p-4 text-left hover:border-yellow-400/50 hover:bg-yellow-500/10"
                >
                  <div className="font-semibold text-yellow-200">{item.title}</div>
                  <p className="mt-1 text-sm leading-5 text-yellow-50/65">{item.description}</p>
                </button>
              ))}
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décris le contenu à créer : offre, cible, douleur, promesse, objection, angle, CTA…"
              className="mt-4 min-h-[130px] w-full rounded-2xl border border-yellow-500/20 bg-black/60 px-4 py-3 text-sm leading-6 text-yellow-50 outline-none focus:border-yellow-400"
            />

            {!!error && (
              <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={generate}
                disabled={isGenerating}
                className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? "LIVE IA en cours…" : "⚡ Générer LIVE IA"}
              </button>
              <button
                onClick={inject}
                disabled={isGenerating}
                className="rounded-2xl border border-yellow-500/35 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-100 hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Injecter dans le canvas
              </button>
            </div>

            {!!generated.length && (
              <div className="mt-5 rounded-2xl border border-yellow-500/15 bg-black/40 p-4">
                <div className="mb-3 text-sm font-semibold text-yellow-300">Aperçu avant injection</div>
                <div className="space-y-3">
                  {generated.map((block, index) => (
                    <div key={`${block.role}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-yellow-300/70">
                        {block.role}
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-6 text-yellow-50/85">
                        {block.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
