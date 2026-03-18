// ======================================================
//  LGD WOW ENGINE V5 — CanvasImage
//  Gestion des images (auto-fit, hitbox, déplacement)
// ======================================================

import { loadImage, pointInRect, uid } from "./CanvasUtils";

export default class CanvasImage {
  id: string = uid("img");
  type: "image" = "image";

  x: number = 100;
  y: number = 100;
  width: number = 300;
  height: number = 300;

  url: string = "";
  img: HTMLImageElement | null = null;
  selected: boolean = false;

  constructor(config: Partial<CanvasImage> = {}) {
    Object.assign(this, config);
    if (config.url) this.setImage(config.url);
  }

  async setImage(url: string) {
    this.url = url;
    this.img = await loadImage(url);

    // Auto-fit image dans bounding box
    if (this.img) {
      const ratio = Math.min(
        this.width / this.img.width,
        this.height / this.img.height
      );

      this.width = this.img.width * ratio;
      this.height = this.img.height * ratio;
    }
  }

  // Hit test image
  hitTest(px: number, py: number) {
    return pointInRect(px, py, this.x, this.y, this.width, this.height);
  }

  // Déplacement
  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  // Affichage
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.img) return;

    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

    if (this.selected) this.drawSelection(ctx);
  }

  // Bordure sélection premium
  drawSelection(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 200, 50, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
    ctx.restore();
  }
}
