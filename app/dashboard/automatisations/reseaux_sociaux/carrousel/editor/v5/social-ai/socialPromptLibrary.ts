export type SocialPromptCategory =
  | "Hooks"
  | "Vente"
  | "Leads"
  | "Engagement"
  | "Autorité"
  | "Objections"
  | "Storytelling"
  | "Carrousel"
  | "Reel"
  | "CTA"
  | "MRR"
  | "Personas";

export type SocialPromptTemplate = {
  id: string;
  category: SocialPromptCategory;
  title: string;
  description: string;
  prompt: string;
};

const RULES =
  "Règles absolues : contenu directement publiable, zéro blabla théorique, zéro explication méta, zéro phrase corporate, zéro formulation générique, aucune mention de plateforme ou d'outil non demandé. Écris comme un copywriter senior spécialisé marketing digital, psychologie d'achat, contenu social et conversion.";

export const SOCIAL_PROMPT_LIBRARY: SocialPromptTemplate[] = [
  {
    id: "hook-pain-hidden-cost",
    category: "Hooks",
    title: "Hook coût caché",
    description: "Fait ressentir le prix invisible de l'inaction.",
    prompt:
      `Crée 10 hooks scroll-stopper sur le coût caché du problème vécu par l'audience. Chaque hook doit faire penser : "c'est exactement moi". ${RULES}`,
  },
  {
    id: "hook-brutal-truth-soft",
    category: "Hooks",
    title: "Vérité brutale douce",
    description: "Angle fort, lucide, sans agresser.",
    prompt:
      `Crée 10 hooks qui commencent par une vérité difficile à entendre mais utile. Ton humain, premium, direct, sans jugement. ${RULES}`,
  },
  {
    id: "hook-before-after-gap",
    category: "Hooks",
    title: "Écart avant/après",
    description: "Montre l'écart entre situation actuelle et résultat désiré.",
    prompt:
      `Crée 10 hooks basés sur l'écart entre ce que l'audience fait aujourd'hui et le résultat qu'elle veut vraiment obtenir. ${RULES}`,
  },
  {
    id: "hook-objection-first",
    category: "Hooks",
    title: "Objection dès la ligne 1",
    description: "Transforme une objection en aimant à attention.",
    prompt:
      `Crée 10 hooks qui ouvrent directement sur l'objection principale de l'audience, puis la retournent avec finesse. ${RULES}`,
  },
  {
    id: "hook-pattern-interrupt",
    category: "Hooks",
    title: "Pattern interrupt",
    description: "Arrête le scroll avec une phrase inattendue.",
    prompt:
      `Crée 10 hooks courts, surprenants et crédibles qui cassent le schéma habituel du marché. Pas de sensation putaclic. ${RULES}`,
  },
  {
    id: "hook-mirror-sentence",
    category: "Hooks",
    title: "Phrase miroir",
    description: "L'utilisateur a l'impression que le post lit dans ses pensées.",
    prompt:
      `Crée 10 hooks miroir qui décrivent une pensée intime que l'audience n'ose pas forcément dire à voix haute. ${RULES}`,
  },
  {
    id: "sale-soft-premium-post",
    category: "Vente",
    title: "Post vente douce premium",
    description: "Vendre sans forcer, sans posture agressive.",
    prompt:
      `Crée un post de vente douce qui vend l'offre de l'utilisateur avec désir, clarté et élégance. Structure : hook émotionnel, problème réel, mécanisme simple, transformation, invitation naturelle. ${RULES}`,
  },
  {
    id: "sale-direct-but-human",
    category: "Vente",
    title: "Vente directe humaine",
    description: "Plus commercial, mais crédible et propre.",
    prompt:
      `Crée un post de vente directe humain, sans agressivité. Le contenu doit donner envie d'acheter ou de demander plus d'informations maintenant. ${RULES}`,
  },
  {
    id: "sale-offer-reframe",
    category: "Vente",
    title: "Reformulation d'offre",
    description: "Transforme une offre banale en bénéfice désirable.",
    prompt:
      `Reformule l'offre de l'utilisateur en contenu social désirable : pas de liste de fonctionnalités, uniquement bénéfices concrets, transformation, soulagement, résultat tangible. ${RULES}`,
  },
  {
    id: "sale-why-now",
    category: "Vente",
    title: "Pourquoi maintenant",
    description: "Crée une urgence saine et crédible.",
    prompt:
      `Crée un post qui explique pourquoi attendre coûte plus cher que passer à l'action maintenant. Urgence saine, pas de manipulation. ${RULES}`,
  },
  {
    id: "sale-mini-case-study",
    category: "Vente",
    title: "Mini cas client",
    description: "Simule une preuve concrète sans inventer de chiffres précis.",
    prompt:
      `Crée un post façon mini cas client crédible : situation de départ, blocage, déclic, action simple, résultat qualitatif. Ne pas inventer de chiffres ni de faux témoignage. ${RULES}`,
  },
  {
    id: "lead-magnet-desire",
    category: "Leads",
    title: "Lead magnet désirable",
    description: "Donne envie de télécharger, commenter ou envoyer un DM.",
    prompt:
      `Crée un post qui rend un lead magnet irrésistible. Le lecteur doit comprendre le gain concret, le soulagement obtenu et l'étape simple à faire. ${RULES}`,
  },
  {
    id: "lead-dm-keyword",
    category: "Leads",
    title: "DM mot-clé",
    description: "Déclenche des messages privés sans pression.",
    prompt:
      `Crée un post court qui pousse naturellement à envoyer un mot-clé en DM. Le CTA doit être simple, naturel et orienté bénéfice immédiat. ${RULES}`,
  },
  {
    id: "lead-comment-keyword",
    category: "Leads",
    title: "Commentaire mot-clé",
    description: "Optimisé pour récolter des commentaires qualifiés.",
    prompt:
      `Crée un post qui donne envie de commenter un mot-clé pour recevoir une ressource. Le post doit filtrer une audience qualifiée. ${RULES}`,
  },
  {
    id: "lead-checklist",
    category: "Leads",
    title: "Checklist utile",
    description: "Transforme l'idée en ressource simple et concrète.",
    prompt:
      `Crée un post qui vend une checklist simple. Le lecteur doit sentir qu'elle va lui éviter de perdre du temps, oublier une étape ou refaire les mêmes erreurs. ${RULES}`,
  },
  {
    id: "engagement-confession",
    category: "Engagement",
    title: "Confession relatable",
    description: "Déclenche commentaires et identification.",
    prompt:
      `Crée un post confessionnel court, très humain, qui donne envie à l'audience de répondre "moi aussi". ${RULES}`,
  },
  {
    id: "engagement-question-deep",
    category: "Engagement",
    title: "Question profonde",
    description: "Question qui ouvre une vraie conversation.",
    prompt:
      `Crée 7 questions de post qui poussent l'audience à commenter son blocage réel, pas une réponse superficielle. ${RULES}`,
  },
  {
    id: "engagement-this-or-that",
    category: "Engagement",
    title: "Choix A/B",
    description: "Simple, rapide, conversationnel.",
    prompt:
      `Crée un post type choix A/B qui force une prise de position simple et génère des commentaires qualifiés. ${RULES}`,
  },
  {
    id: "authority-framework",
    category: "Autorité",
    title: "Framework 3 étapes",
    description: "Crédibilité immédiate sans cours interminable.",
    prompt:
      `Crée un post d'autorité avec un framework en 3 étapes. Il doit être simple, mémorisable et directement applicable. ${RULES}`,
  },
  {
    id: "authority-myth-busting",
    category: "Autorité",
    title: "Mythe cassé",
    description: "Positionne l'utilisateur comme expert lucide.",
    prompt:
      `Crée un post qui casse un mythe courant du marché de l'utilisateur, puis propose une vision plus mature, plus efficace et plus crédible. ${RULES}`,
  },
  {
    id: "authority-diagnostic",
    category: "Autorité",
    title: "Diagnostic expert",
    description: "Montre que l'utilisateur comprend vraiment son audience.",
    prompt:
      `Crée un post diagnostic : symptômes visibles, vraie cause, erreur fréquente, meilleure approche. Ton expert mais accessible. ${RULES}`,
  },
  {
    id: "objection-price",
    category: "Objections",
    title: "Objection prix",
    description: "Retourne le “c'est trop cher”.",
    prompt:
      `Crée un post qui répond à l'objection prix sans défendre l'offre. Montre le coût de l'inaction, le coût des bricolages et la valeur du résultat. ${RULES}`,
  },
  {
    id: "objection-time",
    category: "Objections",
    title: "Objection temps",
    description: "Pour audience débordée.",
    prompt:
      `Crée un post qui répond à l'objection "je n'ai pas le temps". Le contenu doit montrer que le vrai problème est souvent le manque de système, pas le manque d'heures. ${RULES}`,
  },
  {
    id: "objection-legitimacy",
    category: "Objections",
    title: "Objection légitimité",
    description: "Pour ceux qui n'osent pas vendre ou publier.",
    prompt:
      `Crée un post qui aide l'audience à dépasser la peur de ne pas être légitime. Ton rassurant, mature, orienté passage à l'action. ${RULES}`,
  },
  {
    id: "objection-already-tried",
    category: "Objections",
    title: "J'ai déjà essayé",
    description: "Relance une audience déçue ou sceptique.",
    prompt:
      `Crée un post qui répond à "j'ai déjà essayé et ça n'a pas marché". Montre que ce n'est pas forcément l'objectif qui était mauvais, mais l'approche, l'ordre ou le message. ${RULES}`,
  },
  {
    id: "story-before-after",
    category: "Storytelling",
    title: "Avant / Après humain",
    description: "Mini histoire émotionnelle et crédible.",
    prompt:
      `Crée un storytelling avant/après : situation confuse, frustration, petit déclic, nouvelle façon d'agir, résultat ressenti. Pas de fausse promesse. ${RULES}`,
  },
  {
    id: "story-mistake-lesson",
    category: "Storytelling",
    title: "Erreur → leçon",
    description: "Transforme une erreur en contenu puissant.",
    prompt:
      `Crée un post storytelling basé sur une erreur fréquente de l'audience, puis transforme cette erreur en leçon concrète et utile. ${RULES}`,
  },
  {
    id: "story-day-in-life",
    category: "Storytelling",
    title: "Scène du quotidien",
    description: "Rendu très humain, très visuel.",
    prompt:
      `Crée un post sous forme de scène du quotidien. Le lecteur doit visualiser sa propre situation, sentir la tension, puis voir une issue simple. ${RULES}`,
  },
  {
    id: "carousel-6-slides-conversion",
    category: "Carrousel",
    title: "Carrousel conversion 6 slides",
    description: "Structure complète pour capter, convaincre, convertir.",
    prompt:
      `Crée un carrousel de 6 slides : 1 hook, 2 problème réel, 3 erreur fréquente, 4 mécanisme, 5 mini-plan, 6 CTA. Texte court par slide, puissant, publiable. ${RULES}`,
  },
  {
    id: "carousel-myth-to-method",
    category: "Carrousel",
    title: "Mythe → méthode",
    description: "Éducatif, autorité, conversion douce.",
    prompt:
      `Crée un carrousel qui part d'un mythe courant, le démonte proprement, puis propose une méthode simple. 6 slides maximum. ${RULES}`,
  },
  {
    id: "carousel-checklist-action",
    category: "Carrousel",
    title: "Checklist action",
    description: "Fait sauvegarder et passer à l'action.",
    prompt:
      `Crée un carrousel checklist ultra concret. Chaque slide doit donner une action claire et utile. Objectif : sauvegarde + passage à l'action. ${RULES}`,
  },
  {
    id: "reel-script-fast-pain",
    category: "Reel",
    title: "Reel douleur rapide",
    description: "TikTok / Reels avec impact immédiat.",
    prompt:
      `Crée un script Reel de 25 secondes : hook en 2 secondes, scène relatable, tension, déclic, CTA court. Phrases très courtes. ${RULES}`,
  },
  {
    id: "reel-script-objection",
    category: "Reel",
    title: "Reel objection",
    description: "Répond à une objection en vidéo courte.",
    prompt:
      `Crée un script Reel qui répond à l'objection principale de l'audience. Structure : phrase choc, objection, retournement, exemple simple, CTA. ${RULES}`,
  },
  {
    id: "reel-script-story",
    category: "Reel",
    title: "Reel mini-story",
    description: "Une histoire courte qui vend sans vendre.",
    prompt:
      `Crée un script Reel storytelling : une situation précise, une frustration, un déclic, une action, une invitation naturelle. ${RULES}`,
  },
  {
    id: "cta-premium-dm",
    category: "CTA",
    title: "CTA DM premium",
    description: "Fait écrire sans malaise commercial.",
    prompt:
      `Crée 12 CTA premium pour inviter à envoyer un DM. Variantes : doux, direct, expert, émotionnel, urgent sain, curiosité. ${RULES}`,
  },
  {
    id: "cta-comment-keyword",
    category: "CTA",
    title: "CTA commentaire",
    description: "Pour commentaires mot-clé.",
    prompt:
      `Crée 12 CTA pour inviter à commenter un mot-clé. Ils doivent être naturels, courts, orientés bénéfice, sans sonner automatisé. ${RULES}`,
  },
  {
    id: "cta-save-share",
    category: "CTA",
    title: "CTA sauvegarde / partage",
    description: "Favorise l'engagement utile.",
    prompt:
      `Crée 12 CTA qui donnent envie de sauvegarder ou partager le post sans mendier l'engagement. ${RULES}`,
  },
  {
    id: "mrr-stuck-after-buying",
    category: "MRR",
    title: "MRR bloqué après achat",
    description: "Pour audience qui a acheté mais n'exécute pas.",
    prompt:
      `Crée un post pour une personne qui a acheté des formations MRR, affiliation ou produits digitaux, mais reste bloquée au moment de publier, capter des leads et vendre. ${RULES}`,
  },
  {
    id: "mrr-content-fatigue",
    category: "MRR",
    title: "Fatigue contenu MRR",
    description: "Parle du business qui devient un deuxième job.",
    prompt:
      `Crée un post sur la fatigue de devoir créer du contenu tous les jours pour vendre des produits digitaux. Angle : le problème n'est pas la motivation, c'est l'absence de système simple. ${RULES}`,
  },
  {
    id: "mrr-one-shot-sales",
    category: "MRR",
    title: "Ventes one-shot",
    description: "Sortir du modèle vente ponctuelle.",
    prompt:
      `Crée un post sur la frustration des ventes one-shot : vendre parfois, puis disparaître, puis recommencer à zéro. Propose une vision plus stable et structurée. ${RULES}`,
  },
  {
    id: "mrr-no-audience-trust",
    category: "MRR",
    title: "Audience qui ne fait pas confiance",
    description: "Construire crédibilité et conversion.",
    prompt:
      `Crée un post pour expliquer pourquoi l'audience n'achète pas encore : manque de clarté, confiance, preuve, répétition utile. Donne un angle concret. ${RULES}`,
  },
  {
    id: "persona-busy-parent",
    category: "Personas",
    title: "Parent débordé",
    description: "Temps limité, besoin de simplicité.",
    prompt:
      `Crée un post pour une personne qui veut développer une activité digitale tout en gérant famille, charge mentale et manque de temps. ${RULES}`,
  },
  {
    id: "persona-salarie-side-business",
    category: "Personas",
    title: "Salarié + side business",
    description: "Avancer après le travail sans s'épuiser.",
    prompt:
      `Crée un post pour un salarié qui veut construire une activité en ligne après le travail mais se sent dispersé, fatigué et irrégulier. ${RULES}`,
  },
  {
    id: "persona-coach-consultant",
    category: "Personas",
    title: "Coach / consultant",
    description: "Vendre son expertise sans paraître insistant.",
    prompt:
      `Crée un post pour un coach ou consultant qui veut vendre son accompagnement sans paraître lourd, tout en montrant sa valeur et son expertise. ${RULES}`,
  },
  {
    id: "persona-creator-low-engagement",
    category: "Personas",
    title: "Créateur peu engagé",
    description: "Publie mais n'obtient pas de retours.",
    prompt:
      `Crée un post pour une personne qui publie régulièrement mais obtient peu de commentaires, peu de leads et peu de ventes. ${RULES}`,
  },
];

export const SOCIAL_PROMPT_CATEGORIES: SocialPromptCategory[] = [
  "Hooks",
  "Vente",
  "Leads",
  "Engagement",
  "Autorité",
  "Objections",
  "Storytelling",
  "Carrousel",
  "Reel",
  "CTA",
  "MRR",
  "Personas",
];
