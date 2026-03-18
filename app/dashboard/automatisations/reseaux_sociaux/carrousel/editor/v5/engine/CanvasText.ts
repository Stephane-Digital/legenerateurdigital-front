// ======================================================
//  LGD WOW ENGINE V5 — CanvasText
//  Gestion du texte haute qualité, sélection, déplacement
// ======================================================

import { pointInRect, uid } from "./CanvasUtils";

export default class CanvasText {
  id: string = uid("txt");
  type: "text" = "text";

  x: number = 100;
  y: number = 100;
  text: string = "Texte";
  color: string = "#ffffff";
  fontSize: number = 48;
  fontFamily: string = "Inter, sans-serif";
  selected: boolean = false;

  constructor(config: Partial<CanvasText> = {}) {
    Object.assign(this, config);
  }

  // Mesure la taille réelle du texte
  measure(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    const metrics = ctx.measureText(this.text);
    const width = metrics.width;
    const height = this.fontSize * 1.2; // approximation visuelle
    return { width, height };
  }

  // Détection du clic (hitbox)
  hitTest(px: number, py: number, ctx: CanvasRenderingContext2D) {
    const { width, height } = this.measure(ctx);
    return pointInRect(px, py, this.x, this.y - height, width, height);
  }

  // Déplacement
  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  // Affichage du texte
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Glow premium LGD
    if (this.selected) {
      ctx.shadowColor = "rgba(255, 200, 50, 0.8)";
      ctx.shadowBlur = 22;
    } else {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    ctx.fillStyle = this.color;
    ctx.textBaseline = "top";

    ctx.fillText(this.text, this.x, this.y);

    ctx.restore();

    if (this.selected) {
      this.drawSelection(ctx);
    }
  }

  // Bordure de sélection
  drawSelection(ctx: CanvasRenderingContext2D) {
    const { width, height } = this.measure(ctx);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 200, 50, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 4, this.y - 4, width + 8, height + 8);
    ctx.restore();
  }
}
