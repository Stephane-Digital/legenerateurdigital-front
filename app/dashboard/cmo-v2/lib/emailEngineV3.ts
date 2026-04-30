import type { CMOEmailSequenceItem } from "../types";

export type EmailEngineV3Context = {
  objective: string;
  blocker: string;
  offer: string;
  audience: string;
  promise: string;
  angle: string;
  cta: string;
};

function cleanText(value: unknown, fallback = "") {
  const text = String(value || "")
    .replace(/\*\*/g, "")
    .replace(/CTA\s*:/gi, "")
    .replace(/Cet email vise[\s\S]*$/gi, "")
    .replace(/Le message est conçu[\s\S]*$/gi, "")
    .replace(/\[Passer à l’action maintenant\]\(#\)/gi, "Passer à l’action maintenant")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text || fallback;
}

function sentence(value: unknown, fallback: string) {
  const text = cleanText(value, fallback);
  return text.length >= 3 ? text : fallback;
}

function compact(value: unknown, fallback: string, max = 120) {
  const text = sentence(value, fallback).replace(/[\n\r]+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function ensureCta(value: unknown) {
  const cta = cleanText(value, "Passer à l’action maintenant")
    .replace(/^👉\s*/g, "")
    .replace(/[.。]+$/g, "")
    .trim();

  return cta || "Passer à l’action maintenant";
}

function normalizeOffer(value: unknown) {
  const raw = cleanText(value, "votre offre");
  const cleaned = raw
    .replace(/\s+à\s+des\s+.+$/i, "")
    .replace(/\s+pour\s+des\s+.+$/i, "")
    .replace(/\s+aux\s+.+$/i, "")
    .replace(/\s+à\s+une\s+.+$/i, "")
    .trim();

  return cleaned.length >= 4 ? cleaned : raw;
}

function buildShort(params: {
  hook: string;
  benefit: string;
  cta: string;
}) {
  return cleanText(`
Bonjour [Prénom],

${params.hook}

${params.benefit}

👉 ${params.cta}

À très vite,
LGD
`);
}

function buildLong(params: {
  opener: string;
  paragraphs: string[];
  cta: string;
}) {
  const body = params.paragraphs
    .map((paragraph) => cleanText(paragraph))
    .filter(Boolean)
    .join("\n\n");

  return cleanText(`
Bonjour [Prénom],

${params.opener}

${body}

👉 ${params.cta}

À très vite,
LGD
`);
}

function buildNote() {
  return cleanText(`
NOTE LGD :
- Copie l’objet A, B ou C dans le champ “Objet” de Systeme.io.
- Copie le préheader dans le champ prévu si disponible.
- Colle uniquement la version courte OU la version longue dans le corps de l’email.
- Remplace [Prénom] par la variable Systeme.io si tu l’utilises.
`);
}

function formatEmail(email: CMOEmailSequenceItem) {
  return cleanText(`
==================================================
EMAIL JOUR ${email.day} — ${email.intent.toUpperCase()}
==================================================

🧪 OBJETS À TESTER DANS SYSTEME.IO

A → ${email.subjects.a}
B → ${email.subjects.b}
C → ${email.subjects.c}

--------------------------------------------------

PRÉHEADER :
${email.preheader}

--------------------------------------------------

VERSION COURTE — MOBILE / RAPIDE
--------------------------------------------------

${email.short}

--------------------------------------------------

VERSION LONGUE — STORYTELLING / CONVERSION
--------------------------------------------------

${email.long}

👉 CTA À TESTER :

A → ${email.ctas.a}
B → ${email.ctas.b}
C → ${email.ctas.c}

--------------------------------------------------
${buildNote()}
`);
}

function validateEmail(email: CMOEmailSequenceItem) {
  const required = [
    email.subjects.a,
    email.subjects.b,
    email.subjects.c,
    email.preheader,
    email.short,
    email.long,
    email.ctas.a,
    email.ctas.b,
    email.ctas.c,
  ];

  const invalid = required.some((value) => !value || cleanText(value).length < 8);
  const forbidden = [email.short, email.long, email.preheader, email.subjects.a].some((value) => {
    const text = cleanText(value).toLowerCase();
    return (
      text === "formation" ||
      text.includes("cet email vise") ||
      text.includes("le message est conçu") ||
      text.includes("**")
    );
  });

  if (invalid || forbidden) {
    throw new Error(`Email Engine V3 blocked invalid email day ${email.day}`);
  }
}

export function generateEmailSequenceV3(context: EmailEngineV3Context) {
  const objective = sentence(context.objective, "Clarifier l’objectif marketing");
  const blocker = sentence(context.blocker, "Le prospect hésite à passer à l’action.");
  const offer = normalizeOffer(context.offer);
  const audience = sentence(context.audience, "personnes qui veulent avancer mais manquent de clarté");
  const promise = sentence(
    context.promise,
    `avancer avec une méthode simple, claire et progressive grâce à ${offer}`
  );
  const angle = sentence(context.angle, "reprendre confiance et passer à l’action sans se sentir perdu");
  const cta = ensureCta(context.cta);

  const ctas = {
    a: cta,
    b: "Voir comment ça fonctionne",
    c: "Accéder à la méthode",
  };

  const emails: CMOEmailSequenceItem[] = [
    {
      day: 1,
      intent: "nurture",
      subjects: {
        a: `Vous pouvez avancer avec ${compact(offer, "cette méthode", 54)}`,
        b: "Et si tout devenait plus clair aujourd’hui ?",
        c: "Le premier pas est souvent le plus simple",
      },
      preheader: `Découvrez comment ${compact(promise, "avancer sans vous sentir perdu", 92)}.`,
      short: buildShort({
        hook: `Vous voulez ${compact(objective, "avancer", 110)}, mais quelque chose vous retient.`,
        benefit: `La bonne nouvelle : vous n’avez pas besoin de tout maîtriser pour commencer. ${compact(promise, "Une méthode claire peut vous aider à avancer.", 150)}`,
        cta,
      }),
      long: buildLong({
        opener: `Vous voulez avancer, mais le blocage est réel : ${blocker}`,
        paragraphs: [
          `Ce frein peut donner l’impression qu’il faut attendre le bon moment, le bon niveau ou la bonne certitude avant de se lancer. Pourtant, ce moment parfait arrive rarement.`,
          `Avec ${offer}, l’objectif est justement de transformer cette hésitation en action claire. Vous avancez étape par étape, avec une méthode pensée pour ${audience}.`,
          `La promesse est simple : ${promise}. Pas de jargon inutile, pas de pression, seulement une progression concrète pour sortir de l’immobilisme.`,
          `Aujourd’hui, le plus important n’est pas d’être parfait. Le plus important est de faire le premier pas avec le bon cadre.`,
        ],
        cta,
      }),
      ctas,
    },
    {
      day: 2,
      intent: "nurture",
      subjects: {
        a: "Le mythe qui bloque votre passage à l’action",
        b: "Vous n’avez pas besoin de tout savoir pour commencer",
        c: "Ce que beaucoup comprennent trop tard",
      },
      preheader: `Votre blocage n’est pas une fatalité : ${compact(blocker, "il peut être dépassé", 90)}.`,
      short: buildShort({
        hook: `Si vous pensez être bloqué à cause de ceci : ${compact(blocker, "un doute", 110)}, vous n’êtes pas seul.`,
        benefit: `${compact(angle, "Un angle plus simple existe", 145)}. Le but est d’avancer avec méthode, pas de tout résoudre d’un coup.`,
        cta,
      }),
      long: buildLong({
        opener: `Il y a une croyance qui freine beaucoup de personnes : penser qu’il faut être totalement prêt avant d’agir.`,
        paragraphs: [
          `Dans votre cas, le blocage est clair : ${blocker}`,
          `Mais ce blocage ne signifie pas que vous n’êtes pas capable. Il signifie surtout qu’il manque un cadre, une direction et une méthode simple pour avancer sans vous disperser.`,
          `${offer} sert précisément à créer ce cadre. Au lieu d’improviser, vous suivez une progression claire et vous transformez une envie floue en actions concrètes.`,
          `Le vrai changement commence quand vous arrêtez d’attendre d’être prêt et que vous commencez avec un plan adapté à votre situation.`,
        ],
        cta,
      }),
      ctas,
    },
    {
      day: 3,
      intent: "objection",
      subjects: {
        a: "Et si votre doute n’était pas le vrai problème ?",
        b: "La peur de se tromper peut coûter cher",
        c: "Voici comment dépasser l’hésitation",
      },
      preheader: `Transformez l’objection principale en décision plus claire.`,
      short: buildShort({
        hook: `Votre hésitation est compréhensible : ${compact(blocker, "vous avez une vraie raison de douter", 120)}.`,
        benefit: `Mais rester bloqué ne donne pas plus de sécurité. ${compact(promise, "Une méthode claire vous aide à avancer avec moins de risque.", 145)}`,
        cta,
      }),
      long: buildLong({
        opener: `Il est normal d’hésiter quand l’enjeu compte vraiment.`,
        paragraphs: [
          `Vous ne bloquez pas par manque de volonté. Vous bloquez parce que ${blocker.toLowerCase()}`,
          `C’est précisément pour cela qu’une solution structurée est plus utile qu’un conseil générique. Elle vous évite de repartir de zéro, de vous disperser ou de refaire les mêmes erreurs.`,
          `Avec ${offer}, vous ne cherchez pas une promesse magique. Vous cherchez un cadre pour avancer avec plus de lucidité, plus de confiance et une action mieux guidée.`,
          `L’inaction paraît confortable sur le moment, mais elle laisse le problème intact. Une décision claire peut au contraire créer le premier mouvement.`,
        ],
        cta,
      }),
      ctas,
    },
    {
      day: 4,
      intent: "vente",
      subjects: {
        a: `Pourquoi ${compact(offer, "cette méthode", 48)} peut tout changer`,
        b: "Le plan simple pour passer de l’envie à l’action",
        c: "Ce qui manque souvent pour obtenir un vrai résultat",
      },
      preheader: `Découvrez le mécanisme qui transforme le blocage en progression concrète.`,
      short: buildShort({
        hook: `Ce qui manque rarement, ce n’est pas l’envie. C’est le bon cadre.`,
        benefit: `${compact(offer, "Cette méthode", 70)} vous aide à transformer votre objectif en étapes simples et actionnables.`,
        cta,
      }),
      long: buildLong({
        opener: `Si vous avez déjà essayé d’avancer seul, vous savez à quel point il est facile de se perdre.`,
        paragraphs: [
          `Votre objectif est clair : ${objective}`,
          `Votre frein l’est aussi : ${blocker}`,
          `C’est exactement l’écart que ${offer} vient combler. Le but n’est pas de vous donner plus d’informations. Le but est de vous donner une méthode utilisable, claire et progressive.`,
          `Au lieu de rester dans la confusion, vous savez quoi faire, pourquoi le faire et comment passer à l’étape suivante sans vous sentir dépassé.`,
        ],
        cta,
      }),
      ctas,
    },
    {
      day: 5,
      intent: "nurture",
      subjects: {
        a: "Une décision simple peut débloquer la suite",
        b: "Le déclic que beaucoup attendent trop longtemps",
        c: "Vous êtes peut-être plus proche que vous ne pensez",
      },
      preheader: `Un message pour remettre votre objectif en mouvement.`,
      short: buildShort({
        hook: `Vous n’avez pas besoin d’avoir toutes les réponses pour faire le prochain pas.`,
        benefit: `Vous avez besoin d’un cadre clair, d’une action simple et d’une raison solide d’avancer maintenant.`,
        cta,
      }),
      long: buildLong({
        opener: `Parfois, le plus difficile n’est pas de travailler. Le plus difficile est de savoir par où commencer.`,
        paragraphs: [
          `C’est pour cela que votre blocage ne doit pas être traité comme un manque de motivation. Il doit être traité comme un problème de clarté et de méthode.`,
          `${offer} vous aide à remettre de l’ordre dans les priorités : comprendre où vous êtes, ce qui vous bloque, puis avancer avec une progression réaliste.`,
          `La transformation recherchée est simple : ${promise}`,
          `Chaque jour passé à attendre entretient le doute. Chaque action claire, même petite, construit de la confiance.`,
        ],
        cta,
      }),
      ctas,
    },
    {
      day: 6,
      intent: "relance",
      subjects: {
        a: "Avant de remettre votre décision à plus tard",
        b: "Votre prochaine étape peut rester simple",
        c: "La checklist avant de passer à l’action",
      },
      preheader: `Faites le point rapidement avant de décider.`,
      short: buildShort({
        hook: `Avant de repousser encore, posez-vous une question : que vous coûte vraiment l’inaction ?`,
        benefit: `${compact(promise, "Une méthode claire peut vous remettre en mouvement.", 145)}`,
        cta,
      }),
      long: buildLong({
        opener: `Avant de décider, voici une mini-checklist simple.`,
        paragraphs: [
          `1. Votre objectif est-il important pour vous ? ${objective}`,
          `2. Votre blocage est-il encore présent ? ${blocker}`,
          `3. Avez-vous aujourd’hui une méthode claire pour avancer sans vous disperser ?`,
          `4. Que se passera-t-il dans quelques semaines si rien ne change ?`,
          `Si ces questions résonnent, alors le bon sujet n’est pas de savoir si vous devez être parfait. Le bon sujet est de choisir un cadre pour avancer maintenant.`,
          `${offer} est là pour vous aider à franchir ce cap avec plus de clarté, plus de méthode et moins d’hésitation.`,
        ],
        cta,
      }),
      ctas,
    },
    {
      day: 7,
      intent: "vente",
      subjects: {
        a: "C’est le moment de reprendre le contrôle",
        b: "Votre objectif mérite une vraie méthode",
        c: "Dernier rappel avant de passer à autre chose",
      },
      preheader: `Une dernière invitation à transformer votre objectif en action concrète.`,
      short: buildShort({
        hook: `Si votre objectif compte vraiment, ne le laissez pas rester au stade d’idée.`,
        benefit: `${compact(offer, "Cette méthode", 70)} vous donne un cadre concret pour passer de l’hésitation à l’action.`,
        cta,
      }),
      long: buildLong({
        opener: `Si vous êtes encore là, c’est probablement que votre objectif compte vraiment.`,
        paragraphs: [
          `Vous voulez ${objective.toLowerCase()}`,
          `Mais vous savez aussi que ${blocker.toLowerCase()}`,
          `C’est exactement ce moment qui sépare l’idée de l’action. Vous pouvez continuer à attendre plus de certitude, ou vous pouvez choisir un cadre qui vous aide à avancer avec plus de simplicité.`,
          `${offer} a été pensé pour vous aider à dépasser ce point de blocage et à construire une progression claire.`,
          `La décision ne consiste pas à promettre que tout sera parfait. Elle consiste à ne plus rester seul face au même blocage.`,
        ],
        cta,
      }),
      ctas,
    },
  ];

  emails.forEach(validateEmail);

  return {
    emails,
    sequenceText: emails.map(formatEmail).join("\n\n"),
  };
}
