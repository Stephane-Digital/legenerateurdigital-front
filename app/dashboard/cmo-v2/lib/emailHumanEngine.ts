export type HumanEmailInput = {
  offer: string;
  target: string;
  pain: string;
  promise: string;
  cta: string;
};

function clean(value: unknown, fallback = "") {
  const text = String(value || "")
    .replace(/\*\*/g, "")
    .replace(/CTA\s*:/gi, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text || fallback;
}

function normalizeOffer(value: string) {
  const text = clean(value, "Le Générateur Digital");

  if (text.length > 120) {
    return "ton offre";
  }

  return text;
}

function normalizeTarget(value: string) {
  const text = clean(
    value,
    "les entrepreneurs, freelances, coachs et créateurs qui veulent développer leur business en ligne"
  );

  if (text.toLowerCase().includes("prospects concernés")) {
    return "les entrepreneurs qui veulent avancer dans leur business en ligne";
  }

  return text;
}

function normalizePain(value: string) {
  const text = clean(
    value,
    "tu t’éparpilles entre plusieurs outils sans jamais construire quelque chose de stable"
  );

  return text
    .replace(/^le blocage.*?:/i, "")
    .replace(/^blocage.*?:/i, "")
    .trim();
}

function normalizePromise(value: string) {
  const text = clean(
    value,
    "avancer avec clarté et construire un système qui transforme tes idées en actions concrètes"
  );

  return text
    .replace(/^aider.*?à avancer avec/i, "avancer avec")
    .replace(/^transformer ce besoin utilisateur en/i, "transformer cette situation en")
    .trim();
}

function normalizeCta(value: string) {
  return clean(value, "Passer à l’action maintenant");
}

function startsWithVowelSound(value: string) {
  const first = value.trim().charAt(0).toLowerCase();
  return ["a", "e", "i", "o", "u", "y", "é", "è", "ê", "à"].includes(first);
}

function withArticleOffer(offer: string) {
  if (!offer || offer === "ton offre") return "ton offre";
  if (/^(le|la|les|l’|un|une|des|ton|ta|tes|votre|vos)\s/i.test(offer)) return offer;
  return startsWithVowelSound(offer) ? `l’${offer}` : `la solution ${offer}`;
}

export function generateHumanEmail(input: HumanEmailInput) {
  const offer = normalizeOffer(input.offer);
  const offerWithArticle = withArticleOffer(offer);
  const target = normalizeTarget(input.target);
  const pain = normalizePain(input.pain);
  const promise = normalizePromise(input.promise);
  const cta = normalizeCta(input.cta);

  return `Objet : Tu n’as pas besoin d’un outil de plus

Préheader : Tu as surtout besoin d’un système simple pour avancer.

Bonjour [Prénom],

Je vais être direct avec toi.

Si aujourd’hui tu n’avances pas comme tu voudrais avec ${offerWithArticle}…
ce n’est probablement pas parce que tu manques d’idées.

Tu en as.

Ce n’est pas non plus parce que tu manques d’outils.
Tu en utilises sûrement déjà plusieurs :

ChatGPT. Canva. Systeme.io.

👉 Le problème est ailleurs.

Tu passes ton temps à jongler entre tout ça,
sans jamais vraiment construire quelque chose de stable.

Et dans ton cas, le vrai blocage ressemble plutôt à ça :

${pain}

Un jour tu écris un post.
Le lendemain tu testes un email.
Puis tu changes d’idée.

Et au final, rien ne s’enchaîne vraiment.

👉 C’est ça qui bloque.

Pas ton niveau.
Pas ton potentiel.

Juste l’absence d’un système clair.

🎁 Du coup, voilà exactement ce que je te propose

Pas un nouvel outil.

Pas une promesse floue.

Mais un cadre simple pour :

- savoir quoi faire aujourd’hui
- arrêter de repartir de zéro à chaque fois
- transformer tes idées en actions concrètes
- construire quelque chose qui tient dans le temps

💡 Ce qui change vraiment

Tu arrêtes de demander :

“Qu’est-ce que je dois faire ?”

Et tu commences à avancer sans te poser la question en permanence.

Ton contenu devient plus cohérent.
Tes actions s’enchaînent.
Et tu commences enfin à voir une direction.

Pour ${target}, ce n’est pas seulement une question de publier plus.

C’est surtout une question de construire un système plus clair pour ${promise}.

👉 ${cta}

Tu n’as pas besoin d’en faire plus.

Tu as juste besoin d’arrêter de t’éparpiller.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD`;
}
