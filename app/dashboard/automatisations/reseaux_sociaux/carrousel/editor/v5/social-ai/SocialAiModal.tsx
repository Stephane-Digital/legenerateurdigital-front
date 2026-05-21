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
  { label: "Conseils", category: "Conseils", helper: "Conseils experts à donner à ton audience" },
  { label: "Algorithmes", category: "Algorithmes", helper: "Astuces publication, rétention, commentaires" },
  { label: "Viralité", category: "Viralité", helper: "Angles partageables sans contenu cringe" },
  { label: "90 jours", category: "Conseils 90 jours", helper: "Base du futur plan LIVE IA 90 jours" },
];


function cleanText(value: string) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/\r/g, "")
    .replace(/^\s*(HOOK|BODY|CTA|TITRE|LÉGENDE|LEGENDE|SLIDE)\s*[:：-]\s*/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function compact(value: string) {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

function inferOffer(prompt: string) {
  const text = compact(prompt);

  if (!text) {
    return "ton offre";
  }

  const offerMatch = text.match(/(?:je\s+vends|je\s+propose|offre\s*:|produit\s*:|service\s*:|formation\s*:|programme\s*:)([^.\n;]+)/i);
  if (offerMatch?.[1]) {
    return offerMatch[1].trim();
  }

  return text.length > 120 ? `${text.slice(0, 117).trim()}...` : text;
}

function inferAudience(prompt: string) {
  const text = compact(prompt);
  const audienceMatch = text.match(/(?:cible\s*:|audience\s*:|pour\s+des?|pour\s+les|j'aide\s+les?|j’aide\s+les?)([^.\n;]+)/i);

  if (audienceMatch?.[1]) {
    return audienceMatch[1].trim();
  }

  if (/mrr|master resale|affiliation|produits digitaux/i.test(text)) {
    return "les personnes qui veulent vendre des produits digitaux mais restent bloquées au moment de publier et convertir";
  }

  if (/coach|consultant|accompagnement/i.test(text)) {
    return "les indépendants qui veulent vendre leur expertise sans paraître insistants";
  }

  if (/parent|maman|famille|charge mentale/i.test(text)) {
    return "les personnes qui veulent avancer dans leur business malgré le manque de temps et la charge mentale";
  }

  return "les personnes qui veulent obtenir un résultat concret mais se sentent encore bloquées";
}

function inferPain(prompt: string) {
  const text = compact(prompt);
  const painMatch = text.match(/(?:douleur\s*:|problème\s*:|probleme\s*:|blocage\s*:|peur\s*:)([^.\n;]+)/i);

  if (painMatch?.[1]) {
    return painMatch[1].trim();
  }

  if (/page blanche|quoi publier|contenu/i.test(text)) {
    return "la page blanche qui revient à chaque publication";
  }

  if (/mrr|formation|affiliation|produits digitaux/i.test(text)) {
    return "avoir acheté des méthodes mais ne pas réussir à les transformer en contenus, leads et ventes";
  }

  if (/temps|débordé|fatigue|fatigué/i.test(text)) {
    return "le manque de temps, la fatigue et l'impression de devoir tout refaire à zéro";
  }

  return "la frustration de savoir quoi faire en théorie, mais de ne pas réussir à passer à l'action clairement";
}

function inferPromise(prompt: string) {
  const text = compact(prompt);
  const promiseMatch = text.match(/(?:promesse\s*:|résultat\s*:|resultat\s*:|objectif\s*:|transformation\s*:)([^.\n;]+)/i);

  if (promiseMatch?.[1]) {
    return promiseMatch[1].trim();
  }

  if (/lead|prospect/i.test(text)) {
    return "attirer des prospects plus qualifiés avec un message plus clair";
  }

  if (/vendre|vente|abonnement|client/i.test(text)) {
    return "transformer l'attention en confiance, puis en demande réelle";
  }

  return "avancer avec un message plus clair, plus simple et plus facile à publier";
}

function ctaForGoal(goal: SocialGoal) {
  if (goal === "DM") return "Écris-moi “PLAN” en DM et je t'envoie une première structure simple.";
  if (goal === "Commentaires") return "Commente “PLAN” si tu veux une structure simple pour avancer sans repartir de zéro.";
  if (goal === "Leads") return "Commente “GUIDE” et je t'envoie la version simple à appliquer.";
  if (goal === "Vente douce") return "Si tu veux aller plus loin, envoie-moi “INFO” et je te montre comment ça peut s'appliquer à ta situation.";
  if (goal === "Engagement") return "Dis-moi en commentaire : c'est quoi ton plus gros blocage aujourd'hui ?";
  return "Garde ce post pour la prochaine fois où tu sens que tu repars de zéro.";
}

function networkStyle(network: SocialNetwork, format: ContentFormat) {
  if (format === "reel" || network === "TikTok") {
    return {
      rhythm: "phrases très courtes, tension rapide, visuel mental immédiat",
      hook: "Tu ne manques pas d'idées. Tu manques d'un angle qui donne envie d'agir.",
    };
  }

  if (network === "LinkedIn" || format === "linkedin") {
    return {
      rhythm: "autorité calme, crédibilité, phrases nettes, angle business mature",
      hook: "Le contenu qui convertit ne commence pas par une idée. Il commence par une tension précise.",
    };
  }

  if (network === "Facebook" || format === "facebook") {
    return {
      rhythm: "conversation humaine, proximité, simplicité, phrases naturelles",
      hook: "Il y a un moment où tu réalises que le problème n'est pas de savoir quoi faire.",
    };
  }

  return {
    rhythm: "relatable, visuel, émotion + clarté, sauvegardable",
    hook: "Tu peux avoir la bonne offre et rester invisible si ton message part dans tous les sens.",
  };
}

function toneInstruction(tone: SocialTone) {
  if (tone === "Punchy") return "direct, nerveux, phrases courtes, zéro détour";
  if (tone === "Émotionnel") return "émotionnel, réaliste, proche du vécu, sans dramatiser";
  if (tone === "Expert") return "expert, structuré, précis, crédible, sans jargon inutile";
  if (tone === "Humain") return "humain, simple, chaleureux, avec une sensation de conversation";
  if (tone === "Storytelling") return "narratif, visuel, scène concrète, progression naturelle";
  return "premium, clair, crédible, désirable, sans agressivité commerciale";
}

function buildMegaPrompt({
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
}) {
  const idea = cleanText(prompt);
  const offer = inferOffer(idea);
  const audience = inferAudience(idea);
  const pain = inferPain(idea);
  const promise = inferPromise(idea);
  const style = networkStyle(network, format);

  return {
    idea,
    offer,
    audience,
    pain,
    promise,
    style,
    directive: [
      "MISSION : créer un contenu social média impossible à ignorer et directement publiable.",
      `OFFRE / SUJET : ${offer}`,
      `AUDIENCE : ${audience}`,
      `DOULEUR DOMINANTE : ${pain}`,
      `PROMESSE / RÉSULTAT : ${promise}`,
      `PLATEFORME : ${network}`,
      `FORMAT : ${format}`,
      `OBJECTIF BUSINESS : ${goal}`,
      `TON : ${toneInstruction(tone)}`,
      `RYTHME : ${style.rhythm}`,
      "RÈGLES : zéro blabla, zéro phrase IA générique, zéro conseil théorique, zéro mention d'un outil ou d'une plateforme non demandée, aucun label HOOK/BODY/CTA dans le rendu final.",
      "STRUCTURE : hook fort, tension réelle, problème précis, déclic, micro-solution, CTA naturel.",
    ].join("\n"),
  };
}

function buildPostBlocks({
  goal,
  network,
  tone,
  prompt,
  format,
}: {
  goal: SocialGoal;
  network: SocialNetwork;
  tone: SocialTone;
  prompt: string;
  format: ContentFormat;
}): SocialAiGeneratedBlock[] {
  const context = buildMegaPrompt({ format, network, goal, tone, prompt });
  const cta = ctaForGoal(goal);

  const hook = goal === "Autorité"
    ? "La plupart des contenus ne manquent pas d'idées. Ils manquent d'une raison claire d'être lus jusqu'au bout."
    : goal === "Engagement"
      ? "Soyons honnêtes : ce n'est pas toujours l'offre qui bloque. Parfois, c'est juste le message qui ne touche personne."
      : goal === "Vente douce"
        ? "Vendre sans forcer, ce n'est pas parler moins de son offre. C'est mieux faire ressentir pourquoi elle compte."
        : context.style.hook;

  const body = [
    `Si tu t'adresses à ${context.audience}, tu ne peux pas te contenter d'un message propre.`,
    "",
    "Il faut viser la tension exacte.",
    "Le moment où la personne se dit :",
    "“Oui. C'est exactement ce que je vis.”",
    "",
    `Ici, la tension est simple : ${context.pain}.`,
    "",
    "Tant que ton contenu reste général, il est facile à ignorer.",
    "Quand il nomme le vrai blocage, il devient difficile à oublier.",
    "",
    `Le but n'est pas de publier plus. Le but est de publier un message qui rend ${context.promise} plus évident, plus concret et plus désirable.`,
    "",
    cta,
  ].join("\n");

  return [
    { role: "hook", text: cleanText(hook) },
    { role: "body", text: cleanText(body) },
  ];
}

function buildCarouselBlocks({
  goal,
  network,
  tone,
  prompt,
  format,
}: {
  goal: SocialGoal;
  network: SocialNetwork;
  tone: SocialTone;
  prompt: string;
  format: ContentFormat;
}): SocialAiGeneratedBlock[] {
  const context = buildMegaPrompt({ format, network, goal, tone, prompt });
  const cta = ctaForGoal(goal);

  return [
    {
      role: "slide",
      text: cleanText(`Tu ne manques pas forcément d'idées.\n\nTu manques peut-être d'un message qui donne envie d'agir.`),
    },
    {
      role: "slide",
      text: cleanText(`Le vrai blocage\n\n${context.pain}.\n\nEt tant que ce blocage reste flou, chaque publication paraît plus compliquée qu'elle ne devrait.`),
    },
    {
      role: "slide",
      text: cleanText(`L'erreur classique\n\nParler de ton offre trop tôt.\n\nAvant de vendre, ton contenu doit d'abord faire sentir à la bonne personne que tu as compris sa situation.`),
    },
    {
      role: "slide",
      text: cleanText(`Le déclic\n\nUn bon contenu ne cherche pas à impressionner tout le monde.\n\nIl parle précisément à ${context.audience}.`),
    },
    {
      role: "slide",
      text: cleanText(`La structure simple\n\n1. Nommer la tension\n2. Montrer l'erreur\n3. Donner un angle clair\n4. Proposer une prochaine action`),
    },
    {
      role: "cta",
      text: cleanText(cta),
    },
  ];
}

function buildReelBlocks({
  goal,
  network,
  tone,
  prompt,
  format,
}: {
  goal: SocialGoal;
  network: SocialNetwork;
  tone: SocialTone;
  prompt: string;
  format: ContentFormat;
}): SocialAiGeneratedBlock[] {
  const context = buildMegaPrompt({ format, network, goal, tone, prompt });
  const cta = ctaForGoal(goal);

  return [
    {
      role: "hook",
      text: cleanText("Arrête de chercher une nouvelle idée si ton message actuel ne donne déjà envie à personne de répondre."),
    },
    {
      role: "body",
      text: cleanText([
        "Plan vidéo court :",
        "",
        "Face caméra.",
        "Tu regardes l'objectif.",
        "Pause d'une seconde.",
        "",
        `“Si tu parles à ${context.audience}, ton contenu ne doit pas commencer par ce que tu vends.”`,
        "",
        `“Il doit commencer par ce que la personne vit déjà : ${context.pain}.”`,
        "",
        "“Quand elle se sent comprise, elle écoute.”",
        "“Quand elle écoute, elle peut faire confiance.”",
        "“Et quand elle fait confiance, ton offre devient enfin logique.”",
        "",
        cta,
      ].join("\n")),
    },
  ];
}

function buildStoryBlocks({
  goal,
  network,
  tone,
  prompt,
  format,
}: {
  goal: SocialGoal;
  network: SocialNetwork;
  tone: SocialTone;
  prompt: string;
  format: ContentFormat;
}): SocialAiGeneratedBlock[] {
  const context = buildMegaPrompt({ format, network, goal, tone, prompt });
  const cta = ctaForGoal(goal);

  return [
    {
      role: "hook",
      text: cleanText("Un jour, tu réalises que ce n'est pas l'envie qui manque."),
    },
    {
      role: "body",
      text: cleanText([
        "Tu as l'idée.",
        "Tu connais ton sujet.",
        "Tu sais que tu devrais publier.",
        "",
        "Mais au moment d'écrire, tout devient lourd.",
        "",
        `Parce que derrière le contenu, il y a souvent ${context.pain}.`,
        "",
        "Alors tu repousses.",
        "Tu sauvegardes une autre méthode.",
        "Tu te dis que tu publieras demain.",
        "",
        "Le déclic, ce n'est pas d'avoir plus d'inspiration.",
        "C'est d'avoir un angle clair, une tension précise et une prochaine action simple.",
        "",
        `C'est comme ça que tu passes de “je devrais publier” à “je sais exactement quoi dire pour ${context.promise}”.`,
        "",
        cta,
      ].join("\n")),
    },
  ];
}


function buildAuthorityAdviceBlocks({
  goal,
  network,
  tone,
  prompt,
  format,
  category,
}: {
  goal: SocialGoal;
  network: SocialNetwork;
  tone: SocialTone;
  prompt: string;
  format: ContentFormat;
  category: SocialPromptCategory;
}): SocialAiGeneratedBlock[] {
  const context = buildMegaPrompt({ format, network, goal, tone, prompt });
  const cta = ctaForGoal(goal);

  const categoryKey = String(category);

  const angle =
    categoryKey === "Algorithmes"
      ? "Algorithme"
      : categoryKey === "Viralité"
        ? "Viralité douce"
        : categoryKey === "Conseils 90 jours"
            ? "Plan de conseils 90 jours"
            : categoryKey === "Conseils"
              ? "Conseil d'expert"
              : "Autorité";

  const hook =
    categoryKey === "Algorithmes"
      ? "Ton contenu ne floppe pas toujours parce qu'il est mauvais. Souvent, il commence trop lentement."
      : categoryKey === "Viralité"
        ? "Le contenu viral ne crie pas plus fort. Il touche une tension que beaucoup vivent en silence."
        : categoryKey === "Conseils 90 jours"
          ? "Une audience ne s’attache pas à un compte parce qu’il publie une fois fort. Elle s’attache parce qu’il l’aide régulièrement."
          : "Un bon conseil ne donne pas juste une astuce. Il aide ton audience à comprendre pourquoi elle bloque.";

  const body = [
    `${angle} :`,
    "",
    hook,
    "",
    `Si tu parles à ${context.audience}, commence par nommer le vrai blocage : ${context.pain}.`,
    "",
    "Ensuite, donne une seule idée simple.",
    "Pas 12 astuces.",
    "Pas un cours complet.",
    "Une idée claire que la personne peut retenir, sauvegarder ou appliquer aujourd'hui.",
    "",
    categoryKey === "Algorithmes"
      ? "Sur les réseaux, les premières secondes servent à créer une raison de rester. Si le lecteur ne comprend pas vite pourquoi ça le concerne, il part."
      : categoryKey === "Viralité"
        ? "Un contenu partageable donne souvent cette sensation : “je pensais être le seul à vivre ça”. C'est cette reconnaissance qui crée la réaction."
        : categoryKey === "Conseils 90 jours"
          ? "Le bon système consiste à alterner conseils pratiques, erreurs fréquentes, mini-frameworks, objections, algorithmes, storytelling et appels à l’action. C’est cette variété qui évite la répétition."
          : "L'autorité ne vient pas du vocabulaire compliqué. Elle vient de la précision avec laquelle tu nommes le problème.",
    "",
    `Le meilleur angle ici : montrer comment passer de “${context.pain}” à “${context.promise}”, sans promettre de miracle.`,
    "",
    cta,
  ].join("\n");

  return [
    { role: "hook", text: cleanText(hook) },
    { role: "body", text: cleanText(body) },
  ];
}

function buildLocalGeneration({
  format,
  network,
  goal,
  tone,
  prompt,
  category,
}: {
  format: ContentFormat;
  network: SocialNetwork;
  goal: SocialGoal;
  tone: SocialTone;
  prompt: string;
  category?: SocialPromptCategory;
}): SocialAiGeneratedBlock[] {
  const authorityAdviceCategories: SocialPromptCategory[] = ["Conseils", "Algorithmes", "Viralité", "Conseils 90 jours"];

  if (category && authorityAdviceCategories.includes(category)) {
    return buildAuthorityAdviceBlocks({ format, network, goal, tone, prompt, category });
  }

  if (format === "carrousel") {
    return buildCarouselBlocks({ format, network, goal, tone, prompt });
  }

  if (format === "reel") {
    return buildReelBlocks({ format, network, goal, tone, prompt });
  }

  if (format === "story") {
    return buildStoryBlocks({ format, network, goal, tone, prompt });
  }

  return buildPostBlocks({ format, network, goal, tone, prompt });
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
    setGenerated(buildLocalGeneration({ format, network, goal, tone, prompt, category: activeCategory }));
  };

  const inject = () => {
    const blocks = generated.length
      ? generated
      : buildLocalGeneration({ format, network, goal, tone, prompt, category: activeCategory });
    onInject(blocks);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 px-3 py-5 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-yellow-500/25 bg-[#070707] shadow-[0_0_80px_rgba(255,184,0,0.16)]">
        <div className="flex items-start justify-between border-b border-yellow-500/15 bg-gradient-to-r from-yellow-500/10 to-transparent px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300/80">
              Social Copilot V2
            </div>
            <h2 className="mt-1 text-xl font-bold text-yellow-200">IA Réseaux Sociaux Expert</h2>
            <p className="mt-1 text-sm text-yellow-50/65">
              Prompts marketing premium + génération orientée résultats pour posts, carrousels, reels et CTA.
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
              Le moteur V2 analyse l'offre, l'audience, la douleur, la promesse et le réseau pour produire du contenu orienté résultat, sans page blanche.
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
                      setPrompt(
                        SOCIAL_PROMPT_LIBRARY.find((template) => template.category === item.category)?.prompt || ""
                      );
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

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={generate}
                className="rounded-2xl bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300"
              >
                ⚡ Générer la proposition
              </button>
              <button
                onClick={inject}
                className="rounded-2xl border border-yellow-500/35 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-100 hover:bg-yellow-500/20"
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
