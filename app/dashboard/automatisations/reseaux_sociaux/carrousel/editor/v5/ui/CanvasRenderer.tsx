"use client";

import CanvasEngine from "./CanvasEngineV5";

// ✅ FIX TS minimal : SlideFormat n’est plus exporté par ../typesV5
type SlideFormat = "1080x1350" | "1080x1920" | "1080x1080";

interface Props {
  format: SlideFormat;
  layers: any[];
  setLayers: React.Dispatch<React.SetStateAction<any[]>> | ((l: any[]) => void);
  background?: string | null; // conservé pour compat, non utilisé (pas de suppression feature)
}

const sizes: Record<SlideFormat, { w: number; h: number }> = {
  "1080x1350": { w: 1080, h: 1350 },
  "1080x1920": { w: 1080, h: 1920 },
  "1080x1080": { w: 1080, h: 1080 },
};

export default function CanvasRenderer({ format, layers, setLayers }: Props) {
  const size = sizes[format] || sizes["1080x1350"];

  return (
    <CanvasEngine
      format={size}
      layers={layers}
      selectedLayerId={null}
      onSelectLayer={() => {}}
      setLayers={setLayers as any}
    />
  );
}
