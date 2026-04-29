export type CMOStrategy = {
  target: string;
  pain: string;
  desire: string;
  promise: string;
  angle: string;
  mechanism: string;
  cta: string;
};

export function buildStrategy(objective: string, blocker: string): CMOStrategy {
  const text = `${objective} ${blocker}`.toLowerCase();

  // 🔥 Analyse simple mais efficace (évolutive)
  let target = "Entrepreneur / créateur de business";
  let pain = "Manque de résultats";
  let desire = "Générer des ventes";
  let promise = "Obtenir des résultats concrets rapidement";
  let angle = "Tu peux réussir même si tu débutes";
  let mechanism = "Méthode simple et guidée";
  let cta = "Passer à l’action maintenant";

  // 🎯 Cas Emailing débutant
  if (text.includes("email") || text.includes("emailing")) {
    target = "Débutant en emailing";
    pain = "Ne sait pas écrire des emails qui vendent";
    desire = "Faire ses premières ventes";
    promise = "Vendre même sans être copywriter";
    angle = "Tu peux vendre même si tu es nul aujourd’hui";
    mechanism = "Framework simple + exemples concrets";
    cta = "Découvrir la méthode";
  }

  return {
    target,
    pain,
    desire,
    promise,
    angle,
    mechanism,
    cta,
  };
}
