"use client";

import { useState } from "react";
import { SlideData } from "../../components/types";
import normalizeSlide from "../../utils/normalizeSlide";

export function useSaveCarrousel(carrouselId: number) {
  const [saving, setSaving] = useState(false);

  const save = async (slides: SlideData[]) => {
    setSaving(true);

    try {
      const payload = slides.map((slide) => {
        const safe = normalizeSlide(slide) as any;

        return {
          id: safe.id,
          // ✅ FIX TS: normalizeSlide ne garantit pas title -> on lit depuis slide
          title: (slide as any)?.title || "",
          json_layers: JSON.stringify(safe.elements || []),
        };
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/carrousel/${carrouselId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: payload }),
        }
      );

      if (!res.ok) throw new Error("Erreur de sauvegarde");

      return true;
    } catch (err) {
      console.error("SAVE ERROR:", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving };
}
