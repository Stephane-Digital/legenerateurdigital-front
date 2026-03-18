import type { LayerData } from "../types/layers";

type Format = { w: number; h: number };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function getImageLayers(layers: LayerData[]) {
  return layers.filter((l) => l.type === "image");
}

function normalizeZ(layers: LayerData[]) {
  // on garde l’ordre actuel (zIndex), sinon fallback à l’index
  return [...layers]
    .map((l, i) => ({ ...l, zIndex: l.zIndex ?? i }))
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}

/**
 * Auto layout "pro" :
 * - 1 image : cover canvas
 * - 2 images : split intelligent (portrait => vertical stack, sinon left/right)
 * - 3 images : layout "hero + stack"
 * - 4 images : grid 2x2
 * - 5+ : on ne force pas (carrousel/slide management viendra après)
 *
 * IMPORTANT : on ne touche qu’aux layers image.
 */
export function applyAutoLayoutImages(
  layers: LayerData[],
  format: Format,
  opts?: { padding?: number; gap?: number }
): LayerData[] {
  const padding = opts?.padding ?? 24;
  const gap = opts?.gap ?? 16;

  const ordered = normalizeZ(layers);

  const images = ordered.filter((l) => l.type === "image");
  const n = images.length;

  if (n === 0) return layers;
  if (n >= 5) return layers; // phase suivante: carrousel/slide

  const W = format.w;
  const H = format.h;

  const innerW = Math.max(1, W - padding * 2);
  const innerH = Math.max(1, H - padding * 2);

  const isPortrait = H / W > 1.2;
  const isLandscape = W / H > 1.2;

  // Helpers
  const setRect = (layer: LayerData, x: number, y: number, w: number, h: number) => ({
    ...layer,
    x: Math.round(clamp(x, 0, W - 1)),
    y: Math.round(clamp(y, 0, H - 1)),
    width: Math.round(clamp(w, 40, W)),
    height: Math.round(clamp(h, 40, H)),
  });

  const rects: { x: number; y: number; w: number; h: number }[] = [];

  // ====== 1 IMAGE ======
  if (n === 1) {
    rects.push({ x: padding, y: padding, w: innerW, h: innerH });
  }

  // ====== 2 IMAGES ======
  if (n === 2) {
    if (isPortrait) {
      const h1 = Math.floor((innerH - gap) / 2);
      rects.push({ x: padding, y: padding, w: innerW, h: h1 });
      rects.push({ x: padding, y: padding + h1 + gap, w: innerW, h: innerH - h1 - gap });
    } else {
      const w1 = Math.floor((innerW - gap) / 2);
      rects.push({ x: padding, y: padding, w: w1, h: innerH });
      rects.push({ x: padding + w1 + gap, y: padding, w: innerW - w1 - gap, h: innerH });
    }
  }

  // ====== 3 IMAGES ======
  if (n === 3) {
    if (isPortrait) {
      // 1 hero top, 2 split bottom
      const heroH = Math.floor(innerH * 0.55);
      const bottomH = innerH - heroH - gap;
      const w1 = Math.floor((innerW - gap) / 2);

      rects.push({ x: padding, y: padding, w: innerW, h: heroH });
      rects.push({ x: padding, y: padding + heroH + gap, w: w1, h: bottomH });
      rects.push({
        x: padding + w1 + gap,
        y: padding + heroH + gap,
        w: innerW - w1 - gap,
        h: bottomH,
      });
    } else if (isLandscape) {
      // 1 hero left, 2 stack right
      const heroW = Math.floor(innerW * 0.62);
      const rightW = innerW - heroW - gap;
      const h1 = Math.floor((innerH - gap) / 2);

      rects.push({ x: padding, y: padding, w: heroW, h: innerH });
      rects.push({ x: padding + heroW + gap, y: padding, w: rightW, h: h1 });
      rects.push({ x: padding + heroW + gap, y: padding + h1 + gap, w: rightW, h: innerH - h1 - gap });
    } else {
      // square-ish : 1 big left, 2 stack right
      const leftW = Math.floor(innerW * 0.6);
      const rightW = innerW - leftW - gap;
      const h1 = Math.floor((innerH - gap) / 2);

      rects.push({ x: padding, y: padding, w: leftW, h: innerH });
      rects.push({ x: padding + leftW + gap, y: padding, w: rightW, h: h1 });
      rects.push({ x: padding + leftW + gap, y: padding + h1 + gap, w: rightW, h: innerH - h1 - gap });
    }
  }

  // ====== 4 IMAGES ======
  if (n === 4) {
    const cellW = Math.floor((innerW - gap) / 2);
    const cellH = Math.floor((innerH - gap) / 2);

    rects.push({ x: padding, y: padding, w: cellW, h: cellH });
    rects.push({ x: padding + cellW + gap, y: padding, w: innerW - cellW - gap, h: cellH });
    rects.push({ x: padding, y: padding + cellH + gap, w: cellW, h: innerH - cellH - gap });
    rects.push({
      x: padding + cellW + gap,
      y: padding + cellH + gap,
      w: innerW - cellW - gap,
      h: innerH - cellH - gap,
    });
  }

  // Appliquer aux images dans leur ordre zIndex (bas->haut)
  const updatedImages = images.map((img, idx) => {
    const r = rects[idx];
    if (!r) return img;
    return setRect(img, r.x, r.y, r.w, r.h);
  });

  // Recomposer sans toucher aux autres layers
  const updatedById = new Map(updatedImages.map((l) => [l.id, l]));

  return layers.map((l) => updatedById.get(l.id) ?? l);
}
