export type EmailCampaignType = "vente" | "relance" | "lancement" | "nurturing";

export type EmailEngineContext = {
  offer: string;
  target: string;
  pain: string;
  promise: string;
  cta: string;
  angle: string;
  objection: string;
  objective: string;
  tone?: string;
  brand?: string;
};

export type EmailDayType = "nurture" | "objection" | "vente" | "relance";

export type EmailSequenceDay = {
  day: number;
  type: EmailDayType;
  label: string;
  subjects: {
    a: string;
    b: string;
    c: string;
  };
  preheader: string;
  shortMobile: string;
  longStory: string;
  ctaVariants: {
    a: string;
    b: string;
    c: string;
  };
  systemeIoNote: string;
};

export type EmailSequencePro = {
  campaignName: string;
  campaignType: EmailCampaignType;
  offer: string;
  target: string;
  promise: string;
  cta: string;
  days: EmailSequenceDay[];
  plainTextExport: string;
};

const DEFAULTS: EmailEngineContext = {
  offer: "l’offre",
  target: "les prospects concernés",
  pain: "ils hésitent à passer à l’action parce qu’ils manquent de clarté",
  promise: "avancer avec une méthode simple, progressive et rassurante",
  cta: "Passer à l’action maintenant",
  angle: "montrer qu’il est possible d’avancer sans être expert dès le départ",
  objection: "peur de ne pas obtenir de résultat concret",
  objective: "vendre une offre avec un message clair et orienté conversion",
  tone: "premium, humain, direct",
  brand: "LGD",
};

