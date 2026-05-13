
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
type SocialGoal = "Attention" | "Engagement" | "Autorité" | "Leads" | "Vente douce" | "Éducation" | "Commentaires" | "DM";

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

const GOALS: SocialGoal[] = ["Attention", "Engagement", "Autorité", "Leads", "Vente douce", "Éducation", "Commentaires", "DM"];
const NETWORKS: SocialNetwork[] = ["Instagram", "Facebook", "LinkedIn", "TikTok", "Multi-réseaux"];
const TONES: SocialTone[] = ["Premium", "Humain", "Expert", "Émotionnel", "Punchy", "Storytelling"];

function cleanText(value: string) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildLocalGeneration({
  format,
  network,
  goal,
  tone,
  prompt,
}: {
  format: ContentFormat;
  network: SocialNetwork;
  goal: SocialGoal;
  tone: SocialTone;
  prompt: string;
}): SocialAiGeneratedBlock[] {
  const idea = cleanText(prompt) || "Aider une audience bloquée à passer de l'information à l'action.";
  const networkLine = network === "Multi-réseaux" ? "sur tes réseaux" : `sur ${network}`;

  if (format === "carrousel") {
    return [
      { role: "hook", text: "Tu n'as pas besoin d'une idée de plus. Tu as besoin d'un chemin clair." },
      { role: "slide", text: `Slide 2 — Le vrai blocage\n${idea}` },
      { role: "slide", text: "Slide 3 — Pourquoi ça coince\nTrop d'informations, trop de méthodes, trop de choix. Résultat : l'action devient floue." },
      { role: "slide", text: "Slide 4 — Le déclic\nChoisis une seule priorité, transforme-la en action simple, puis avance étape par étape." },
      { role: "slide", text: `Slide 5 — Application ${networkLine}\nUn hook clair, un message utile, une preuve simple et un CTA naturel.` },
      { role: "cta", text: "Si tu veux le chemin complet, commence par structurer ta prochaine action marketing." },
    ];
  }

  if (format === "reel") {
    return [
      { role: "hook", text: "Tu sais déjà beaucoup de choses… mais est-ce que tu avances vraiment ?" },
      { role: "body", text: `Scène 1 : tu ouvres encore une vidéo business.\nScène 2 : tu prends des notes.\nScène 3 : tu refermes tout sans publier, sans capter de lead, sans passer à l'action.\n\nLe problème n'est pas ton niveau. C'est l'absence d'ordre clair.` },
      { role: "cta", text: "Avant de chercher une nouvelle réponse, construis ton prochain pas." },
    ];
  }

  const hook = goal === "Autorité"
    ? "La différence entre une idée intéressante et un contenu qui convertit, c'est la structure."
    : goal === "Engagement"
      ? "Tu consommes beaucoup de contenu business… mais qu'est-ce qui t'empêche vraiment d'agir ?"
      : "Tu n'es pas bloqué parce que tu manques d'informations. Tu es bloqué parce qu'il te manque un ordre clair.";

  return [
    { role: "hook", text: hook },
    {
      role: "body",
      text: `${idea}\n\nUn bon contenu ${networkLine} ne doit pas seulement “sonner bien”. Il doit capter l'attention, clarifier une idée, créer de la confiance et donner envie de faire une prochaine action simple.\n\nTon : ${tone.toLowerCase()}. Objectif : ${goal.toLowerCase()}.`,
    },
    { role: "cta", text: goal === "DM" ? "Écris-moi “PLAN” en DM si tu veux avancer avec une prochaine étape claire." : "Garde ce post si tu veux arrêter d'empiler des idées et commencer à structurer ton action." },
  ];
}

