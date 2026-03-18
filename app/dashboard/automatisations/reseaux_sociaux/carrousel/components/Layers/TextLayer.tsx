"use client";

import dynamic from "next/dynamic";
import type { LayerData } from "../types";

// Import dynamique du composant Text de React-Konva
const KonvaText = dynamic(() => import("react-konva").then((mod) => mod.Text), {
  ssr: false,
});

export default function TextLayer(
  props: LayerData & {
    updateLayer: (id: string, updates: Partial<LayerData>) => void;
  }
) {
  const { updateLayer } = props;
  const anyProps = props as any;

  const locked = !!anyProps.locked;
  const visible = anyProps.visible !== false;

  const scaleX = typeof anyProps.scaleX === "number" ? anyProps.scaleX : 1;
  const scaleY = typeof anyProps.scaleY === "number" ? anyProps.scaleY : 1;

  if (!visible) return null;

  return (
    <KonvaText
      // ✅ Props Konva uniquement (pas de spread)
      text={anyProps.value ?? ""}
      x={anyProps.x ?? 0}
      y={anyProps.y ?? 0}
      width={anyProps.width ?? undefined}
      height={anyProps.height ?? undefined}
      fontSize={anyProps.size ?? 24}
      fontFamily={anyProps.fontFamily ?? "Inter"}
      fill={anyProps.color ?? "#FFFFFF"}
      align={anyProps.align ?? "left"}
      rotation={anyProps.rotation ?? 0}
      opacity={typeof anyProps.opacity === "number" ? anyProps.opacity : 1}
      draggable={!locked}
      onDragEnd={(e: any) =>
        updateLayer(anyProps.id, {
          x: e.target.x(),
          y: e.target.y(),
        })
      }
      onTransformEnd={(e: any) => {
        const node = e.target;
        updateLayer(anyProps.id, {
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
          // ✅ LayerData n’expose pas scaleX/scaleY => on remet à 1 dans Konva
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
      scaleX={scaleX}
      scaleY={scaleY}
    />
  );
}
