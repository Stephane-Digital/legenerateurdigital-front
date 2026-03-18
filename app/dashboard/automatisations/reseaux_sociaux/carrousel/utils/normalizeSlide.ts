// ============================================================
// NORMALISATION UNIQUE OFFICIELLE LGD — Compatible EditorCanvas
// ============================================================
//
// Ce fichier convertit un slide backend -> slide frontend
// Structure finale toujours :
// {
//    id: number | string,
//    elements: SlideElement[]
// }
// ============================================================

export default function normalizeSlide(raw: any) {
  if (!raw) {
    return {
      id: "0",
      elements: [],
    };
  }

  // ----------------------------------------------------------
  // Extraction des layers JSON backend
  // ----------------------------------------------------------
  let parsedLayers: any[] = [];

  try {
    if (raw.json_layers) {
      const parsed = JSON.parse(raw.json_layers);
      parsedLayers = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    parsedLayers = [];
  }

  return {
    id: raw.id?.toString() ?? "0",
    elements: parsedLayers
  };
}
