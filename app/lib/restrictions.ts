// ============================================================
// 🚫 RESTRICTIONS TECHNIQUES CARROUSEL — LGD v2025
// ============================================================
//
// Ce module définit les limites internes nécessaires pour :
// - protéger le Canvas
// - éviter les carrousels trop lourds
// - empêcher les crashes liés à Konva
// - garder une UX fluide sur toutes les machines
//
// Complémentaire de :
// - limits.ts (lié au plan utilisateur)
//
// ============================================================

// ------------------------------------------------------------
// 🎨 LIMITES D'ÉLÉMENTS PAR SLIDE
// ------------------------------------------------------------

export const MAX_TEXT_ELEMENTS = 10;        // Jusqu'à 10 blocs texte
export const MAX_IMAGE_ELEMENTS = 8;        // Dont background
export const MAX_TOTAL_ELEMENTS = 15;       // Sécurité générale

// ------------------------------------------------------------
// 🖼️ DIMENSIONS MIN/MAX AUTORISÉES
// ------------------------------------------------------------

export const MIN_ELEMENT_SIZE = 20;         // px
export const MAX_ELEMENT_SIZE = 2000;       // px (sécurité Konva)

// ------------------------------------------------------------
// 🧱 LIMITES SPÉCIALES POUR BACKGROUND
// ------------------------------------------------------------

export const ALLOW_MULTIPLE_BACKGROUNDS = false;

// ------------------------------------------------------------
// 🔢 LIMITE DU NOMBRE DE SLIDES
// ------------------------------------------------------------
//
// Cette limite technique complète celle du plan utilisateur.
//
// Le plan peut dire : "max 10 slides"
// Mais techniquement, on empêche de dépasser 25 par sécurité.
//

export const MAX_SLIDES_TECH = 25;

// ------------------------------------------------------------
// 🎯 VALIDATION GLOBALE AVANT AJOUT
// ------------------------------------------------------------

export function canAddElement(currentElements: any[]): boolean {
  return currentElements.length < MAX_TOTAL_ELEMENTS;
}

export function canAddText(currentElements: any[]): boolean {
  return (
    currentElements.filter((el) => el.type === "text").length <
    MAX_TEXT_ELEMENTS
  );
}

export function canAddImage(currentElements: any[]): boolean {
  return (
    currentElements.filter((el) => el.type === "image").length <
    MAX_IMAGE_ELEMENTS
  );
}

export function hasBackground(currentElements: any[]): boolean {
  return currentElements.some((el) => el.type === "background");
}

export function canAddBackground(currentElements: any[]): boolean {
  if (ALLOW_MULTIPLE_BACKGROUNDS) return true;
  return !hasBackground(currentElements);
}

// ------------------------------------------------------------
// 🔥 VALIDATION DES DIMENSIONS
// ------------------------------------------------------------

export function validateElementSize(width: number, height: number): boolean {
  if (width < MIN_ELEMENT_SIZE || height < MIN_ELEMENT_SIZE) return false;
  if (width > MAX_ELEMENT_SIZE || height > MAX_ELEMENT_SIZE) return false;
  return true;
}
