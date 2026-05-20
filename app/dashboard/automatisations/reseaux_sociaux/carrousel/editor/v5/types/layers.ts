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
    fill?: string;
    textColor?: string;
    fontWeight?: string | number;
    fontStyle?: string;
    italic?: boolean;
    underline?: boolean;
    textDecoration?: string;
    textAlign?: "left" | "center" | "right";
    lineHeight?: number;

    // Ombre texte — propriété visuelle persistée
    textShadowEnabled?: boolean;
    textShadowColor?: string;
    textShadowBlur?: number;
    textShadowOffsetX?: number;
    textShadowOffsetY?: number;
  };
}
