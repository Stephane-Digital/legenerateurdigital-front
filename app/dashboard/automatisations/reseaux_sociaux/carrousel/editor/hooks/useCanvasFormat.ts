"use client";

import { useEffect } from "react";
import { SlideData } from "../types";

export default function useCanvasFormat({
  activeFormat,
  stageRef,
  slides,
  setSlides,
}: {
  activeFormat: string;
  stageRef: any;
  slides: SlideData[];
  setSlides: (s: SlideData[]) => void;
}) {
  const formats = {
    "1080x1080": { w: 1080, h: 1080 },
    "1080x1350": { w: 1080, h: 1350 },
    "1080x1920": { w: 1080, h: 1920 },
  };

  const current = formats[activeFormat];

  useEffect(() => {
    if (!stageRef.current) return;

    stageRef.current.width(current.w);
    stageRef.current.height(current.h);

    // AUTO-ADAPTATION LÉGÈRE DU LAYOUT
    const adapted = slides.map((slide) => {
      const ratio = current.h / 1350; // base = 1350 (format portrait LGD)

      return {
        ...slide,
        elements: slide.elements.map((el) => ({
          ...el,
          x: el.x * ratio,
          y: el.y * ratio,
          width: el.width * ratio,
          height: el.height * ratio,
        })),
      };
    });

    setSlides(adapted);
  }, [activeFormat]);
}
