"use client";

import { Group, Text as KonvaText } from "react-konva";
import { parseSlateToChunks } from "./slateCanvasUtils";

interface Props {
  content?: string; // JSON Slate
  x: number;
  y: number;
  width?: number;
}

export default function SlateTextRenderer({
  content,
  x,
  y,
  width = 800,
}: Props) {
  const chunks = parseSlateToChunks(content);

  let offsetY = 0;

  return (
    <Group x={x} y={y}>
      {chunks.map((chunk, index) => {
        const fontStyle = [
          chunk.bold ? "bold" : "",
          chunk.italic ? "italic" : "",
        ]
          .join(" ")
          .trim();

        const lineHeight = chunk.fontSize * 1.2;

        const node = (
          <KonvaText
            key={index}
            text={chunk.text}
            fontSize={chunk.fontSize}
            fontFamily={chunk.fontFamily}
            fontStyle={fontStyle || "normal"}
            fill={chunk.color}
            width={width}
            align="center"
            y={offsetY}
            listening={false}
          />
        );

        offsetY += lineHeight;

        return node;
      })}
    </Group>
  );
}
