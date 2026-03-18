"use client";

import { useEffect, useRef } from "react";
import {
  Image as KonvaImage,
  Layer,
  Rect,
  Stage,
  Text,
  Transformer,
} from "react-konva";

// ✅ FIX TS: on évite d'importer des types qui n'existent plus / ont changé.
// On garde le runtime identique (elements, src/content, etc.)
type AnyElement = any;
type SlideData = { elements: AnyElement[] } & Record<string, any>;

// Loader d'image sécurisé
const useImageLoader = (src?: string | null) => {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
    };
  }, [src]);

  return imgRef.current;
};

export default function EditorCanvas({
  activeSlide,
  selectedElementId,
  selectElement,
  updateElement,
  width,
  height,
}: {
  activeSlide: SlideData;
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  updateElement: (id: string, patch: Partial<AnyElement>) => void;
  width: number;
  height: number;
}) {
  // ✅ FIX TS: refs typés large (Konva types peuvent varier)
  const transformerRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  // Mise à jour Transformer
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;

    if (!transformer || !stage) return;

    const node = selectedElementId ? stage.findOne(`#${selectedElementId}`) : null;

    if (node) {
      // ✅ FIX TS: nodes() + getLayer() peuvent être typés strict => cast any
      (transformer as any).nodes([node]);
      (transformer as any).getLayer?.()?.batchDraw?.();
    } else {
      (transformer as any).nodes([]);
    }
  }, [selectedElementId, activeSlide]);

  return (
    <Stage
      width={width}
      height={height}
      ref={stageRef}
      className="border border-yellow-600 rounded-xl shadow-xl bg-black"
      onMouseDown={(e: any) => {
        if (e.target === e.target.getStage()) selectElement(null);
      }}
    >
      <Layer>
        {/* BACKGROUND DEFAULT */}
        {!(activeSlide?.elements ?? []).some((e: any) => e?.type === "background") && (
          <Rect x={0} y={0} width={width} height={height} fill="#000" />
        )}

        {(activeSlide?.elements ?? []).map((el: any) => {
          // Image / Background
          if (el?.type === "image" || el?.type === "background") {
            const img = useImageLoader(el?.src ?? el?.url ?? null);

            return (
              <KonvaImage
                key={el.id}
                id={el.id}
                image={img || undefined}
                x={el.x}
                y={el.y}
                width={el.width}
                height={el.height}
                draggable
                opacity={typeof el.opacity === "number" ? el.opacity : 1}
                onClick={() => selectElement(el.id)}
                onDragEnd={(e: any) =>
                  updateElement(el.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
              />
            );
          }

          // Texte
          if (el?.type === "text") {
            return (
              <Text
                key={el.id}
                id={el.id}
                text={el.content ?? el.text ?? ""}
                x={el.x}
                y={el.y}
                width={el.width}
                fontSize={el.fontSize ?? el.size}
                fontFamily={el.fontFamily}
                fill={el.color ?? el.fill ?? "#fff"}
                draggable
                onClick={() => selectElement(el.id)}
                onDragEnd={(e: any) =>
                  updateElement(el.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  })
                }
              />
            );
          }

          return null;
        })}

        {/* Transformer */}
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
        />
      </Layer>
    </Stage>
  );
}
