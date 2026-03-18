import type { LayerData } from "../v5/types/layers";

export async function rehydrateLayers(
  layers: LayerData[]
): Promise<LayerData[]> {
  const hydrated: LayerData[] = [];

  for (const layer of layers) {
    if (layer.type === "image" && layer.src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = layer.src;

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // SAFE
      });

      hydrated.push({
        ...layer,
        image: img,
      });
    } else {
      hydrated.push(layer);
    }
  }

  return hydrated;
}
