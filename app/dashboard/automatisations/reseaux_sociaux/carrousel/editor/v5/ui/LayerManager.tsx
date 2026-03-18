"use client";

import { Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";
import { LayerData } from "../typesV5";

interface Props {
  layers: LayerData[];
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<LayerData>) => void;
}

export default function LayerManager({ layers, onSelect, onUpdate }: Props) {
  return (
    <>
      {layers.map((layer) => {
        if (layer.type === "image") {
          return <ImageLayer key={layer.id} layer={layer} onSelect={onSelect} onUpdate={onUpdate} />;
        }

        if (layer.type === "text") {
          return <TextLayer key={layer.id} layer={layer} onSelect={onSelect} onUpdate={onUpdate} />;
        }

        return null;
      })}
    </>
  );
}

/* ==========================================================
   🖼️ IMAGE LAYER
   ========================================================== */

function ImageLayer({ layer, onSelect, onUpdate }: any) {
  const [img] = useImage(layer.url);

  return (
    <KonvaImage
      id={`layer-${layer.id}`}
      image={img}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      draggable
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      shadowColor={layer.selected ? "gold" : "transparent"}
      shadowBlur={layer.selected ? 25 : 0}
      onDragEnd={(e) => onUpdate(layer.id, { x: e.target.x(), y: e.target.y() })}
    />
  );
}

/* ==========================================================
   ✍️ TEXT LAYER
   ========================================================== */

function TextLayer({ layer, onSelect, onUpdate }: any) {
  return (
    <Text
      id={`layer-${layer.id}`}
      text={layer.text}
      x={layer.x}
      y={layer.y}
      fontSize={layer.fontSize}
      fill={layer.fill}
      draggable
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      shadowColor={layer.selected ? "gold" : "transparent"}
      shadowBlur={layer.selected ? 25 : 0}
      onDragEnd={(e) => onUpdate(layer.id, { x: e.target.x(), y: e.target.y() })}
    />
  );
}
