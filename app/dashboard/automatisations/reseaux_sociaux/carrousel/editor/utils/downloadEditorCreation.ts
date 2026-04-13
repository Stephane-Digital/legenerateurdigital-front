"use client";

import { CANVAS_FORMATS, type CanvasFormatKey } from "../v5/config/formats";

type LayerStyle = {
  color?: string;
  fill?: string;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  italic?: boolean;
  underline?: boolean;
  textAlign?: CanvasTextAlign | "justify";
  align?: CanvasTextAlign | "justify";
  lineHeight?: number;
  textDecoration?: string;
  letterSpacing?: number;
  textTransform?: string;
};

type LayerData = {
  id?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  w?: number;
  h?: number;
  zIndex?: number;
  visible?: boolean;
  opacity?: number;
  text?: string;
  html?: string;
  src?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  italic?: boolean;
  underline?: boolean;
  lineHeight?: number;
  textAlign?: CanvasTextAlign | "justify";
  align?: CanvasTextAlign | "justify";
  color?: string;
  fill?: string;
  style?: LayerStyle & { color?: string };
};

type EditorUI = {
  formatKey?: CanvasFormatKey;
};

type PostDraft = {
  ui?: EditorUI;
  layers?: LayerData[];
};

type SlideDraft = {
  id?: string;
  ui?: EditorUI;
  layers?: LayerData[];
};

type CarrouselDraft = {
  ui?: EditorUI;
  slides?: SlideDraft[];
  layers?: LayerData[];
};

