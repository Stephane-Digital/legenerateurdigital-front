// app/dashboard/automatisations/reseaux_sociaux/carrousel/utils/IAStylesConfig.ts

/**
 * ============================================================
 *  🎨 LGD SIGNATURE STYLE ENGINE
 *  -> Définit tous les styles IA Premium pour les carrousels
 *  -> Utilisé par l'IA + le rendu du CarouselEditor
 *  ============================================================
 */

export type LGDTextBlock = {
  x: number;
  y: number;
  fontSize: number;
  color: string;
  width?: number;
  align?: "left" | "center" | "right";
  maxLines?: number;
  glow?: boolean;
};

export type LGDSlideStyle = {
  background: {
    color?: string;
    gradient?: [string, string];
    opacity?: number;
  };
  title: LGDTextBlock;
  text: LGDTextBlock;
  cta?: LGDTextBlock;
};

/**
 * ============================================================
 *  🎨 LGD SIGNATURE — VISUAL SYSTEM
 * ============================================================
 *
 * - Couleurs or premium + contrastes élégants
 * - Typo : Inter / Marcellus
 * - Glow subtil doré
 * - Zones cohérentes pour Konva (1080×1920)
 */

export const LGD_SIGNATURE_STYLE: LGDSlideStyle = {
  background: {
    gradient: ["#0a0a0a", "#1a1a1a"],
    opacity: 1,
  },

  title: {
    x: 90,
    y: 160,
    fontSize: 92,
    color: "#FFD86B",
    width: 900,
    align: "center",
    glow: true,
    maxLines: 3,
  },

  text: {
    x: 120,
    y: 440,
    fontSize: 48,
    color: "#f2f2f2",
    width: 840,
    align: "center",
    glow: false,
    maxLines: 6,
  },

  cta: {
    x: 200,
    y: 1580,
    fontSize: 48,
    color: "#FFD86B",
    width: 680,
    align: "center",
    glow: true,
  },
};

/**
 * ============================================================
 *  📕 THEMATICS STYLE PRESETS
 * ============================================================
 *
 * Ces presets ne modifient QUE le style visuel, pas le contenu textuel.
 * Ils peuvent être sélectionnés via AIPresetsModal.
 */

export const LGD_THEME_STYLES: Record<string, LGDSlideStyle> = {
  default: LGD_SIGNATURE_STYLE,

  business: {
    ...LGD_SIGNATURE_STYLE,
    background: {
      gradient: ["#0a0a0a", "#131313"],
    },
  },

  coaching: {
    ...LGD_SIGNATURE_STYLE,
    background: {
      gradient: ["#0c0c0c", "#202020"],
    },
    text: { ...LGD_SIGNATURE_STYLE.text, color: "#e8e8e8" },
  },

  bien_etre: {
    ...LGD_SIGNATURE_STYLE,
    background: {
      gradient: ["#0a0a0a", "#1f1a10"],
    },
    title: { ...LGD_SIGNATURE_STYLE.title, color: "#F6E7B4" },
  },

  nutrition: {
    ...LGD_SIGNATURE_STYLE,
    background: {
      gradient: ["#0a0a0a", "#1a220f"],
    },
    title: { ...LGD_SIGNATURE_STYLE.title, color: "#D3FF7B" },
  },

  marketing: {
    ...LGD_SIGNATURE_STYLE,
    background: {
      gradient: ["#111111", "#1e1e1e"],
    },
    title: { ...LGD_SIGNATURE_STYLE.title, color: "#FFD86B" },
  },
};

/**
 * ============================================================
 *  🔥 Style Builder (IA → LayerItems)
 * ============================================================
 *
 * Sert à transformer les données IA → layers Konva
 */

export function buildLGDSlideLayout(aiSlide: { title: string; texts: string[] }) {
  return {
    title: aiSlide.title,
    text: aiSlide.texts.join("\n"),
  };
}