function rawText(value: unknown): string {
  return String(value ?? "")
    .replace(/\*\*/g, "")
    .replace(/\bCTA\s*:/gi, "")
    .replace(/\bCORPS\s*:/gi, "")
    .replace(/VERSION COURTE[\s\S]*?(?=VERSION LONGUE|NOTE LGD|$)/gi, "")
    .replace(/VERSION LONGUE[\s\S]*?(?=NOTE LGD|$)/gi, "")
    .replace(/\[(Passer à l’action maintenant)\]\(#\)/gi, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function clean(value: unknown, fallback: string): string {
  const text = rawText(value);
  return text || fallback;
}

function cleanBlock(value: string): string {
  return rawText(value)
    .replace(/\n\s*Bonjour \[Prénom\],\s*\n\s*Bonjour,?/gi, "\nBonjour [Prénom],")
    .replace(/\n\s*Bonjour,\s*\n\s*Bonjour,?/gi, "\nBonjour,")
    .replace(/👉 CTA\s*:\s*\n\s*👉/gi, "👉")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ensureSentence(value: string): string {
  const text = clean(value, "").trim();
  if (!text) return text;
  return /[.!?…]$/.test(text) ? text : `${text}.`;
}

function stripTrailingPunctuation(value: string): string {
  return clean(value, "").replace(/[.!?…]+$/g, "").trim();
}

function short(value: string, max = 85): string {
  const text = clean(value, "");
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function notGenericOffer(value: string): string {
  const text = clean(value, DEFAULTS.offer);
  const lower = text.toLowerCase();
  if (["formation", "offre", "produit", "service"].includes(lower)) return "la formation Code Liberté";
  return text;
}

function normalizeContext(input: Partial<EmailEngineContext>): EmailEngineContext {
  const offer = notGenericOffer(clean(input.offer, DEFAULTS.offer));
  const target = clean(input.target, DEFAULTS.target);
  const pain = clean(input.pain, clean(input.objection, DEFAULTS.pain));
  const promise = clean(input.promise, DEFAULTS.promise);
  const cta = clean(input.cta, DEFAULTS.cta);
  const angle = clean(input.angle, DEFAULTS.angle);
  const objection = clean(input.objection, pain || DEFAULTS.objection);
  const objective = clean(input.objective, DEFAULTS.objective);

  return {
    offer,
    target,
    pain,
    promise,
    cta,
    angle,
    objection,
    objective,
    tone: clean(input.tone, DEFAULTS.tone || "premium, humain, direct"),
    brand: clean(input.brand, DEFAULTS.brand || "LGD"),
  };
}

function detectCampaignType(ctx: EmailEngineContext): EmailCampaignType {
  const text = `${ctx.objective} ${ctx.angle} ${ctx.pain}`.toLowerCase();
  if (text.includes("relance")) return "relance";
  if (text.includes("lancement")) return "lancement";
  if (text.includes("nurture") || text.includes("nurturing") || text.includes("éduquer") || text.includes("eduquer")) return "nurturing";
  return "vente";
}

function ctaVariants(ctx: EmailEngineContext) {
  return {
    a: ctx.cta,
    b: "Voir comment ça fonctionne",
    c: "Accéder à la méthode",
  };
}

function dayNote() {
  return [
    "LIENS UTILES À INSÉRER AVANT ENVOI SIO :",
    "- Page de vente / paiement : https://legenerateurdigital.systeme.io/lgd",
    "- Accès plateforme LGD : https://legenerateurdigital-front.vercel.app",
    "",
    "NOTE LGD :",
    "- Copie l’objet A, B ou C dans le champ Objet de Systeme.io.",
    "- Copie le préheader dans le champ prévu si disponible.",
    "- Colle le corps complet de l’email dans Systeme.io.",
    "- Remplace [Prénom] par la variable Systeme.io si tu l’utilises.",
  ].join("\n");
}

function finalizeDay(day: EmailSequenceDay): EmailSequenceDay {
  const fallbackShort = cleanBlock([
    "Bonjour [Prénom],",
    "",
    "Le plus important n’est pas d’être prêt à 100%, mais d’avancer avec une méthode claire.",
    "",
    `👉 ${day.ctaVariants.a}`,
    "",
    "À très vite,",
    "LGD",
  ].join("\n"));

  const fallbackLong = cleanBlock([
    "Bonjour [Prénom],",
    "",
    "Vous n’avez pas besoin de tout maîtriser pour commencer. Vous avez surtout besoin d’un chemin clair, d’un premier pas simple et d’un message qui vous aide à avancer sans vous disperser.",
    "",
    `👉 ${day.ctaVariants.a}`,
    "",
    "À très vite,",
    "LGD",
  ].join("\n"));

  const shortMobile = cleanBlock(day.shortMobile);
  const longStory = cleanBlock(day.longStory);

  return {
    ...day,
    subjects: {
      a: clean(day.subjects.a, "Votre prochaine étape commence ici"),
      b: clean(day.subjects.b, "Et si tout devenait plus simple aujourd’hui ?"),
      c: clean(day.subjects.c, "Ce que vous devez comprendre avant de vous lancer"),
    },
    preheader: clean(day.preheader, "Une méthode simple pour avancer sans rester bloqué."),
    shortMobile: shortMobile.length >= 120 && !/^formation$/i.test(shortMobile) ? shortMobile : fallbackShort,
    longStory: longStory.length >= 350 && !/^formation$/i.test(longStory) ? longStory : fallbackLong,
    systemeIoNote: dayNote(),
  };
}

function buildDay1(ctx: EmailEngineContext): EmailSequenceDay {
  return finalizeDay({
    day: 1,
    type: "nurture",
    label: "EMAIL JOUR 1 — NURTURE",
    subjects: {
      a: `Vous pouvez avancer avec ${short(ctx.offer, 42)}`,
      b: "Et si tout devenait plus simple aujourd’hui ?",
      c: "Ce que personne ne vous dit avant de se lancer",
    },
    preheader: `Le premier pas pour dépasser ${stripTrailingPunctuation(ctx.objection)}.`,
    shortMobile: [
      "Bonjour [Prénom],",
      "",
      `Si vous voulez avancer avec ${ctx.offer}, le vrai sujet n’est pas de tout maîtriser dès le départ.`,
      "",
      `Le vrai sujet, c’est ce blocage : ${ensureSentence(ctx.pain)}`,
      "",
      `La bonne approche consiste à suivre une méthode claire pour ${stripTrailingPunctuation(ctx.promise)}.`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    longStory: [
      "Bonjour [Prénom],",
      "",
      `Vous avez peut-être déjà eu envie d’avancer avec ${ctx.offer}, puis une pensée vous a retenu.`,
      "",
      `Ce frein est souvent très concret : ${ensureSentence(ctx.pain)}`,
      "",
      "Et c’est exactement là que beaucoup de personnes s’arrêtent. Elles pensent qu’il faut être déjà expert, avoir tout compris, avoir les bons outils, ou attendre le moment parfait.",
      "",
      "Mais le moment parfait arrive rarement. Ce qui change tout, c’est d’avoir un cadre simple, une méthode progressive et un premier pas clair.",
      "",
      `${ctx.offer} existe pour vous aider à ${stripTrailingPunctuation(ctx.promise)}, sans rester bloqué par ${stripTrailingPunctuation(ctx.objection)}.`,
      "",
      `L’angle à retenir aujourd’hui : ${ensureSentence(ctx.angle)}`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    ctaVariants: ctaVariants(ctx),
    systemeIoNote: dayNote(),
  });
}

function buildDay2(ctx: EmailEngineContext): EmailSequenceDay {
  return finalizeDay({
    day: 2,
    type: "nurture",
    label: "EMAIL JOUR 2 — NURTURE",
    subjects: {
      a: "La peur coûte souvent plus cher que l’action",
      b: "Ce blocage peut disparaître plus vite que vous le pensez",
      c: `Avant de renoncer à ${short(ctx.offer, 42)}, lisez ceci`,
    },
    preheader: `Transformez ${stripTrailingPunctuation(ctx.objection)} en décision concrète.`,
    shortMobile: [
      "Bonjour [Prénom],",
      "",
      "Le risque n’est pas seulement d’essayer.",
      "",
      "Le vrai risque, c’est de rester au même endroit pendant encore des mois alors que vous savez déjà que quelque chose doit changer.",
      "",
      `Si ${ctx.pain}, une méthode claire peut vous aider à reprendre le contrôle.`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    longStory: [
      "Bonjour [Prénom],",
      "",
      "La peur donne souvent l’impression de nous protéger.",
      "",
      "Elle nous pousse à attendre, comparer, remettre à plus tard, chercher encore une information, regarder ce que font les autres, puis repousser la décision.",
      "",
      `Mais quand votre objectif est de ${stripTrailingPunctuation(ctx.objective)}, cette attente devient souvent le vrai problème.`,
      "",
      `Votre blocage n’est pas anormal : ${ensureSentence(ctx.pain)}`,
      "",
      "La différence se fait lorsque vous arrêtez de vouloir tout résoudre seul et que vous suivez une structure pensée pour avancer dans le bon ordre.",
      "",
      `${ctx.offer} vous aide à clarifier les étapes, éviter la dispersion et vous concentrer sur ce qui permet vraiment de progresser.`,
      "",
      `La promesse est simple : ${ensureSentence(ctx.promise)}`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    ctaVariants: ctaVariants(ctx),
    systemeIoNote: dayNote(),
  });
}

function buildDay3(ctx: EmailEngineContext): EmailSequenceDay {
  return finalizeDay({
    day: 3,
    type: "objection",
    label: "EMAIL JOUR 3 — OBJECTION",
    subjects: {
      a: "Vous n’avez pas besoin d’être prêt à 100%",
      b: "Le bon moment n’arrive pas tout seul",
      c: `L’objection qui bloque ${short(ctx.target, 42)}`,
    },
    preheader: `Répondez à ${stripTrailingPunctuation(ctx.objection)} avec une méthode claire.`,
    shortMobile: [
      "Bonjour [Prénom],",
      "",
      "Vous vous dites peut-être : “Et si je n’y arrive pas ?”",
      "",
      `C’est exactement l’objection à dépasser : ${ensureSentence(ctx.objection)}`,
      "",
      `Avec ${ctx.offer}, l’objectif n’est pas d’être parfait. L’objectif est d’avancer avec un cadre qui rend le passage à l’action plus simple.`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    longStory: [
      "Bonjour [Prénom],",
      "",
      "Il y a une idée qui bloque énormément de personnes : attendre de se sentir totalement prêt avant de commencer.",
      "",
      `Pour ${ctx.target}, cette attente prend souvent la forme suivante : ${ensureSentence(ctx.objection)}`,
      "",
      "Le problème, c’est que la confiance ne vient presque jamais avant l’action. Elle vient après les premiers pas, les premiers essais et les premiers résultats visibles.",
      "",
      `${ctx.offer} sert justement à transformer ce flou en progression concrète.`,
      "",
      `Vous ne partez pas de “je dois tout savoir”. Vous partez de : ${ensureSentence(ctx.angle)}`,
      "",
      `Et c’est ce qui permet de ${stripTrailingPunctuation(ctx.promise)}.`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    ctaVariants: ctaVariants(ctx),
    systemeIoNote: dayNote(),
  });
}

function buildDay4(ctx: EmailEngineContext): EmailSequenceDay {
  return finalizeDay({
    day: 4,
    type: "vente",
    label: "EMAIL JOUR 4 — VENTE",
    subjects: {
      a: `${short(ctx.offer, 42)} : passez du doute à l’action`,
      b: "Voilà ce qui peut changer maintenant",
      c: "La méthode pour avancer sans vous disperser",
    },
    preheader: `Découvrez comment avancer vers ${stripTrailingPunctuation(ctx.promise)}.`,
    shortMobile: [
      "Bonjour [Prénom],",
      "",
      `Si votre objectif est clair, mais que ${ctx.pain}, il vous faut plus qu’une motivation passagère.`,
      "",
      `Il vous faut un cadre. C’est exactement le rôle de ${ctx.offer}.`,
      "",
      `Vous avancez avec une direction simple : ${ensureSentence(ctx.promise)}`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    longStory: [
      "Bonjour [Prénom],",
      "",
      "Vous pouvez continuer à chercher des réponses partout, ou vous pouvez décider d’avancer avec une méthode structurée.",
      "",
      `Si ${ctx.pain}, ce n’est pas parce que vous manquez de potentiel. C’est souvent parce que vous n’avez pas encore le bon cadre pour transformer l’envie en action.`,
      "",
      `${ctx.offer} a été pensé pour vous aider à :`,
      "",
      "- clarifier ce que vous devez faire en priorité,",
      "- éviter la dispersion,",
      "- dépasser les blocages qui ralentissent le passage à l’action,",
      "- avancer vers un résultat concret.",
      "",
      `La promesse centrale : ${ensureSentence(ctx.promise)}`,
      "",
      `Et l’angle qui fait la différence : ${ensureSentence(ctx.angle)}`,
      "",
      "Ce n’est pas une invitation à attendre encore. C’est une invitation à reprendre la main maintenant.",
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    ctaVariants: ctaVariants(ctx),
    systemeIoNote: dayNote(),
  });
}

function buildDay5(ctx: EmailEngineContext): EmailSequenceDay {
  return finalizeDay({
    day: 5,
    type: "nurture",
    label: "EMAIL JOUR 5 — NURTURE",
    subjects: {
      a: "L’erreur qui bloque les bons projets",
      b: "Ce n’est pas un manque de motivation",
      c: `Pourquoi ${short(ctx.target, 42)} restent bloqués`,
    },
    preheader: "Le vrai problème n’est pas toujours celui que l’on croit.",
    shortMobile: [
      "Bonjour [Prénom],",
      "",
      "L’erreur la plus fréquente, c’est de croire qu’il faut encore plus d’informations avant d’agir.",
      "",
      `Mais si ${ctx.pain}, ce qu’il faut surtout, c’est une suite claire de décisions simples.`,
      "",
      `${ctx.offer} vous aide à avancer sans attendre que tout soit parfait.`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    longStory: [
      "Bonjour [Prénom],",
      "",
      "Beaucoup de personnes pensent qu’elles sont bloquées parce qu’elles manquent d’informations.",
      "",
      "En réalité, elles ont souvent déjà assez d’informations pour commencer. Ce qui manque, c’est un chemin clair.",
      "",
      `Quand ${ctx.pain}, le cerveau cherche une porte de sortie : attendre, comparer, repousser, demander un avis de plus.`,
      "",
      "Mais cette logique entretient le doute au lieu de le réduire.",
      "",
      `${ctx.offer} apporte une structure pour avancer dans le bon ordre, avec une promesse simple : ${ensureSentence(ctx.promise)}`,
      "",
      `C’est précisément pour ${ctx.target} qui veulent avancer sans rester prisonniers de ${stripTrailingPunctuation(ctx.objection)}.`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    ctaVariants: ctaVariants(ctx),
    systemeIoNote: dayNote(),
  });
}

function buildDay6(ctx: EmailEngineContext): EmailSequenceDay {
  return finalizeDay({
    day: 6,
    type: "relance",
    label: "EMAIL JOUR 6 — RELANCE",
    subjects: {
      a: "Êtes-vous prêt à faire le premier vrai pas ?",
      b: "Votre décision peut commencer ici",
      c: "La checklist avant de passer à l’action",
    },
    preheader: `Faites le point avant de choisir ${ctx.offer}.`,
    shortMobile: [
      "Bonjour [Prénom],",
      "",
      `Avant de remettre votre décision à plus tard, posez-vous une question simple : voulez-vous encore laisser ${stripTrailingPunctuation(ctx.objection)} décider à votre place ?`,
      "",
      `Si la réponse est non, ${ctx.offer} peut vous aider à avancer avec un cadre clair.`,
      "",
      `La prochaine étape est simple : ${ensureSentence(ctx.promise)}`,
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    longStory: [
      "Bonjour [Prénom],",
      "",
      `Vous hésitez encore à avancer avec ${ctx.offer} ?`,
      "",
      "C’est normal. Une décision importante mérite d’être clarifiée.",
      "",
      "Voici une mini-checklist pour faire le point :",
      "",
      `1. Votre objectif est-il clair ?\n   Aujourd’hui, l’objectif est : ${ensureSentence(ctx.objective)}`,
      "",
      `2. Votre blocage principal est-il identifié ?\n   Le blocage actuel : ${ensureSentence(ctx.pain)}`,
      "",
      `3. L’objection est-elle encore en train de décider pour vous ?\n   Objection repérée : ${ensureSentence(ctx.objection)}`,
      "",
      `4. Voulez-vous avancer avec une méthode qui vous aide à ${stripTrailingPunctuation(ctx.promise)} ?`,
      "",
      `Si oui, ${ctx.offer} est là pour vous donner une direction claire et un passage à l’action plus simple.`,
      "",
      "Ne laissez pas l’hésitation prendre toute la place.",
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    ctaVariants: ctaVariants(ctx),
    systemeIoNote: dayNote(),
  });
}

function buildDay7(ctx: EmailEngineContext): EmailSequenceDay {
  return finalizeDay({
    day: 7,
    type: "vente",
    label: "EMAIL JOUR 7 — VENTE",
    subjects: {
      a: "Dernier rappel : votre prochaine étape est prête",
      b: "Ne laissez pas cette décision repartir à zéro",
      c: `${short(ctx.offer, 42)} : le moment de passer à l’action`,
    },
    preheader: `Dernière invitation pour avancer vers ${stripTrailingPunctuation(ctx.promise)}.`,
    shortMobile: [
      "Bonjour [Prénom],",
      "",
      `Dernier rappel pour ${ctx.offer}.`,
      "",
      `Si vous voulez vraiment ${stripTrailingPunctuation(ctx.promise)}, le plus important est de ne pas repartir dans l’attente.`,
      "",
      `Votre prochaine étape : ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    longStory: [
      "Bonjour [Prénom],",
      "",
      "Si vous avez suivi cette séquence, vous avez maintenant une vision plus claire de ce qui se joue.",
      "",
      `Votre objectif : ${ensureSentence(ctx.objective)}`,
      "",
      `Votre blocage : ${ensureSentence(ctx.pain)}`,
      "",
      `Votre objection principale : ${ensureSentence(ctx.objection)}`,
      "",
      "Et votre prochaine étape ne devrait pas être de chercher encore plus d’informations. Elle devrait être de prendre une décision simple.",
      "",
      `${ctx.offer} vous aide à avancer avec une méthode structurée, pour ${stripTrailingPunctuation(ctx.promise)}.`,
      "",
      "Vous pouvez laisser les mêmes doutes revenir demain, ou choisir de créer un premier mouvement aujourd’hui.",
      "",
      `👉 ${ctx.cta}`,
      "",
      "À très vite,",
      ctx.brand || "LGD",
    ].join("\n"),
    ctaVariants: ctaVariants(ctx),
    systemeIoNote: dayNote(),
  });
}

function formatDay(day: EmailSequenceDay): string {
  const cleaned = finalizeDay(day);
  const body = cleanBlock(cleaned.longStory);

  return cleanBlock([
    "==================================================",
    cleaned.label,
    "==================================================",
    "",
    "🧪 OBJETS À TESTER DANS SYSTEME.IO",
    "",
    `A → ${cleaned.subjects.a}`,
    `B → ${cleaned.subjects.b}`,
    `C → ${cleaned.subjects.c}`,
    "",
    "--------------------------------------------------",
    "PRÉHEADER :",
    cleaned.preheader,
    "",
    "--------------------------------------------------",
    "CORPS DE L’EMAIL",
    "--------------------------------------------------",
    "",
    body,
    "",
    "👉 CTA À TESTER :",
    "",
    `A → ${cleaned.ctaVariants.a}`,
    `B → ${cleaned.ctaVariants.b}`,
    `C → ${cleaned.ctaVariants.c}`,
    "",
    "--------------------------------------------------",
    cleaned.systemeIoNote,
  ].join("\n"));
}

export function buildEmailSequencePro(input: Partial<EmailEngineContext>): EmailSequencePro {
  const ctx = normalizeContext(input);
  const days = [
    buildDay1(ctx),
    buildDay2(ctx),
    buildDay3(ctx),
    buildDay4(ctx),
    buildDay5(ctx),
    buildDay6(ctx),
    buildDay7(ctx),
  ].map(finalizeDay);

  return {
    campaignName: `CMO Dispatch - ${ctx.offer}`,
    campaignType: detectCampaignType(ctx),
    offer: ctx.offer,
    target: ctx.target,
    promise: ctx.promise,
    cta: ctx.cta,
    days,
    plainTextExport: days.map(formatDay).join("\n\n\n"),
  };
}
