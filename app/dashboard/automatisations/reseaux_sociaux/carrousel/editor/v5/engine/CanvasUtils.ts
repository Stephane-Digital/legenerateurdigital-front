// ======================================================
//  LGD WOW ENGINE V5 — CanvasUtils
//  Fonctions utilitaires indispensables aux classes V5
// ======================================================

// Génère un UID unique (id premium LGD)
export function uid(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10)}`;
}

// Charge une image avec promesse
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // sécurité / CORS
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

// Détection collision rectangle
export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
