"use client";

import { Circle, Rect } from "react-konva";
import { LayerData } from "../types";

interface ShapeLayerProps extends LayerData {
  updateLayer: (id: string, updates: Partial<LayerData>) => void;
}

export default function ShapeLayer({
  id,
  shapeType = "rect",
  x,
  y,
  width = 200,
  height = 200,
  color = "white",
  opacity = 0.3,
  updateLayer,
}: ShapeLayerProps) {
  if (shapeType === "circle") {
    return (
      <Circle
        x={x}
        y={y}
        radius={(width + height) / 4}
        fill={color}
        opacity={opacity}
        draggable
        onDragEnd={(e) =>
          updateLayer(id, { x: e.target.x(), y: e.target.y() })
        }
      />
    );
  }

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      opacity={opacity}
      draggable
      onDragEnd={(e) =>
        updateLayer(id, { x: e.target.x(), y: e.target.y() })
      }
    />
  );
}
