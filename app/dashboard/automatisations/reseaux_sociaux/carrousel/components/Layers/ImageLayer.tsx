"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { LayerData } from "../types";

// Import dynamique du composant Image de React-Konva
const KonvaImage = dynamic(() => import("react-konva").then((mod) => mod.Image), {
  ssr: false,
});

export default function ImageLayer(
  props: LayerData & {
    updateLayer: (id: string, updates: Partial<LayerData>) => void;
    deleteLayer?: (id: string) => void;
    locked?: boolean; // SAFE optionnel
  }
) {
  const { id, url, x, y, width, height, rotation, opacity, updateLayer } = props;

  // ✅ champs runtime optionnels (ne cassent pas LayerData)
  const anyProps = props as any;
  const locked = !!anyProps.locked;
  const visible = anyProps.visible !== false; // default true

  const scaleX = typeof anyProps.scaleX === "number" ? anyProps.scaleX : 1;
  const scaleY = typeof anyProps.scaleY === "number" ? anyProps.scaleY : 1;
  const skewX = typeof anyProps.skewX === "number" ? anyProps.skewX : 0;
  const skewY = typeof anyProps.skewY === "number" ? anyProps.skewY : 0;

  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!url) {
      setImg(null);
      return;
    }

    const imageEl = new Image();
    imageEl.crossOrigin = "anonymous";
    imageEl.src = url;

    imageEl.onload = () => {
      if (!cancelled) setImg(imageEl);
    };

    imageEl.onerror = () => {
      if (!cancelled) setImg(null);
    };

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!visible) return null;

  return (
    <KonvaImage
      image={img ?? undefined}
      x={x ?? 0}
      y={y ?? 0}
      width={width ?? 0}
      height={height ?? 0}
      rotation={rotation ?? 0}
      opacity={typeof opacity === "number" ? opacity : 1}
      scaleX={scaleX}
      scaleY={scaleY}
      skewX={skewX}
      skewY={skewY}
      draggable={!locked}
      onDragEnd={(e: any) =>
        updateLayer(id, {
          x: e.target.x(),
          y: e.target.y(),
        })
      }
    />
  );
}
