// ============================================================
// 🟡 AI TEMPLATES — LGD PREMIUM
// ============================================================
//
// Ce module applique des structures intelligentes à une série
// de slides : Top 5, Checklist, Avant/Après, etc.
//
// Le but : réorganiser les layers pour donner un rendu pro,
// cohérent et esthétique en un clic.
//
// ============================================================

// -------------------------------------------------------------
// 🔥 Helpers internes : créer calques préformatés
// -------------------------------------------------------------
function createTitleLayer(text: string) {
  return {
    id: `title-${Date.now()}`,
    type: "text",
    content: text,
    fontSize: 96,
    fontFamily: "Montserrat ExtraBold",
    color: "#ffffff",
    x: 100,
    y: 200,
  };
}

function createPointLayer(text: string, index: number) {
  return {
    id: `point-${Date.now()}-${index}`,
    type: "text",
    content: `${index + 1}. ${text}`,
    fontSize: 60,
    fontFamily: "Montserrat",
    color: "#FFD700",
    x: 120,
    y: 400 + index * 160,
  };
}

function createParagraphLayer(text: string) {
  return {
    id: `para-${Date.now()}`,
    type: "text",
    content: text,
    fontSize: 54,
    fontFamily: "Inter",
    color: "#ffffff",
    x: 120,
    y: 400,
  };
}

function createBeforeLayer(text: string) {
  return {
    id: `before-${Date.now()}`,
    type: "text",
    content: `AVANT : ${text}`,
    fontSize: 70,
    fontFamily: "Montserrat ExtraBold",
    color: "#FF5555",
    x: 100,
    y: 300,
  };
}

function createAfterLayer(text: string) {
  return {
    id: `after-${Date.now()}`,
    type: "text",
    content: `APRÈS : ${text}`,
    fontSize: 70,
    fontFamily: "Montserrat ExtraBold",
    color: "#00FF88",
    x: 100,
    y: 650,
  };
}

// -------------------------------------------------------------
// 🔥 TEMPLATES IA PRINCIPAUX
// -------------------------------------------------------------

// ===============
// 🟣 TOP 5
// ===============
function templateTop5(slides: any[]) {
  if (slides.length < 6) return slides;

  const result = [...slides];

  const points = [
    "Point clé 1",
    "Point clé 2",
    "Point clé 3",
    "Point clé 4",
    "Point clé 5",
  ];

  // Slide 1 → Titre
  result[0].json_layers = JSON.stringify([
    createTitleLayer("Top 5 des meilleures stratégies"),
  ]);

  // Slides 2 à 6 → Points
  for (let i = 1; i <= 5; i++) {
    result[i].json_layers = JSON.stringify([createPointLayer(points[i - 1], i)]);
  }

  return result;
}

// ===============
// 🟣 CHECKLIST
// ===============
function templateChecklist(slides: any[]) {
  const items = [
    "Avoir un objectif clair",
    "Structurer son message",
    "Utiliser un hook fort",
    "Maintenir un rythme visuel",
    "Terminer par un CTA",
  ];

  const result = [...slides];

  result[0].json_layers = JSON.stringify([
    createTitleLayer("Checklist essentielle"),
  ]);

  result[1].json_layers = JSON.stringify(
    items.map((text, index) => createPointLayer(text, index))
  );

  return result;
}

// ===============
// 🟣 AVANT / APRÈS
// ===============
function templateBeforeAfter(slides: any[]) {
  const result = [...slides];

  result[0].json_layers = JSON.stringify([
    createTitleLayer("Transformation"),
  ]);

  if (slides.length > 1) {
    result[1].json_layers = JSON.stringify([createBeforeLayer("Situation initiale")]);
  }

  if (slides.length > 2) {
    result[2].json_layers = JSON.stringify([createAfterLayer("Après amélioration")]);
  }

  return result;
}

// ===============
// 🟣 MINI FORMATION
// ===============
function templateMiniCourse(slides: any[]) {
  const result = [...slides];

  const sections = [
    "Introduction",
    "Concept clé",
    "Méthodologie",
    "Étude de cas",
    "Conclusion",
  ];

  sections.forEach((title, idx) => {
    if (result[idx]) {
      result[idx].json_layers = JSON.stringify([
        createTitleLayer(title),
        createParagraphLayer("Texte explicatif court."),
      ]);
    }
  });

  return result;
}

// ===============
// 🟣 ERREURS À ÉVITER
// ===============
function templateMistakes(slides: any[]) {
  const result = [...slides];

  const mistakes = [
    "Erreur 1 : ne pas structurer",
    "Erreur 2 : trop de texte",
    "Erreur 3 : mauvais contraste",
    "Erreur 4 : aucun CTA",
  ];

  result[0].json_layers = JSON.stringify([
    createTitleLayer("Les erreurs à éviter"),
  ]);

  if (result[1]) {
    result[1].json_layers = JSON.stringify(
      mistakes.map((m, idx) => createPointLayer(m, idx))
    );
  }

  return result;
}

// ============================================================
// 🟣 Fonction principale exportée
// ============================================================

export async function applyAITemplateToSlides(slides: any[], template: string) {
  switch (template) {
    case "top5":
      return templateTop5(slides);

    case "checklist":
      return templateChecklist(slides);

    case "beforeAfter":
      return templateBeforeAfter(slides);

    case "miniCourse":
      return templateMiniCourse(slides);

    case "mistakes":
      return templateMistakes(slides);

    default:
      return slides;
  }
}
