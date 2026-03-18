// ============================================================
// 🟡 STYLE TRANSFER IA — LGD PREMIUM
// ============================================================
//
// Ce fichier applique des styles visuels cohérents à un ensemble
// de calques (textes, images, background).
//
// Il ne génère PAS de nouvelles images (BLOC IA BG réservé).
// Il re-stylise les calques EXISTANTS selon une direction visuelle.
//
// ============================================================

// -----------------------
// 🎨 Palette & Styles LGD
// -----------------------

const STYLES = {
  premium: {
    name: "Black & Gold Premium",
    textColor: "#FFD700",
    fontFamily: "Playfair Display",
    titleSize: 80,
    textSize: 50,
    accentColor: "#c59d00",
  },

  minimal: {
    name: "Minimal Apple",
    textColor: "#ffffff",
    fontFamily: "SF Pro Display",
    titleSize: 72,
    textSize: 42,
    accentColor: "#A0A0A0",
  },

  bold: {
    name: "Bold Marketing",
    textColor: "#FF2D55",
    fontFamily: "Montserrat ExtraBold",
    titleSize: 96,
    textSize: 52,
    accentColor: "#ffffff",
  },

  pastel: {
    name: "Pastel Coaching",
    textColor: "#805ad5",
    fontFamily: "Poppins Medium",
    titleSize: 78,
    textSize: 46,
    accentColor: "#d6bcfa",
  },

  business: {
    name: "Business Corporate",
    textColor: "#0091ff",
    fontFamily: "Inter",
    titleSize: 70,
    textSize: 40,
    accentColor: "#ffffff",
  },
};

// ============================================================
// 🟣 Fonction principale : appliquer un style
// ============================================================

export async function applyStyleTransfer(layers: any[], styleKey: string) {
  const style = STYLES[styleKey];

  if (!style) return layers;

  const updated = layers.map((layer) => {
    const newLayer = { ...layer };

    // -------------------------------------------
    // TITRE (premier texte du slide)
    // -------------------------------------------
    if (newLayer.type === "text") {
      // On cherche s’il y a un mot-clé indiquant un titre
      const isTitle =
        newLayer.content &&
        (newLayer.content.length < 30 || newLayer.content.toUpperCase() === newLayer.content);

      newLayer.fontFamily = style.fontFamily;
      newLayer.color = style.textColor;

      if (isTitle) {
        newLayer.fontSize = style.titleSize;
      } else {
        newLayer.fontSize = style.textSize;
      }

      // Légère harmonisation
      if (styleKey === "minimal") {
        newLayer.color = "#ffffff";
      }

      if (styleKey === "bold") {
        newLayer.rotation = 0; // style plus strict
      }
    }

    // -------------------------------------------
    // Images : augmenter le contraste
    // -------------------------------------------
    if (newLayer.type === "image") {
      newLayer.filter = "contrast(1.2) brightness(1.05)";
    }

    // -------------------------------------------
    // Background : ne pas toucher à l’image
    // -------------------------------------------
    if (newLayer.type === "background") {
      // possible later : color correction
    }

    return newLayer;
  });

  return updated;
}