function sanitizeFilenamePart(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "lgd";
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function toArray<T = any>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function firstNonEmptyString(...values: any[]) {
  for (const value of values) {
    if (typeof value === "string") {
      const v = value.trim();
      if (v) return v;
    }
  }
  return "";
}

function getFormat(ui?: EditorUI) {
  const key = (ui?.formatKey || "instagram_post") as CanvasFormatKey;
  const fmt = CANVAS_FORMATS[key] || CANVAS_FORMATS.instagram_post;
  return {
    key,
    w: fmt.w,
    h: fmt.h,
    label: fmt.label,
  };
}

function getBackgroundLayer(layers: LayerData[]) {
  return (
    layers.find((l) => l?.id === "background-post") ||
    layers.find((l) => l?.id === "background") ||
    layers.find((l) => l?.id === "bg") ||
    layers.find((l) => String(l?.type || "").toLowerCase() === "background") ||
    null
  );
}

function isVisible(layer: LayerData) {
  return layer?.visible !== false;
}

function getLayerX(layer: LayerData) {
  return Number(layer?.x ?? 0) || 0;
}

function getLayerY(layer: LayerData) {
  return Number(layer?.y ?? 0) || 0;
}

function getLayerW(layer: LayerData, fallback = 320) {
  return Number(layer?.width ?? layer?.w ?? fallback) || fallback;
}

function getLayerH(layer: LayerData, fallback = 180) {
  return Number(layer?.height ?? layer?.h ?? fallback) || fallback;
}


function textToHtml(text: string) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

function escapeXml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getLayerStyle(layer: LayerData): LayerStyle & Record<string, any> {
  const style = (layer?.style ?? {}) as Record<string, any>;
  return {
    ...style,
    fontSize: typeof style.fontSize === "number" ? style.fontSize : layer?.fontSize,
    fontFamily: typeof style.fontFamily === "string" && style.fontFamily.trim().length ? style.fontFamily : layer?.fontFamily,
    fontWeight: style.fontWeight ?? layer?.fontWeight,
    fontStyle: style.fontStyle ?? layer?.fontStyle,
    italic: style.italic ?? layer?.italic,
    underline: style.underline ?? layer?.underline,
    textAlign: style.textAlign ?? layer?.textAlign ?? style.align ?? layer?.align,
    lineHeight: typeof style.lineHeight === "number" ? style.lineHeight : layer?.lineHeight,
    color: style.color ?? style.fill ?? style.textColor ?? layer?.color ?? layer?.fill,
    fill: style.fill ?? layer?.fill,
  };
}

function getLayerTextAlign(style: Record<string, any>): "left" | "center" | "right" | "justify" {
  const value = String(style?.textAlign ?? style?.align ?? "left");
  if (value === "center" || value === "right" || value === "justify") return value;
  return "left";
}

function getTextLayerHtml(layer: LayerData) {
  if (typeof layer?.html === "string" && layer.html.trim()) return layer.html;
  return textToHtml(String(layer?.text ?? ""));
}

function svgMarkupToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function ensureFontReady(style: Record<string, any>) {
  if (typeof document === "undefined" || !document.fonts) return;

  const fontSize = Math.max(8, Number(style?.fontSize ?? 32) || 32);
  const fontFamily = firstNonEmptyString(style?.fontFamily, "Inter", "Arial");
  const fontStyle = style?.italic || style?.fontStyle === "italic" ? "italic" : "normal";
  const fontWeight = String(style?.fontWeight ?? 400);

  try {
    if (typeof document.fonts.load === "function") {
      await document.fonts.load(`${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`);
    }
    if ((document.fonts as any)?.ready) {
      await (document.fonts as any).ready;
    }
  } catch {
    // ignore font loading failure
  }
}

async function drawTextLayerRich(ctx: CanvasRenderingContext2D, layer: LayerData) {
  const text = String(layer?.text || "").trim();
  const html = getTextLayerHtml(layer);
  if (!text && !html) return false;

  const x = getLayerX(layer);
  const y = getLayerY(layer);
  const w = Math.max(20, Math.round(getLayerW(layer, 520)));
  const h = Math.max(20, Math.round(getLayerH(layer, 240)));
  const style = getLayerStyle(layer);
  await ensureFontReady(style);

  const textAlign = getLayerTextAlign(style);
  const color = firstNonEmptyString(style?.fill, style?.color, style?.textColor, "#ffffff");
  const backgroundColor = firstNonEmptyString(style?.backgroundColor, "");
  const fontSize = Math.max(8, Number(style?.fontSize ?? 32) || 32);
  const fontFamily = firstNonEmptyString(style?.fontFamily, "Inter, Arial, sans-serif");
  const fontWeight = String(style?.fontWeight ?? 400);
  const fontStyle = style?.italic || style?.fontStyle === "italic" ? "italic" : "normal";
  const lineHeight = Math.max(0.8, Number(style?.lineHeight ?? 1.2) || 1.2);
  const textDecoration = String(style?.textDecoration || (style?.underline ? "underline" : "none"));
  const letterSpacing = typeof style?.letterSpacing === "number" ? `${style.letterSpacing}px` : "normal";
  const textTransform = style?.textTransform ? String(style.textTransform) : "none";
  const layerOpacity = typeof layer?.opacity === "number" ? layer.opacity : 1;
  const containerStyles = [
    `width:${w}px`,
    `min-height:${h}px`,
    `box-sizing:border-box`,
    `color:${escapeXml(color)}`,
    `font-size:${fontSize}px`,
    `font-family:${escapeXml(fontFamily)}`,
    `font-weight:${escapeXml(fontWeight)}`,
    `font-style:${escapeXml(fontStyle)}`,
    `line-height:${lineHeight}`,
    `text-align:${textAlign}`,
    `text-decoration:${escapeXml(textDecoration)}`,
    `white-space:normal`,
    `word-break:break-word`,
    `overflow-wrap:anywhere`,
    `overflow:hidden`,
    `padding:${backgroundColor ? "16px 22px" : "0px"}`,
    `background:${backgroundColor ? escapeXml(backgroundColor) : "transparent"}`,
    `border-radius:${backgroundColor ? "18px" : "0px"}`,
    `display:${backgroundColor ? "flex" : "block"}`,
    backgroundColor
      ? `align-items:center`
      : "align-items:flex-start",
    backgroundColor
      ? `justify-content:${textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start"}`
      : "justify-content:flex-start",
    `text-transform:${escapeXml(textTransform)}`,
    `letter-spacing:${escapeXml(letterSpacing)}`,
    `opacity:${Math.max(0, Math.min(1, Number(layerOpacity) || 1))}`,
    `margin:0`,
  ].join(";");

  const bodyHtml = `
    <div xmlns="http://www.w3.org/1999/xhtml" style="${containerStyles}">
      ${html}
    </div>
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <foreignObject x="0" y="0" width="100%" height="100%">${bodyHtml}</foreignObject>
    </svg>
  `;

  try {
    const img = await loadImage(svgMarkupToDataUrl(svg));
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, Number(layerOpacity) || 1));
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    return true;
  } catch {
    return false;
  }
}

function isLinearGradient(value: string) {
  return typeof value === "string" && value.includes("linear-gradient(");
}

