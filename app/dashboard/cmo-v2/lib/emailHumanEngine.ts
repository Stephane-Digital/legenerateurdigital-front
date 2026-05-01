export type HumanEmailInput = {
  offer: string;
  target: string;
  pain: string;
  promise: string;
  cta: string;
};

export type HumanEmailSequenceItem = {
  day: number;
  subject: string;
  preheader: string;
  body: string;
};

type HumanEmailContext = {
  offer: string;
  offerWithArticle: string;
  target: string;
  pain: string;
  promise: string;
  cta: string;
  shortPain: string;
  shortPromise: string;
};

function clean(value: unknown, fallback = "") {
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

function compact(value: string) {
  return clean(value).replace(/\s+/g, " ").trim();
}

function shortText(value: string, max = 130) {
  const text = compact(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
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
    .replace(/^probl[eè]me.*?:/i, "")
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
  if (/^(le|la|les|l’|l'|un|une|des|ton|ta|tes|votre|vos)\s/i.test(offer)) return offer;
  return startsWithVowelSound(offer) ? `l’${offer}` : `la solution ${offer}`;
}

function buildEmailBlock(item: HumanEmailSequenceItem) {
  return `==================================================\n\nEMAIL ${item.day}\n\nObjet : ${item.subject}\n\nPréheader : ${item.preheader}\n\n${item.body}`;
}

function buildHumanContext(input: HumanEmailInput): HumanEmailContext {
  const offer = normalizeOffer(input.offer);
  const offerWithArticle = withArticleOffer(offer);
  const target = normalizeTarget(input.target);
  const pain = normalizePain(input.pain);
  const promise = normalizePromise(input.promise);
  const cta = normalizeCta(input.cta);

  return {
    offer,
    offerWithArticle,
    target,
    pain,
    promise,
    cta,
    shortPain: shortText(pain, 115),
    shortPromise: shortText(promise, 120),
  };
}

function signature() {
  return `À bientôt peut-être 👀\n\nAlex IA 🤖\nTon Coach LGD`;
}

function emailOne(ctx: HumanEmailContext): HumanEmailSequenceItem {
  return {
    day: 1,
    subject: "Tu n’as pas besoin d’un outil de plus",
    preheader: "Tu as surtout besoin d’un système simple pour avancer.",
    body: `Bonjour [Prénom],

Je vais être direct avec toi.

Si aujourd’hui tu n’avances pas comme tu voudrais avec ${ctx.offerWithArticle}, ce n’est probablement pas parce que tu manques d’idées.

Tu en as.

Ce n’est pas non plus parce que tu manques d’outils.

Tu as peut-être déjà ChatGPT pour écrire, Canva pour créer, Systeme.io pour publier ou vendre.

Et pourtant, malgré tout ça, tu peux encore avoir cette impression frustrante :

“Je fais des choses, mais rien ne s’enchaîne vraiment.”

Le vrai blocage ressemble souvent à ça :

${ctx.pain}

Ce n’est pas un manque de potentiel.

C’est un manque de continuité.

Un post part dans une direction.
Un email raconte autre chose.
Une page reste à moitié terminée.
Une idée importante finit dans un brouillon.

Et à force, tu n’as plus un système.

Tu as une pile d’actions isolées.

C’est exactement ce que ${ctx.offerWithArticle} doit t’aider à remettre en ordre : partir de ce que tu veux vendre, clarifier le message, produire les bons contenus, puis créer une action simple derrière.

Pas pour faire “plus”.

Pour faire plus cohérent.

Pour ${ctx.target}, la vraie différence n’est pas de publier tous les jours ou d’écrire des emails parfaits.

La vraie différence, c’est d’avoir un chemin clair pour ${ctx.shortPromise}.

👉 ${ctx.cta}

Tu n’as pas besoin d’en faire plus aujourd’hui.

Tu as besoin d’arrêter de t’éparpiller.

${signature()}`,
  };
}

function emailTwo(ctx: HumanEmailContext): HumanEmailSequenceItem {
  return {
    day: 2,
    subject: "Le piège, ce n’est pas le manque de motivation",
    preheader: "C’est la dispersion qui fatigue le plus.",
    body: `Bonjour [Prénom],

Il y a un piège assez classique quand on veut développer un business en ligne.

On croit que le problème vient de soi.

Pas assez régulier.
Pas assez discipliné.
Pas assez rapide.
Pas assez expert.

Alors on se pousse un peu plus.

On essaie de produire davantage.
On ouvre encore un nouvel outil.
On reprend une stratégie vue ailleurs.
On recommence un tunnel, une page, une séquence, un contenu.

Mais le problème n’est pas toujours l’effort.

Souvent, le problème, c’est que tout repose sur ton énergie du moment.

Quand tu es motivé, tu crées.
Quand tu es fatigué, tu repousses.
Quand tu doutes, tu repars chercher une nouvelle méthode.

Et pendant ce temps, ${ctx.offerWithArticle} reste dépendante de ton humeur, au lieu de devenir un système sur lequel tu peux t’appuyer.

C’est là que ${ctx.shortPain} devient dangereux.

Parce que ce blocage ne fait pas seulement perdre du temps.

Il casse la confiance.

Tu finis par te demander si ton message est bon, si ton offre est claire, si les gens vont comprendre, si tu dois tout refaire.

Alors qu’il manque surtout une structure simple :

- une intention claire
- un message principal
- une suite logique de contenus
- une action à proposer
- un CTA cohérent

C’est beaucoup plus léger quand ce chemin est déjà posé.

Tu ne repars plus de zéro à chaque fois.

Tu avances dans la bonne direction, même les jours où tu n’as pas une énergie incroyable.

👉 ${ctx.cta}

Ce que tu construis mérite mieux qu’une stratégie qui dépend uniquement de ta motivation.

${signature()}`,
  };
}

function emailThree(ctx: HumanEmailContext): HumanEmailSequenceItem {
  return {
    day: 3,
    subject: "Pourquoi ChatGPT + Canva ne suffisent pas toujours",
    preheader: "Les outils aident. Mais ils ne remplacent pas une stratégie.",
    body: `Bonjour [Prénom],

ChatGPT peut t’aider à écrire.

Canva peut t’aider à créer un visuel propre.

Systeme.io peut t’aider à mettre une page ou un tunnel en ligne.

Ces outils sont utiles.

Mais aucun d’eux ne décide à ta place ce qui doit être dit maintenant.

Aucun ne sait vraiment :

- quelle objection traiter aujourd’hui
- quel angle rendre plus désirable
- quel contenu prépare la vente
- quel email doit rassurer
- quel message doit ramener de la clarté

C’est pour ça que beaucoup de personnes ont de très bons outils, mais un marketing encore flou.

Elles créent un post ici.
Un email là.
Une page quand elles ont le temps.
Une idée dès qu’elle arrive.

Mais rien ne pousse dans la même direction.

Et quand tout reste séparé, le prospect ne ressent pas une progression.

Il voit des morceaux.

Pas un chemin.

Le rôle de ${ctx.offerWithArticle}, ce n’est pas de remplacer ton intelligence ou ton intuition.

C’est de relier les pièces.

Ton idée devient un message.
Ton message devient un contenu.
Ton contenu prépare une décision.
Ta décision mène vers une action.

C’est cette continuité qui transforme un simple outil en vrai système.

Pour ${ctx.target}, l’enjeu n’est donc pas seulement de créer plus vite.

L’enjeu, c’est de créer plus juste pour ${ctx.shortPromise}.

👉 ${ctx.cta}

Les outils peuvent accélérer.

Mais c’est la structure qui rend l’accélération utile.

${signature()}`,
  };
}

function emailFour(ctx: HumanEmailContext): HumanEmailSequenceItem {
  return {
    day: 4,
    subject: "Ce qui manque souvent entre l’idée et la vente",
    preheader: "Ce n’est pas l’envie. C’est le lien entre les étapes.",
    body: `Bonjour [Prénom],

Une idée seule ne vend pas.

Même une bonne idée.

Même une idée utile.

Pour qu’elle produise un résultat, elle doit être transformée.

D’abord en message clair.
Puis en contenu compréhensible.
Puis en preuve ou en explication.
Puis en proposition.
Puis en action simple.

C’est souvent entre ces étapes que tout se bloque.

Tu peux savoir ce que tu veux vendre, mais ne pas savoir comment l’amener naturellement.

Tu peux avoir une bonne promesse, mais l’exprimer trop vite.

Tu peux avoir une page, mais aucun contenu qui prépare vraiment la personne avant qu’elle arrive dessus.

Tu peux avoir des emails, mais pas de progression émotionnelle.

Et là, tu te retrouves avec une sensation d’empilement.

Un contenu de plus.
Un email de plus.
Une page de plus.
Une action de plus.

Mais pas forcément plus de clarté.

La vraie question devient alors :

“Est-ce que chaque élément aide vraiment la personne à faire un pas de plus ?”

C’est précisément le rôle que ${ctx.offerWithArticle} doit jouer.

Remettre un fil conducteur.

Pas un tunnel agressif.

Un chemin lisible.

Un chemin où ton contenu attire, ton email explique, ta page clarifie, et ton CTA arrive au bon moment.

👉 ${ctx.cta}

Tu peux continuer à empiler des actions.

Ou commencer à construire une suite qui donne envie d’avancer.

${signature()}`,
  };
}

function emailFive(ctx: HumanEmailContext): HumanEmailSequenceItem {
  return {
    day: 5,
    subject: "Tu n’as pas besoin d’être partout",
    preheader: "Tu as besoin d’une direction plus simple.",
    body: `Bonjour [Prénom],

Tu n’as pas besoin d’être partout.

Tu n’as pas besoin de publier sur tous les réseaux.

Tu n’as pas besoin de créer dix formats différents.

Tu n’as pas besoin de réinventer ta stratégie chaque semaine.

Ce dont tu as besoin, c’est d’un système que tu peux réellement suivre.

Un système assez simple pour être utilisé même quand tu n’as pas deux heures devant toi.

Un système assez clair pour ne pas dépendre uniquement de ton inspiration.

Un système assez humain pour que ton message ne ressemble pas à un texte automatique.

Parce que c’est aussi ça, le danger aujourd’hui.

À force de vouloir gagner du temps avec l’IA, beaucoup finissent avec des contenus propres, mais froids.

Des emails corrects, mais oubliables.

Des posts bien structurés, mais sans vraie intention.

Ce n’est pas ce que tu veux.

Tu veux que ton marketing travaille pour toi, sans effacer ta voix.

Tu veux garder le fond humain, tout en ayant une méthode plus claire.

C’est exactement l’objectif de ${ctx.offerWithArticle} : t’aider à passer de “je dois créer quelque chose” à “je sais quoi créer, pourquoi, et comment l’utiliser ensuite”.

Pour ${ctx.target}, ce changement compte énormément.

Parce qu’un message vivant, cohérent et répété avec intelligence devient beaucoup plus fort qu’une série de contenus improvisés.

👉 ${ctx.cta}

Tu peux avancer sans t’éparpiller.

Et tu peux le faire sans devenir quelqu’un d’autre.

${signature()}`,
  };
}

function emailSix(ctx: HumanEmailContext): HumanEmailSequenceItem {
  return {
    day: 6,
    subject: "Le vrai coût de la dispersion",
    preheader: "Ce n’est pas seulement du temps perdu.",
    body: `Bonjour [Prénom],

La dispersion coûte plus cher qu’on ne le pense.

Elle ne coûte pas seulement du temps.

Elle coûte de la clarté.
Elle coûte de l’énergie.
Elle coûte de la confiance.

Parce qu’à force de passer d’une idée à l’autre, tu finis par douter de ton projet.

Tu te demandes si ton offre est assez bonne.

Si ton message est assez clair.

Si ton contenu intéresse vraiment quelqu’un.

Si tu devrais changer d’angle, refaire la page, réécrire les emails, attendre encore un peu.

Alors que parfois, le problème n’est pas ${ctx.offer === "ton offre" ? "l’offre" : ctx.offer}.

Le problème, c’est que sa valeur n’est pas portée par un système assez lisible.

Une personne doit comprendre rapidement :

- ce que tu proposes
- pourquoi c’est utile maintenant
- ce que ça change concrètement
- pourquoi elle peut te faire confiance
- quelle action faire ensuite

Si ces éléments sont dispersés entre plusieurs brouillons, plusieurs outils et plusieurs idées non reliées, la décision devient difficile.

Pas parce que la personne n’est pas intéressée.

Mais parce que le chemin n’est pas assez clair.

${ctx.offerWithArticle} prend tout son sens à ce moment-là.

L’idée n’est pas de rajouter une charge mentale.

L’idée est de réduire le flou.

De reprendre une direction.
De transformer tes idées en contenus utiles.
De relier ces contenus à une vraie action.

👉 ${ctx.cta}

Si tu sens que tu avances beaucoup sans construire assez, c’est peut-être le bon moment pour remettre de la structure.

${signature()}`,
  };
}

function emailSeven(ctx: HumanEmailContext): HumanEmailSequenceItem {
  return {
    day: 7,
    subject: "Dernier message : ne laisse pas ton projet rester flou",
    preheader: "Tu peux garder tes idées dispersées, ou leur donner un vrai cadre.",
    body: `Bonjour [Prénom],

Dernier message de cette séquence.

Et je veux rester simple.

Si ton projet compte vraiment pour toi, ne le laisse pas dépendre uniquement de ton énergie du moment.

Ne le laisse pas coincé entre des idées, des outils, des brouillons, des pages jamais terminées et des actions remises à plus tard.

Tu peux continuer à avancer comme ça.

Un peu au feeling.

Un peu dans l’urgence.

Un peu en espérant que le prochain contenu débloque enfin quelque chose.

Ou tu peux décider de remettre un cadre.

Pas un cadre rigide.

Un cadre utile.

Quelque chose qui t’aide à savoir quoi faire ensuite.
Quelque chose qui transforme ton idée en message.
Ton message en contenu.
Ton contenu en confiance.
La confiance en action.

C’est exactement la logique derrière ${ctx.offerWithArticle}.

T’aider à arrêter de repartir de zéro.

T’aider à construire plus clairement.

T’aider à avancer avec une méthode qui garde ton côté humain.

Parce que le vrai sujet n’est pas de publier plus.

Le vrai sujet, c’est de construire un système simple pour ${ctx.shortPromise}.

Et si le blocage actuel est encore celui-ci :

${ctx.pain}

Alors ce n’est pas un signe que tu dois abandonner.

C’est un signe que tu dois arrêter d’avancer seul, sans structure.

👉 ${ctx.cta}

Tu n’as pas besoin d’attendre le bon moment.

Tu as juste besoin d’un prochain pas clair.

${signature()}`,
  };
}

export function generateHumanEmailSequenceItems(input: HumanEmailInput): HumanEmailSequenceItem[] {
  const context = buildHumanContext(input);
  const sequence = [
    emailOne(context),
    emailTwo(context),
    emailThree(context),
    emailFour(context),
    emailFive(context),
    emailSix(context),
    emailSeven(context),
  ];

  return sequence.map((item, index) => ({
    ...item,
    day: index + 1,
    subject: clean(item.subject, `Email ${index + 1}`),
    preheader: clean(item.preheader),
    body: clean(item.body),
  }));
}

export function generateHumanEmailSequence(input: HumanEmailInput) {
  return generateHumanEmailSequenceItems(input).map(buildEmailBlock).join("\n\n");
}

export function generateHumanEmail(input: HumanEmailInput) {
  const firstEmail = generateHumanEmailSequenceItems(input)[0];
  return `Objet : ${firstEmail.subject}\n\nPréheader : ${firstEmail.preheader}\n\n${firstEmail.body}`;
}

