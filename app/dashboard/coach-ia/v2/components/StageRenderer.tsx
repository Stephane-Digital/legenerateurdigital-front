"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getBehaviorTags,
  makeOptimizationRecFromBlocker,
} from "../lib/alexBehaviorEngine";
import {
  canRegenPlan,
  commitPlanRegen,
  getCoachPlanLimits,
  getUpgradeHintForPlanRegen,
  tierFromPlanLabel,
  type PlanTier,
} from "../lib/planPolicy";
import type {
  AlexAudienceSize,
  AlexBusinessGoal,
  AlexBusinessModel,
  AlexContext,
  AlexIntent,
  AlexLevel,
  AlexMainBlocker,
  AlexRoadmap,
  AlexStage,
  AlexToday,
  DailyLog,
  TimePerDay,
} from "../lib/types";

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#2a2416] bg-black/20 px-3 py-1 text-xs text-white/60">
      {children}
    </span>
  );
}

type FormActionParcours =
  | "creation_produit_digital"
  | "mrr"
  | "affiliation"
  | "code_liberte"
  | "non_defini";

type FormActionBusinessProject = {
  offerDescription?: string;
  problemSolved?: string;
  transformationPromise?: string;
  targetAudienceDescription?: string;
  personaName?: string;
  positioning?: string;
  businessModel?: AlexBusinessModel;
  parcours?: FormActionParcours;
  recommendedPlatform?: string;
  platformReason?: string;
  estimatedTimeBeforeSale?: string;
  firstRevenueGoal?: string;
  nextMission?: string;
  missionFollowing?: string;
  contentAngle?: string;
  salesAngle?: string;
  offerReadinessScore?: number;
  updatedAtISO?: string;
};

function normalizeText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectMrrFromText(value: unknown) {
  const lower = normalizeText(value).toLowerCase();
  return (
    lower.includes("mrr") ||
    lower.includes("master resell rights") ||
    lower.includes("droits de revente") ||
    lower.includes("droit de revente") ||
    lower.includes("licence de revente") ||
    lower.includes("revente")
  );
}

function detectLidFromText(value: unknown) {
  const lower = normalizeText(value).toLowerCase();
  return (
    lower.includes("l'indépendance digital") ||
    lower.includes("l’indépendance digital") ||
    lower.includes("indépendance digital") ||
    lower.includes("independance digital") ||
    lower.includes("lid")
  );
}

function labelBusinessModel(model: AlexBusinessModel) {
  if (model === "affiliation") return "Affiliation";
  if (model === "offre_digitale") return "Création de produit digital";
  if (model === "coaching") return "Coaching / accompagnement";
  if (model === "contenu") return "Contenu + audience";
  return "Modèle à confirmer";
}

function labelBusinessModelForProject(
  project?: FormActionBusinessProject | null,
  model?: AlexBusinessModel,
) {
  if (project?.parcours === "mrr" || detectMrrFromText(project?.offerDescription)) {
    return "Formation MRR";
  }
  return labelBusinessModel((project?.businessModel || model || "pas_encore") as AlexBusinessModel);
}

function labelBusinessGoal(goal: AlexBusinessGoal) {
  if (goal === "revenu_500") return "500€/mois";
  if (goal === "premiers_clients") return "premiers clients";
  if (goal === "quitter_job") return "sortie progressive du salariat";
  if (goal === "business_stable") return "business stable";
  return "premiers revenus";
}

function labelLevel(level: AlexLevel) {
  if (level === "sans_resultat") return "a déjà essayé sans résultat";
  if (level === "quelques_ventes") return "a déjà généré quelques ventes";
  return "débute aujourd’hui";
}

function labelAudienceSize(size: AlexAudienceSize) {
  if (size === "zero") return "part de zéro";
  if (size === "500_5000") return "dispose déjà d’une petite audience";
  if (size === "plus_5000") return "dispose déjà d’une audience exploitable";
  return "a une audience encore limitée";
}

function labelBlocker(blocker: AlexMainBlocker) {
  if (blocker === "temps") return "manque de temps";
  if (blocker === "technique") return "bloque sur la technique";
  if (blocker === "vente") return "ne sait pas vendre simplement";
  if (blocker === "confiance") return "manque de confiance";
  return "se disperse trop";
}


type DigitalProductOpportunity = {
  id: string;
  title: string;
  badge: string;
  demand: string;
  score: number;
  why: string;
  product: string;
  price: string;
  offerDescription: string;
  problemSolved: string;
  transformationPromise: string;
  targetAudienceDescription: string;
};

const DIGITAL_PRODUCT_OPPORTUNITIES: DigitalProductOpportunity[] = [
  {
    id: "reconversion_45_plus",
    title: "Reconversion professionnelle 45+",
    badge: "Demande très forte",
    demand: "Salariés, indépendants fragilisés, personnes en transition",
    score: 96,
    why: "Marché émotionnel, besoin urgent de sécurité, envie de créer un revenu complémentaire sans repartir de zéro.",
    product: "Formation courte + plan 30 jours + templates d’action",
    price: "197€ à 497€",
    offerDescription:
      "Un programme digital destiné aux salariés et personnes en transition professionnelle de 45 ans et plus, pour construire progressivement une activité en ligne simple, réaliste et compatible avec leur temps disponible.",
    problemSolved:
      "Aider des personnes expérimentées mais bloquées à transformer leur vécu, leurs compétences ou leur besoin de changement en projet digital concret, sans prendre de risque brutal.",
    transformationPromise:
      "Passer d’une inquiétude professionnelle et d’une impression d’être dépassé à un plan clair pour créer une première offre digitale, attirer une audience ciblée et préparer un revenu complémentaire.",
    targetAudienceDescription:
      "Avatar : Sophie, 49 ans. Elle travaille encore, sent que son avenir professionnel est fragile et veut construire une alternative. Elle a peur de la technique, manque de temps et veut une méthode rassurante, simple, guidée et adaptée à son âge.",
  },
  {
    id: "ia_solopreneurs",
    title: "IA pour indépendants et petites entreprises",
    badge: "Potentiel IA énorme",
    demand: "Freelances, artisans, consultants, TPE",
    score: 94,
    why: "Forte demande pour gagner du temps, produire du contenu, mieux vendre et automatiser sans recruter.",
    product: "Mini-formation IA + prompts prêts à l’emploi + cas pratiques",
    price: "97€ à 297€",
    offerDescription:
      "Une formation pratique qui aide les indépendants, freelances et petites entreprises à utiliser l’IA pour créer du contenu, gagner du temps, mieux structurer leurs offres et améliorer leur communication commerciale.",
    problemSolved:
      "Aider les professionnels seuls ou débordés à utiliser l’IA de façon concrète, sans jargon, pour produire plus vite et mieux vendre sans passer leurs journées devant les outils.",
    transformationPromise:
      "Passer d’un usage confus de l’IA à un système simple de prompts, contenus et actions commerciales utilisables chaque semaine pour développer son activité.",
    targetAudienceDescription:
      "Avatar : Julien, 38 ans. Il est indépendant, compétent dans son métier, mais débordé par la communication, les réseaux sociaux et la création de contenu. Il veut utiliser l’IA, mais ne sait pas par où commencer ni comment l’appliquer à son activité réelle.",
  },
  {
    id: "marketing_digital_debutants",
    title: "Marketing digital simplifié pour débutants",
    badge: "Compatible LGD à 100%",
    demand: "Débutants, MRR, affiliés, créateurs de contenu",
    score: 93,
    why: "Audience massive, forte douleur : trop d’informations, pas de méthode, pas de premières ventes.",
    product: "Méthode simple + calendrier de contenu + tunnel de vente basique",
    price: "97€ à 397€",
    offerDescription:
      "Une méthode digitale simple pour aider les débutants à comprendre le marketing digital, choisir une offre, créer du contenu utile et mettre en place un premier système de vente sans se disperser.",
    problemSolved:
      "Aider les débutants à arrêter de consommer des formations dans tous les sens et à suivre une méthode claire pour obtenir leurs premières actions visibles et leurs premières ventes.",
    transformationPromise:
      "Passer d’un débutant perdu dans les conseils contradictoires à une personne capable de publier, expliquer son offre, créer une page simple et ouvrir ses premières conversations de vente.",
    targetAudienceDescription:
      "Avatar : Laura, 34 ans. Elle veut gagner de l’argent en ligne, a déjà regardé beaucoup de contenus sur le marketing digital, mais ne sait pas quoi faire dans quel ordre. Elle veut une méthode claire, simple, sans jargon et orientée résultats.",
  },
  {
    id: "productivite_ia",
    title: "Productivité personnelle avec IA",
    badge: "Facile à créer",
    demand: "Salariés, entrepreneurs, parents débordés, étudiants adultes",
    score: 90,
    why: "Besoin universel : mieux s’organiser, gagner du temps, réduire la charge mentale et reprendre le contrôle.",
    product: "Ebook premium + templates Notion/IA + routines 7 jours",
    price: "27€ à 147€",
    offerDescription:
      "Un produit digital qui aide les personnes débordées à utiliser l’IA, des routines simples et des templates pour mieux organiser leurs journées, prioriser leurs actions et réduire la charge mentale.",
    problemSolved:
      "Aider les personnes qui se sentent débordées à reprendre le contrôle de leur temps avec une méthode simple, guidée et applicable en quelques minutes par jour.",
    transformationPromise:
      "Passer d’une journée subie, dispersée et stressante à une organisation claire avec des priorités, des routines et des outils IA simples pour avancer avec plus de sérénité.",
    targetAudienceDescription:
      "Avatar : Claire, 41 ans. Elle jongle entre travail, famille et projets personnels. Elle manque de temps, culpabilise de ne pas avancer et cherche une méthode simple pour retrouver de la clarté sans devenir experte en productivité.",
  },
  {
    id: "revenu_complementaire_budget",
    title: "Revenu complémentaire et budget personnel",
    badge: "Douleur marché forte",
    demand: "Salariés, familles, personnes en tension financière",
    score: 89,
    why: "Pouvoir d’achat, peur de l’avenir et besoin d’options concrètes créent une demande durable.",
    product: "Guide pratique + plan 30 jours + idées de revenus digitaux",
    price: "47€ à 197€",
    offerDescription:
      "Un guide digital pratique pour aider les personnes qui veulent créer un complément de revenu à clarifier leur situation, choisir une piste simple et construire un premier plan d’action réaliste sur 30 jours.",
    problemSolved:
      "Aider les personnes sous pression financière à sortir de la confusion et à identifier une première piste de revenu complémentaire adaptée à leur temps, leurs compétences et leur niveau.",
    transformationPromise:
      "Passer d’un sentiment d’urgence financière et de flou à un plan concret pour tester une première source de revenu complémentaire sans promesse irréaliste.",
    targetAudienceDescription:
      "Avatar : Nadia, 44 ans. Elle veut respirer financièrement, mais ne sait pas quelle piste choisir. Elle a peur des arnaques, manque de confiance et veut une méthode réaliste, prudente et concrète pour commencer.",
  },
  {
    id: "bien_etre_femmes_40_plus",
    title: "Bien-être et équilibre femmes 40+",
    badge: "Audience très engagée",
    demand: "Femmes actives, mères, entrepreneures, reconversion douce",
    score: 92,
    why: "Forte demande pour reprendre énergie, confiance et clarté sans approche médicale ni promesses extrêmes.",
    product: "Programme 21 jours + workbook + routines guidées",
    price: "47€ à 197€",
    offerDescription:
      "Un programme digital de bien-être et d’organisation personnelle pour aider les femmes de 40 ans et plus à retrouver de l’énergie, clarifier leurs priorités et reconstruire une routine simple compatible avec leur vie réelle.",
    problemSolved:
      "Aider des femmes actives à sortir de la fatigue, de la charge mentale et de l’impression de s’oublier, grâce à une méthode douce, concrète et progressive.",
    transformationPromise:
      "Passer d’un quotidien subi à une routine plus claire, plus légère et plus alignée, avec des actions simples pour retrouver confiance, énergie et direction.",
    targetAudienceDescription:
      "Avatar : Isabelle, 46 ans. Elle donne beaucoup aux autres, manque de temps pour elle et veut retrouver de l’énergie sans méthode culpabilisante. Elle cherche une solution simple, humaine et rassurante.",
  },
  {
    id: "notion_templates_freelances",
    title: "Templates Notion pour freelances",
    badge: "Produit rapide à créer",
    demand: "Freelances, créateurs, consultants, micro-entrepreneurs",
    score: 88,
    why: "Les freelances veulent mieux piloter clients, contenus, facturation et objectifs sans outil complexe.",
    product: "Pack templates + tutoriels courts + système d’organisation",
    price: "27€ à 97€",
    offerDescription:
      "Un pack de templates Notion destiné aux freelances pour organiser leurs clients, leurs missions, leur contenu, leurs finances simples et leurs objectifs hebdomadaires dans un seul espace clair.",
    problemSolved:
      "Aider les freelances désorganisés à reprendre le contrôle de leur activité sans multiplier les outils ni perdre du temps dans des systèmes trop complexes.",
    transformationPromise:
      "Passer d’une gestion dispersée à un espace de pilotage simple pour suivre ses clients, ses revenus, ses priorités et ses actions de croissance.",
    targetAudienceDescription:
      "Avatar : Thomas, 32 ans. Il est freelance, travaille bien, mais gère tout dans sa tête. Il veut une organisation simple, professionnelle et rapide à mettre en place.",
  },
  {
    id: "canva_business_templates",
    title: "Templates Canva business premium",
    badge: "Très visuel · facile à vendre",
    demand: "Créateurs, coachs, infopreneurs, petites marques",
    score: 87,
    why: "Les entrepreneurs veulent publier vite avec un rendu professionnel sans designer.",
    product: "Pack templates Canva + prompts + calendrier de contenu",
    price: "27€ à 147€",
    offerDescription:
      "Un pack de templates Canva premium pour aider les entrepreneurs, coachs et créateurs à publier du contenu professionnel rapidement, avec des visuels cohérents et des messages orientés conversion.",
    problemSolved:
      "Aider les créateurs à arrêter de perdre du temps sur le design et à publier des contenus plus professionnels sans partir d’une page blanche.",
    transformationPromise:
      "Passer d’une communication irrégulière et amateur à une présence visuelle claire, premium et plus facile à maintenir chaque semaine.",
    targetAudienceDescription:
      "Avatar : Emma, 36 ans. Elle vend une offre en ligne mais perd trop de temps à créer ses visuels. Elle veut un rendu professionnel, rapide et cohérent avec son positionnement.",
  },
  {
    id: "micro_formation_chatgpt_seniors",
    title: "ChatGPT simple pour 50+",
    badge: "Marché sous-servi",
    demand: "50+, salariés, indépendants, retraités actifs",
    score: 91,
    why: "Beaucoup veulent comprendre l’IA sans jargon, avec des usages concrets et rassurants.",
    product: "Micro-formation vidéo + fiches pratiques + prompts simples",
    price: "47€ à 197€",
    offerDescription:
      "Une micro-formation qui explique ChatGPT et l’IA aux personnes de 50 ans et plus avec des exemples simples pour gagner du temps, écrire, organiser ses idées et mieux comprendre les outils numériques.",
    problemSolved:
      "Aider les personnes qui se sentent dépassées par l’IA à l’utiliser simplement, sans jargon technique ni peur de mal faire.",
    transformationPromise:
      "Passer d’une impression d’être largué à une utilisation confiante et pratique de l’IA dans le quotidien, le travail ou les projets personnels.",
    targetAudienceDescription:
      "Avatar : Patrick, 56 ans. Il entend parler d’IA partout, mais se sent en retard. Il veut apprendre calmement, avec des exemples concrets et une méthode très accessible.",
  },
  {
    id: "email_marketing_independants",
    title: "Email marketing simple pour indépendants",
    badge: "Forte valeur business",
    demand: "Solopreneurs, coachs, formateurs, affiliés",
    score: 93,
    why: "L’email reste un levier direct de conversion, mais beaucoup ne savent pas quoi écrire ni quand envoyer.",
    product: "Séquences email prêtes à adapter + formation courte",
    price: "97€ à 297€",
    offerDescription:
      "Une formation courte qui aide les indépendants à créer une première séquence email simple pour présenter leur offre, créer de la confiance et convertir sans écrire comme un copywriter expert.",
    problemSolved:
      "Aider les indépendants à arrêter de dépendre uniquement des réseaux sociaux et à transformer leurs prospects en clients grâce à des emails simples et humains.",
    transformationPromise:
      "Passer d’une audience dispersée à une séquence email claire qui nourrit la relation, explique l’offre et mène naturellement vers la vente.",
    targetAudienceDescription:
      "Avatar : Céline, 39 ans. Elle a une petite audience, mais ne sait pas relancer ni vendre par email. Elle veut des modèles simples, humains et adaptés à son activité.",
  },
  {
    id: "faceless_content_ia",
    title: "Contenu faceless avec IA",
    badge: "Très forte tendance créateur",
    demand: "Débutants, créateurs discrets, affiliés, MRR",
    score: 95,
    why: "Beaucoup veulent créer du contenu sans montrer leur visage, tout en construisant une audience monétisable.",
    product: "Méthode faceless + prompts + scripts reels + calendrier",
    price: "47€ à 197€",
    offerDescription:
      "Une méthode digitale pour créer du contenu faceless avec l’IA, structurer des scripts courts, produire des visuels simples et publier régulièrement sans se montrer à l’écran.",
    problemSolved:
      "Aider les personnes qui n’osent pas se montrer à publier quand même du contenu utile, régulier et monétisable grâce à une méthode faceless claire.",
    transformationPromise:
      "Passer de la peur de s’exposer à une stratégie de contenu discrète, structurée et capable d’attirer une audience ciblée.",
    targetAudienceDescription:
      "Avatar : Manon, 29 ans. Elle veut lancer un projet en ligne mais ne veut pas se filmer. Elle cherche une méthode rassurante, simple et compatible avec l’IA.",
  },
  {
    id: "business_local_ia",
    title: "IA pour commerces locaux",
    badge: "Besoin concret terrain",
    demand: "Restaurants, instituts, artisans, commerces de proximité",
    score: 90,
    why: "Les commerces veulent plus de visibilité mais manquent de temps et de méthode pour communiquer.",
    product: "Kit IA local + prompts posts + calendrier mensuel",
    price: "97€ à 297€",
    offerDescription:
      "Un kit digital pour aider les commerces locaux à utiliser l’IA afin de créer des idées de posts, promotions, messages clients et contenus simples pour gagner en visibilité chaque semaine.",
    problemSolved:
      "Aider les commerces locaux à communiquer régulièrement sans agence, sans complexité et sans perdre du temps à chercher quoi publier.",
    transformationPromise:
      "Passer d’une communication irrégulière à un système simple pour publier, promouvoir ses offres et rester présent dans l’esprit des clients locaux.",
    targetAudienceDescription:
      "Avatar : Karim, 43 ans. Il gère un commerce local, connaît son métier, mais n’a jamais le temps de communiquer. Il veut des idées simples et prêtes à utiliser.",
  },
  {
    id: "ebooks_pratiques_ia",
    title: "Créer et vendre des ebooks pratiques avec IA",
    badge: "Low ticket scalable",
    demand: "Créateurs, experts débutants, freelances, coachs",
    score: 89,
    why: "Les ebooks restent simples à produire et à vendre quand ils répondent à un problème précis.",
    product: "Formation création ebook + prompts + page de vente simple",
    price: "47€ à 197€",
    offerDescription:
      "Une formation pratique pour créer un ebook utile avec l’aide de l’IA, le structurer autour d’un problème précis et le vendre avec une page simple et une séquence courte.",
    problemSolved:
      "Aider les personnes qui ont une expertise ou une méthode à la transformer en ebook clair, utile et vendable sans passer des mois à écrire.",
    transformationPromise:
      "Passer d’une idée floue à un ebook structuré, positionné et prêt à être vendu à une audience ciblée.",
    targetAudienceDescription:
      "Avatar : Lucas, 35 ans. Il a des connaissances utiles mais ne sait pas comment les transformer en produit. Il veut créer vite quelque chose de propre et vendable.",
  },
  {
    id: "parentalite_organisation",
    title: "Organisation familiale et charge mentale",
    badge: "Douleur quotidienne forte",
    demand: "Parents actifs, familles débordées, mères entrepreneures",
    score: 88,
    why: "Problème quotidien, émotionnel et récurrent, avec forte recherche de solutions simples.",
    product: "Workbook + routines familiales + planning imprimable",
    price: "27€ à 97€",
    offerDescription:
      "Un produit digital qui aide les parents actifs à organiser la semaine familiale, répartir les priorités, réduire la charge mentale et retrouver plus de calme dans le quotidien.",
    problemSolved:
      "Aider les parents débordés à sortir de l’improvisation permanente et à mettre en place une organisation familiale simple et apaisante.",
    transformationPromise:
      "Passer d’un quotidien saturé et stressant à une semaine mieux organisée, plus lisible et plus sereine pour toute la famille.",
    targetAudienceDescription:
      "Avatar : Aurélie, 40 ans. Elle travaille, gère beaucoup de choses à la maison et a l’impression de porter toute l’organisation. Elle veut des outils simples et concrets.",
  },
  {
    id: "personal_branding_ia",
    title: "Marque personnelle avec IA",
    badge: "Demande créateurs forte",
    demand: "Indépendants, cadres en reconversion, coachs, consultants",
    score: 92,
    why: "De plus en plus de personnes veulent devenir visibles mais ne savent pas formuler leur expertise.",
    product: "Méthode positionnement + prompts bio + calendrier contenu",
    price: "97€ à 297€",
    offerDescription:
      "Une méthode digitale pour aider les indépendants et cadres en reconversion à clarifier leur marque personnelle, formuler leur expertise et créer du contenu avec l’IA pour devenir visibles sans se disperser.",
    problemSolved:
      "Aider les personnes compétentes mais peu visibles à transformer leur expérience en positionnement clair et en contenus réguliers qui attirent les bonnes opportunités.",
    transformationPromise:
      "Passer d’une expertise invisible à une marque personnelle claire, crédible et capable d’attirer clients, opportunités ou partenaires.",
    targetAudienceDescription:
      "Avatar : Sandrine, 45 ans. Elle a de l’expérience mais ne sait pas comment se positionner en ligne. Elle veut devenir visible sans jouer un rôle artificiel.",
  },
];

