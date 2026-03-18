// ============================================================
// 🎨 TYPES GLOBAUX CARROUSEL — LGD 2025
// ============================================================

export type SlideElement =
  | {
      id: string;
      type: "text";
      content: string;
      x: number;
      y: number;
      fontSize?: number;
      color?: string;
      fontFamily?: string;
      opacity?: number;
      rotation?: number;
      align?: "left" | "center" | "right";
      zIndex?: number;
    }
  | {
      id: string;
      type: "image";
      src: string;
      x: number;
      y: number;
      width?: number;
      height?: number;
      opacity?: number;
      rotation?: number;
      zIndex?: number;
    }
  | {
      id: string;
      type: "background";
      imageUrl: string;
    };

export interface SlideData {
  id: string;
  elements: SlideElement[];
}

export interface IAResultSlide {
  title?: string;
  text?: string;
  elements?: SlideElement[];
}