export default function SocialAiModal({ open, onClose, onInject }: Props) {
  const [format, setFormat] = useState<ContentFormat>("post");
  const [goal, setGoal] = useState<SocialGoal>("Attention");
  const [network, setNetwork] = useState<SocialNetwork>("Instagram");
  const [tone, setTone] = useState<SocialTone>("Premium");
  const [activeCategory, setActiveCategory] = useState<SocialPromptCategory>("Hooks");
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<SocialAiGeneratedBlock[]>([]);

  const templates = useMemo(
    () => SOCIAL_PROMPT_LIBRARY.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  if (!open) return null;

  const generate = () => {
    setGenerated(buildLocalGeneration({ format, network, goal, tone, prompt }));
  };

  const inject = () => {
    const blocks = generated.length ? generated : buildLocalGeneration({ format, network, goal, tone, prompt });
    onInject(blocks);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-3 py-5 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-yellow-500/25 bg-[#070707] shadow-[0_0_80px_rgba(255,184,0,0.16)]">
        <div className="flex items-start justify-between border-b border-yellow-500/15 bg-gradient-to-r from-yellow-500/10 to-transparent px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300/80">LGD Social Copilot</div>
            <h2 className="mt-1 text-xl font-bold text-yellow-200">IA Réseaux Sociaux Expert</h2>
            <p className="mt-1 text-sm text-yellow-50/65">Bibliothèque marketing + génération structurée pour posts, carrousels, reels et CTA.</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-yellow-500/20 px-3 py-2 text-yellow-100 hover:bg-yellow-500/10">✕</button>
        </div>

        <div className="grid max-h-[78vh] grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-[330px_1fr]">
          <aside className="border-b border-yellow-500/15 p-4 lg:border-b-0 lg:border-r">
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFormat(item.value)}
                  className={`rounded-xl border px-3 py-2 text-sm ${format === item.value ? "border-yellow-400 bg-yellow-400 text-black" : "border-yellow-500/20 bg-yellow-500/5 text-yellow-100"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-sm text-yellow-300">
                Objectif
                <select value={goal} onChange={(e) => setGoal(e.target.value as SocialGoal)} className="mt-2 w-full rounded-xl border border-yellow-500/20 bg-black px-3 py-2 text-yellow-50">
                  {GOALS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-sm text-yellow-300">
                Réseau
                <select value={network} onChange={(e) => setNetwork(e.target.value as SocialNetwork)} className="mt-2 w-full rounded-xl border border-yellow-500/20 bg-black px-3 py-2 text-yellow-50">
                  {NETWORKS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-sm text-yellow-300">
                Ton
                <select value={tone} onChange={(e) => setTone(e.target.value as SocialTone)} className="mt-2 w-full rounded-xl border border-yellow-500/20 bg-black px-3 py-2 text-yellow-50">
                  {TONES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </aside>

          <main className="p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {SOCIAL_PROMPT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${activeCategory === category ? "border-yellow-400 bg-yellow-400 text-black" : "border-yellow-500/20 text-yellow-100 hover:bg-yellow-500/10"}`}
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
              placeholder="Décris le contenu à créer : cible, douleur, offre, angle, CTA…"
              className="mt-4 min-h-[130px] w-full rounded-2xl border border-yellow-500/20 bg-black/60 px-4 py-3 text-sm leading-6 text-yellow-50 outline-none focus:border-yellow-400"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button onClick={generate} className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300">⚡ Générer la proposition</button>
              <button onClick={inject} className="rounded-2xl border border-yellow-500/35 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-100 hover:bg-yellow-500/20">Injecter dans le canvas</button>
            </div>

            {!!generated.length && (
              <div className="mt-5 rounded-2xl border border-yellow-500/15 bg-black/40 p-4">
                <div className="mb-3 text-sm font-semibold text-yellow-300">Aperçu avant injection</div>
                <div className="space-y-3">
                  {generated.map((block, index) => (
                    <div key={`${block.role}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-yellow-300/70">{block.role}</div>
                      <div className="whitespace-pre-wrap text-sm leading-6 text-yellow-50/85">{block.text}</div>
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