function getDigitalProductOpportunityBatch(batchIndex: number) {
  const size = 5;
  const total = Math.max(1, Math.ceil(DIGITAL_PRODUCT_OPPORTUNITIES.length / size));
  const safeIndex = ((batchIndex % total) + total) % total;
  const start = safeIndex * size;
  const batch = DIGITAL_PRODUCT_OPPORTUNITIES.slice(start, start + size);

  if (batch.length === size) return batch;
  return [...batch, ...DIGITAL_PRODUCT_OPPORTUNITIES.slice(0, size - batch.length)];
}

function findDigitalProductOpportunityByOffer(offerDescription: string) {
  return DIGITAL_PRODUCT_OPPORTUNITIES.find(
    (opportunity) => opportunity.offerDescription === offerDescription,
  );
}


function getCoachApiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function getCoachAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function extractJsonObjectFromText(text: string): any | null {
  const raw = String(text || "").trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {}

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
    } catch {}
  }

  const firstBracket = raw.indexOf("[");
  const lastBracket = raw.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    try {
      return { opportunities: JSON.parse(raw.slice(firstBracket, lastBracket + 1)) };
    } catch {}
  }

  return null;
}

function normalizeLiveOpportunity(value: any, index: number): DigitalProductOpportunity | null {
  if (!value || typeof value !== "object") return null;

  const title = normalizeText(value.title || value.niche || value.name || value.nom);
  if (!title) return null;

  const score = Math.max(
    70,
    Math.min(99, Number(value.score || value.opportunityScore || value.businessScore || 88)),
  );

  const problemSolved = normalizeText(
    value.problemSolved ||
      value.problem ||
      value.probleme ||
      `Aider une audience ciblée à résoudre un problème urgent dans la niche ${title}.`,
  );
  const transformationPromise = normalizeText(
    value.transformationPromise ||
      value.promise ||
      value.promesse ||
      `Passer d’une situation bloquée à un résultat clair grâce à un produit digital simple et actionnable sur ${title}.`,
  );
  const offerDescription = normalizeText(
    value.offerDescription ||
      value.offer ||
      value.offre ||
      `Un produit digital autour de ${title}, conçu pour répondre à une demande forte avec une méthode simple, concrète et facile à appliquer.`,
  );
  const targetAudienceDescription = normalizeText(
    value.targetAudienceDescription ||
      value.avatar ||
      value.audience ||
      `Avatar prioritaire : personne motivée par ${title}, avec un problème clair, une urgence émotionnelle et le besoin d’une solution simple, rassurante et guidée.`,
  );

  return {
    id: `live_${Date.now()}_${index}`,
    title,
    badge: normalizeText(value.badge || value.tag || "Analyse IA Live"),
    demand: normalizeText(value.demand || value.demande || value.market || "Demande actuelle détectée par Alex IA Live"),
    score,
    why: normalizeText(value.why || value.reason || value.pourquoi || "Opportunité détectée par l’analyse IA Live selon la demande, la facilité de création et le potentiel commercial."),
    product: normalizeText(value.product || value.produit || "Formation courte, ebook premium ou mini-programme guidé"),
    price: normalizeText(value.price || value.prix || "97€ à 297€"),
    offerDescription,
    problemSolved,
    transformationPromise,
    targetAudienceDescription,
  };
}

function extractLiveOpportunities(payload: any): DigitalProductOpportunity[] {
  const direct =
    payload?.opportunities ||
    payload?.niches ||
    payload?.items ||
    payload?.data?.opportunities ||
    payload?.data?.niches;

  if (Array.isArray(direct)) {
    return direct
      .map((item, index) => normalizeLiveOpportunity(item, index))
      .filter(Boolean)
      .slice(0, 5) as DigitalProductOpportunity[];
  }

  const text =
    payload?.response ||
    payload?.reply ||
    payload?.message ||
    payload?.content ||
    payload?.data?.response ||
    payload?.data?.message ||
    "";

  const parsed = extractJsonObjectFromText(text);
  if (!parsed) return [];
  return extractLiveOpportunities(parsed);
}

async function fetchLiveDigitalProductOpportunities(args: {
  businessGoal: AlexBusinessGoal;
  level: AlexLevel;
  audienceSize: AlexAudienceSize;
  mainBlocker: AlexMainBlocker;
  primaryChannel: string;
}): Promise<DigitalProductOpportunity[]> {
  const base = getCoachApiBase();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL manquant");
  }

  const prompt = `Tu es Alex, Directeur Business IA de LGD. Analyse le marché actuel et propose exactement 5 niches rentables pour créer un produit digital. Réponds uniquement en JSON valide, sans markdown, au format {"opportunities":[{"title":"","badge":"","demand":"","score":95,"why":"","product":"","price":"","offerDescription":"","problemSolved":"","transformationPromise":"","targetAudienceDescription":""}]}. Contexte utilisateur: objectif=${args.businessGoal}, niveau=${args.level}, audience=${args.audienceSize}, blocage=${args.mainBlocker}, canal=${args.primaryChannel}. Les niches doivent avoir une forte demande, être monétisables rapidement, compatibles avec LGD, et adaptées à un utilisateur qui veut créer son propre produit digital.`;

  const headers = {
    "Content-Type": "application/json",
    ...getCoachAuthHeaders(),
  };

  const requests = [
    {
      url: `${base}/coach/market-opportunities`,
      body: {
        business_model: "offre_digitale",
        request_type: "digital_product_opportunities",
        count: 5,
        context: args,
        prompt,
      },
    },
    {
      url: `${base}/market-opportunities`,
      body: {
        business_model: "offre_digitale",
        request_type: "digital_product_opportunities",
        count: 5,
        context: args,
        prompt,
      },
    },
  ];

  let lastError = "Analyse IA Live indisponible.";

  for (const req of requests) {
    try {
      const res = await fetch(req.url, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(req.body),
      });

      if (!res.ok) {
        lastError = `Endpoint ${req.url} indisponible (${res.status})`;
        continue;
      }

      const payload = await res.json().catch(() => null);
      const opportunities = extractLiveOpportunities(payload);
      if (opportunities.length >= 5) return opportunities.slice(0, 5);

      lastError = "Réponse IA Live reçue, mais format des niches incomplet.";
    } catch (error: any) {
      lastError = String(error?.message || error || lastError);
    }
  }

  throw new Error(lastError);
}

