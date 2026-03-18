"use client";

import { useCallback } from "react";

// ✅ FIX TS: NormalizedSlide import n’existe pas / plus => type local safe (build-safe)
type NormalizedSlide = Record<string, any>;

interface Props {
  slide: NormalizedSlide | null;
  updateSlide: (updated: NormalizedSlide) => void;
}

export default function useBackgroundModeA({ slide, updateSlide }: Props) {
  const setBackground = useCallback(
    (src: string | null) => {
      if (!slide) return;

      updateSlide({
        ...slide,
        background: { src, type: src ? "image" : null },
      });
    },
    [slide, updateSlide]
  );

  const importBackgroundFromFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();

      // ✅ FIX TS: pas de spread sur Uint8Array (TS “tuple/spread”)
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }

      const base64 = `data:${file.type};base64,${btoa(binary)}`;
      setBackground(base64);
    },
    [setBackground]
  );

  return { setBackground, importBackgroundFromFile };
}
