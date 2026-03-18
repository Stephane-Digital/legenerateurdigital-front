export type LayerType = "text" | "image";

export interface LayerData {
  id: string;
  type: LayerType;

  x: number;
  y: number;
  width?: number;
  height?: number;

  text?: string;
  src?: string;

  // 🔒 RUNTIME ONLY (jamais sérialisé)
  image?: HTMLImageElement;

  visible: boolean;
  selected: boolean;

  zIndex: number;

  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: number;
    italic?: boolean;
    underline?: boolean;
  };
}
