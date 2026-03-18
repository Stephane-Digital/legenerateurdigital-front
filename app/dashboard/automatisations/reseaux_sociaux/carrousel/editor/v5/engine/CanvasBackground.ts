// ======================================================
//  LGD WOW ENGINE V5 — CanvasBackground
//  Gestion du background (image + auto-fit)
// ======================================================

import { loadImage } from "./CanvasUtils";

export default class CanvasBackground {
  url: string | null = null;
  img: HTMLImageElement | null = null;

  constructor(url?: string) {
    if (url) this.url = url;
  }

  async set(url: string) {
    this.url = url;
    this.img = await loadImage(url);
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.img) return;

    const img = this.img;
    const ratio = Math.max(width / img.width, height / img.height);

    const w = img.width * ratio;
    const h = img.height * ratio;

    const x = (width - w) / 2;
    const y = (height - h) / 2;

    ctx.drawImage(img, x, y, w, h);
  }
}
