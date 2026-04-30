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
  const target = cleanText(input.target, "les entrepreneurs qui veulent avancer plus simplement");
  const pain = cleanText(input.pain, "tu as des idées, mais tu perds du temps à tout assembler entre plusieurs outils");
  const promise = cleanText(input.promise, "tu peux avancer avec un plan plus clair, plus simple, et une vraie méthode pour passer à l’action");
  const cta = cleanText(input.cta, "Passer à l’action maintenant");

  return cleanText(`
Bonjour [Prénom],

Je vais être honnête avec toi.

La plupart des personnes qui restent bloquées ne manquent pas d’idées.

Elles manquent surtout d’un système simple pour les transformer en actions concrètes.

Et souvent, le vrai problème ressemble à ça :

${pain}

Ce n’est pas un manque de motivation.
Ce n’est pas non plus parce que tu n’es pas capable.

C’est juste que quand tout est dispersé entre trop d’outils, trop d’idées et trop de choses à faire, on finit par repousser.

👉 C’est exactement ce que ${offer} est conçu pour corriger.

🎁 Ce que tu peux faire maintenant

Si tu veux repartir simplement, tu peux reprendre le fil ici :

👉 ${cta}

💡 Ce qui change vraiment

Cette fois, l’objectif est simple :

• aller à l’essentiel
• suivre un plan clair
• transformer une idée en vraie action marketing
• laisser l’IA t’aider sans te noyer sous des réponses génériques

${offer} n’est pas là pour te compliquer la vie.

Il est là pour t’aider à avancer plus vite, avec plus de clarté, même si tout n’est pas encore parfait.

Pour ${target}, le plus important n’est pas de tout maîtriser.

Le plus important, c’est de reprendre une direction claire.

Et c’est exactement la promesse :

${promise}

Si tu veux, tu peux aussi répondre à cet email.
Je lis tous les messages.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD
`);
}
