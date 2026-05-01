export type HumanEmailInput = {
  offer: string;
  target: string;
  pain: string;
  promise: string;
  cta: string;
};

function cleanText(value: unknown, fallback = "") {
  const text = String(value || "")
    .replace(/\*\*/g, "")
    .replace(/CTA\s*:/gi, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text || fallback;
}

export function generateHumanEmail(input: HumanEmailInput) {
  const offer = cleanText(input.offer, "Le Générateur Digital");
  const target = cleanText(input.target, "les entrepreneurs, freelances, coachs et créateurs qui veulent développer leur business en ligne");
  const pain = cleanText(input.pain, "tu as des idées, mais tu perds du temps à tout assembler entre plusieurs outils");
  const promise = cleanText(input.promise, "tu peux avancer avec un plan clair, créer du contenu utile et transformer tes idées en actions marketing concrètes");
  const cta = cleanText(input.cta, "Passer à l’action maintenant");

  return cleanText(`
Bonjour [Prénom],

Je vais être honnête avec toi.

La plupart des personnes ne bloquent pas parce qu’elles manquent d’idées.
Elles bloquent parce qu’elles n’ont pas encore trouvé une méthode simple et adaptée à leur situation.

Et souvent, le vrai problème ressemble à ça :

${pain}

🎁 Ce que je te propose

Avec ${offer}, l’objectif est simple :
• clarifier ton message
• créer du contenu plus utile
• structurer ton marketing digital
• transformer tes idées en actions concrètes
• laisser l’IA faire le plus gros du travail sans perdre ton côté humain

💡 Ce qui change vraiment

${promise}

Pour ${target}, le vrai sujet n’est pas de publier plus.

Le vrai sujet, c’est de construire un système simple qui t’aide à avancer, à capter l’attention et à convertir avec plus de clarté.

👉 ${cta}

Si tu veux, tu peux aussi répondre à cet email et me dire ce qui bloque aujourd’hui dans ton marketing.
Je lis tous les messages.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD
`);
}
