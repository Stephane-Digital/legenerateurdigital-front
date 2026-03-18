// ============================================================
// 🟡 IA AUDIT — LGD PREMIUM
// ============================================================
//
// Analyse OLÉ algorithmique (Orientation - Lisibilité - Esthétique)
//
// ============================================================

export function generateAIDescriptionAudit(layers: any[]) {
  let score = 100;
  let issues: string[] = [];
  let positives: string[] = [];

  // --------------------------
  // Lisibilité du texte
  // --------------------------
  const texts = layers.filter((l) => l.type === "text");

  if (texts.length === 0) {
    issues.push("Aucun texte détecté.");
    score -= 20;
  } else {
    positives.push("Texte présent.");
  }

  texts.forEach((txt) => {
    if (txt.fontSize < 40) {
      issues.push(`Le texte "${txt.content}" est trop petit.`);
      score -= 10;
    }
    if (txt.color && txt.color.toLowerCase() === "#ffffff") {
      positives.push(`Texte lisible (blanc sur fond sombre).`);
    }
  });

  // --------------------------
  // Harmonie / Composition
  // --------------------------
  if (layers.length > 8) {
    issues.push("Trop de calques : composition chargée.");
    score -= 15;
  } else if (layers.length > 4) {
    positives.push("Bonne richesse visuelle.");
  }

  // --------------------------
  // Contraste
  // --------------------------
  const hasBackground = layers.some((l) => l.type === "background");

  if (!hasBackground) {
    issues.push("Aucun background détecté → manque de profondeur.");
    score -= 10;
  } else {
    positives.push("Background présent.");
  }

  // --------------------------
  // Score final & Rapport
  // --------------------------
  const finalScore = Math.max(20, Math.min(score, 100));

  let report = `🎨 **Audit IA du slide**
Score global : **${finalScore}/100**

🔎 **Points positifs :**
${positives.map((p) => "• " + p).join("\n")}

⚠️ **Points à améliorer :**
${issues.map((p) => "• " + p).join("\n")}

`;

  if (finalScore < 60) {
    report += `
💡 **Recommandation :**
Améliore la lisibilité, réduit le nombre de calques, ajoute un background cohérent.`;
  }

  return report;
}
