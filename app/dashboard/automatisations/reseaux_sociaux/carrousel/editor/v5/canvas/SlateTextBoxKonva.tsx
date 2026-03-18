"use client";

import { Circle, Group, Rect } from "react-konva";
import SlateTextRenderer from "./SlateTextRenderer";

interface Props {
  id: string;
  content?: string; // JSON Slate
  x: number;
  y: number;
  width?: number;
  isSelected: boolean;
  onSelect: () => void;
  onResize: (newWidth: number) => void;
}

const MIN_WIDTH = 120;
const HANDLE_RADIUS = 8;

export default function SlateTextBoxKonva({
  content,
  x,
  y,
  width = 800,
  isSelected,
  onSelect,
  onResize,
}: Props) {
  return (
    <Group
      x={x}
      y={y}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
    >
      {/* ===== RENDU TEXTE SLATE ===== */}
      <SlateTextRenderer
        content={content}
        x={0}
        y={0}
        width={width}
      />

      {/* ===== BOUNDING BOX + HANDLE ===== */}
      {isSelected && (
        <>
          <Rect
            x={0}
            y={0}
            width={width}
            height={200} // hauteur volontairement large (texte multi-lignes)
            stroke="#ffb800"
            strokeWidth={1}
            dash={[6, 4]}
            listening={false}
          />

          {/* ===== HANDLE RESIZE (DROIT) ===== */}
          <Circle
            x={width}
            y={100}
            radius={HANDLE_RADIUS}
            fill="#ffb800"
            stroke="#000"
            strokeWidth={1}
            draggable
            onMouseDown={(e) => {
              e.cancelBubble = true;
            }}
            onDragMove={(e) => {
              const newWidth = Math.max(
                MIN_WIDTH,
                e.target.x()
              );
              onResize(newWidth);
            }}
            onDragEnd={(e) => {
              const newWidth = Math.max(
                MIN_WIDTH,
                e.target.x()
              );
              onResize(newWidth);
              e.target.x(width); // reset visuel
            }}
          />
        </>
      )}
    </Group>
  );
}
