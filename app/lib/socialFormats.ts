// ============================================================
// 📐 SOCIAL FORMATS — LGD v2025 (Final Premium Version)
// ============================================================
//
// Centralise tous les formats utilisés par :
// - Le générateur IA Carrousel
// - Le Planner
// - Le Canvas Carrousel
// - Les exports PNG / JPG
//
// Mise à jour : ajout Facebook + formats réels Instagram.
//
// ============================================================

export type SocialFormat = {
  label: string;
  value: string;
  width: number;
  height: number;
  ratio: string;
};

// ============================================================
// 🎯 FORMATS PRINCIPAUX — Posts Carrés / Portraits
// ============================================================

export const SOCIAL_FORMATS: SocialFormat[] = [
  {
    label: "Instagram / Facebook — Carré (1080x1080)",
    value: "insta_square",
    width: 1080,
    height: 1080,
    ratio: "1:1",
  },
  {
    label: "Instagram — Portrait (1080x1350)",
    value: "insta_portrait",
    width: 1080,
    height: 1350,
    ratio: "4:5",
  },
  {
    label: "Instagram / TikTok — Story (1080x1920)",
    value: "story",
    width: 1080,
    height: 1920,
    ratio: "9:16",
  },
  {
    label: "TikTok — Vidéo / Fond Carrousel (1080x1920)",
    value: "tiktok",
    width: 1080,
    height: 1920,
    ratio: "9:16",
  },
  {
    label: "LinkedIn — Post (1200x1200)",
    value: "linkedin_square",
    width: 1200,
    height: 1200,
    ratio: "1:1",
  },
  {
    label: "Facebook — Post Carré (1080x1080)",
    value: "facebook_square",
    width: 1080,
    height: 1080,
    ratio: "1:1",
  },
];

// ============================================================
// 🔥 UTILITAIRE : Trouver un format
// ============================================================

export function getSocialFormat(value: string): SocialFormat {
  return SOCIAL_FORMATS.find((f) => f.value === value) || SOCIAL_FORMATS[0];
}

// ============================================================
// 🔥 UTILITAIRE : Taille adaptée pour Canvas
// ============================================================
//
// Permet d’harmoniser le rendu selon device (scaling)
// Sans toucher aux proportions originales.
//
// ============================================================

export function getCanvasDimensions(format: SocialFormat) {
  const MAX_WIDTH = 600; // taille visible dans l’éditeur LGD
  const ratio = format.height / format.width;

  return {
    width: MAX_WIDTH,
    height: Math.round(MAX_WIDTH * ratio),
  };
}
export const NETWORK_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
};
