export type CanvasFormat = {
  name: string;
  width: number;
  height: number;
};

export const CANVAS_FORMATS: CanvasFormat[] = [
  { name: "Instagram Carré", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "Instagram Reel", width: 1080, height: 1920 },
  { name: "LinkedIn Post", width: 1200, height: 1350 },
  { name: "Pinterest Vertical", width: 1000, height: 1500 },
  { name: "LGD Carrousel Default", width: 1080, height: 1350 },
];
