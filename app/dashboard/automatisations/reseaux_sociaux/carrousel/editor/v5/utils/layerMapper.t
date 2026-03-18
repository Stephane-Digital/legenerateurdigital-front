// ======================================================
// CARROUSEL V5 — LAYER MAPPER (NORMALISATION DATA)
// ======================================================

import { AnyLayer } from "../types/layers";

/**
 * Hydrate json_layers (DB) → Editor state
 * AUCUNE logique métier ici
 */
export function hydrateLayers(raw: any): AnyLayer[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((layer) => ({
    id: String(layer.id),
    type: layer.type,

    x: Number(layer.x ?? 0),
    y: Number(layer.y ?? 0),
    width: Number(layer.width ?? 100),
    height: Number(layer.height ?? 50),

    rotation: Number(layer.rotation ?? 0),
    opacity: Number(layer.opacity ?? 1),
    zIndex: Number(layer.zIndex ?? 1),

    locked: Boolean(layer.locked ?? false),
    visible: Boolean(layer.visible ?? true),

    style: {
      ...layer.style,
    },

    content: {
      ...layer.content,
    },
  }));
}

/**
 * Serialize Editor state → json_layers (DB)
 * ZÉRO mutation, ZÉRO calcul
 */
export function serializeLayers(layers: AnyLayer[]): any[] {
  return layers.map((layer) => ({
    id: layer.id,
    type: layer.type,

    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,

    rotation: layer.rotation,
    opacity: layer.opacity,
    zIndex: layer.zIndex,

    locked: layer.locked,
    visible: layer.visible,

    style: { ...layer.style },
    content: { ...layer.content },
  }));
}
