import type { CMOStrategy } from "../types";

function clean(value: string, fallback = "") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function extractOffer(objective: string) {
  const text = clean(objective);
  const patterns = [
    /vendre\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
    /promouvoir\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
    /lancer\s+(?:ma|mon|mes|la|le|les|un|une|des)\s+([^,.!?]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return text || "ton offre";
}

export function buildStrategy(objectiveInput: string, blockerInput: string): CMOStrategy {
  const objective = clean(objectiveInput, "Créer une action marketing utile aujourd’hui.");
  const blocker = clean(blockerInput, "Le message doit être clarifié avant de produire le contenu.");
  const combined = `${objective} ${blocker}`.toLowerCase();
  const offer = extractOffer(objective);
  const wantsSoftSelling =
    combined.includes("pas agressif") ||
    combined.includes("sans être agressif") ||
    combined.includes("douce") ||
    combined.includes("soft") ||
    combined.includes("naturel");

  if (wantsSoftSelling) {
    return {
      target: `Prospects intéressés par ${offer}, mais sensibles aux messages trop commerciaux`,
      pain: "Ils ont besoin d’être rassurés avant d’acheter et rejettent la pression commerciale",
      desire: "Comprendre la valeur de l’offre et se projeter sans se sentir forcés",
      promise: `Présenter ${offer} avec une approche claire, utile et non agressive`,
      angle: "Vente douce : créer de la confiance avant de proposer l’action",
      mechanism: "Séquence pédagogique : problème → prise de conscience → preuve → invitation naturelle",
      cta: `Découvrir ${offer}`,
    };
  }

  if (combined.includes("email") || combined.includes("emailing")) {
    return {
      target: `Audience concernée par ${offer}`,
      pain: blocker,
      desire: "Comprendre rapidement pourquoi l’offre peut l’aider et passer à l’action",
      promise: `Transformer l’intérêt autour de ${offer} en action concrète`,
      angle: "Séquence email claire : bénéfice concret, objection levée, CTA simple",
      mechanism: "Emails courts orientés confiance, preuve et décision",
      cta: `Découvrir ${offer}`,
    };
  }

  return {
    target: `Audience concernée par ${offer}`,
    pain: blocker,
    desire: "Obtenir une solution claire et facile à comprendre",
    promise: `Transformer ${offer} en action marketing concrète`,
    angle: "Clarifier le problème, rendre l’offre évidente, puis guider vers l’action",
    mechanism: "Message simple : situation actuelle → coût du blocage → solution → prochaine étape",
    cta: `Découvrir ${offer}`,
  };
}
