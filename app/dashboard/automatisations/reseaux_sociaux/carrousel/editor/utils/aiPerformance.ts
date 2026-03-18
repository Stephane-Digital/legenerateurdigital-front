// ============================================================
// 🟡 IA PERFORMANCE — LGD PREMIUM
// ============================================================
//
// Score d'engagement basé sur :
// - Hook
// - Lisibilité
// - Contraste
// - Simplicité visuelle
// - Mise en page
//
// ============================================================

export function generatePerformanceScore(layers: any[]) {
  let score = 100;

  const texts = layers.filter((l) => l.type === "text");
  const images = layers.filter((l) => l.type === "image");

  // --------------------------
  // Hook (premier texte)
  // --------------------------
  if (texts.length > 0) {
    const hook = texts[0].content || "";
    if (hook.length < 10) {
      score -= 15;
    } else if (hook.length > 80) {
      score -= 10;
    }
  }

  // --------------------------
  // Nombre d'images
  // --------------------------
  if (images.length === 0) {
    score -= 10;
  } else if (images.length > 3) {
    score -= 10;
  }

  // --------------------------
  // Nombre total de calques
  // --------------------------
  if (layers.length > 10) {
    score -= 20;
  }

  if (layers.length < 3) {
    score -= 10;
  }

  // --------------------------
  // Lisibilité
  // --------------------------
  texts.forEach((txt) => {
    if (txt.fontSize < 38) score -= 5;
    if (txt.color === "#000000") score -= 5;
  });

  // --------------------------
  // Contraste background
  // --------------------------
  const hasBackground = layers.some((l) => l.type === "background");
  if (!hasBackground) score -= 10;

  // --------------------------
  // Score final
  // --------------------------
  const final = Math.max(0, Math.min(score, 100));
  return final;
}
