"use client";

import type { SlideV5 } from "../typesV5";

/**
 * 🔒 HOOK CANONIQUE — SAUVEGARDE CARROUSEL V5
 * Aligné BACKEND LGD — PUT /carrousel/{id}
 * OPTION A : bulk slides
 */
export function useSaveCarrousel() {
  const saveCarrousel = async (payload: {
    carrousel: {
      id: number;
      title?: string;
      description?: string;
    };
    slides: SlideV5[];
  }) => {
    const slidesPayload = payload.slides.map((slide) => ({
      id: slide.id,
      position: slide.position,
      title: `Slide ${slide.position + 1}`,
      json_layers: slide.layers, // 🔑 SOURCE DE VÉRITÉ V5
    }));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/carrousel/${payload.carrousel.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: payload.carrousel.title,
          description: payload.carrousel.description,
          slides: slidesPayload,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Erreur sauvegarde carrousel");
    }

    return res.json();
  };

  return { saveCarrousel };
}
