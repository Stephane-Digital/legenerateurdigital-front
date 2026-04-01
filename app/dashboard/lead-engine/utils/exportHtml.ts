import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";

type BuildLeadHtmlExportInput = {
  layers: LayerData[];
  ctaUrl: string;
};

const DEFAULT_CANVAS_WIDTH = 1080;
const MIN_CANVAS_HEIGHT = 1200;

function normalizeUrl(url: string) {
  const value = String(url || "").trim();
  if (!value) return "#sio-formulaire";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("#")
  ) {
    return value;
  }

  return `https://${value}`;
}

function escapeHtml(input: string) {
  return String(input || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getLayerStyle(layer: any) {
  return ((layer?.style ?? {}) as Record<string, any>) || {};
}

function getTextColor(style: Record<string, any>) {
  return String(style.fill || style.color || style.textColor || "#ffffff");
}

function getLayerHtml(layer: any) {
  if (typeof layer?.html === "string" && layer.html.trim()) return layer.html;
  return escapeHtml(String(layer?.text || "")).replace(/\n/g, "<br />");
}

function getCanvasHeight(visible: any[]) {
  const bgLayer = visible.find((layer) => String(layer?.id) === "background-post");
  const bgHeight = Math.round(toNumber(bgLayer?.height, 0));

  const contentBottom = visible.reduce((max, layer) => {
    const y = toNumber(layer?.y, 0);
    const height = Math.max(
      0,
      toNumber(layer?.height, layer?.type === "text" ? 120 : layer?.type === "image" ? 300 : 0)
    );
    return Math.max(max, y + height);
  }, 0);

  return Math.max(MIN_CANVAS_HEIGHT, bgHeight, Math.ceil(contentBottom + 80));
}

function buildBackgroundHtml(layer: any, canvasHeight: number) {
  const style = getLayerStyle(layer);
  const overlay = style.overlay as any;

  const isImage = layer?.type === "image" && typeof layer?.src === "string" && layer.src;
  const backgroundBase = isImage
    ? `<img src="${escapeHtml(String(layer.src))}" alt="Background" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;display:block;" />`
    : `<div style="position:absolute;inset:0;background:${escapeHtml(String(style.color || "#111111"))};"></div>`;

  const overlayHtml = overlay
    ? `<div style="position:absolute;inset:0;background:${escapeHtml(String(overlay.value || overlay.color1 || "#000000"))};opacity:${Math.max(
        0,
        Math.min(1, Number(overlay.opacity ?? 0.35))
      )};pointer-events:none;"></div>`
    : "";

  return `
    <div style="position:absolute;left:0;top:0;width:${DEFAULT_CANVAS_WIDTH}px;height:${canvasHeight}px;overflow:hidden;z-index:0;">
      ${backgroundBase}
      ${overlayHtml}
    </div>
  `.trim();
}

function buildTextLayerHtml(layer: any, ctaUrl: string) {
  const style = getLayerStyle(layer);
  const fontSize = Math.max(8, toNumber(style.fontSize, 32));
  const fontWeight = escapeHtml(String(style.fontWeight ?? 400));
  const fontFamily = escapeHtml(String(style.fontFamily || "Inter, Arial, sans-serif"));
  const lineHeight = Math.max(0.8, toNumber(style.lineHeight, 1.2));
  const textAlign = ["left", "center", "right", "justify"].includes(String(style.textAlign))
    ? String(style.textAlign)
    : "left";
  const fontStyle = escapeHtml(String(style.fontStyle || "normal"));
  const textDecoration = escapeHtml(String(style.textDecoration || "none"));
  const color = escapeHtml(getTextColor(style));
  const backgroundColor = style.backgroundColor ? escapeHtml(String(style.backgroundColor)) : "";
  const borderRadius = backgroundColor ? "18px" : "0";
  const padding = backgroundColor ? "16px 22px" : "0";
  const display = backgroundColor ? "flex" : "block";
  const alignItems = backgroundColor ? "center" : "initial";
  const justifyContent = backgroundColor
    ? textAlign === "center"
      ? "center"
      : textAlign === "right"
      ? "flex-end"
      : "flex-start"
    : "initial";
  const boxShadow = backgroundColor ? "0 10px 30px rgba(0,0,0,0.18)" : "none";
  const content = backgroundColor
    ? `<span style="display:block;width:100%;">${getLayerHtml(layer)}</span>`
    : getLayerHtml(layer);

  const commonStyle = [
    `position:absolute`,
    `left:${Math.round(toNumber(layer?.x, 0))}px`,
    `top:${Math.round(toNumber(layer?.y, 0))}px`,
    `width:${Math.max(20, Math.round(toNumber(layer?.width, 320)))}px`,
    `min-height:${Math.max(20, Math.round(toNumber(layer?.height, 60)))}px`,
    `z-index:${Math.round(toNumber(layer?.zIndex, 1)) + 20}`,
    `color:${color}`,
    `font-size:${fontSize}px`,
    `font-family:${fontFamily}`,
    `font-weight:${fontWeight}`,
    `font-style:${fontStyle}`,
    `line-height:${lineHeight}`,
    `text-align:${textAlign}`,
    `text-decoration:${textDecoration}`,
    `white-space:normal`,
    `word-break:break-word`,
    `overflow-wrap:anywhere`,
    `background:${backgroundColor || "transparent"}`,
    `border-radius:${borderRadius}`,
    `padding:${padding}`,
    `display:${display}`,
    `align-items:${alignItems}`,
    `justify-content:${justifyContent}`,
    `box-sizing:border-box`,
    `overflow:hidden`,
    `box-shadow:${boxShadow}`,
  ].join(";");

  const isCta = String(layer?.id || "").includes("lead-cta") || String(layer?.id || "").includes("cta");

  if (isCta) {
    return `<a href="${escapeHtml(normalizeUrl(ctaUrl))}" target="_blank" rel="noopener noreferrer" style="${commonStyle};text-decoration:none;">${content}</a>`;
  }

  return `<div style="${commonStyle};">${content}</div>`;
}

function buildImageLayerHtml(layer: any) {
  const x = Math.round(toNumber(layer?.x, 0));
  const y = Math.round(toNumber(layer?.y, 0));
  const width = Math.max(20, Math.round(toNumber(layer?.width, 300)));
  const height = Math.max(20, Math.round(toNumber(layer?.height, 300)));
  const zIndex = Math.round(toNumber(layer?.zIndex, 1)) + 10;
  const src = escapeHtml(String(layer?.src || ""));
  const style = getLayerStyle(layer);
  const borderRadius = Math.max(0, Math.round(toNumber(style.borderRadius, 8)));

  return `
    <div style="position:absolute;left:${x}px;top:${y}px;width:${width}px;height:${height}px;z-index:${zIndex};overflow:hidden;box-sizing:border-box;border-radius:${borderRadius}px;">
      <img src="${src}" alt="Visuel" style="display:block;width:100%;height:100%;object-fit:cover;object-position:center center;" />
    </div>
  `.trim();
}

export function buildLeadHtmlExport({ layers, ctaUrl }: BuildLeadHtmlExportInput) {
  const visible = [...(Array.isArray(layers) ? layers : [])]
    .filter((layer: any) => layer && layer?.visible !== false && String(layer?.id) !== "lead-canvas-height-marker")
    .sort((a: any, b: any) => Number(a?.zIndex ?? 0) - Number(b?.zIndex ?? 0));

  const backgroundLayer =
    visible.find((layer: any) => String(layer?.id) === "background-post") ??
    visible.find((layer: any) => layer?.type === "background") ??
    null;

  const contentLayers = visible.filter((layer: any) => String(layer?.id) !== "background-post");
  const canvasHeight = getCanvasHeight(visible);

  const backgroundHtml = backgroundLayer
    ? buildBackgroundHtml(backgroundLayer, canvasHeight)
    : `<div style="position:absolute;inset:0;background:#111111;z-index:0;"></div>`;

  const layerHtml = contentLayers
    .map((layer: any) => {
      if (layer?.type === "text") return buildTextLayerHtml(layer, ctaUrl);
      if (layer?.type === "image" && typeof layer?.src === "string" && layer.src) {
        return buildImageLayerHtml(layer);
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return `
<div style="width:100%;padding:24px 0;background:#050505;">
  <div style="max-width:${DEFAULT_CANVAS_WIDTH}px;margin:0 auto;">
    <div style="position:relative;width:${DEFAULT_CANVAS_WIDTH}px;height:${canvasHeight}px;margin:0 auto;overflow:hidden;border-radius:32px;border:1px solid rgba(255,184,0,0.18);background:#111111;font-family:Inter,Arial,sans-serif;">
      ${backgroundHtml}
      ${layerHtml}
    </div>
  </div>
</div>
`.trim();
}
