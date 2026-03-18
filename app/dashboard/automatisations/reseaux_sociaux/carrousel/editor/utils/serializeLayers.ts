import type { LayerData } from "../v5/types/layers";

export function serializeLayers(layers: LayerData[]) {
  return JSON.stringify(
    layers.map((layer: any) => {
      if (layer.type === "image") {
        const { image, file, bitmap, ...safe } = layer;
        return safe;
      }
      return layer;
    })
  );
}
