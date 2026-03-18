export type LayerData = {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;

  // Texte
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  align?: "left" | "center" | "right";
  fontStyle?: "normal" | "bold" | "italic";

  // Image
  url?: string;

  // Formes
  shapeType?: "rect" | "circle";
  color?: string;
};

export type SlideData = {
  id: number;
  carrousel_id: number;
  title: string;
  position: number;
  json_layers: string;
  thumbnail_url?: string;
};
