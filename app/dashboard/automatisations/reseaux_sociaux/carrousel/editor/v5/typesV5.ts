// ======================================================
// CARROUSEL V5 — TYPES CANONIQUES (PHASE 1A)
// ======================================================

/**
 * ⚠️ RÈGLES
 * - Tout ce qui est PERSISTÉ doit être sérialisable JSON
 * - Tout ce qui est UI-ONLY est optionnel et non sérialisé
 */

// ------------------------------------------------------
// TYPES DE BASE
// ------------------------------------------------------

export type LayerType = "text" | "image" | "shape";

export interface LayerStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  backgroundColor?: string;
  borderRadius?: number;
}

// ------------------------------------------------------
// LAYER DATA — V5
// ------------------------------------------------------

export interface LayerData {
  // === Persisté (json_layers) ===
  id: string;
  type: LayerType;

  x: number;
  y: number;

  width?: number;
  height?: number;

  rotation?: number;
  opacity?: number;
  zIndex?: number;

  locked?: boolean;
  visible?: boolean;

  style?: LayerStyle;

  // === Persisté selon type ===
  text?: string;     // type === "text"
  src?: string;      // type === "image"

  // --------------------------------------------------
  // UI ONLY (⚠️ NON SÉRIALISÉ)
  // --------------------------------------------------
  selected?: boolean;
}

// ------------------------------------------------------
// SLIDE V5
// ------------------------------------------------------

export interface SlideV5 {
  id: number;
  position: number;

  // 👉 TOUJOURS normalisé via hydrateLayers()
  layers: LayerData[];
}