function inferProblemSolved(
  offerDescription: string,
  businessModel: AlexBusinessModel,
) {
  const offer = normalizeText(offerDescription);
  const lower = offer.toLowerCase();

  if (lower.includes("mrr") || lower.includes("revente")) {
    return "Aider des personnes motivées à arrêter d’acheter des formations sans résultat et à transformer une offre digitale existante en vraie première vente.";
  }

  if (
    lower.includes("salariat") ||
    lower.includes("liberté") ||
    lower.includes("liberte")
  ) {
    return "Aider des salariés ou personnes en transition à construire progressivement une activité digitale sans tout quitter du jour au lendemain.";
  }

  if (businessModel === "affiliation") {
    return "Aider une audience ciblée à choisir la bonne solution, à passer à l’action et à éviter de rester bloquée dans la consommation d’informations.";
  }

  if (businessModel === "offre_digitale") {
    return "Transformer une compétence, une méthode ou une expérience en solution simple, compréhensible et vendable.";
  }

  if (businessModel === "coaching") {
    return "Accompagner une personne d’un point A confus vers un point B concret, mesurable et rassurant.";
  }

  return "Clarifier un problème précis, rendre la solution simple à comprendre et donner envie de passer à l’action.";
}

function inferTransformationPromise(args: {
  offerDescription: string;
  problemSolved: string;
  businessGoal: AlexBusinessGoal;
  businessModel: AlexBusinessModel;
}) {
  const goal = labelBusinessGoal(args.businessGoal);
  const model = labelBusinessModel(args.businessModel).toLowerCase();

  if (detectMrrFromText(args.offerDescription)) {
    return `Passer d’une personne qui consomme des formations sans résultat à un entrepreneur capable de vendre une formation MRR, développer son audience et viser ${goal} avec une méthode claire, duplicable et orientée action.`;
  }

  if (args.businessModel === "affiliation") {
    return `Passer d’une audience tiède qui hésite à une stratégie d’affiliation claire capable de générer ${goal}, avec une offre comprise, un message simple et une action quotidienne orientée vente.`;
  }

  if (args.businessModel === "offre_digitale") {
    return `Passer d’une idée encore floue à un produit digital structuré, positionné et prêt à être présenté à une audience ciblée pour viser ${goal}.`;
  }

  return `Passer d’un projet ${model} dispersé à un chemin d’action clair, mesurable et orienté ${goal}.`;
}

function buildPremiumAvatar(args: {
  offerDescription: string;
  businessModel: AlexBusinessModel;
  businessGoal: AlexBusinessGoal;
  level: AlexLevel;
  audienceSize: AlexAudienceSize;
  mainBlocker: AlexMainBlocker;
  problemSolved: string;
}) {
  const offer = normalizeText(args.offerDescription);
  if (!offer) return "";

  const lower = offer.toLowerCase();
  const isMrr = lower.includes("mrr") || lower.includes("revente");
  const isAffiliation =
    args.businessModel === "affiliation" || lower.includes("affiliation");
  const isSalary =
    lower.includes("salariat") ||
    lower.includes("reconversion") ||
    lower.includes("liberté") ||
    lower.includes("liberte");

  const personaName =
    isMrr || isAffiliation
      ? "Avatar : Sophie, 42 ans"
      : isSalary
        ? "Avatar : Marc, 47 ans"
        : "Avatar : Client idéal prioritaire";

  const situation = isMrr
    ? "A déjà acheté une ou plusieurs formations MRR, suit beaucoup de contenus business, mais n’arrive pas à transformer ses connaissances en ventes réelles."
    : isAffiliation
      ? "Veut générer ses premiers revenus en ligne sans créer son propre produit, mais ne sait pas quelle offre recommander ni comment en parler sans forcer."
      : isSalary
        ? "Salarié ou personne en transition qui veut créer une activité digitale en parallèle, sans prendre de risque brutal."
        : "Personne motivée qui veut résoudre un problème concret, mais manque d’une méthode claire et d’un plan d’action simple.";

  const frustrations = [
    "Trop d’informations contradictoires.",
    "Difficulté à savoir quoi faire aujourd’hui.",
    "Impression d’avancer sans résultat visible.",
    args.mainBlocker === "technique"
      ? "Blocage dès qu’il faut utiliser des outils ou publier."
      : args.mainBlocker === "vente"
        ? "Peur de vendre, de déranger ou de ne pas être légitime."
        : args.mainBlocker === "temps"
          ? "Peu de temps disponible et peur de perdre ses soirées pour rien."
          : "Tendance à changer de méthode avant d’avoir des résultats.",
  ];

  const fears = [
    "Perdre encore du temps.",
    "Investir dans une solution qui ne mène à rien.",
    "Être jugé par son entourage ou son audience.",
    "Ne pas réussir à expliquer clairement son offre.",
  ];

  const desires = [
    `Atteindre ${labelBusinessGoal(args.businessGoal)} avec une méthode réaliste.`,
    "Être guidé étape par étape.",
    "Savoir quoi publier, quoi dire et quoi vendre.",
    "Voir des actions simples produire des résultats mesurables.",
  ];

  const tried = isMrr
    ? "A déjà testé des formations, des prompts, des tunnels copiés, des posts isolés ou des méthodes vues sur les réseaux."
    : "A déjà consommé du contenu gratuit, commencé plusieurs idées ou essayé d’appliquer des conseils sans structure.";

  const whyBlocked =
    args.mainBlocker === "vente"
      ? "Il ne manque pas forcément d’envie : il lui manque un message de vente simple, humain et rassurant."
      : args.mainBlocker === "technique"
        ? "Il bloque parce que la technique prend toute la place avant même que l’offre soit claire."
        : args.mainBlocker === "temps"
          ? "Il échoue parce qu’il essaye d’en faire trop au lieu d’avoir une seule action rentable par jour."
          : "Il échoue parce qu’il consomme plus qu’il n’exécute et change trop vite de direction.";

  return `${personaName}

Situation actuelle
${situation}

Problème profond
${args.problemSolved}

Frustrations
- ${frustrations.join("\n- ")}

Peurs
- ${fears.join("\n- ")}

Désirs
- ${desires.join("\n- ")}

Ce qu’il a déjà essayé
${tried}

Pourquoi il échoue aujourd’hui
${whyBlocked}

Ce qu’il attend de toi
Une direction claire, une solution simple, un langage rassurant, un plan d’action concret et la sensation qu’il peut avancer même s’il n’est pas expert.

Comment lui parler
Utilise un ton humain, direct, rassurant, sans jargon. Montre que tu comprends sa fatigue, ses doutes et son besoin d’un chemin simple.

Ce qui le fera acheter
- Une promesse claire et crédible.
- Une preuve que la méthode est applicable rapidement.
- Une réduction de la charge technique.
- Une première étape simple à exécuter aujourd’hui.
- La sensation d’être accompagné plutôt que livré à lui-même.`;
}

function inferTargetAudienceFromOffer(
  offerDescription: string,
  businessModel: AlexBusinessModel,
  businessGoal: AlexBusinessGoal = "premiers_revenus",
  level: AlexLevel = "debutant",
  audienceSize: AlexAudienceSize = "moins_500",
  mainBlocker: AlexMainBlocker = "dispersion",
  problemSolved?: string,
) {
  const offer = normalizeText(offerDescription);
  if (!offer) return "";

  return buildPremiumAvatar({
    offerDescription: offer,
    businessModel,
    businessGoal,
    level,
    audienceSize,
    mainBlocker,
    problemSolved: problemSolved || inferProblemSolved(offer, businessModel),
  });
}

function inferPlatform(args: {
  businessModel: AlexBusinessModel;
  primaryChannel: string;
  audienceSize: AlexAudienceSize;
  mainBlocker: AlexMainBlocker;
}) {
  const raw = normalizeText(args.primaryChannel).toLowerCase();
  const channel = raw.includes("facebook")
    ? "Facebook"
    : raw.includes("pinterest")
      ? "Pinterest"
      : raw.includes("tiktok")
        ? "TikTok"
        : "Instagram";

  if (args.businessModel === "offre_digitale" && raw.includes("mrr")) {
    return {
      recommendedPlatform: `${channel} d’abord, Facebook ensuite`,
      platformReason:
        "Une offre MRR se vend mieux quand l’utilisateur comprend la valeur de la licence, la simplicité du système et le chemin concret vers ses premières ventes.",
    };
  }

  if (args.businessModel === "affiliation") {
    return {
      recommendedPlatform: `${channel} d’abord, Facebook ensuite`,
      platformReason:
        "L’affiliation demande d’abord de créer de la confiance, de répéter un angle simple et d’ouvrir des conversations avant de multiplier les canaux.",
    };
  }

  if (args.businessModel === "offre_digitale") {
    return {
      recommendedPlatform: "Instagram + Systeme.io",
      platformReason:
        "Instagram sert à tester le message et Systeme.io sert à transformer l’intérêt en page, capture email et première vente.",
    };
  }

  return {
    recommendedPlatform: channel,
    platformReason:
      "Ce canal permet de concentrer l’énergie au lieu de disperser l’utilisateur sur plusieurs réseaux trop tôt.",
  };
}

function inferFormActionProject(args: {
  offerDescription: string;
  problemSolved: string;
  transformationPromise: string;
  targetAudienceDescription: string;
  businessModel: AlexBusinessModel;
  businessGoal: AlexBusinessGoal;
  level: AlexLevel;
  audienceSize: AlexAudienceSize;
  mainBlocker: AlexMainBlocker;
  primaryChannel: string;
  positioning: string;
  firstRevenueGoal: string;
  parcoursChoice?: FormActionParcours;
}): FormActionBusinessProject {
  const offer = normalizeText(args.offerDescription);
  const audience = normalizeText(args.targetAudienceDescription);
  const lower = `${offer} ${audience} ${args.problemSolved}`.toLowerCase();

  const isMrr = args.parcoursChoice === "mrr" || detectMrrFromText(offer);

  const parcours: FormActionParcours =
    isMrr
      ? "mrr"
      : args.parcoursChoice && args.parcoursChoice !== "non_defini"
        ? args.parcoursChoice
        : args.businessModel === "affiliation" || lower.includes("affiliation")
          ? "affiliation"
          : args.businessModel === "offre_digitale"
            ? "creation_produit_digital"
            : lower.includes("liberté") ||
                lower.includes("liberte") ||
                lower.includes("salariat")
              ? "code_liberte"
              : "non_defini";

  const platform =
    parcours === "mrr"
      ? {
          recommendedPlatform: `${normalizeText(args.primaryChannel) || "Instagram"} d’abord, Facebook ensuite`,
          platformReason:
            "Une formation MRR se vend mieux quand l’audience comprend la valeur des droits de revente, la simplicité du système et le chemin vers les premières ventes.",
        }
      : inferPlatform({
          businessModel: args.businessModel,
          primaryChannel: args.primaryChannel,
          audienceSize: args.audienceSize,
          mainBlocker: args.mainBlocker,
        });

  const estimatedTimeBeforeSale =
    parcours === "mrr"
      ? args.audienceSize === "zero"
        ? "7 à 10 jours"
        : "3 à 7 jours"
      : parcours === "creation_produit_digital"
        ? args.level === "quelques_ventes"
          ? "5 à 10 jours"
          : "7 à 14 jours"
        : parcours === "affiliation"
          ? args.audienceSize === "zero"
            ? "7 à 10 jours"
            : "3 à 7 jours"
          : "7 jours";

  const offerReadinessScore = Math.min(
    100,
    Math.max(
      35,
      (offer.length > 120 ? 25 : 10) +
        (audience.length > 300 ? 25 : 10) +
        (args.problemSolved.length > 80 ? 20 : 10) +
        (args.transformationPromise.length > 80 ? 20 : 10) +
        (args.firstRevenueGoal ? 10 : 0),
    ),
  );

  const nextMission =
    parcours === "mrr"
      ? "Clarifier la promesse de la formation MRR en une phrase : résultat, simplicité, droits de revente."
      : parcours === "affiliation"
        ? "Écrire l’angle de recommandation affiliée en 3 phrases : problème, solution, raison de faire confiance."
        : parcours === "creation_produit_digital"
          ? "Transformer l’idée en promesse vendable : résultat concret, cible précise, première étape livrable."
          : "Clarifier le positionnement et choisir une première action de vente simple.";

  const missionFollowing =
    parcours === "mrr"
      ? "Créer le premier contenu qui explique pourquoi la licence MRR évite de créer un produit de zéro."
      : parcours === "affiliation"
        ? "Créer le premier contenu de conversion puis ouvrir 3 conversations qualifiées."
        : parcours === "creation_produit_digital"
          ? "Construire la page simple de prévente puis préparer une séquence email courte."
          : "Tester l’angle sur Instagram avec un post problème → solution.";

  const contentAngle =
    parcours === "mrr"
      ? "Montrer le déclic : arrêter de collectionner des formations et utiliser une licence MRR comme point de départ concret."
      : parcours === "affiliation"
        ? "Raconter le blocage vécu par la cible, puis montrer pourquoi cette solution évite de repartir de zéro."
        : "Montrer la transformation promise avec une situation avant/après très concrète.";

  const salesAngle =
    parcours === "mrr"
      ? "Ne pas vendre une formation : vendre une activité prête à lancer avec droits de revente, méthode et passage à l’action."
      : parcours === "affiliation"
        ? "Ne pas vendre la formation : vendre le raccourci, la clarté et le passage à l’action."
        : "Ne pas vendre un produit : vendre le résultat mesurable et le soulagement immédiat.";

  return {
    offerDescription: offer,
    problemSolved: normalizeText(args.problemSolved),
    transformationPromise: normalizeText(args.transformationPromise),
    targetAudienceDescription: audience,
    positioning: args.positioning,
    businessModel: args.businessModel,
    parcours,
    recommendedPlatform: platform.recommendedPlatform,
    platformReason: platform.platformReason,
    estimatedTimeBeforeSale,
    firstRevenueGoal: args.firstRevenueGoal,
    nextMission,
    missionFollowing,
    contentAngle,
    salesAngle,
    offerReadinessScore,
    updatedAtISO: new Date().toISOString(),
  };
}

function parcoursLabel(parcours?: FormActionParcours) {
  if (parcours === "mrr") return "MRR · Droits de revente";
  if (parcours === "affiliation") return "Affiliation";
  if (parcours === "creation_produit_digital")
    return "Création produit digital";
  if (parcours === "code_liberte") return "Code Liberté";
  return "À confirmer";
}