function applyBackgroundFill(
  ctx: CanvasRenderingContext2D,
  backgroundValue: string,
  width: number,
  height: number
) {
  if (!backgroundValue) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (!isLinearGradient(backgroundValue)) {
    ctx.fillStyle = backgroundValue;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const match = backgroundValue.match(
    /linear-gradient\(([-\d.]+)deg,\s*([^,]+),\s*([^)]+)\)/
  );

  if (!match) {
    ctx.fillStyle = "#111111";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const angleDeg = Number(match[1] || 135);
  const color1 = String(match[2] || "#111111").trim();
  const color2 = String(match[3] || "#000000").trim();

  const angle = (angleDeg * Math.PI) / 180;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(width, height);

  const x1 = cx - Math.cos(angle) * radius;
  const y1 = cy - Math.sin(angle) * radius;
  const x2 = cx + Math.cos(angle) * radius;
  const y2 = cy + Math.sin(angle) * radius;

  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image loading failed"));
    img.src = src;
  });
}

async function drawImageCover(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (!src) return;
  const img = await loadImage(src);

  const iw = img.naturalWidth || img.width || w;
  const ih = img.naturalHeight || img.height || h;
  const scale = Math.max(w / iw, h / ih);

  const drawW = iw * scale;
  const drawH = ih * scale;
  const dx = x + (w - drawW) / 2;
  const dy = y + (h - drawH) / 2;

  ctx.drawImage(img, dx, dy, drawW, drawH);
}

function buildFont(style?: LayerStyle) {
  const size = Math.max(10, Number(style?.fontSize ?? 48) || 48);
  const family = firstNonEmptyString(style?.fontFamily, "Inter", "Arial");
  const weight = String(style?.fontWeight ?? "700");
  const italic = style?.italic || style?.fontStyle === "italic" ? "italic " : "";
  return `${italic}${weight} ${size}px ${family}`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const rawLines = String(text || "").split("\n");
  const lines: string[] = [];

  for (const rawLine of rawLines) {
    const words = rawLine.split(/\s+/).filter(Boolean);

    if (!words.length) {
      lines.push("");
      continue;
    }

    let line = words[0];

    for (let i = 1; i < words.length; i += 1) {
      const test = `${line} ${words[i]}`;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        lines.push(line);
        line = words[i];
      }
    }

    lines.push(line);
  }

  return lines;
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: LayerData
) {
  const text = String(layer?.text || "").trim();
  if (!text) return;

  const x = getLayerX(layer);
  const y = getLayerY(layer);
  const w = getLayerW(layer, 520);
  const h = getLayerH(layer, 240);
  const style = getLayerStyle(layer);
  const fontSize = Math.max(10, Number(style?.fontSize ?? 48) || 48);
  const lineHeight = Math.max(1, Number(style?.lineHeight ?? 1.2) || 1.2);
  const color = firstNonEmptyString(style?.fill, style?.color, style?.textColor, "#ffffff");
  const align = getLayerTextAlign(style) as CanvasTextAlign;

  ctx.save();
  ctx.font = buildFont(style);
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.textAlign = align;

  const lines = wrapText(ctx, text, Math.max(60, w - 12));
  const step = fontSize * lineHeight;

  let drawX = x + 6;
  if (align === "center") drawX = x + w / 2;
  if (align === "right") drawX = x + w - 6;

  lines.forEach((line, index) => {
    const lineY = y + 6 + index * step;
    if (lineY > y + h) return;
    ctx.fillText(line, drawX, lineY, w - 12);

    if (style?.underline) {
      const metrics = ctx.measureText(line);
      let ux = drawX;
      if (align === "center") ux = drawX - metrics.width / 2;
      if (align === "right") ux = drawX - metrics.width;
      const uy = lineY + fontSize + 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, fontSize / 18);
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(ux + metrics.width, uy);
      ctx.stroke();
    }
  });

  ctx.restore();
}

