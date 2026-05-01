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

function buildEmailBlock(item: HumanEmailSequenceItem) {
  return `==================================================

EMAIL ${item.day}

Objet : ${item.subject}

Préheader : ${item.preheader}

${item.body}`;
}

function buildHumanContext(input: HumanEmailInput) {
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
  };
}

export function generateHumanEmailSequenceItems(input: HumanEmailInput): HumanEmailSequenceItem[] {
  const { offer, offerWithArticle, target, pain, promise, cta } = buildHumanContext(input);

  return [
    {
      day: 1,
      subject: "Tu n’as pas besoin d’un outil de plus",
      preheader: "Tu as surtout besoin d’un système simple pour avancer.",
      body: `Bonjour [Prénom],

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
Ton Coach LGD`,
    },
    {
      day: 2,
      subject: "Le piège, ce n’est pas le manque de motivation",
      preheader: "C’est la dispersion qui fatigue le plus.",
      body: `Bonjour [Prénom],

Il y a un piège dans lequel beaucoup de personnes tombent.

Elles pensent que si ça n’avance pas,
c’est parce qu’elles ne sont pas assez régulières.

Pas assez disciplinées.
Pas assez organisées.
Pas assez “expertes”.

Mais souvent, ce n’est pas ça.

Le vrai problème, c’est que tout repose sur ton énergie du moment.

Quand tu es motivé, tu crées.
Quand tu es fatigué, tu repousses.
Quand tu doutes, tu recommences à chercher une nouvelle méthode.

Et petit à petit, ${offerWithArticle} devient un projet que tu portes seul,
au lieu de devenir un système qui t’aide à avancer.

C’est exactement ce qui arrive quand le blocage principal reste celui-ci :

${pain}

Tu ne manques pas forcément de volonté.

Tu manques surtout d’un chemin simple.

Un chemin qui te dit :

- quoi clarifier
- quoi créer
- quoi publier
- quoi envoyer
- quoi proposer ensuite

Parce qu’un business en ligne ne se construit pas avec des actions isolées.

Il se construit avec une suite logique.

Une idée devient un message.
Un message devient un contenu.
Un contenu attire une personne.
Cette personne comprend mieux ton offre.
Puis elle peut passer à l’action.

C’est cette continuité qui change tout.

Et c’est exactement ce que ${offer} doit t’aider à remettre en place.

Pas en ajoutant de la complexité.

Mais en remettant de l’ordre dans ce que tu fais déjà.

👉 ${cta}

Tu n’as pas besoin de tout révolutionner aujourd’hui.

Tu peux simplement commencer par remettre une direction claire.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD`,
    },
    {
      day: 3,
      subject: "Pourquoi ChatGPT + Canva ne suffisent pas toujours",
      preheader: "Les outils aident. Mais ils ne remplacent pas une stratégie.",
      body: `Bonjour [Prénom],

ChatGPT peut t’aider à écrire.

Canva peut t’aider à créer un visuel.

Systeme.io peut t’aider à mettre une page ou un tunnel en ligne.

Mais aucun de ces outils ne décide à ta place :

- quel message tu dois porter
- quelle promesse tu dois clarifier
- quelle objection tu dois traiter
- quelle action tu dois prioriser
- comment relier ton contenu à ton offre

C’est pour ça que beaucoup de personnes utilisent de très bons outils…
sans obtenir un vrai système.

Elles créent un post ici.
Un email là.
Une page quand elles ont le temps.

Mais tout reste séparé.

Et quand tout est séparé,
rien ne pousse vraiment dans la même direction.

Le sujet n’est donc pas de savoir si les outils gratuits sont utiles.

Ils le sont.

Le sujet, c’est de savoir si tu peux construire une vraie progression avec eux,
sans perdre du temps, sans t’éparpiller,
et sans repartir de zéro à chaque contenu.

Dans ton cas, le frein est clair :

${pain}

Et c’est précisément là que ${offerWithArticle} peut faire la différence.

Parce que l’objectif n’est pas de créer “plus”.

L’objectif est de créer plus juste.

Un message plus clair.
Une suite plus cohérente.
Une action plus simple à exécuter.

Pour ${target}, la vraie avancée n’est pas seulement de publier régulièrement.

C’est de construire une logique qui aide à ${promise}.

👉 ${cta}

Si tu veux avancer plus proprement,
commence par arrêter de demander à chaque outil de faire toute la stratégie.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD`,
    },
    {
      day: 4,
      subject: "Ce qui manque souvent entre l’idée et la vente",
      preheader: "Ce n’est pas l’envie. C’est le lien entre les étapes.",
      body: `Bonjour [Prénom],

Une idée seule ne vend pas.

Même une bonne idée.

Même une idée utile.

Pour qu’une idée commence à produire un résultat,
elle doit être transformée.

D’abord en message clair.

Puis en contenu compréhensible.

Puis en ressource ou en offre.

Puis en action simple pour la personne en face.

C’est là que beaucoup bloquent.

Ils ont l’idée.
Ils ont parfois l’offre.
Ils ont même les outils.

Mais il manque le lien entre chaque étape.

Et sans ce lien,
tout donne l’impression d’être urgent :

“Il faut que je publie.”
“Il faut que je fasse une page.”
“Il faut que j’écrive un email.”
“Il faut que je relance.”
“Il faut que je refasse mon offre.”

Résultat : tu avances, mais dans tous les sens.

C’est épuisant.

Et surtout, ça rend ton marketing moins lisible.

${offer} doit justement t’aider à remettre une structure simple dans tout ça.

Pas pour devenir parfait.

Mais pour que chaque action serve la suivante.

Ton contenu ne doit pas juste exister.

Il doit préparer la suite.

Ton email ne doit pas juste informer.

Il doit rapprocher la personne d’une décision.

Ta page ne doit pas juste être jolie.

Elle doit rendre ton offre plus évidente.

Et tout ça commence par une chose :

clarifier le système avant d’empiler les actions.

👉 ${cta}

Tu peux continuer à bricoler chaque élément séparément.

Ou tu peux commencer à construire une suite plus logique.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD`,
    },
    {
      day: 5,
      subject: "Tu n’as pas besoin d’être partout",
      preheader: "Tu as besoin d’une direction plus simple.",
      body: `Bonjour [Prénom],

Tu n’as pas besoin d’être partout.

Tu n’as pas besoin de publier sur tous les réseaux.
Tu n’as pas besoin de créer dix formats.
Tu n’as pas besoin de refaire toute ta stratégie toutes les semaines.

Ce dont tu as besoin,
c’est d’un système que tu peux réellement suivre.

Un système assez simple pour être utilisé même quand tu n’as pas deux heures devant toi.

Un système assez clair pour ne pas dépendre uniquement de ta motivation.

Un système assez humain pour que ton message ne ressemble pas à un texte générique.

Parce que c’est ça, le danger aujourd’hui.

À force de vouloir utiliser l’IA pour aller plus vite,
beaucoup finissent avec des contenus propres…
mais froids.

Des emails corrects…
mais oubliables.

Des posts bien structurés…
mais sans vraie intention.

Ce n’est pas ce que tu veux.

Tu veux quelque chose qui garde ton côté humain,
tout en te donnant une vraie méthode.

Et c’est exactement l’objectif de ${offerWithArticle} :

t’aider à transformer tes idées en actions plus claires,
sans perdre ce qui rend ton message vivant.

Pour ${target}, la promesse n’est pas de faire “plus de marketing”.

La promesse, c’est de mieux relier ton message, ton contenu et ton offre pour ${promise}.

👉 ${cta}

Tu peux avancer sans t’éparpiller.

Et tu peux le faire sans devenir quelqu’un d’autre.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD`,
    },
    {
      day: 6,
      subject: "Le vrai coût de la dispersion",
      preheader: "Ce n’est pas seulement du temps perdu.",
      body: `Bonjour [Prénom],

La dispersion coûte plus cher qu’on ne le pense.

Elle ne coûte pas seulement du temps.

Elle coûte de la clarté.
Elle coûte de l’énergie.
Elle coûte de la confiance.

Parce qu’à force de passer d’une idée à l’autre,
tu finis par douter de ton projet.

Tu te demandes si ton offre est assez bonne.
Si ton message est assez clair.
Si ton contenu intéresse vraiment quelqu’un.
Si tu devrais tout changer.

Alors que parfois,
le problème n’est pas l’offre.

Le problème, c’est qu’elle n’est pas portée par un système assez lisible.

Une personne doit comprendre rapidement :

- ce que tu proposes
- pourquoi c’est utile maintenant
- ce que ça change concrètement
- pourquoi elle devrait passer à l’action

Si tout ça est dispersé entre plusieurs outils,
plusieurs brouillons,
plusieurs idées non reliées,
la vente devient beaucoup plus difficile.

Pas parce que ton projet n’a pas de valeur.

Mais parce que cette valeur n’est pas assez structurée.

C’est là que ${offer} prend tout son sens.

L’idée n’est pas de te rajouter une charge mentale.

L’idée est de réduire le flou.

De t’aider à reprendre une direction.
De transformer tes idées en contenus utiles.
Et de relier ces contenus à une vraie action.

👉 ${cta}

Si tu sens que tu avances beaucoup sans construire assez,
c’est peut-être le bon moment pour remettre de la structure.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD`,
    },
    {
      day: 7,
      subject: "Dernier message : ne laisse pas ton projet rester flou",
      preheader: "Tu peux garder tes idées dispersées, ou leur donner un vrai cadre.",
      body: `Bonjour [Prénom],

Dernier message de cette séquence.

Et je veux rester simple.

Si ton projet compte vraiment pour toi,
ne le laisse pas dépendre uniquement de ton énergie du moment.

Ne le laisse pas coincé entre des idées,
des outils,
des brouillons,
des contenus commencés,
des pages jamais terminées,
et des actions remises à plus tard.

Tu peux continuer comme ça.

Ou tu peux décider de remettre un cadre.

Pas un cadre rigide.

Un cadre utile.

Quelque chose qui t’aide à savoir quoi faire ensuite.
Quelque chose qui transforme ton idée en message.
Ton message en contenu.
Ton contenu en prospect.
Ton prospect en opportunité de vente.

C’est exactement la logique derrière ${offerWithArticle}.

T’aider à arrêter de repartir de zéro.
T’aider à construire plus clairement.
T’aider à avancer avec une méthode qui garde ton côté humain.

Parce que le vrai sujet n’est pas de publier plus.

Le vrai sujet, c’est de construire un système simple pour ${promise}.

Et si le blocage actuel est encore celui-ci :

${pain}

Alors ce n’est pas un signe que tu dois abandonner.

C’est un signe que tu dois arrêter d’avancer seul, sans structure.

👉 ${cta}

Tu n’as pas besoin d’attendre le bon moment.

Tu as juste besoin d’un prochain pas clair.

À bientôt peut-être 👀

Alex IA 🤖
Ton Coach LGD`,
    },
  ];
}

export function generateHumanEmailSequence(input: HumanEmailInput) {
  return generateHumanEmailSequenceItems(input).map(buildEmailBlock).join("\n");
}

export function generateHumanEmail(input: HumanEmailInput) {
  const firstEmail = generateHumanEmailSequenceItems(input)[0];
  return firstEmail.body.includes("Objet :")
    ? firstEmail.body
    : `Objet : ${firstEmail.subject}

Préheader : ${firstEmail.preheader}

${firstEmail.body}`;
}
