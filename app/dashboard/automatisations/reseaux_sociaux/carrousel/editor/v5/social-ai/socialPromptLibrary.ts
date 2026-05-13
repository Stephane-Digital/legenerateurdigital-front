export type SocialPromptCategory =
  | "Hooks"
  | "Engagement"
  | "Autorité"
  | "Vente douce"
  | "Storytelling"
  | "Carrousel"
  | "Reel"
  | "CTA"
  | "Personas";

export type SocialPromptTemplate = {
  id: string;
  category: SocialPromptCategory;
  title: string;
  description: string;
  prompt: string;
};

export const SOCIAL_PROMPT_LIBRARY: SocialPromptTemplate[] = [
  {
    id: "hook-scroll-stop-frustration",
    category: "Hooks",
    title: "Hook frustration silencieuse",
    description: "Pour capter les personnes bloquées qui n'osent pas agir.",
    prompt:
      "Crée un hook scroll-stopper pour une audience qui consomme beaucoup de contenu business mais repousse l'action. Ton empathique, lucide, premium, sans jugement.",
  },
  {
    id: "hook-truth",
    category: "Hooks",
    title: "Vérité dérangeante douce",
    description: "Angle fort sans agressivité.",
    prompt:
      "Crée un post qui commence par une vérité dérangeante mais respectueuse sur le fait qu'avoir plus d'information ne crée pas automatiquement plus d'action.",
  },
  {
    id: "authority-method",
    category: "Autorité",
    title: "Méthode claire",
    description: "Montre une expertise structurée en peu de mots.",
    prompt:
      "Crée un post d'autorité qui explique une méthode simple en 3 étapes pour transformer une idée en action marketing concrète.",
  },
  {
    id: "engagement-question",
    category: "Engagement",
    title: "Question commentaire",
    description: "Déclenche réponses et conversations.",
    prompt:
      "Crée un post court avec une question forte qui pousse l'audience à commenter son plus gros blocage actuel dans le business digital.",
  },
  {
    id: "soft-sale-lead-magnet",
    category: "Vente douce",
    title: "Lead magnet sans forcer",
    description: "CTA naturel vers guide gratuit ou DM.",
    prompt:
      "Crée un post de vente douce qui donne envie de recevoir un guide gratuit, sans pression, en expliquant la micro-transformation promise.",
  },
  {
    id: "story-failed-action",
    category: "Storytelling",
    title: "Story blocage → déclic",
    description: "Une mini-histoire qui connecte émotion et action.",
    prompt:
      "Crée un storytelling court : une personne accumule les formations et contenus, puis comprend qu'il lui manque un chemin guidé, pas une réponse de plus.",
  },
  {
    id: "carousel-guided-path",
    category: "Carrousel",
    title: "Carrousel chemin guidé",
    description: "Structure une idée en slides claires.",
    prompt:
      "Crée un carrousel Instagram de 6 slides sur la différence entre une IA qui répond et un système qui structure l'action marketing.",
  },
  {
    id: "reel-script-objection",
    category: "Reel",
    title: "Script Reel objection",
    description: "Hook + scène + punchline + CTA.",
    prompt:
      "Crée un script Reel court qui répond à l'objection : Pourquoi utiliser LGD si ChatGPT peut déjà répondre ? Ton respectueux et premium.",
  },
  {
    id: "cta-dm",
    category: "CTA",
    title: "CTA DM premium",
    description: "Invite au DM sans agressivité.",
    prompt:
      "Crée 5 CTA premium pour inviter à envoyer un DM afin de recevoir un plan simple ou un guide gratuit.",
  },
  {
    id: "persona-salarie",
    category: "Personas",
    title: "Salarié fatigué",
    description: "Persona qui veut avancer après le travail.",
    prompt:
      "Crée un post pour un salarié fatigué qui veut construire une activité digitale mais se sent dispersé et manque de temps.",
  },
  {
    id: "persona-mrr",
    category: "Personas",
    title: "MRR / affiliation bloqué",
    description: "Audience qui a déjà acheté mais n'a pas exécuté.",
    prompt:
      "Crée un contenu pour une personne qui a acheté des formations MRR ou affiliation mais reste bloquée au moment de publier, capter des leads et vendre.",
  },
];

export const SOCIAL_PROMPT_CATEGORIES: SocialPromptCategory[] = [
  "Hooks",
  "Engagement",
  "Autorité",
  "Vente douce",
  "Storytelling",
  "Carrousel",
  "Reel",
  "CTA",
  "Personas",
];
