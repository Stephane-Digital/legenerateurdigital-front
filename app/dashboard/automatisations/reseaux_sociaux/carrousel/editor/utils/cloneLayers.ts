import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";

/**
 * Clone profond SAFE pour layers
 * Évite toute référence partagée entre slides
 */
export function cloneLayers(layers: LayerData[]): LayerData[] {
  return layers.map((l) => ({
    ...l,
    style: l.style ? { ...l.style } : undefined,
  }));
}
