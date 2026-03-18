// ============================================================
// 🟡 TYPES LGD — Carrousel PRO (Version Finale Deluxe)
// ============================================================
//
// Ce fichier unifie 100% des types utilisés par :
// - l’éditeur (Canvas, Toolbar, LayerManager)
// - le backend (Carrousel, Slide)
// - le système de sauvegarde JSON (json_layers)
//
// ============================================================

// ------------------------------------------------------------
// 🎨 Type des éléments d’un slide
// ------------------------------------------------------------

export type LayerType = "text" | "image" | "background";

export interface Layer {
  id: string;
  type: LayerType;

  // Position
  x: number;
  y: number;

  // Dimensions
  width?: number;
  height?: number;

  // Apparence / Texte
  rotation?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  content?: string;
  opacity?: number;
  align?: string;

  // Image / Background
  imageUrl?: string;

  // Gestion du layer
  hidden?: boolean;
  locked?: boolean;
  name?: string;
}

// ------------------------------------------------------------
// 🖼 Un slide complet (côté frontend)
// ------------------------------------------------------------

export interface SlideData {
  id: string;            // Toujours string côté frontend
  elements: Layer[];     // Les layers déjà parsés et utilisables
}

// ------------------------------------------------------------
// 💾 Slide brut reçu du backend
// ------------------------------------------------------------

export interface Slide {
  id: number;
  carrousel_id: number;
  json_layers: string;    // JSON.stringify([...layers])
}

// ------------------------------------------------------------
// 📚 Carrousel entier depuis le backend
// ------------------------------------------------------------

export interface Carrousel {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  slides: Slide[];
}
