"use client";

import { useCallback, useState } from "react";

export type CanvasFormat = "square" | "portrait" | "story";

interface FormatDefinition {
  label: string;
  width: number;
  height: number;
  ratio: number;
}

/**
 * LGD — Formats officiels Carrousel v5.5
 *
 * square : Instagram post / LinkedIn post
 * portrait : IG portrait / Facebook portrait
 * story : Instagram / TikTok story (Full vertical)
 */
const FORMAT_MAP: Record<CanvasFormat, FormatDefinition> = {
  square: {
    label: "Carré (1080 × 1080)",
    width: 1080,
    height: 1080,
    ratio: 1080 / 1080,
  },
  portrait: {
    label: "Portrait (1080 × 1350)",
    width: 1080,
    height: 1350,
    ratio: 1080 / 1350,
  },
  story: {
    label: "Story / Reel (1080 × 1920)",
    width: 1080,
    height: 1920,
    ratio: 1080 / 1920,
  },
};

export default function useCanvasFormat(initial: CanvasFormat = "portrait") {
  const [format, setFormat] = useState<CanvasFormat>(initial);

  const definition = FORMAT_MAP[format];

  /**
   * Change le format global du canvas
   * Persistance gérée par CarrouselEditor si nécessaire
   */
  const changeFormat = useCallback((newFormat: CanvasFormat) => {
    setFormat(newFormat);
  }, []);

  return {
    format,
    changeFormat,
    width: definition.width,
    height: definition.height,
    ratio: definition.ratio,
    label: definition.label,
    formats: FORMAT_MAP,
  };
}