export async function renderSingleCreationToDataUrl(args: {
  layers: LayerData[];
  ui?: EditorUI;
}) {
  const format = getFormat(args.ui);
  const canvas = document.createElement("canvas");
  canvas.width = format.w;
  canvas.height = format.h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponible");

  const layers = toArray<LayerData>(args.layers).filter(isVisible);
  const backgroundLayer = getBackgroundLayer(layers);

  applyBackgroundFill(
    ctx,
    firstNonEmptyString(backgroundLayer?.style?.color, "#111111"),
    format.w,
    format.h
  );

  if (
    backgroundLayer &&
    String(backgroundLayer?.type || "").toLowerCase() === "image" &&
    typeof backgroundLayer?.src === "string" &&
    backgroundLayer.src
  ) {
    try {
      await drawImageCover(ctx, backgroundLayer.src, 0, 0, format.w, format.h);
    } catch {
      // ignore image loading failure
    }
  }

  const drawableLayers = layers
    .filter((layer) => layer && layer !== backgroundLayer)
    .sort((a, b) => Number(a?.zIndex ?? 0) - Number(b?.zIndex ?? 0));

  for (const layer of drawableLayers) {
    const type = String(layer?.type || "").toLowerCase();

    if (type === "image" && layer?.src) {
      try {
        await drawImageCover(
          ctx,
          layer.src,
          getLayerX(layer),
          getLayerY(layer),
          getLayerW(layer, 360),
          getLayerH(layer, 360)
        );
      } catch {
        // ignore
      }
      continue;
    }

    if (type === "text") {
      const richDrawn = await drawTextLayerRich(ctx, layer);
      if (!richDrawn) {
        drawTextLayer(ctx, layer);
      }
    }
  }

  return canvas.toDataURL("image/png");
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export async function downloadPostCreation(
  draft: PostDraft,
  filenameBase = "lgd-post"
) {
  const layers = toArray<LayerData>(draft?.layers);
  if (!layers.length) {
    throw new Error("Aucun contenu à télécharger.");
  }

  const dataUrl = await renderSingleCreationToDataUrl({
    layers,
    ui: draft?.ui,
  });

  triggerDownload(dataUrl, `${sanitizeFilenamePart(filenameBase)}.png`);
}

export async function downloadCarrouselCreation(
  draft: CarrouselDraft,
  filenameBase = "lgd-carrousel"
) {
  const slides = toArray<SlideDraft>(draft?.slides);

  if (!slides.length) {
    const fallbackLayers = toArray<LayerData>(draft?.layers);
    if (!fallbackLayers.length) {
      throw new Error("Aucun carrousel à télécharger.");
    }

    const dataUrl = await renderSingleCreationToDataUrl({
      layers: fallbackLayers,
      ui: draft?.ui,
    });

    triggerDownload(dataUrl, `${sanitizeFilenamePart(filenameBase)}-slide-01.png`);
    return;
  }

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];
    const layers = toArray<LayerData>(slide?.layers);
    if (!layers.length) continue;

    const dataUrl = await renderSingleCreationToDataUrl({
      layers,
      ui: slide?.ui || draft?.ui,
    });

    const n = String(index + 1).padStart(2, "0");
    triggerDownload(
      dataUrl,
      `${sanitizeFilenamePart(filenameBase)}-slide-${n}.png`
    );

    await delay(220);
  }
}

export async function downloadEditorCreation(args: {
  mode: "post" | "carrousel";
  draft: any;
  title?: string;
}) {
  const base = sanitizeFilenamePart(
    args.title || (args.mode === "post" ? "lgd-post" : "lgd-carrousel")
  );

  if (args.mode === "post") {
    await downloadPostCreation(args.draft as PostDraft, base);
    return;
  }

  await downloadCarrouselCreation(args.draft as CarrouselDraft, base);
}

export async function renderEditorCreationToDataUrl(args: {
  mode: "post" | "carrousel";
  draft: any;
  slideIndex?: number;
}) {
  const draft = args?.draft || {};

  if (args.mode === "post") {
    const layers = toArray<LayerData>(draft?.layers);
    if (!layers.length) throw new Error("Aucun layer de post à rendre.");
    return renderSingleCreationToDataUrl({ layers, ui: draft?.ui });
  }

  const slides = toArray<SlideDraft>(draft?.slides);
  if (slides.length) {
    const index = Math.max(0, Number(args?.slideIndex ?? 0) || 0);
    const slide = slides[index] || slides[0];
    const layers = toArray<LayerData>(slide?.layers);
    if (!layers.length) throw new Error("Aucun layer de slide à rendre.");
    return renderSingleCreationToDataUrl({ layers, ui: slide?.ui || draft?.ui });
  }

  const fallbackLayers = toArray<LayerData>(draft?.layers);
  if (!fallbackLayers.length) throw new Error("Aucun contenu carrousel à rendre.");
  return renderSingleCreationToDataUrl({ layers: fallbackLayers, ui: draft?.ui });
}
