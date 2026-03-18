"use client";

import { Text } from "react-konva";
import { parseSlateToChunks } from "./slateCanvasUtils";

interface Props {
  content?: string;
  x: number;
  y: number;
  width?: number;
}

export default function SlateTextRendererKonva({
  content,
  x,
  y,
  width = 800,
}: Props) {
  const chunks = parseSlateToChunks(content);

  let offsetY = 0;

  return (
    <>
      {chunks.map((chunk, index) => {
        const fontStyle = [
          chunk.bold ? "bold" : "",
          chunk.italic ? "italic" : "",
        ]
          .join(" ")
          .trim();

        const lineHeight = chunk.fontSize * 1.2;
        const yPos = offsetY;
        offsetY += lineHeight;

        return (
          <Text
            key={index}
            x={x}
            y={y + yPos}
            width={width}
            text={chunk.text}
            fontSize={chunk.fontSize}
            fontFamily={chunk.fontFamily}
            fontStyle={fontStyle || "normal"}
            fill={chunk.color}
            align="center"
            listening={false}
          />
        );
      })}
    </>
  );
}
