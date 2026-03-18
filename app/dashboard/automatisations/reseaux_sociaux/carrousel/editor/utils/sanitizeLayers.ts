import type { LayerData } from "../v5/types/layers";

/**
 * 🔒 LGD SANITIZER — VERSION SÛRE
 * - Supprime uniquement les objets runtime
 * - GARANTIT la conservation de `src`
 */
export function sanitizeLayers(layers: LayerData[]): LayerData[] {
  return layers.map((layer) => {
    if (layer.type === "image") {
      return {
        ...layer,
        // 🔥 GARANTIE ABSOLUE
        src: layer.src ?? "",
        // ❌ runtime uniquement
        image: undefined,
        bitmap: undefined,
        file: undefined,
        preview: undefined,
      };
    }

    return { ...layer };
  });
}
