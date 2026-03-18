"use client";

import type { SlideV5 } from "../typesV5";
import { useSaveCarrousel } from "./useSaveCarrousel";

export function useSaveToLibrary() {
  const { saveCarrousel } = useSaveCarrousel();

  const save = async (payload: {
    carrousel: { id: number; title?: string; description?: string };
    slides: SlideV5[];
  }) => {
    return saveCarrousel({
      carrousel: payload.carrousel,
      slides: payload.slides,
    });
  };

  return { save };
}
