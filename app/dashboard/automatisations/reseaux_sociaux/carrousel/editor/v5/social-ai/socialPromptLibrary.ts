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
  | "Personas"
  | "Conseils"
  | "Algorithmes"
  | "Viralité"
  | "Conversion"
  | "Stratégie"
  | "Conseils 90 jours";

export type SocialPromptTemplate = {
  id: string;
  category: SocialPromptCategory;
  title: string;
  description: string;
  prompt: string;
};

const RULES =
  "Écris en LIVE IA. Zéro fallback. Zéro pavé. Mobile-first. Maximum 120 mots pour Instagram/Facebook/TikTok. Une seule idée forte. Phrases courtes. Respiration forte. Le lecteur doit penser : 'putain c’est moi'. Interdits : contenu authentique, apporte de la valeur, écoute ton audience, optimise ta stratégie, construis une relation, crois en toi, passe à l’action, vous méritez. Ne mentionne jamais LGD sauf si l’utilisateur le demande explicitement. Respecte strictement le brief utilisateur.";

export const SOCIAL_PROMPT_LIBRARY: SocialPromptTemplate[] = [
  { id: "mrr-stop-videos", category: "MRR", title: "Arrête les vidéos", description: "MRR débutant, consommation infinie, zéro exécution.", prompt: `Si l’audience débute dans le MRR, commence par ce qu’elle doit arrêter de faire. Angle : arrêter de regarder des vidéos toute la journée au lieu de publier. Parle de formations achetées, stratégies sauvegardées, zéro contenu, zéro prospect, zéro vente. ${RULES}` },
  { id: "mrr-execution", category: "MRR", title: "Exécution > information", description: "Vérité qui pique sur l’apprentissage passif.", prompt: `Écris un post MRR mobile-first sur cette vérité : l’audience n’a plus un problème d’information, elle a un problème d’exécution. ${RULES}` },
  { id: "mrr-page-blanche", category: "MRR", title: "Page blanche", description: "Parler au débutant qui ne sait jamais quoi poster.", prompt: `Écris un post MRR pour quelqu’un qui veut vendre mais bloque chaque fois qu’il doit publier. Mentionne page blanche, peur de mal faire, contenu imparfait publié. ${RULES}` },
  { id: "mrr-zero-sales", category: "MRR", title: "Zéro prospect", description: "Relier publication absente et ventes absentes.", prompt: `Écris un post MRR qui montre que zéro contenu publié finit souvent par zéro prospect et zéro vente. Ton direct, pas culpabilisant. ${RULES}` },
  { id: "mrr-one-action", category: "MRR", title: "Une action aujourd’hui", description: "Débloquer le passage à l’action.", prompt: `Écris un post MRR qui donne une action simple à faire aujourd’hui : publier un contenu imparfait au lieu de consommer une méthode de plus. ${RULES}` },

  { id: "advice-stop", category: "Conseils", title: "Arrête de faire ça", description: "Conseil court qui pique.", prompt: `Crée un conseil qui commence par ce que l’audience doit arrêter de faire. Une seule erreur. Une vérité. Un déclic. ${RULES}` },
  { id: "advice-one-rule", category: "Conseils", title: "Une règle", description: "Une règle utile et sauvegardable.", prompt: `Écris un post conseil avec une seule règle simple que l’audience peut appliquer aujourd’hui. Pas de liste. Pas de cours. ${RULES}` },
  { id: "advice-mistake", category: "Conseils", title: "Erreur débutant", description: "Faire ressentir l’erreur sans humilier.", prompt: `Écris un post sur une erreur de débutant dans la niche de l’utilisateur. Le lecteur doit se reconnaître. ${RULES}` },
  { id: "advice-imperfect", category: "Conseils", title: "Imparfait publié", description: "Contre le perfectionnisme.", prompt: `Écris un conseil sur le perfectionnisme qui empêche de publier. Punchline : un contenu imparfait publié bat une idée parfaite restée dans la tête. ${RULES}` },
  { id: "advice-too-much-info", category: "Conseils", title: "Trop d’information", description: "Stop surcharge mentale.", prompt: `Écris un post sur la surcharge d’information qui donne l’impression d’avancer alors qu’on n’exécute pas. ${RULES}` },

  { id: "algo-3sec", category: "Algorithmes", title: "3 secondes", description: "Faire comprendre vite pourquoi rester.", prompt: `Écris un conseil algorithme simple : si la personne ne comprend pas en 3 secondes pourquoi le post la concerne, elle part. ${RULES}` },
  { id: "algo-retention", category: "Algorithmes", title: "Rétention", description: "Tenir l’attention sans blabla.", prompt: `Écris un post court sur la rétention : chaque ligne doit donner envie de lire la suivante. Pas de cours. ${RULES}` },
  { id: "algo-save", category: "Algorithmes", title: "Sauvegarde", description: "Créer un post utile à garder.", prompt: `Écris un conseil sur les sauvegardes : un contenu est sauvegardé quand il aide à éviter une erreur concrète. ${RULES}` },
  { id: "algo-comments", category: "Algorithmes", title: "Commentaires", description: "Déclencher une réponse qualifiée.", prompt: `Écris un conseil pour déclencher des commentaires qualifiés sans mendier l’engagement. ${RULES}` },
  { id: "algo-recycle", category: "Algorithmes", title: "Recycler", description: "Une idée, plusieurs formats.", prompt: `Écris un post sur le recyclage intelligent : transformer une vérité forte en post, reel, story et carrousel. ${RULES}` },

  { id: "viral-relatable", category: "Viralité", title: "Moi aussi", description: "Relatable et partageable.", prompt: `Écris un post viral doux basé sur une situation que beaucoup vivent mais peu osent dire. Le lecteur doit penser 'moi aussi'. ${RULES}` },
  { id: "viral-truth", category: "Viralité", title: "Vérité qui pique", description: "Phrase mémorable sans buzz vide.", prompt: `Écris un post avec une vérité qui pique mais utile. Pas d’agressivité, pas de buzz vide. ${RULES}` },
  { id: "viral-contrast", category: "Viralité", title: "Contraste", description: "Opposer apprentissage et action.", prompt: `Écris un post basé sur un contraste fort entre ce que l’audience croit devoir faire et ce qui la débloque vraiment. ${RULES}` },
  { id: "viral-myth", category: "Viralité", title: "Mythe cassé", description: "Démonter une croyance banale.", prompt: `Écris un post qui casse un mythe courant de la niche avec une phrase courte et mémorable. ${RULES}` },
  { id: "viral-silent", category: "Viralité", title: "Frustration silencieuse", description: "Nommer ce que l’audience ressent.", prompt: `Écris un post qui nomme une frustration silencieuse de l’audience. Zéro conseil générique. ${RULES}` },

  { id: "conv-soft", category: "Conversion", title: "Conversion douce", description: "Faire avancer vers la décision.", prompt: `Écris un post qui rapproche le lecteur d’une décision sans vendre lourdement. Une prise de conscience, pas un argumentaire. ${RULES}` },
  { id: "conv-cost", category: "Conversion", title: "Coût de l’inaction", description: "Montrer ce que coûte l’attente.", prompt: `Écris un post sur le coût de l’inaction. Spécifique, court, concret. Pas de peur artificielle. ${RULES}` },
  { id: "conv-trust", category: "Conversion", title: "Confiance", description: "Faire confiance avant achat.", prompt: `Écris un post sur pourquoi l’audience n’achète pas encore : elle ne s’est pas encore reconnue dans le message. ${RULES}` },
  { id: "conv-objection", category: "Conversion", title: "Objection cachée", description: "Répondre sans défendre l’offre.", prompt: `Écris un post qui répond à une objection cachée sans défendre l’offre. Le lecteur doit se sentir compris. ${RULES}` },

  { id: "hook-pain", category: "Hooks", title: "Douleur directe", description: "Hooks qui parlent au vécu.", prompt: `Génère 10 hooks très courts. Chaque hook doit être spécifique, mobile-first, sans jargon. ${RULES}` },
  { id: "hook-stop", category: "Hooks", title: "Arrête de", description: "Hooks commençant par l’arrêt d’une erreur.", prompt: `Génère 10 hooks qui commencent par 'arrête de...' et qui nomment une erreur précise de l’audience. ${RULES}` },
  { id: "hook-mirror", category: "Hooks", title: "Pensée miroir", description: "Lire dans la tête du lecteur.", prompt: `Génère 10 hooks miroir : pensées que l’audience ressent mais ne dit pas. ${RULES}` },

  { id: "sale-no-force", category: "Vente", title: "Vendre sans forcer", description: "Faire ressentir le besoin.", prompt: `Écris un post de vente douce qui ne vend pas frontalement : il fait ressentir le problème et la prochaine étape logique. ${RULES}` },
  { id: "lead-keyword", category: "Leads", title: "Mot-clé commentaire", description: "Créer une demande simple.", prompt: `Écris un post qui donne envie de commenter un mot-clé pour recevoir une ressource. Court, utile, pas automatisé. ${RULES}` },
  { id: "eng-question", category: "Engagement", title: "Question qui ouvre", description: "Vraie conversation.", prompt: `Écris un post qui finit par une question simple et profonde, liée au blocage réel de l’audience. ${RULES}` },
  { id: "auth-framework", category: "Autorité", title: "Mini framework", description: "Autorité sans cours.", prompt: `Écris un mini framework en 3 lignes maximum. Une idée, pas un cours. ${RULES}` },
  { id: "obj-time", category: "Objections", title: "Pas le temps", description: "Répondre à l’objection temps.", prompt: `Écris un post qui répond à 'je n’ai pas le temps' en montrant que le vrai problème est souvent l’absence d’action simple. ${RULES}` },
  { id: "story-before-after", category: "Storytelling", title: "Avant / après", description: "Mini histoire terrain.", prompt: `Écris une mini histoire avant/après très courte : confusion, déclic, action. ${RULES}` },
  { id: "carrousel-short", category: "Carrousel", title: "6 slides courtes", description: "Une idée par slide.", prompt: `Crée un carrousel 6 slides. Chaque slide doit être courte. Une seule idée. Zéro paragraphe. ${RULES}` },
  { id: "reel-fast", category: "Reel", title: "Script court", description: "Reel/TikTok respirant.", prompt: `Écris un script Reel court, phrase écran par phrase écran. Hook immédiat. ${RULES}` },
  { id: "cta-simple", category: "CTA", title: "CTA naturel", description: "Action sans lourdeur.", prompt: `Génère 12 CTA courts, humains, naturels, sans pression commerciale. ${RULES}` },
  { id: "persona-busy", category: "Personas", title: "Débordé", description: "Audience dispersée.", prompt: `Écris pour une personne débordée qui veut avancer mais consomme trop d’informations et publie peu. ${RULES}` },
  { id: "strategy-7days", category: "Stratégie", title: "7 jours", description: "Plan de posts courts.", prompt: `Crée un plan de contenu 7 jours. Chaque jour : thème, vérité, hook court, objectif. Zéro post complet. ${RULES}` },
  { id: "advice-90", category: "Conseils 90 jours", title: "90 jours LIVE", description: "Plan long de conseils courts.", prompt: `Crée un plan 90 jours LIVE IA. Chaque jour : thème, angle, hook seed, conseil court, format, CTA. Pas de posts complets. ${RULES}` },
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
  "Conseils",
  "Algorithmes",
  "Viralité",
  "Conversion",
  "Stratégie",
  "Conseils 90 jours",
];
