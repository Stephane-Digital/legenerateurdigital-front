import type { LayerData } from "../v5/types/layers";

/**
 * Ré-hydrate les images runtime (HTMLImageElement) à partir des `src` stockés.
 *
 * ⚠️ Important : on attache l'image sur une clé non-serializable ("_runtimeImage")
 * pour l'affichage rapide, puis `safeCloneLayers` / persistance la retire.
 */
export async function rehydrateRuntimeImages(
  layers: LayerData[]
): Promise<LayerData[]> {
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = src;
    });

  const hydrated = await Promise.all(
    (layers ?? []).map(async (layer) => {
      const anyLayer = layer as any;

      if (!anyLayer || anyLayer.type !== "image") return layer;

      const src =
        anyLayer.src ??
        anyLayer.url ??
        anyLayer.imageUrl ??
        anyLayer.value ??
        anyLayer.dataUrl;

      if (!src || typeof src !== "string") return layer;

      const img = await loadImage(src);
      return { ...(layer as any), _runtimeImage: img } as LayerData;
    })
  );

  return hydrated;
}
