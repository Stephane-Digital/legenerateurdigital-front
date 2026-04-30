export type HumanEmailInput = {
  offer: string;
  target: string;
  pain: string;
  promise: string;
  cta: string;
};

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateHumanEmail(input: HumanEmailInput) {
  const { offer, target, pain, promise, cta } = input;

  const openers = [
    "Je vais être honnête avec toi.",
    "Je vais te dire un truc important.",
    "On va être direct.",
  ];

  const mirror = [
    `La plupart des gens dans ta situation vivent la même chose.`,
    `Ce que tu ressens est plus courant que tu ne le penses.`,
    `Beaucoup de personnes bloquent exactement à cet endroit.`,
  ];

  const tension = [
    `Ce n’est pas que ça ne fonctionne pas.`,
    `Ce n’est pas un problème de motivation.`,
    `Ce n’est pas que tu n’es pas capable.`,
  ];

  const realProblem = [
    `Le vrai problème, c’est : ${pain}`,
    `Le blocage réel, c’est : ${pain}`,
  ];

  const solution = [
    `C’est exactement ce que ${offer} permet de corriger.`,
    `${offer} est conçu pour débloquer ça.`,
  ];

  const simplicity = [
    "Pas besoin de tout refaire.",
    "Pas besoin de repartir de zéro.",
  ];

  const bullets = [
    "aller à l’essentiel",
    "suivre un plan clair",
    "laisser l’IA faire le plus dur",
  ];

  const email = `
Bonjour [Prénom],

${pick(openers)}

${pick(tension)}
${pick(realProblem)}

${pick(mirror)}

👉 ${pick(solution)}

---

💡 Cette fois, l’objectif est simple :

• ${bullets[0]}  
• ${bullets[1]}  
• ${bullets[2]}  

---

${pick(simplicity)}

👉 ${promise}

---

👉 ${cta}

---

Si tu veux, tu peux aussi répondre à cet email.
Je lis tous les messages.

À bientôt peut-être 👀

Alex
Coach LGD
`;

  return email.trim();
}
