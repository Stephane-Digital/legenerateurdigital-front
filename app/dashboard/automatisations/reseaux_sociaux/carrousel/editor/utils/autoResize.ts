// ============================================================
// 🟡 AUTO RESIZE DES CALQUES — LGD PREMIUM
// ============================================================
//
// Ce moteur redimensionne:
// - x, y
// - width, height
// - fontSize
// - rotation (inchangé)
// - ratio global du canvas
//
// Les proportions sont conservées, la position est ré-adaptée.
//
// ============================================================

export const NETWORK_PRESETS = {
  instagram: { width: 1080, height: 1350, ratio: 4 / 5 },
  story: { width: 1080, height: 1920, ratio: 9 / 16 },
  tiktok: { width: 1080, height: 1920, ratio: 9 / 16 },
  linkedin: { width: 1200, height: 1200, ratio: 1 },
  facebook: { width: 1200, height: 628, ratio: 1.91 },
};

// Canvas interne par défaut
export const DEFAULT_CANVAS = {
  width: 1080,
  height: 1350,
};

// ============================================================
// 🟣 Fonction principale
// ============================================================

export function autoResizeForNetwork(layers: any[], network: string) {
  const preset = NETWORK_PRESETS[network];

  if (!preset) return layers;

  const { width: newW, height: newH } = preset;
  const oldW = DEFAULT_CANVAS.width;
  const oldH = DEFAULT_CANVAS.height;

  const scaleX = newW / oldW;
  const scaleY = newH / oldH;

  const resized = layers.map((layer: any) => {
    const updated = { ...layer };

    // Resize position
    updated.x = Math.round(layer.x * scaleX);
    updated.y = Math.round(layer.y * scaleY);

    // Resize dimensions si image
    if (layer.type === "image" || layer.type === "background") {
      updated.width = Math.round((layer.width || 400) * scaleX);
      updated.height = Math.round((layer.height || 400) * scaleY);
    }

    // Resize font si texte
    if (layer.type === "text") {
      updated.fontSize = Math.round((layer.fontSize || 60) * scaleX);
    }

    // Rotation reste identique
    updated.rotation = layer.rotation || 0;

    return updated;
  });

  return resized;
}