type BusinessScoreV4 = {
  vision: number;
  offre: number;
  avatar: number;
  positionnement: number;
  acquisition: number;
  conversion: number;
  discipline: number;
  execution: number;
  global: number;
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function extractProjectName(
  project?: FormActionBusinessProject | null,
  ctx?: AlexContext | null,
) {
  const source = normalizeText(
    project?.offerDescription || ctx?.offerDescription || "",
  );
  if (!source) return "Projet à clarifier";

  const known = [
    "L'Indépendance Digital",
    "L’Indépendance Digital",
    "Indépendance Digital",
    "Code Liberté",
    "Le Générateur Digital",
    "LGD",
    "Digital Freedom Academy",
  ];
  const lower = source.toLowerCase();
  const found = known.find((item) => lower.includes(item.toLowerCase()));
  if (found) return found;

  return source.length > 42 ? `${source.slice(0, 42)}…` : source;
}

function computeBusinessScoreV4(args: {
  project?: FormActionBusinessProject | null;
  ctx?: AlexContext | null;
  logs?: DailyLog[];
}): BusinessScoreV4 {
  const { project, ctx, logs = [] } = args;
  const offer = normalizeText(
    project?.offerDescription || ctx?.offerDescription || "",
  );
  const problem = normalizeText(project?.problemSolved || "");
  const promise = normalizeText(project?.transformationPromise || "");
  const avatar = normalizeText(
    project?.targetAudienceDescription || ctx?.targetAudienceDescription || "",
  );
  const positioning = normalizeText(project?.positioning || "");
  const platform = normalizeText(
    project?.recommendedPlatform || ctx?.primaryChannel || "",
  );
  const sales = normalizeText(project?.salesAngle || "");
  const content = normalizeText(project?.contentAngle || "");
  const doneCount = logs.filter((log) => log.done).length;

  const vision = clampScore(
    35 +
      (project?.parcours && project.parcours !== "non_defini" ? 20 : 0) +
      (project?.firstRevenueGoal || ctx?.businessGoal ? 20 : 0) +
      (project?.estimatedTimeBeforeSale ? 15 : 0) +
      (project?.nextMission ? 10 : 0),
  );
  const offre = clampScore(
    30 +
      (offer.length > 80 ? 20 : offer.length > 20 ? 10 : 0) +
      (problem.length > 70 ? 20 : problem.length > 20 ? 10 : 0) +
      (promise.length > 70 ? 20 : promise.length > 20 ? 10 : 0) +
      (project?.offerReadinessScore
        ? Math.min(10, project.offerReadinessScore / 10)
        : 0),
  );
  const avatarScore = clampScore(
    30 +
      (avatar.length > 600
        ? 35
        : avatar.length > 250
          ? 25
          : avatar.length > 80
            ? 12
            : 0) +
      (avatar.includes("Frustrations") ? 15 : 0) +
      (avatar.includes("Ce qui le fera acheter") ? 20 : 0),
  );
  const positionnement = clampScore(
    35 +
      (positioning ? 20 : 0) +
      (sales ? 20 : 0) +
      (project?.businessModel || ctx?.businessModel ? 15 : 0) +
      (project?.parcours ? 10 : 0),
  );
  const acquisition = clampScore(
    35 +
      (platform ? 25 : 0) +
      (content ? 20 : 0) +
      (ctx?.audienceSize && ctx.audienceSize !== "zero" ? 10 : 0) +
      (doneCount > 0 ? 10 : 0),
  );
  const conversion = clampScore(
    30 +
      (sales ? 25 : 0) +
      (project?.nextMission ? 20 : 0) +
      (project?.missionFollowing ? 15 : 0) +
      (doneCount > 1 ? 10 : 0),
  );
  const discipline = clampScore(
    45 + Math.min(35, doneCount * 8) + (ctx?.timePerDay ? 10 : 0),
  );
  const execution = clampScore(
    35 +
      Math.min(45, doneCount * 10) +
      (project?.nextMission ? 10 : 0) +
      (project?.missionFollowing ? 10 : 0),
  );
  const global = clampScore(
    (vision +
      offre +
      avatarScore +
      positionnement +
      acquisition +
      conversion +
      discipline +
      execution) /
      8,
  );

  return {
    vision,
    offre,
    avatar: avatarScore,
    positionnement,
    acquisition,
    conversion,
    discipline,
    execution,
    global,
  };
}

function getBusinessDiagnosisV4(args: {
  project?: FormActionBusinessProject | null;
  ctx?: AlexContext | null;
  score: BusinessScoreV4;
}) {
  const blocker = args.ctx?.mainBlocker;
  const project = args.project;
  const weakest = [
    ["Vision", args.score.vision],
    ["Offre", args.score.offre],
    ["Avatar", args.score.avatar],
    ["Positionnement", args.score.positionnement],
    ["Acquisition", args.score.acquisition],
    ["Conversion", args.score.conversion],
    ["Discipline", args.score.discipline],
    ["Exécution", args.score.execution],
  ].sort((a, b) => Number(a[1]) - Number(b[1]))[0]?.[0];

  const risk =
    blocker === "temps"
      ? "vouloir tout faire avec trop peu de temps"
      : blocker === "technique"
        ? "laisser la technique ralentir la vente"
        : blocker === "vente"
          ? "préparer beaucoup sans oser vendre simplement"
          : blocker === "confiance"
            ? "attendre d’être parfaitement légitime avant de publier"
            : "te disperser sur trop d’idées au lieu de pousser un seul angle";

  const force = project?.targetAudienceDescription
    ? "tu as déjà une base d’avatar exploitable"
    : project?.offerDescription
      ? "ton offre commence à être suffisamment claire pour créer une première action"
      : "tu acceptes de clarifier ton projet avant d’exécuter";

  const leverage =
    project?.salesAngle ||
    project?.contentAngle ||
    project?.nextMission ||
    "clarifier un angle simple : problème, solution, raison de passer à l’action";

  return {
    profile:
      blocker === "technique"
        ? "Constructeur prudent"
        : blocker === "vente"
          ? "Créateur à convertir"
          : blocker === "temps"
            ? "Exécutant contraint"
            : "Bâtisseur stratégique",
    force,
    risk,
    weakest: String(weakest || "Exécution"),
    leverage,
  };
}

function businessPreviewText(value?: string, max = 140) {
  const text = normalizeText(value || "");
  if (!text) return "À compléter";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function BusinessDirectorPanelV4(props: {
  businessProject?: FormActionBusinessProject | null;
  context?: AlexContext | null;
  logs?: DailyLog[];
  today?: AlexToday | null;
  compact?: boolean;
}) {
  const { businessProject, context, logs = [], today, compact } = props;
  const [activeTab, setActiveTab] = useState<"business" | "avatar" | "plan" | "score">("business");
  const hasBusinessMemory = Boolean(
    normalizeText(
      businessProject?.offerDescription || context?.offerDescription || "",
    ),
  );

  if (!hasBusinessMemory) {
    return (
      <div className="rounded-[30px] border border-yellow-500/20 bg-gradient-to-br from-[#10151f] via-[#070b11] to-black p-5 shadow-[0_0_45px_rgba(250,204,21,0.07)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-yellow-300/70">
              Alex Mobile Command
            </div>
            <h2 className="mt-2 text-2xl font-black leading-tight text-yellow-400">
              🧠 Diagnostic en attente
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Alex ne suppose rien. Il construit la stratégie seulement après ton diagnostic.
            </p>
          </div>
          <div className="shrink-0 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-center">
            <div className="text-[10px] font-bold text-yellow-200/70">Score</div>
            <div className="mt-1 text-2xl font-black text-yellow-300">--</div>
            <div className="text-[10px] text-white/45">/100</div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-yellow-400/20 bg-black/35 p-5">
          <div className="text-sm font-black text-yellow-200">
            🤝 Action unique maintenant
          </div>
          <p className="mt-2 text-base font-semibold leading-7 text-white">
            Termine le diagnostic Alex.
          </p>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Ensuite, Alex définira ton modèle, ta promesse, ton client idéal et la première action à exécuter.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MobileInfoPill label="Projet" value="À définir" />
          <MobileInfoPill label="Modèle" value="Après choix" />
          <MobileInfoPill label="Vente" value="Après diagnostic" />
          <MobileInfoPill label="Parcours" value="En construction" />
        </div>
      </div>
    );
  }

  const score = computeBusinessScoreV4({
    project: businessProject,
    ctx: context,
    logs,
  });
  const diagnosis = getBusinessDiagnosisV4({
    project: businessProject,
    ctx: context,
    score,
  });
  const projectName = extractProjectName(businessProject, context);
  const model =
    businessProject?.businessModel || context?.businessModel || "pas_encore";
  const platform =
    businessProject?.recommendedPlatform ||
    context?.primaryChannel ||
    "Instagram";
  const objective =
    businessProject?.firstRevenueGoal ||
    (context?.businessGoal
      ? labelBusinessGoal(context.businessGoal)
      : "Première vente");
  const nextAction =
    today?.mission?.title ||
    businessProject?.nextMission ||
    "clarifier l’action la plus rentable du jour";

  const isMrrProject = businessProject?.parcours === "mrr" || detectMrrFromText(businessProject?.offerDescription);
  const businessModelLabel = labelBusinessModelForProject(
    businessProject,
    model as AlexBusinessModel,
  );
  const platformShort = businessPreviewText(platform, 52);
  const problemShort = businessPreviewText(businessProject?.problemSolved, 155);
  const promiseShort = businessPreviewText(businessProject?.transformationPromise, 155);
  const avatarShort = businessPreviewText(businessProject?.targetAudienceDescription, 230);

  const scoreRows: Array<[string, number]> = [
    ["Vision", score.vision],
    ["Offre", score.offre],
    ["Avatar", score.avatar],
    ["Positionnement", score.positionnement],
    ["Acquisition", score.acquisition],
    ["Conversion", score.conversion],
    ["Discipline", score.discipline],
    ["Exécution", score.execution],
  ];

  return (
    <div className="rounded-[30px] border border-yellow-500/20 bg-gradient-to-br from-[#10151f] via-[#070b11] to-black p-5 shadow-[0_0_45px_rgba(250,204,21,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-yellow-300/70">
            Alex Mobile Command
          </div>
          <h2 className="mt-2 text-2xl font-black leading-tight text-yellow-400">
            🧠 {projectName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            {isMrrProject
              ? "Alex a identifié une formation MRR avec droits de revente. Il pilote la stratégie vers la première vente."
              : "Alex synthétise ton business et prépare uniquement l’action la plus utile."}
          </p>
        </div>
        <div className="shrink-0 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 px-4 py-3 text-center">
          <div className="text-[10px] font-bold text-yellow-200/70">Score</div>
          <div className="mt-1 text-2xl font-black text-yellow-300">{score.global}</div>
          <div className="text-[10px] text-white/45">/100</div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-5">
        <div className="text-sm font-black text-yellow-200">
          🤝 Aujourd’hui, fais uniquement ça
        </div>
        <p className="mt-3 text-lg font-black leading-7 text-white">
          {nextAction}
        </p>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Pourquoi ? Parce que cette action rapproche directement ton projet de la prochaine vente, sans t’éparpiller.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileInfoPill label="Modèle" value={businessModelLabel} />
        <MobileInfoPill label="Objectif" value={objective} />
        <MobileInfoPill label="Canal" value={platformShort} />
        <MobileInfoPill label="Vente" value={businessProject?.estimatedTimeBeforeSale || "À estimer"} />
      </div>

      {!compact ? (
        <>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            <MobileTabButton active={activeTab === "business"} onClick={() => setActiveTab("business")}>Business</MobileTabButton>
            <MobileTabButton active={activeTab === "avatar"} onClick={() => setActiveTab("avatar")}>Avatar</MobileTabButton>
            <MobileTabButton active={activeTab === "plan"} onClick={() => setActiveTab("plan")}>Plan</MobileTabButton>
            <MobileTabButton active={activeTab === "score"} onClick={() => setActiveTab("score")}>Score</MobileTabButton>
          </div>

          <div className="mt-4 rounded-3xl border border-[#2a2416] bg-black/30 p-5">
            {activeTab === "business" ? (
              <div>
                <div className="text-sm font-black text-yellow-200">🧠 Ce qu’Alex a compris</div>
                <div className="mt-3 space-y-3 text-sm leading-6 text-white/70">
                  <p>
                    Tu veux développer <span className="font-semibold text-white">{projectName}</span> avec le modèle <span className="font-semibold text-white">{businessModelLabel}</span>.
                  </p>
                  <p>
                    Problème résolu : <span className="text-white">{problemShort}</span>
                  </p>
                  <p>
                    Promesse : <span className="text-white">{promiseShort}</span>
                  </p>
                  <p>
                    Canal prioritaire : <span className="text-white">{platform}</span>
                  </p>
                </div>
              </div>
            ) : null}

            {activeTab === "avatar" ? (
              <div>
                <div className="text-sm font-black text-yellow-200">👤 Avatar premium</div>
                <p className="mt-3 text-sm leading-6 text-white/70">{avatarShort}</p>
                <div className="mt-4 rounded-2xl border border-yellow-500/15 bg-yellow-400/5 p-4 text-xs leading-5 text-white/55">
                  Le profil complet reste éditable dans le questionnaire. Ici, Alex affiche seulement l’essentiel pour décider quoi faire aujourd’hui.
                </div>
              </div>
            ) : null}

            {activeTab === "plan" ? (
              <div>
                <div className="text-sm font-black text-yellow-200">🗺️ Prochaines étapes</div>
                <div className="mt-4 space-y-3">
                  <TimelineStep number="1" title="Action du jour" body={nextAction} />
                  <TimelineStep number="2" title="Mission suivante" body={businessProject?.missionFollowing || "Créer le premier contenu de conversion."} />
                  <TimelineStep number="3" title="Angle de vente" body={businessProject?.salesAngle || "Clarifier pourquoi l’offre est simple, crédible et utile maintenant."} />
                </div>
              </div>
            ) : null}

            {activeTab === "score" ? (
              <div>
                <div className="text-sm font-black text-yellow-200">📈 Business Score</div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {scoreRows.map(([label, value]) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/55">{label}</span>
                        <span className="font-semibold text-white/75">{value}/100</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-yellow-400" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-yellow-500/15 bg-yellow-400/5 p-4 text-xs leading-5 text-white/60">
                  Point à renforcer : <span className="text-white">{diagnosis.weakest}</span>. Risque principal : <span className="text-white">{diagnosis.risk}</span>.
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
export default function StageRenderer(props: {
  stage: AlexStage;
  planLabel?: string;
  context: AlexContext | null;
  roadmap: AlexRoadmap | null;
  today: AlexToday | null;
  logs: DailyLog[];
  onStartOnboarding: () => void;
  businessProject?: FormActionBusinessProject | null;
  onSubmitOnboarding: (data: {
    intent: AlexIntent;
    level: AlexLevel;
    timePerDay: TimePerDay;
    businessGoal: AlexBusinessGoal;
    businessModel: AlexBusinessModel;
    audienceSize: AlexAudienceSize;
    mainBlocker: AlexMainBlocker;
    offerDescription: string;
    targetAudienceDescription: string;
    primaryChannel: string;
    channelNotes: string;
    formActionProject: FormActionBusinessProject;
  }) => void;
  onOpenPlan: () => void;
  onGoMission: () => void;
  onAskCommit: () => void;
  onFeedbackDone: () => void;
  onFeedbackNotYet: () => void;
  onSubmitFeedback: (data: {
    done: boolean;
    kpiValue: number;
    blocker: DailyLog["blocker"];
  }) => void;
  onGenerateNext: () => void;
  onOpenParcours: () => void;
  onAfterLiveMarketAnalysis?: () => void | Promise<void>;
}) {
  const {
    stage,
    planLabel,
    context,
    roadmap,
    today,
    logs,
    businessProject,
    onStartOnboarding,
    onSubmitOnboarding,
    onOpenPlan,
    onGoMission,
    onAskCommit,
    onFeedbackDone,
    onFeedbackNotYet,
    onSubmitFeedback,
    onGenerateNext,
    onOpenParcours,
    onAfterLiveMarketAnalysis,
  } = props;

  const planTier: PlanTier = tierFromPlanLabel(planLabel);
  const planLimits = getCoachPlanLimits(planTier);

  // ===== WELCOME
  if (stage === "WELCOME") {
    const doneCount = logs.filter((l) => l.done).length;
    const pct = Math.min(100, Math.round((doneCount / 7) * 100));

    return (
      <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-2xl font-semibold text-yellow-400 sm:text-3xl">
              Alex V4 · Business Director IA
            </div>
            <div className="mt-1 text-sm text-white/55">
              MMR · MLR · Contenu — Focus Instagram. Résultats mesurés.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill>Instagram</Pill>
            <Pill>Ventes</Pill>
            <Pill>Workflow</Pill>
          </div>
        </div>

        <div className="mt-6">
          <BusinessDirectorPanelV4
            businessProject={businessProject || null}
            context={context}
            logs={logs}
            today={today}
            compact={!businessProject && !context}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
            <div className="text-white/85 font-semibold">Bon retour 👋</div>
            <div className="mt-1 text-sm text-white/55">
              {today
                ? `Mission en cours : Semaine ${today.weekIndex} · Jour ${today.dayIndex}`
                : "Tu peux reprendre là où tu t’es arrêté."}
            </div>

            <div className="mt-4">
              <div className="text-xs text-white/50">Progression semaine</div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-white/55">{doneCount}/7</div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={onGoMission}
                className="flex-1 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
              >
                Reprendre la mission
              </button>
              <button
                onClick={onOpenParcours}
                className="flex-1 rounded-2xl border border-[#2a2416] bg-black/20 px-4 py-3 text-sm text-white/75 hover:border-yellow-400/30 hover:text-yellow-200 transition"
              >
                Voir mon parcours
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
            <div className="text-white/85 font-semibold">Nouveau ici ?</div>
            <div className="mt-1 text-sm text-white/55">
              2 minutes pour démarrer. Aucun blabla.
            </div>

            <button
              onClick={onStartOnboarding}
              className="mt-5 w-full rounded-2xl border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/15 transition"
            >
              Commencer le parcours
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== ONBOARDING
  if (stage === "ONBOARDING") {
    return (
      <OnboardingCard
        onSubmit={onSubmitOnboarding}
        businessProject={businessProject || null}
        onAfterLiveMarketAnalysis={onAfterLiveMarketAnalysis}
      />
    );
  }

  // ===== PLAN
  if (stage === "PLAN_OVERVIEW") {
    return (
      <PlanOverview
        roadmap={roadmap}
        planTier={planTier}
        planLimits={planLimits}
        onStart={onGoMission}
        onRegen={onStartOnboarding}
        businessProject={businessProject || null}
        context={context}
        logs={logs}
      />
    );
  }

  // ===== MISSION
  if (stage === "MISSION_TODAY") {
    return (
      <MissionCard
        today={today}
        onAskCommit={onAskCommit}
        onOpenParcours={onOpenParcours}
        businessProject={businessProject || null}
        context={context}
        logs={logs}
      />
    );
  }

  // ===== FEEDBACK
  if (stage === "FEEDBACK") {
    return (
      <FeedbackCard
        today={today}
        onDone={onFeedbackDone}
        onNotYet={onFeedbackNotYet}
        onSubmit={onSubmitFeedback}
      />
    );
  }

  // ===== OPTIMIZE
  if (stage === "OPTIMIZE") {
    return (
      <OptimizeCard
        today={today}
        logs={logs}
        ctx={context}
        planLimits={planLimits}
        onNext={onGenerateNext}
      />
    );
  }

  // EXECUTION / COMMIT_REQUIRED are handled by Shell (modal + redirect)
  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-4 sm:p-6">
      <div className="text-white/80">Chargement…</div>
    </div>
  );
}

function OnboardingCard(props: {
  businessProject: FormActionBusinessProject | null;
  onAfterLiveMarketAnalysis?: () => void | Promise<void>;
  onSubmit: (data: {
    intent: AlexIntent;
    level: AlexLevel;
    timePerDay: TimePerDay;
    businessGoal: AlexBusinessGoal;
    businessModel: AlexBusinessModel;
    audienceSize: AlexAudienceSize;
    mainBlocker: AlexMainBlocker;
    offerDescription: string;
    targetAudienceDescription: string;
    primaryChannel: string;
    channelNotes: string;
    formActionProject: FormActionBusinessProject;
  }) => void;
}) {
  const { businessProject, onSubmit, onAfterLiveMarketAnalysis } = props;
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<AlexIntent>("argent_vite");
  const [level, setLevel] = useState<AlexLevel>("debutant");
  const [timePerDay, setTimePerDay] = useState<TimePerDay>(30);
  const [businessGoal, setBusinessGoal] =
    useState<AlexBusinessGoal>("premiers_revenus");
  const [businessModel, setBusinessModel] = useState<AlexBusinessModel>(
    (businessProject?.businessModel as AlexBusinessModel) || "pas_encore",
  );
  const [parcoursChoice, setParcoursChoice] = useState<FormActionParcours>(
    businessProject?.parcours || "non_defini",
  );
  const [audienceSize, setAudienceSize] =
    useState<AlexAudienceSize>("moins_500");
  const [mainBlocker, setMainBlocker] = useState<AlexMainBlocker>("dispersion");
  const [offerDescription, setOfferDescription] = useState(
    businessProject?.offerDescription || "",
  );
  const [problemSolved, setProblemSolved] = useState(
    businessProject?.problemSolved || "",
  );
  const [transformationPromise, setTransformationPromise] = useState(
    businessProject?.transformationPromise || "",
  );
  const [targetAudienceDescription, setTargetAudienceDescription] = useState(
    businessProject?.targetAudienceDescription || "",
  );
  const [positioning, setPositioning] = useState(
    businessProject?.positioning || "mentor",
  );
  const [primaryChannel, setPrimaryChannel] = useState("instagram");
  const [firstRevenueGoal, setFirstRevenueGoal] = useState(
    businessProject?.firstRevenueGoal || "1 première vente",
  );
  const [channelNotes, setChannelNotes] = useState("");
  const targetEditedRef = useRef(
    Boolean(businessProject?.targetAudienceDescription),
  );
  const problemEditedRef = useRef(Boolean(businessProject?.problemSolved));
  const promiseEditedRef = useRef(
    Boolean(businessProject?.transformationPromise),
  );
  const [opportunityBatchIndex, setOpportunityBatchIndex] = useState(0);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(true);
  const [liveOpportunities, setLiveOpportunities] = useState<DigitalProductOpportunity[] | null>(null);
  const [liveOpportunitiesLoading, setLiveOpportunitiesLoading] = useState(false);
  const [liveOpportunitiesError, setLiveOpportunitiesError] = useState("");
  const [liveOpportunitiesNotice, setLiveOpportunitiesNotice] = useState("");

  const visibleDigitalProductOpportunities = useMemo(
    () => liveOpportunities || getDigitalProductOpportunityBatch(opportunityBatchIndex),
    [liveOpportunities, opportunityBatchIndex],
  );

  const selectedDigitalProductOpportunity = useMemo(
    () => findDigitalProductOpportunityByOffer(offerDescription),
    [offerDescription],
  );

  useEffect(() => {
    if (problemEditedRef.current) return;
    const inferred = inferProblemSolved(offerDescription, businessModel);
    if (!offerDescription) return;
    setProblemSolved(inferred);
  }, [offerDescription, businessModel]);

  useEffect(() => {
    if (promiseEditedRef.current) return;
    if (!offerDescription) return;
    const inferred = inferTransformationPromise({
      offerDescription,
      problemSolved:
        problemSolved || inferProblemSolved(offerDescription, businessModel),
      businessGoal,
      businessModel,
    });
    setTransformationPromise(inferred);
  }, [offerDescription, problemSolved, businessGoal, businessModel]);

  useEffect(() => {
    if (targetEditedRef.current) return;
    const inferred = inferTargetAudienceFromOffer(
      offerDescription,
      businessModel,
      businessGoal,
      level,
      audienceSize,
      mainBlocker,
      problemSolved,
    );
    if (!inferred) return;
    setTargetAudienceDescription(inferred);
  }, [
    offerDescription,
    businessModel,
    businessGoal,
    level,
    audienceSize,
    mainBlocker,
    problemSolved,
  ]);

  const formActionProject = useMemo(
    () =>
      inferFormActionProject({
        offerDescription,
        problemSolved,
        transformationPromise,
        targetAudienceDescription,
        businessModel,
        businessGoal,
        level,
        audienceSize,
        mainBlocker,
        primaryChannel,
        positioning,
        firstRevenueGoal,
        parcoursChoice,
      }),
    [
      offerDescription,
      problemSolved,
      transformationPromise,
      targetAudienceDescription,
      businessModel,
      businessGoal,
      level,
      audienceSize,
      mainBlocker,
      primaryChannel,
      positioning,
      firstRevenueGoal,
      parcoursChoice,
    ],
  );

  const totalSteps = 10;

  function regenerateAvatar() {
    targetEditedRef.current = false;
    setTargetAudienceDescription(
      inferTargetAudienceFromOffer(
        offerDescription,
        businessModel,
        businessGoal,
        level,
        audienceSize,
        mainBlocker,
        problemSolved,
      ),
    );
  }

  function applyDigitalProductOpportunity(opportunity: DigitalProductOpportunity) {
    problemEditedRef.current = true;
    promiseEditedRef.current = true;
    targetEditedRef.current = true;
    setOfferDescription(opportunity.offerDescription);
    setProblemSolved(opportunity.problemSolved);
    setTransformationPromise(opportunity.transformationPromise);
    setTargetAudienceDescription(opportunity.targetAudienceDescription);
    setPrimaryChannel("instagram");
    setPositioning("mentor");
    setOpportunitiesOpen(false);
  }

  async function runLiveMarketAnalysis() {
    if (liveOpportunitiesLoading) return;

    setLiveOpportunitiesLoading(true);
    setLiveOpportunitiesError("");
    setLiveOpportunitiesNotice("");

    try {
      const opportunities = await fetchLiveDigitalProductOpportunities({
        businessGoal,
        level,
        audienceSize,
        mainBlocker,
        primaryChannel,
      });

      setLiveOpportunities(opportunities);
      setOpportunitiesOpen(true);
      setLiveOpportunitiesNotice(
        "Analyse IA Live terminée : ces opportunités ont consommé des jetons et sont personnalisées par Alex.",
      );
      await onAfterLiveMarketAnalysis?.();
    } catch (error: any) {
      setLiveOpportunitiesError(
        String(error?.message || error || "Analyse IA Live indisponible. Le fallback premium reste actif."),
      );
    } finally {
      setLiveOpportunitiesLoading(false);
    }
  }

  function submitOnboarding() {
    onSubmit({
      intent,
      level,
      timePerDay,
      businessGoal,
      businessModel,
      audienceSize,
      mainBlocker,
      offerDescription,
      targetAudienceDescription,
      primaryChannel,
      channelNotes,
      formActionProject,
    });
  }

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-4 sm:p-4 sm:p-6">
      <div className="text-2xl font-semibold text-yellow-400 sm:text-3xl">
        Coach Alex V3 · FormAction Premium
      </div>
      <div className="mt-1 text-sm text-white/55">
        Alex ne collecte plus seulement des réponses : il construit la mémoire
        marketing centrale de ton projet.
      </div>

      <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-400/5 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300/80">
          Étape {step + 1}/{totalSteps}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-yellow-400"
            style={{ width: `${Math.round(((step + 1) / totalSteps) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        {step === 0 ? (
          <>
            <div className="text-white/85 font-semibold">
              Quel est ton projet principal ?
            </div>
            <div className="mt-2 text-sm text-white/50">
              Alex adapte tout le parcours selon ce choix.
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={businessModel === "offre_digitale" && parcoursChoice === "creation_produit_digital"}
                onClick={() => {
                  setBusinessModel("offre_digitale");
                  setParcoursChoice("creation_produit_digital");
                }}
                label="Créer mon propre produit digital"
              />
              <PickRow
                checked={parcoursChoice === "mrr"}
                onClick={() => {
                  setBusinessModel("offre_digitale");
                  setParcoursChoice("mrr");
                }}
                label="Vendre une formation MRR avec droits de revente"
              />
              <PickRow
                checked={businessModel === "affiliation" && parcoursChoice === "affiliation"}
                onClick={() => {
                  setBusinessModel("affiliation");
                  setParcoursChoice("affiliation");
                }}
                label="Développer une activité d’affiliation"
              />
              <PickRow
                checked={businessModel === "coaching"}
                onClick={() => {
                  setBusinessModel("coaching");
                  setParcoursChoice("non_defini");
                }}
                label="Vendre du coaching ou de l’accompagnement"
              />
              <PickRow
                checked={businessModel === "contenu"}
                onClick={() => {
                  setBusinessModel("contenu");
                  setParcoursChoice("non_defini");
                }}
                label="Construire une audience puis monétiser"
              />
              <PickRow
                checked={businessModel === "pas_encore"}
                onClick={() => {
                  setBusinessModel("pas_encore");
                  setParcoursChoice("non_defini");
                }}
                label="Je ne sais pas encore"
              />
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className="text-white/85 font-semibold">
              Quel objectif veux-tu atteindre en priorité ?
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={businessGoal === "premiers_revenus"}
                onClick={() => {
                  setBusinessGoal("premiers_revenus");
                  setFirstRevenueGoal("1 première vente");
                }}
                label="Obtenir mes premiers revenus"
              />
              <PickRow
                checked={businessGoal === "revenu_500"}
                onClick={() => {
                  setBusinessGoal("revenu_500");
                  setFirstRevenueGoal("500€/mois");
                }}
                label="Atteindre 500€/mois"
              />
              <PickRow
                checked={businessGoal === "premiers_clients"}
                onClick={() => {
                  setBusinessGoal("premiers_clients");
                  setFirstRevenueGoal("3 premiers clients");
                }}
                label="Trouver mes premiers clients"
              />
              <PickRow
                checked={businessGoal === "quitter_job"}
                onClick={() => {
                  setBusinessGoal("quitter_job");
                  setFirstRevenueGoal("revenu complémentaire stable");
                }}
                label="Préparer une sortie progressive du salariat"
              />
              <PickRow
                checked={businessGoal === "business_stable"}
                onClick={() => {
                  setBusinessGoal("business_stable");
                  setFirstRevenueGoal("business stable et répétable");
                }}
                label="Construire un business stable"
              />
            </div>
          </>
        ) : step === 2 ? (
          <>
           <div className="text-white/85 font-semibold">
  {parcoursChoice === "creation_produit_digital"
    ? "Décris le produit digital que tu souhaites créer"
    : parcoursChoice === "mrr"
      ? "Décris la formation MRR que tu souhaites développer"
      : parcoursChoice === "affiliation"
        ? "Décris les produits ou services que tu souhaites recommander"
        : businessModel === "coaching"
          ? "Décris l'accompagnement que tu souhaites proposer"
          : businessModel === "contenu"
            ? "Décris l'univers que tu souhaites développer"
            : "Description de l'offre"}
</div>

<div className="mt-2 text-sm text-white/50">
  {parcoursChoice === "creation_produit_digital"
    ? "Alex va construire toute ta stratégie autour de ce produit."
    : parcoursChoice === "mrr"
      ? "Alex utilisera cette description pour bâtir tout ton système MRR."
      : parcoursChoice === "affiliation"
        ? "Alex utilisera cette description pour construire ton système d'affiliation."
        : businessModel === "coaching"
          ? "Alex préparera ton positionnement et ton offre d'accompagnement."
          : businessModel === "contenu"
            ? "Alex préparera une stratégie de croissance et de monétisation."
            : "Plus tu es précis, plus Alex devient puissant."}
</div>

{parcoursChoice === "creation_produit_digital" ? (
  <div className="mt-5 rounded-3xl border border-yellow-500/20 bg-yellow-400/5 p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="text-sm font-black text-yellow-200">
          🧠 Alex peut te proposer 5 niches rentables
        </div>
        <div className="mt-1 text-xs leading-5 text-white/55">
          Choisis une opportunité pour préremplir ton idée de produit, ou écris librement ton propre projet.
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <button
          type="button"
          onClick={() => {
            setLiveOpportunities(null);
            setLiveOpportunitiesError("");
            setLiveOpportunitiesNotice("Fallback premium régénéré : 0 jeton consommé.");
            setOpportunityBatchIndex((current) => current + 1);
            setOpportunitiesOpen(true);
          }}
          className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-200 transition hover:bg-yellow-400/15"
        >
          Régénérer 5 niches rentables
        </button>
        <button
          type="button"
          onClick={runLiveMarketAnalysis}
          disabled={liveOpportunitiesLoading}
          className="rounded-2xl border border-yellow-400/40 bg-yellow-400 px-4 py-2 text-xs font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {liveOpportunitiesLoading ? "Analyse IA en cours…" : "🧠 Analyse marché IA Live"}
        </button>
        {selectedDigitalProductOpportunity ? (
          <button
            type="button"
            onClick={() => setOpportunitiesOpen((current) => !current)}
            className="rounded-2xl border border-[#2a2416] bg-black/25 px-4 py-2 text-xs font-semibold text-white/65 transition hover:border-yellow-400/30 hover:text-yellow-200"
          >
            {opportunitiesOpen ? "Rétracter les propositions" : "Voir les 5 propositions"}
          </button>
        ) : null}
      </div>
    </div>

    <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/20 p-3 text-xs leading-5 text-white/55">
      {liveOpportunities
        ? "Mode IA Live : les niches affichées viennent d’une analyse IA et consomment des jetons."
        : "Mode fallback premium : niches préchargées, instantanées, 0 jeton consommé."}
    </div>

    {liveOpportunitiesLoading ? (
      <LiveMarketLoadingMoulinette />
    ) : null}

    {liveOpportunitiesNotice ? (
      <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-5 text-emerald-100">
        {liveOpportunitiesNotice}
      </div>
    ) : null}

    {liveOpportunitiesError ? (
      <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-xs leading-5 text-red-100">
        {liveOpportunitiesError}
      </div>
    ) : null}

    {selectedDigitalProductOpportunity && !opportunitiesOpen ? (
      <SelectedOpportunitySummary
        opportunity={selectedDigitalProductOpportunity}
        onOpen={() => setOpportunitiesOpen(true)}
      />
    ) : null}

    {opportunitiesOpen ? (
      <div className="mt-4 grid grid-cols-1 gap-3">
        {visibleDigitalProductOpportunities.map((opportunity) => (
          <OpportunityPickCard
            key={opportunity.id}
            opportunity={opportunity}
            selected={selectedDigitalProductOpportunity?.id === opportunity.id}
            onPick={() => applyDigitalProductOpportunity(opportunity)}
          />
        ))}
      </div>
    ) : null}
  </div>
) : null}

<textarea
  value={offerDescription}
  onChange={(e) => setOfferDescription(e.target.value)}
  placeholder={
    parcoursChoice === "creation_produit_digital"
      ? "Exemple : une formation, un ebook ou une méthode que tu as créé pour aider une audience précise à résoudre un problème concret..."
      : parcoursChoice === "mrr"
        ? "Exemple : une formation MRR comme L'Indépendance Digital avec droits de revente pour aider des débutants à construire une activité digitale..."
        : parcoursChoice === "affiliation"
          ? "Exemple : recommander des outils ou des formations que tu apprécies et toucher une commission sur chaque vente..."
          : businessModel === "coaching"
            ? "Exemple : accompagner des entrepreneurs à atteindre un objectif précis grâce à ton expertise..."
            : businessModel === "contenu"
              ? "Exemple : développer une audience sur une thématique puis la monétiser progressivement..."
              : "Décris ton projet..."
  }
  className="mt-5 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/40"
  rows={7}
/>
          </>
        ) : step === 3 ? (
          <>
            <div className="text-white/85 font-semibold">
              Quel problème règles-tu ?
            </div>
            <div className="mt-2 text-sm text-white/50">
              Alex le préremplit depuis ton offre. Corrige seulement si besoin.
            </div>
            <textarea
              value={problemSolved}
              onChange={(e) => {
                problemEditedRef.current = true;
                setProblemSolved(e.target.value);
              }}
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/40"
              rows={5}
            />
          </>
        ) : step === 4 ? (
          <>
            <div className="text-white/85 font-semibold">
              Quelle transformation promets-tu ?
            </div>
            <div className="mt-2 text-sm text-white/50">
              Ce bloc servira plus tard aux pages de vente, emails, posts et
              scripts de conversion.
            </div>
            <textarea
              value={transformationPromise}
              onChange={(e) => {
                promiseEditedRef.current = true;
                setTransformationPromise(e.target.value);
              }}
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/40"
              rows={5}
            />
          </>
        ) : step === 5 ? (
          <>
            <div className="text-white/85 font-semibold">Ton niveau actuel</div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={level === "debutant"}
                onClick={() => setLevel("debutant")}
                label="Je débute totalement"
              />
              <PickRow
                checked={level === "sans_resultat"}
                onClick={() => setLevel("sans_resultat")}
                label="J’ai déjà essayé sans résultat"
              />
              <PickRow
                checked={level === "quelques_ventes"}
                onClick={() => setLevel("quelques_ventes")}
                label="J’ai déjà fait quelques ventes"
              />
            </div>

            <div className="mt-5 text-white/85 font-semibold">
              Ton audience actuelle
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={audienceSize === "zero"}
                onClick={() => setAudienceSize("zero")}
                label="Je pars de zéro"
              />
              <PickRow
                checked={audienceSize === "moins_500"}
                onClick={() => setAudienceSize("moins_500")}
                label="Moins de 500 abonnés"
              />
              <PickRow
                checked={audienceSize === "500_5000"}
                onClick={() => setAudienceSize("500_5000")}
                label="Entre 500 et 5 000 abonnés"
              />
              <PickRow
                checked={audienceSize === "plus_5000"}
                onClick={() => setAudienceSize("plus_5000")}
                label="Plus de 5 000 abonnés"
              />
            </div>
          </>
        ) : step === 6 ? (
          <>
            <div className="text-white/85 font-semibold">
              Ton blocage principal aujourd’hui
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={mainBlocker === "dispersion"}
                onClick={() => setMainBlocker("dispersion")}
                label="Je me disperse trop"
              />
              <PickRow
                checked={mainBlocker === "temps"}
                onClick={() => setMainBlocker("temps")}
                label="Je manque de temps"
              />
              <PickRow
                checked={mainBlocker === "technique"}
                onClick={() => setMainBlocker("technique")}
                label="Je bloque sur la technique"
              />
              <PickRow
                checked={mainBlocker === "vente"}
                onClick={() => setMainBlocker("vente")}
                label="Je ne sais pas vendre"
              />
              <PickRow
                checked={mainBlocker === "confiance"}
                onClick={() => setMainBlocker("confiance")}
                label="Je manque de confiance"
              />
            </div>

            <div className="mt-5 text-white/85 font-semibold">
              Pourquoi tu veux réussir maintenant ?
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={intent === "argent_vite"}
                onClick={() => setIntent("argent_vite")}
                label="Gagner de l’argent rapidement"
              />
              <PickRow
                checked={intent === "quitter_job"}
                onClick={() => setIntent("quitter_job")}
                label="Quitter mon travail à terme"
              />
              <PickRow
                checked={intent === "complement"}
                onClick={() => setIntent("complement")}
                label="Créer un complément de revenu"
              />
              <PickRow
                checked={intent === "discipline"}
                onClick={() => setIntent("discipline")}
                label="Arrêter de procrastiner"
              />
            </div>
          </>
        ) : step === 7 ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white/85 font-semibold">
                  Avatar marketing premium
                </div>
                <div className="mt-2 text-sm text-white/50">
                  Alex préremplit le client idéal avec un vrai avatar
                  exploitable par tout LGD.
                </div>
              </div>
              <button
                type="button"
                onClick={regenerateAvatar}
                className="shrink-0 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-semibold text-yellow-200 hover:bg-yellow-400/15 transition"
              >
                Régénérer
              </button>
            </div>
            <textarea
              value={targetAudienceDescription}
              onChange={(e) => {
                targetEditedRef.current = true;
                setTargetAudienceDescription(e.target.value);
              }}
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/40"
              rows={18}
            />
            <div className="mt-3 rounded-2xl border border-yellow-500/15 bg-yellow-400/5 p-3 text-xs leading-5 text-white/60">
              Ce bloc devient la mémoire marketing centrale : Coach Alex, CMO
              IA, Lead Engine, posts, emailing et pages de vente pourront
              l’exploiter.
            </div>
          </>
        ) : step === 8 ? (
          <>
            <div className="text-white/85 font-semibold">
              Positionnement et canal prioritaire
            </div>
            <div className="mt-2 text-sm text-white/50">
              Alex choisit une stratégie concentrée, pas une dispersion sur tous
              les réseaux.
            </div>

            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300/70">
              Tu veux être perçu comme
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {[
                "expert",
                "mentor",
                "coach",
                "créateur",
                "entrepreneur",
                "marque personnelle",
              ].map((item) => (
                <PickRow
                  key={item}
                  checked={positioning === item}
                  onClick={() => setPositioning(item)}
                  label={item.charAt(0).toUpperCase() + item.slice(1)}
                />
              ))}
            </div>

            <div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300/70">
              Canal prioritaire
            </div>
            <input
              value={primaryChannel}
              onChange={(e) => setPrimaryChannel(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-sm text-white outline-none focus:border-yellow-400/40"
            />

            <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/20 p-4 text-xs leading-5 text-white/60">
              <span className="font-semibold text-yellow-200">
                Recommandation Alex :
              </span>{" "}
              {formActionProject.recommendedPlatform}.{" "}
              {formActionProject.platformReason}
            </div>
          </>
        ) : (
          <>
            <div className="text-white/85 font-semibold">
              Validation FormAction
            </div>
            <div className="mt-2 text-sm text-white/50">
              Alex a compris ton projet et prépare la première mission utile.
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <SummaryLine
                label="Parcours"
                value={parcoursLabel(formActionProject.parcours)}
              />
              <SummaryLine
                label="Modèle"
                value={labelBusinessModelForProject(formActionProject, businessModel)}
              />
              <SummaryLine
                label="Objectif"
                value={firstRevenueGoal || labelBusinessGoal(businessGoal)}
              />
              <SummaryLine label="Niveau" value={labelLevel(level)} />
              <SummaryLine
                label="Audience"
                value={labelAudienceSize(audienceSize)}
              />
              <SummaryLine
                label="Blocage prioritaire"
                value={labelBlocker(mainBlocker)}
              />
              <SummaryLine
                label="Plateforme recommandée"
                value={formActionProject.recommendedPlatform || "Instagram"}
              />
              <SummaryLine
                label="Temps estimé avant mise en vente"
                value={formActionProject.estimatedTimeBeforeSale || "7 jours"}
              />
              <SummaryLine
                label="Score de clarté offre"
                value={`${formActionProject.offerReadinessScore || 0}/100`}
              />
            </div>

            <div className="mt-5">
              <BusinessDirectorPanelV4
                businessProject={formActionProject}
                context={null}
                logs={[]}
                today={null}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-500/20 bg-yellow-400/5 p-4">
              <div className="text-sm font-semibold text-yellow-200">
                🧠 Ce qu’Alex a compris · Synthèse opérationnelle
              </div>
              <div className="mt-3 space-y-3 text-sm leading-6 text-white/70">
                <p>
                  Ton projet prioritaire est :{" "}
                  <span className="text-white">
                    {parcoursLabel(formActionProject.parcours)}
                  </span>
                  . Alex doit concentrer tes actions sur{" "}
                  <span className="text-white">
                    {formActionProject.recommendedPlatform}
                  </span>
                  .
                </p>
                <p>
                  Ton offre doit résoudre :{" "}
                  <span className="text-white">
                    {problemSolved || "un problème clair à préciser"}
                  </span>
                </p>
                <p>
                  Ton angle de contenu :{" "}
                  <span className="text-white">
                    {formActionProject.contentAngle}
                  </span>
                </p>
                <p>
                  Ton angle de vente :{" "}
                  <span className="text-white">
                    {formActionProject.salesAngle}
                  </span>
                </p>
                <p>
                  Mission suivante préparée :{" "}
                  <span className="text-white">
                    {formActionProject.nextMission}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 text-white/85 font-semibold">
              Temps disponible par jour
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <PickRow
                checked={timePerDay === 30}
                onClick={() => setTimePerDay(30)}
                label="30 minutes"
              />
              <PickRow
                checked={timePerDay === 60}
                onClick={() => setTimePerDay(60)}
                label="1 heure"
              />
              <PickRow
                checked={timePerDay === 90}
                onClick={() => setTimePerDay(90)}
                label="1h30+"
              />
            </div>
          </>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={
              "rounded-2xl border px-4 py-3 text-sm transition " +
              (step === 0
                ? "border-white/10 bg-white/5 text-white/30"
                : "border-[#2a2416] bg-black/20 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Retour
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={submitOnboarding}
              className="rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Valider et générer ma trajectoire
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
        <div className="text-xs text-white/50">Coach Alex V3 FormAction</div>
        <div className="mt-1 text-sm text-white/70">
          Une seule mémoire projet. Une seule direction. Une mission suivante
          exploitable par tout LGD.
        </div>
      </div>
    </div>
  );
}

function CommandMetric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-[#070b11] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-5 text-white/80">
        {value}
      </div>
    </div>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-center">
      <div className="text-xs text-yellow-200/70">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-yellow-300">
        {value}
      </div>
      <div className="text-[10px] text-white/40">/100</div>
    </div>
  );
}


function MobileInfoPill({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#2a2416] bg-black/25 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold leading-5 text-white/80">
        {value}
      </div>
    </div>
  );
}

function MobileTabButton(props: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const { active, onClick, children } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "shrink-0 rounded-full border px-4 py-2 text-xs font-black transition " +
        (active
          ? "border-yellow-400/50 bg-yellow-400 text-black"
          : "border-[#2a2416] bg-black/25 text-white/65 hover:border-yellow-400/30 hover:text-yellow-200")
      }
    >
      {children}
    </button>
  );
}

function TimelineStep(props: { number: string; title: string; body: ReactNode }) {
  const { number, title, body } = props;
  return (
    <div className="flex gap-3 rounded-2xl border border-[#2a2416] bg-black/20 p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-xs font-black text-yellow-200">
        {number}
      </div>
      <div>
        <div className="text-sm font-black text-white/85">{title}</div>
        <div className="mt-1 text-sm leading-6 text-white/60">{body}</div>
      </div>
    </div>
  );
}


function opportunityDemandScore(opportunity: DigitalProductOpportunity) {
  return Math.max(7.2, Math.min(9.8, Number((opportunity.score / 10).toFixed(1))));
}

function opportunityRevenueScore(opportunity: DigitalProductOpportunity) {
  const score = Number(((opportunity.score - 5) / 10).toFixed(1));
  return Math.max(7.0, Math.min(9.5, score));
}

function opportunityDifficultyScore(opportunity: DigitalProductOpportunity) {
  const text = `${opportunity.product} ${opportunity.why} ${opportunity.price}`.toLowerCase();
  if (text.includes("template") || text.includes("ebook") || text.includes("guide")) return "Faible";
  if (text.includes("coaching") || text.includes("communauté") || text.includes("communaute")) return "Moyenne";
  return opportunity.score >= 93 ? "Faible à moyenne" : "Moyenne";
}

function opportunityTimeToSale(opportunity: DigitalProductOpportunity) {
  if (opportunity.score >= 94) return "7 jours";
  if (opportunity.score >= 90) return "7 à 10 jours";
  return "10 à 14 jours";
}

function opportunityChannel(opportunity: DigitalProductOpportunity) {
  const text = `${opportunity.title} ${opportunity.demand} ${opportunity.targetAudienceDescription}`.toLowerCase();
  if (text.includes("faceless") || text.includes("créateur") || text.includes("createur")) return "TikTok + Instagram";
  if (text.includes("commerce") || text.includes("local")) return "Facebook local + Instagram";
  if (text.includes("freelance") || text.includes("indépendant") || text.includes("independant")) return "LinkedIn + Instagram";
  return "Instagram + TikTok";
}

function opportunityFirstContent(opportunity: DigitalProductOpportunity) {
  const problem = businessPreviewText(opportunity.problemSolved, 78);
  return `Post/Reel problème → solution : ${problem}`;
}

function opportunityAvatarShort(opportunity: DigitalProductOpportunity) {
  return businessPreviewText(opportunity.targetAudienceDescription, 120);
}

function OpportunityMetric(props: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-yellow-500/15 bg-black/25 p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
        {props.icon} {props.label}
      </div>
      <div className="mt-1 text-sm font-black text-yellow-200">
        {props.value}
      </div>
    </div>
  );
}


function LiveMarketLoadingMoulinette() {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-yellow-400/25 bg-gradient-to-br from-yellow-400/15 via-black/30 to-black p-4 shadow-[0_0_30px_rgba(250,204,21,0.10)]">
      <div className="flex items-start gap-3">
        <div className="relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10">
          <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-yellow-400/15 border-t-yellow-300" />
          <div className="h-3 w-3 rounded-full bg-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.65)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-black text-yellow-200">
            🧠 Alex analyse le marché en direct...
          </div>
          <div className="mt-1 text-xs leading-5 text-white/60">
            Recherche des opportunités, scoring business, avatar, produit conseillé et angle de vente.
          </div>

          <div className="mt-3 space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-yellow-400" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-white/45">
              <span>Demande</span>
              <span>Rentabilité</span>
              <span>Compatibilité LGD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedOpportunitySummary(props: {
  opportunity: DigitalProductOpportunity;
  onOpen: () => void;
}) {
  const { opportunity, onOpen } = props;

  return (
    <div className="mt-4 rounded-3xl border border-yellow-400/35 bg-gradient-to-br from-yellow-400/15 via-yellow-400/7 to-black p-4 shadow-[0_0_28px_rgba(250,204,21,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-300/70">
            Opportunité sélectionnée
          </div>
          <div className="mt-1 text-lg font-black leading-tight text-white">
            {opportunity.title}
          </div>
          <div className="mt-2 text-xs leading-5 text-white/65">
            {opportunity.why}
          </div>
        </div>
        <div className="shrink-0 rounded-2xl border border-yellow-400/25 bg-black/30 px-3 py-2 text-center">
          <div className="text-[10px] text-yellow-200/70">Score</div>
          <div className="text-xl font-black text-yellow-300">
            {opportunity.score}
          </div>
          <div className="text-[10px] text-white/35">/100</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <OpportunityMetric icon="🔥" label="Demande" value={`${opportunityDemandScore(opportunity)}/10`} />
        <OpportunityMetric icon="💰" label="Revenus" value={`${opportunityRevenueScore(opportunity)}/10`} />
        <OpportunityMetric icon="⚡" label="Difficulté" value={opportunityDifficultyScore(opportunity)} />
        <OpportunityMetric icon="⏱" label="1ère vente" value={opportunityTimeToSale(opportunity)} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/5 bg-black/25 p-3 text-xs leading-5 text-white/65">
        <span className="font-black text-yellow-200">Produit conseillé :</span>{" "}
        {opportunity.product}
      </div>
      <div className="mt-2 rounded-2xl border border-white/5 bg-black/25 p-3 text-xs leading-5 text-white/65">
        <span className="font-black text-yellow-200">Premier contenu :</span>{" "}
        {opportunityFirstContent(opportunity)}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-4 w-full rounded-2xl border border-yellow-400/30 bg-black/25 px-4 py-3 text-xs font-black text-yellow-200 transition hover:bg-yellow-400/10"
      >
        Changer de niche ou voir les propositions
      </button>
    </div>
  );
}

function OpportunityPickCard(props: {
  opportunity: DigitalProductOpportunity;
  selected: boolean;
  onPick: () => void;
}) {
  const { opportunity, selected, onPick } = props;

  return (
    <button
      type="button"
      onClick={onPick}
      className={
        "w-full rounded-3xl border p-4 text-left transition " +
        (selected
          ? "border-yellow-400/60 bg-yellow-400/15 shadow-[0_0_24px_rgba(250,204,21,0.10)]"
          : "border-[#2a2416] bg-black/25 hover:border-yellow-400/35 hover:bg-yellow-400/5")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300/60">
            🧠 Carte Business Premium
          </div>
          <div className="mt-1 text-base font-black leading-tight text-white">
            {opportunity.title}
          </div>
          <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-300/70">
            {opportunity.badge}
          </div>
        </div>
        <div className="shrink-0 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-center">
          <div className="text-[10px] text-yellow-200/70">Score</div>
          <div className="text-xl font-black text-yellow-300">
            {opportunity.score}
          </div>
          <div className="text-[10px] text-white/35">/100</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <OpportunityMetric icon="🔥" label="Demande" value={`${opportunityDemandScore(opportunity)}/10`} />
        <OpportunityMetric icon="💰" label="Revenus" value={`${opportunityRevenueScore(opportunity)}/10`} />
        <OpportunityMetric icon="⚡" label="Difficulté" value={opportunityDifficultyScore(opportunity)} />
        <OpportunityMetric icon="⏱" label="1ère vente" value={opportunityTimeToSale(opportunity)} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs leading-5 text-white/65">
          <span className="font-black text-yellow-200">🎯 Avatar conseillé :</span>{" "}
          {opportunityAvatarShort(opportunity)}
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs leading-5 text-white/65">
          <span className="font-black text-yellow-200">📱 Canal prioritaire :</span>{" "}
          {opportunityChannel(opportunity)}
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs leading-5 text-white/65">
          <span className="font-black text-yellow-200">🎬 Premier contenu :</span>{" "}
          {opportunityFirstContent(opportunity)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-black/20 p-3 text-xs leading-5 text-white/65">
          <span className="font-black text-yellow-200">📦 Produit :</span>{" "}
          {opportunity.product}
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/20 p-3 text-xs leading-5 text-white/65">
          <span className="font-black text-yellow-200">💵 Prix :</span>{" "}
          {opportunity.price}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-yellow-500/15 bg-yellow-400/5 p-3 text-xs leading-5 text-white/60">
        <span className="font-black text-yellow-200">Pourquoi maintenant :</span>{" "}
        {opportunity.why}
      </div>

      <div className="mt-4 flex w-full items-center justify-center rounded-2xl bg-yellow-400 px-4 py-3 text-xs font-black text-black transition hover:brightness-110">
        {selected ? "✓ Opportunité sélectionnée" : "Utiliser cette opportunité"}
      </div>
    </button>
  );
}

function SummaryLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/35">
        {label}
      </div>
      <div className="mt-1 break-words text-sm text-white/75">{value}</div>
    </div>
  );
}

function PickRow(props: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  const { checked, label, onClick } = props;
  return (
    <button
      onClick={onClick}
      className={
        "w-full rounded-2xl border px-4 py-3 text-left text-sm transition " +
        (checked
          ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
          : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
      }
    >
      {label}
    </button>
  );
}

function PlanOverview(props: {
  roadmap: AlexRoadmap | null;
  planTier: PlanTier;
  planLimits: ReturnType<typeof getCoachPlanLimits>;
  onStart: () => void;
  onRegen: () => void;
  businessProject?: FormActionBusinessProject | null;
  context?: AlexContext | null;
  logs?: DailyLog[];
}) {
  const {
    roadmap,
    planTier,
    planLimits,
    onStart,
    onRegen,
    businessProject,
    context,
    logs = [],
  } = props;
  const regenCheck = useMemo(() => canRegenPlan(planLimits), [planLimits]);
  const upgradeHint = useMemo(
    () => getUpgradeHintForPlanRegen(planTier),
    [planTier],
  );

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-4 sm:p-4 sm:p-6">
      <div className="text-2xl font-semibold text-yellow-400 sm:text-3xl">
        Ton plan global
      </div>
      <div className="mt-1 text-sm text-white/55">
        Non éditable. Tu exécutes, tu mesures, tu avances.
      </div>

      <div className="mt-6">
        <BusinessDirectorPanelV4
          businessProject={businessProject || null}
          context={context || null}
          logs={logs}
          today={null}
          compact={true}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {(roadmap?.weeks || []).slice(0, 4).map((w) => (
          <div
            key={w.weekIndex}
            className="rounded-2xl border border-[#2a2416] bg-black/20 p-5"
          >
            <div className="text-white/85 font-semibold">
              Semaine {w.weekIndex}
            </div>
            <div className="mt-1 text-sm text-white/55">{w.label}</div>
            <div className="mt-3 space-y-2">
              {w.days.slice(0, 3).map((d) => (
                <div key={d.dayIndex} className="text-sm text-white/65">
                  <span className="text-white/45">Jour {d.dayIndex} :</span>{" "}
                  {d.title}
                </div>
              ))}
              <div className="text-xs text-white/45">
                + {Math.max(0, w.days.length - 3)} autres jours…
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onStart}
          className="flex-1 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
        >
          Commencer aujourd’hui
        </button>
        <button
          onClick={() => {
            const ok = canRegenPlan(planLimits);
            if (!ok.ok) return;
            commitPlanRegen(planLimits);
            onRegen();
          }}
          disabled={!regenCheck.ok}
          className={
            "flex-1 rounded-2xl border px-5 py-3 text-sm transition " +
            (regenCheck.ok
              ? "border-[#2a2416] bg-black/20 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200"
              : "border-white/10 bg-white/5 text-white/35 cursor-not-allowed")
          }
        >
          Recommencer (onboarding)
        </button>
      </div>

      {!regenCheck.ok ? (
        <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
          <div className="text-sm text-yellow-200 font-semibold">
            {upgradeHint?.title || "Limite atteinte"}
          </div>
          <div className="mt-1 text-sm text-white/55">
            {upgradeHint?.body ||
              "Tu pourras relancer ton onboarding plus tard selon ton plan."}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MissionCard(props: {
  today: AlexToday | null;
  onAskCommit: () => void;
  onOpenParcours: () => void;
  businessProject?: FormActionBusinessProject | null;
  context?: AlexContext | null;
  logs?: DailyLog[];
}) {
  const {
    today,
    onAskCommit,
    onOpenParcours,
    businessProject,
    context,
    logs = [],
  } = props;

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-2xl font-semibold text-yellow-400">
            🤝 Action unique du jour
          </div>
          <div className="mt-1 text-sm text-white/55">
            Une seule action. Celle qui fait réellement avancer ton business.
          </div>
        </div>
        <button
          onClick={onOpenParcours}
          className="rounded-2xl border border-[#2a2416] bg-black/20 px-4 py-2 text-sm text-white/70 hover:border-yellow-400/30 hover:text-yellow-200 transition"
        >
          Mon parcours
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-400/5 p-4 text-sm leading-6 text-white/60">
        <span className="font-semibold text-yellow-200">Alex Mobile Command est rétracté.</span>{" "}
        Alex laisse maintenant toute la place à l’action du jour.
      </div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        <div className="text-yellow-200 text-lg font-semibold">
          {today?.mission.title || "—"}
        </div>
        <div className="mt-1 text-xs text-white/50">
          {today ? `Semaine ${today.weekIndex} · Jour ${today.dayIndex}` : ""}
        </div>
        <div className="mt-3 text-sm text-white/70">
          {today?.mission.objective || ""}
        </div>

        {today?.mission.checklist?.length ? (
          <div className="mt-4 space-y-2">
            {today.mission.checklist.map((it, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-white/70"
              >
                <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-yellow-400/80" />
                <span>{it}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-xs text-white/50">KPI</div>
            <div className="mt-1 text-sm text-white/80">
              {today?.mission.kpiLabel || "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-xs text-white/50">Durée</div>
            <div className="mt-1 text-sm text-white/80">
              {today ? `${today.mission.durationMin} min` : "—"}
            </div>
          </div>
        </div>

        <button
          onClick={onAskCommit}
          className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
        >
          🚀 Exécuter maintenant
        </button>

        <div className="mt-3 text-xs text-white/45">
          Accès à l’éditeur intelligent uniquement après validation.
        </div>
      </div>
    </div>
  );
}

function FeedbackCard(props: {
  today: AlexToday | null;
  onDone: () => void;
  onNotYet: () => void;
  onSubmit: (data: {
    done: boolean;
    kpiValue: number;
    blocker: DailyLog["blocker"];
  }) => void;
}) {
  const { today, onDone, onNotYet, onSubmit } = props;
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [kpiValue, setKpiValue] = useState<number>(0);
  const [blocker, setBlocker] = useState<DailyLog["blocker"] | null>(null);

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-4 sm:p-4 sm:p-6">
      <div className="text-2xl font-semibold text-yellow-400 sm:text-3xl">Feedback</div>
      <div className="mt-1 text-sm text-white/55">
        30 secondes. On mesure. On optimise.
      </div>

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
        <div className="text-white/85 font-semibold">Mission terminée ?</div>
        <div className="mt-1 text-sm text-white/55">
          {today?.mission.title || ""}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setAnswered(true);
              onDone();
            }}
            className={
              "rounded-2xl border px-4 py-3 text-sm font-semibold transition " +
              (answered === true
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
                : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Oui
          </button>
          <button
            onClick={() => {
              setAnswered(false);
              onNotYet();
            }}
            className={
              "rounded-2xl border px-4 py-3 text-sm font-semibold transition " +
              (answered === false
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-200"
                : "border-[#2a2416] bg-black/15 text-white/75 hover:border-yellow-400/30 hover:text-yellow-200")
            }
          >
            Pas encore
          </button>
        </div>

        {answered === true ? (
          <>
            <div className="mt-5 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
              <div className="text-sm text-white/70">
                {today?.mission.kpiLabel || "KPI"}
              </div>
              <input
                type="number"
                value={Number.isFinite(kpiValue) ? kpiValue : 0}
                onChange={(e) => setKpiValue(Number(e.target.value || 0))}
                className="mt-2 w-full rounded-2xl border border-[#2a2416] bg-[#070a10] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/40"
                placeholder="0"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
              <div className="text-sm text-white/70">Blocage principal</div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <PickRow
                  checked={blocker === "idees"}
                  onClick={() => setBlocker("idees")}
                  label="Trouver des idées"
                />
                <PickRow
                  checked={blocker === "oser"}
                  onClick={() => setBlocker("oser")}
                  label="Oser publier"
                />
                <PickRow
                  checked={blocker === "pas_de_reponses"}
                  onClick={() => setBlocker("pas_de_reponses")}
                  label="Personne ne répond"
                />
                <PickRow
                  checked={blocker === "temps"}
                  onClick={() => setBlocker("temps")}
                  label="Manque de temps"
                />
                <PickRow
                  checked={blocker === "message"}
                  onClick={() => setBlocker("message")}
                  label="Je ne savais pas quoi dire"
                />
                <PickRow
                  checked={blocker === "autre"}
                  onClick={() => setBlocker("autre")}
                  label="Aucun blocage"
                />
              </div>
            </div>

            <button
              onClick={() =>
                onSubmit({ done: true, kpiValue, blocker: blocker ?? "autre" })
              }
              className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
            >
              Valider
            </button>
          </>
        ) : answered === false ? (
          <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/15 p-4">
            <div className="text-sm text-white/70">
              OK. Reviens une fois la mission terminée.
            </div>
            <div className="mt-1 text-xs text-white/50">
              Alex te remettra exactement sur cette mission.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OptimizeCard(props: {
  today: AlexToday | null;
  logs: DailyLog[];
  ctx: AlexContext | null;
  planLimits: ReturnType<typeof getCoachPlanLimits>;
  onNext: () => void;
}) {
  const { today, logs, ctx, planLimits, onNext } = props;

  const lastDone = useMemo(
    () =>
      logs
        .slice()
        .reverse()
        .find((l) => l.done),
    [logs],
  );

  const blockerKey = (lastDone?.blocker ?? null) as DailyLog["blocker"] | null;
  const hasBlocker = blockerKey !== null && blockerKey !== "autre";

  const behaviorTags = useMemo(() => {
    try {
      return getBehaviorTags(ctx, logs);
    } catch {
      return [];
    }
  }, [ctx, logs]);

  const rec = useMemo(() => {
    if (!hasBlocker) return null;
    try {
      return makeOptimizationRecFromBlocker(blockerKey as DailyLog["blocker"]);
    } catch {
      return null;
    }
  }, [hasBlocker, blockerKey, behaviorTags]);

  const applyToEditor = () => {
    if (!rec) return;
    try {
      const briefId =
        "opt_" +
        Math.random().toString(36).slice(2) +
        "_" +
        Date.now().toString(36);
      const payload = {
        source: "coach-alex-v2",
        network: "instagram",
        objective: "ventes_mmr_mlr",
        blocker: blockerKey,
        tags: behaviorTags,
        recommendationTitle: rec.title,
        cause: rec.cause,
        action: rec.action,
        brief: rec.brief,
        editorMode: rec.editorMode,
        createdAtISO: new Date().toISOString(),
        briefId,
      };
      localStorage.setItem(
        "lgd_editor_intelligent_brief",
        JSON.stringify(payload),
      );
    } catch {
      // ignore
    }
    window.location.href =
      "/dashboard/automatisations/reseaux_sociaux/editor-intelligent";
  };

  const analysis = useMemo(() => {
    if (!hasBlocker) {
      return {
        win: "Tu avances. Continue le rythme.",
        fix: "Mesure ton KPI chaque jour.",
        next: "On enchaîne avec la prochaine mission.",
      };
    }

    // We keep existing logic as a fallback, but behavior tags can slightly adjust the tone.
    const b = blockerKey;

    if (b === "message") {
      return {
        win: "Tu as exécuté. C’est ce qui compte.",
        fix: "Demain : un script plus simple, 1 question ouverte.",
        next: "On passe à une mission conversation guidée.",
      };
    }
    if (b === "pas_de_reponses") {
      return {
        win: "Tu es visible. On optimise le CTA.",
        fix: "Demain : hook + question + CTA DM plus clair.",
        next: "On améliore la conversion, pas le volume.",
      };
    }
    if (b === "idees") {
      return {
        win: "Tu as démarré. On structure.",
        fix: "Demain : 1 template simple (problème → solution → preuve).",
        next: "On enlève la friction d’inspiration.",
      };
    }
    if (b === "temps") {
      return {
        win: "Tu as identifié le vrai problème.",
        fix: "Demain : mission 20 minutes, 1 seule tâche.",
        next: "On privilégie la régularité.",
      };
    }
    if (b === "oser") {
      return {
        win: "Tu progresses. On sécurise.",
        fix: "Demain : format plus léger (story ou mini post).",
        next: "On gagne en confiance par petites victoires.",
      };
    }

    return {
      win: "Tu as exécuté. Bien.",
      fix: "Demain : on optimise un seul levier.",
      next: "On enchaîne.",
    };
  }, [hasBlocker, blockerKey]);

  if (!hasBlocker) {
    return (
      <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-4 sm:p-6">
        <div className="text-2xl font-semibold text-yellow-400 sm:text-3xl">
          Optimisation
        </div>
        <div className="mt-1 text-sm text-white/55">
          Aucun blocage détecté. Parfait — on garde le rythme.
        </div>

        <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-sm text-white/80 font-semibold">
            Ton ajustement pour demain
          </div>
          <div className="mt-2 text-sm text-white/60">
            Répète exactement le même mouvement. La régularité crée les ventes.
          </div>

          <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-4">
            <div className="text-xs text-white/50">Action</div>
            <div className="mt-2 text-sm text-white/80">
              Passe à la mission suivante.
            </div>
          </div>

          <button
            onClick={onNext}
            className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
          >
            Mission suivante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#2a2416] bg-[#0b0f16]/70 p-4 sm:p-4 sm:p-6">
      <div className="text-2xl font-semibold text-yellow-400 sm:text-3xl">Optimisation</div>
      <div className="mt-1 text-sm text-white/55">
        Alex ajuste ton focus. Réseau : Instagram. Modèles : MMR/MLR/Contenu.
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">Ce qui a marché</div>
          <div className="mt-2 text-sm text-white/80">{analysis.win}</div>
        </div>
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">À corriger</div>
          <div className="mt-2 text-sm text-white/80">{analysis.fix}</div>
        </div>
        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-xs text-white/50">Priorité</div>
          <div className="mt-2 text-sm text-white/80">{analysis.next}</div>
        </div>
      </div>

      {/* WOW card computed by Alex Behavior Engine */}
      {rec ? (
        <div className="mt-5 rounded-2xl border border-[#2a2416] bg-black/20 p-5">
          <div className="text-sm text-white/80 font-semibold">
            Ton ajustement pour demain
          </div>
          <div className="mt-2 text-sm text-white/60">{rec.title}</div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Cause probable</div>
              <div className="mt-2 text-sm text-white/80">{rec.cause}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Fix concret</div>
              <div className="mt-2 text-sm text-white/80">{rec.action}</div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/10 p-4">
              <div className="text-xs text-white/50">Action maintenant</div>
              <div className="mt-2 text-sm text-white/80">{rec.brief}</div>
            </div>
          </div>

          <button
            onClick={applyToEditor}
            className="mt-5 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
          >
            Appliquer dans l’éditeur intelligent
          </button>

          {planLimits.optimizeDepth <= 1 ? (
            <div className="mt-3 text-xs text-white/50">
              Astuce : passe en Pro/Ultime pour recevoir plus d’optimisations
              (hooks, scripts, closing).
            </div>
          ) : null}
        </div>
      ) : null}

      {planLimits.optimizeDepth >= 2 ? (
        <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-5">
          <div className="text-sm text-white/80 font-semibold">Boost Pro</div>
          <div className="mt-2 text-sm text-white/60">
            Ajout : 1 recommandation concrète (hook/CTA) pour augmenter les
            réponses.
          </div>
          <div className="mt-3 rounded-2xl border border-[#2a2416] bg-black/20 p-4">
            <div className="text-xs text-white/50">Action recommandée</div>
            <div className="mt-2 text-sm text-white/80">
              Teste 2 hooks différents sur le même sujet (A/B) et garde celui
              qui obtient le plus de commentaires/DM.
            </div>
          </div>
        </div>
      ) : null}

      {planLimits.optimizeDepth >= 3 ? (
        <div className="mt-4 rounded-2xl border border-[#2a2416] bg-black/10 p-5">
          <div className="text-sm text-white/80 font-semibold">
            Boost Ultime
          </div>
          <div className="mt-2 text-sm text-white/60">
            Ajout : plan de micro-optimisation (contenu → DM → closing) pour
            scaler.
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">Contenu</div>
              <div className="mt-1 text-sm text-white/80">
                1 post valeur + 1 story question aujourd’hui.
              </div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">DM</div>
              <div className="mt-1 text-sm text-white/80">
                3 relances courtes (question ouverte + micro engagement).
              </div>
            </div>
            <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
              <div className="text-xs text-white/50">Closing</div>
              <div className="mt-1 text-sm text-white/80">
                Propose une étape suivante simple (audio/mini call).
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-[#2a2416] bg-black/15 p-5">
        <div className="text-sm text-white/70">Dernière mission</div>
        <div className="mt-2 text-lg font-semibold text-yellow-200">
          {today?.mission.title || "—"}
        </div>
        <div className="mt-1 text-sm text-white/55">
          Intent actuel :{" "}
          <span className="text-white/80 font-semibold">
            {ctx?.intent || "—"}
          </span>
        </div>
        {behaviorTags?.length ? (
          <div className="mt-2 text-xs text-white/45">
            Contexte Alex : {behaviorTags.join(" · ")}
          </div>
        ) : null}
      </div>

      <button
        onClick={onNext}
        className="mt-6 w-full rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-black hover:bg-yellow-300 transition"
      >
        Générer la mission suivante
      </button>
    </div>
  );
}
