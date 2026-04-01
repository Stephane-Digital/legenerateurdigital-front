"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaCopy, FaDownload, FaImage, FaMagic, FaRedo, FaSave, FaTrash } from "react-icons/fa";

import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";
import LeadEditorLayout from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/ui/LeadEditorLayout";
import { buildLeadHtmlExport } from "@/dashboard/lead-engine/utils/exportHtml";

const STORAGE_KEY = "lgd_lead_engine_builder_v4";
const STORAGE_CTA_KEY = "lgd_lead_engine_builder_v4_cta_url";
const STORAGE_CANVAS_HEIGHT_KEY = "lgd_lead_engine_builder_v4_canvas_height_manual";
const STORAGE_ARCHIVES_KEY = "lgd_lead_engine_builder_v4_archives";

type SavedArchive = {
  id: string;
  name: string;
  createdAt: string;
  layers: LayerData[];
  ctaUrl: string;
  canvasHeight: number;
};

function normalizeLayersSnapshot(raw: LayerData[] | null | undefined): LayerData[] {
  if (!Array.isArray(raw)) return [];

  try {
    const cloned = JSON.parse(JSON.stringify(raw));
    return Array.isArray(cloned)
      ? cloned.filter((item) => !!item && typeof item === "object")
      : [];
  } catch {
    return [];
  }
}

function buildLeadPreset(): LayerData[] {
  return [
    {
      id: "lead-title",
      type: "text",
      x: 74,
      y: 86,
      width: 560,
      height: 220,
      visible: true,
      selected: false,
      zIndex: 2,
      text: "Comment générer tes premiers leads qualifiés en 7 jours",
      style: {
        fontSize: 60,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.04,
      },
    } as LayerData,
    {
      id: "lead-subtitle",
      type: "text",
      x: 78,
      y: 320,
      width: 530,
      height: 136,
      visible: true,
      selected: false,
      zIndex: 3,
      text: "Une landing premium pensée pour transformer ton audience en vrais prospects sans dépendre uniquement des algorithmes.",
      style: {
        fontSize: 24,
        fontFamily: "Inter",
        color: "#e4e4e7",
        fontWeight: 500,
        lineHeight: 1.45,
      },
    } as LayerData,
    {
      id: "lead-cta",
      type: "text",
      x: 78,
      y: 474,
      width: 330,
      height: 72,
      visible: true,
      selected: false,
      zIndex: 4,
      text: "Recevoir la méthode maintenant",
      style: {
        fontSize: 22,
        fontFamily: "Inter",
        color: "#111111",
        fontWeight: 800,
        lineHeight: 1.2,
        backgroundColor: "#ffb800",
      },
    } as LayerData,
    {
      id: "lead-benefits-title",
      type: "text",
      x: 74,
      y: 620,
      width: 240,
      height: 60,
      visible: true,
      selected: false,
      zIndex: 5,
      text: "Bénéfices",
      style: {
        fontSize: 34,
        fontFamily: "Inter",
        color: "#ffb800",
        fontWeight: 800,
        lineHeight: 1.1,
      },
    } as LayerData,
    {
      id: "lead-benefit-1",
      type: "text",
      x: 78,
      y: 688,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 6,
      text: "• Attire des prospects plus qualifiés sans complexifier ton marketing.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
    {
      id: "lead-benefit-2",
      type: "text",
      x: 78,
      y: 754,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 7,
      text: "• Transforme tes contenus en machine à leads plus cohérente.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
    {
      id: "lead-benefit-3",
      type: "text",
      x: 78,
      y: 820,
      width: 520,
      height: 64,
      visible: true,
      selected: false,
      zIndex: 8,
      text: "• Crée une structure premium qui donne envie de s’inscrire.",
      style: {
        fontSize: 20,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: 600,
        lineHeight: 1.32,
      },
    } as LayerData,
  ];
}

function safeParseLayers(raw: string | null): LayerData[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LayerData[]) : null;
  } catch {
    return null;
  }
}

function safeParseHeight(raw: string | null): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(1200, Math.min(5000, Math.round(n)));
}

function safeParseArchives(raw: string | null): SavedArchive[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedArchive[]) : [];
  } catch {
    return [];
  }
}

const DEFAULT_CTA_URL = "https://legenerateurdigital.systeme.io/lgd";
const EXPORT_CANVAS_WIDTH = 1080;

function normalizeExportUrl(url: string) {
  const value = String(url || "").trim();
  if (!value) return DEFAULT_CTA_URL;
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
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

function parseLinearGradient(input: string | undefined | null) {
  const raw = String(input || "").trim();
  const match = raw.match(/linear-gradient\(([-\d.]+)deg,\s*([^,]+),\s*([^\)]+)\)/i);
  if (!match) return null;
  return {
    angle: Number(match[1] || 135),
    color1: String(match[2] || "#000000").trim(),
    color2: String(match[3] || "#000000").trim(),
  };
}

function getBestExportNode(node: HTMLElement): HTMLElement {
  const dedicated = node.querySelector('[data-lead-engine-export-source="true"]') as HTMLElement | null;
  return dedicated ?? node;
}

async function elementToRasterDataUrl(
  node: HTMLElement,
  type: "png" | "jpeg",
  quality = 0.95
): Promise<string> {
  const exportNode = getBestExportNode(node);
  const rect = exportNode.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(rect.width || exportNode.clientWidth || exportNode.scrollWidth || 1));
  const height = Math.max(1, Math.ceil(rect.height || exportNode.clientHeight || exportNode.scrollHeight || 1));
  const clone = exportNode.cloneNode(true) as HTMLElement;

  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";
  clone.style.boxSizing = "border-box";
  clone.style.position = "relative";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.maxWidth = "none";
  clone.style.maxHeight = "none";
  clone.style.overflow = "hidden";

  const html = `
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="utf-8" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: ${type === "jpeg" ? "#0a0a0a" : "transparent"};
            width: ${width}px;
            height: ${height}px;
            overflow: hidden;
          }
          * {
            box-sizing: border-box;
          }
          img {
            display: block;
          }
        </style>
      </head>
      <body>${clone.outerHTML}</body>
    </html>
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">${html}</foreignObject>
    </svg>
  `;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";

    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Impossible de charger l’image exportée."));
    });

    img.src = url;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D indisponible.");

    if (type === "jpeg") {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(type === "png" ? "image/png" : "image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function LeadEnginePage() {
  const [editorKey, setEditorKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [initialLayers, setInitialLayers] = useState<LayerData[]>(() => buildLeadPreset());
  const [layers, setLayers] = useState<LayerData[]>(() => buildLeadPreset());
  const [ctaUrl, setCtaUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [canvasHeight, setCanvasHeight] = useState(1800);
  const [archiveName, setArchiveName] = useState("");
  const [archives, setArchives] = useState<SavedArchive[]>([]);
  const [exporting, setExporting] = useState<"" | "png" | "jpeg">("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  function handleCtaUrlChange(nextValue: string) {
    setCtaUrl(nextValue);
    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, normalizeExportUrl(nextValue));
    } catch {
      // noop
    }
  }

  useEffect(() => {
    try {
      const savedLayers = safeParseLayers(window.localStorage.getItem(STORAGE_KEY));
      const savedCta = window.localStorage.getItem(STORAGE_CTA_KEY) || DEFAULT_CTA_URL;
      const savedCanvasHeight = safeParseHeight(
        window.localStorage.getItem(STORAGE_CANVAS_HEIGHT_KEY)
      );
      const savedArchives = safeParseArchives(window.localStorage.getItem(STORAGE_ARCHIVES_KEY));

      const nextLayers =
        savedLayers && savedLayers.length > 0 ? savedLayers : buildLeadPreset();

      setInitialLayers(nextLayers);
      setLayers(nextLayers);
      setCtaUrl(savedCta);
      setCanvasHeight(savedCanvasHeight ?? 1800);
      setArchives(savedArchives);
    } catch {
      const preset = buildLeadPreset();
      setInitialLayers(preset);
      setLayers(preset);
      setCtaUrl(DEFAULT_CTA_URL);
      setCanvasHeight(1800);
      setArchives([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, normalizeExportUrl(ctaUrl));
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, String(canvasHeight));
      window.localStorage.setItem(STORAGE_ARCHIVES_KEY, JSON.stringify(archives));
    } catch {
      // noop
    }
  }, [ctaUrl, canvasHeight, archives, hydrated]);

  const htmlExport = useMemo(() => {
    return buildLeadHtmlExport({
      layers,
      ctaUrl,
    });
  }, [layers, ctaUrl]);

  async function copyHtml() {
    try {
      await navigator.clipboard.writeText(htmlExport);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  }

  function persistLayers(nextLayers: LayerData[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLayers));
    } catch {
      // noop
    }
  }

  function handleLayersChange(nextLayers: LayerData[]) {
    setLayers(nextLayers);
    setInitialLayers(nextLayers);
    setLastSavedAt(new Date().toLocaleTimeString());
    persistLayers(nextLayers);
  }

  function resetPreset() {
    const preset = buildLeadPreset();
    setInitialLayers(preset);
    setLayers(preset);
    setCanvasHeight(1800);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, "1800");
    } catch {
      // noop
    }
  }

  function handleCanvasHeightChange(nextHeight: number) {
    const safeHeight = Math.max(1200, Math.min(5000, Math.round(nextHeight)));
    setCanvasHeight(safeHeight);
    setLastSavedAt(new Date().toLocaleTimeString());

    try {
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, String(safeHeight));
    } catch {
      // noop
    }
  }

  function saveArchive() {
    const name =
      archiveName.trim() ||
      `Archive ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const next: SavedArchive = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      createdAt: new Date().toISOString(),
      layers,
      ctaUrl: normalizeExportUrl(ctaUrl),
      canvasHeight,
    };

    setArchives((prev) => [next, ...prev].slice(0, 30));
    setArchiveName("");
  }

  function loadArchive(archiveId: string) {
    const found = archives.find((item) => item.id === archiveId);
    if (!found) return;

    const nextCta = found.ctaUrl || window.localStorage.getItem(STORAGE_CTA_KEY) || DEFAULT_CTA_URL;

    setInitialLayers(found.layers);
    setLayers(found.layers);
    setCtaUrl(nextCta);
    setCanvasHeight(found.canvasHeight);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());

    persistLayers(found.layers);

    try {
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, String(found.canvasHeight));
      window.localStorage.setItem(STORAGE_CTA_KEY, normalizeExportUrl(nextCta));
    } catch {
      // noop
    }
  }

  function deleteArchive(archiveId: string) {
    setArchives((prev) => prev.filter((item) => item.id !== archiveId));
  }

  async function exportRaster(type: "png" | "jpeg") {
    const visibleLayers = normalizeLayersSnapshot(layers).filter(
      (layer: any) => layer && layer.visible !== false && String(layer.id) !== "lead-canvas-height-marker"
    );

    if (visibleLayers.length === 0) {
      window.alert("Export impossible : aucun layer visible.");
      return;
    }

    try {
      setExporting(type);

      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_CANVAS_WIDTH;
      canvas.height = Math.max(1200, Math.round(canvasHeight || 1800));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D indisponible.");

      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Chargement image impossible."));
          img.src = src;
        });

      const drawCover = (img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
        const scale = Math.max(dw / img.width, dh / img.height);
        const sw = dw / scale;
        const sh = dh / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      };

      const drawContain = (img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
        const scale = Math.min(dw / img.width, dh / img.height);
        const rw = img.width * scale;
        const rh = img.height * scale;
        const ox = dx + (dw - rw) / 2;
        const oy = dy + (dh - rh) / 2;
        ctx.drawImage(img, ox, oy, rw, rh);
      };

      const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, fill: string) => {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.save();
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      const drawTextLayer = (layer: any) => {
        const style = getLayerStyle(layer);
        const fontSize = Math.max(8, toNumber(style.fontSize, 32));
        const fontWeight = String(style.fontWeight ?? 400);
        const fontFamily = String(style.fontFamily || "Inter, Arial, sans-serif");
        const lineHeight = Math.max(0.8, toNumber(style.lineHeight, 1.2));
        const textAlign = ["left", "center", "right", "justify"].includes(String(style.textAlign))
          ? String(style.textAlign)
          : "left";
        const color = getTextColor(style);
        const backgroundColor = style.backgroundColor ? String(style.backgroundColor) : "";
        const x = Math.round(toNumber(layer.x, 0));
        const y = Math.round(toNumber(layer.y, 0));
        const width = Math.max(20, Math.round(toNumber(layer.width, 320)));
        const minHeight = Math.max(20, Math.round(toNumber(layer.height, 60)));
        const paddingX = backgroundColor ? 22 : 0;
        const paddingY = backgroundColor ? 16 : 0;
        const innerWidth = Math.max(20, width - paddingX * 2);
        const rawText = String(layer.text || "");

        ctx.save();
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textBaseline = "top";

        const lines: string[] = [];
        for (const paragraph of rawText.split("\n")) {
          const words = String(paragraph || "").split(/\s+/).filter(Boolean);
          if (!words.length) {
            lines.push("");
            continue;
          }
          let current = "";
          for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            if (ctx.measureText(test).width <= innerWidth || !current) {
              current = test;
            } else {
              lines.push(current);
              current = word;
            }
          }
          if (current) lines.push(current);
        }

        const boxHeight = Math.max(minHeight, Math.ceil(lines.length * fontSize * lineHeight + paddingY * 2));
        if (backgroundColor) {
          drawRoundedRect(x, y, width, boxHeight, 18, backgroundColor);
        }

        ctx.fillStyle = color;
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = textAlign as CanvasTextAlign;
        let textX = x + paddingX;
        if (textAlign === "center") textX = x + width / 2;
        if (textAlign === "right") textX = x + width - paddingX;
        let cursorY = y + paddingY;
        for (const line of lines) {
          ctx.fillText(line, textX, cursorY);
          cursorY += fontSize * lineHeight;
        }
        ctx.restore();
      };

      if (type === "jpeg") {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const backgroundLayer = visibleLayers.find((layer: any) => String(layer.id) === "background-post") ?? null;
      const bgStyle = getLayerStyle(backgroundLayer);
      const bgColor = String(bgStyle.color || "#111111");
      const bgGradient = parseLinearGradient(bgColor);
      if (bgGradient) {
        const angle = ((bgGradient.angle - 90) * Math.PI) / 180;
        const x0 = canvas.width / 2 - Math.cos(angle) * canvas.width / 2;
        const y0 = canvas.height / 2 - Math.sin(angle) * canvas.height / 2;
        const x1 = canvas.width / 2 + Math.cos(angle) * canvas.width / 2;
        const y1 = canvas.height / 2 + Math.sin(angle) * canvas.height / 2;
        const grd = ctx.createLinearGradient(x0, y0, x1, y1);
        grd.addColorStop(0, bgGradient.color1);
        grd.addColorStop(1, bgGradient.color2);
        ctx.fillStyle = grd;
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (backgroundLayer && backgroundLayer.type === "image" && typeof backgroundLayer.src === "string" && backgroundLayer.src) {
        const bgImg = await loadImage(backgroundLayer.src);
        drawCover(bgImg, 0, 0, canvas.width, canvas.height);
      }

      const overlay = (bgStyle as any).overlay;
      if (overlay) {
        ctx.save();
        ctx.globalAlpha = clamp(Number(overlay.opacity ?? 0.35), 0, 1);
        const overlayValue = String(overlay.value || overlay.color1 || "#000000");
        const overlayGradient = parseLinearGradient(overlayValue);
        if (overlayGradient) {
          const angle = ((overlayGradient.angle - 90) * Math.PI) / 180;
          const x0 = canvas.width / 2 - Math.cos(angle) * canvas.width / 2;
          const y0 = canvas.height / 2 - Math.sin(angle) * canvas.height / 2;
          const x1 = canvas.width / 2 + Math.cos(angle) * canvas.width / 2;
          const y1 = canvas.height / 2 + Math.sin(angle) * canvas.height / 2;
          const grd = ctx.createLinearGradient(x0, y0, x1, y1);
          grd.addColorStop(0, overlayGradient.color1);
          grd.addColorStop(1, overlayGradient.color2);
          ctx.fillStyle = grd;
        } else {
          ctx.fillStyle = overlayValue;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      const contentLayers = [...visibleLayers]
        .filter((layer: any) => String(layer.id) !== "background-post")
        .sort((a: any, b: any) => Number(a?.zIndex ?? 0) - Number(b?.zIndex ?? 0));

      for (const layer of contentLayers as any[]) {
        if (layer.type === "image" && typeof layer.src === "string" && layer.src) {
          const img = await loadImage(layer.src);
          drawContain(
            img,
            Math.round(toNumber(layer.x, 0)),
            Math.round(toNumber(layer.y, 0)),
            Math.max(20, Math.round(toNumber(layer.width, 300))),
            Math.max(20, Math.round(toNumber(layer.height, 300)))
          );
          continue;
        }

        if (layer.type === "text") {
          drawTextLayer(layer);
        }
      }

      const dataUrl = canvas.toDataURL(type === "png" ? "image/png" : "image/jpeg", 0.95);
      const filename = `lgd-lead-engine-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-")}.${type === "png" ? "png" : "jpg"}`;
      downloadDataUrl(dataUrl, filename);
    } catch (error) {
      console.error("[LeadEngine exportRaster]", error);
      window.alert(
        type === "png"
          ? "Export PNG impossible pour le moment."
          : "Export JPEG impossible pour le moment."
      );
    } finally {
      setExporting("");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1800px] px-6 pb-10 pt-[110px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-yellow-600/25 bg-[#0b0b0b] px-4 py-2 text-sm font-semibold text-yellow-200"
              >
                <FaArrowLeft />
                Retour Dashboard
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-600/25 bg-[#0b0b0b] px-4 py-1 text-[12px] text-white/75">
                <FaMagic className="text-yellow-300" />
                Lead Builder V4.6.2.1 — Page Export Final
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-[#ffb800] sm:text-4xl">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Export HTML SIO, export PNG / JPEG et archives locales sans toucher au moteur de l’éditeur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyHtml}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85"
            >
              <FaCopy className="text-yellow-300" />
              {copied ? "HTML copié" : "Exporter HTML SIO"}
            </button>

            <button
              type="button"
              onClick={() => exportRaster("png")}
              disabled={!!exporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85 disabled:opacity-50"
            >
              <FaImage className="text-yellow-300" />
              {exporting === "png" ? "Export PNG..." : "Exporter PNG"}
            </button>

            <button
              type="button"
              onClick={() => exportRaster("jpeg")}
              disabled={!!exporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85 disabled:opacity-50"
            >
              <FaDownload className="text-yellow-300" />
              {exporting === "jpeg" ? "Export JPEG..." : "Exporter JPEG"}
            </button>

            <button
              type="button"
              onClick={resetPreset}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-600/25 bg-[#0b0b0b] px-5 py-3 font-semibold text-white/85"
            >
              <FaRedo className="text-yellow-300" />
              Réinitialiser le preset
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="mb-2 text-sm font-semibold text-yellow-300">
                Archive de landing
              </div>
              <div className="text-sm text-white/55">
                Sauvegarde des versions prêtes à rouvrir, dupliquer ou exporter plus tard.
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={archiveName}
                  onChange={(e) => setArchiveName(e.target.value)}
                  placeholder="Nom de l’archive"
                  className="flex-1 rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/85 outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={saveArchive}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#ffb800] px-5 py-3 font-semibold text-black"
                >
                  <FaSave />
                  Archiver
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">Archives récentes</div>

              <div className="mt-3 max-h-[180px] space-y-2 overflow-y-auto pr-1">
                {archives.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-yellow-600/20 bg-black/20 px-4 py-4 text-sm text-white/45">
                    Aucune archive pour le moment.
                  </div>
                ) : (
                  archives.map((archive) => (
                    <div
                      key={archive.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-yellow-600/15 bg-black/20 px-3 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white/85">
                          {archive.name}
                        </div>
                        <div className="text-[12px] text-white/45">
                          {new Date(archive.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => loadArchive(archive.id)}
                          className="rounded-lg border border-yellow-600/20 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-200"
                        >
                          Charger
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteArchive(archive.id)}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div ref={rootRef} className="rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-4 sm:p-5">
          {hydrated ? (
            <LeadEditorLayout
              key={editorKey}
              initialLayers={initialLayers}
              initialLayersKey={`lead-engine-${editorKey}`}
              canvasHeight={canvasHeight}
              onCanvasHeightChange={handleCanvasHeightChange}
              ctaUrl={ctaUrl}
              onCtaUrlChange={handleCtaUrlChange}
              onChange={handleLayersChange}
            />
          ) : (
            <div className="flex min-h-[680px] items-center justify-center rounded-[20px] border border-yellow-600/15 bg-[#090909] text-sm text-white/45">
              Chargement du lead builder...
            </div>
          )}
        </div>

        <div className="mt-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-yellow-300">
                HTML SIO généré
              </div>
              <div className="mt-1 text-sm text-white/55">
                Le CTA principal utilise l’URL Systeme.io et l’export reste basé sur le fichier stable actuel.
              </div>
            </div>

            <button
              type="button"
              onClick={copyHtml}
              className="rounded-2xl bg-[#ffb800] px-5 py-3 font-semibold text-black"
            >
              {copied ? "Copié" : "Copier le HTML"}
            </button>
          </div>

          <textarea
            readOnly
            value={htmlExport}
            className="mt-4 min-h-[320px] w-full rounded-2xl border border-yellow-600/20 bg-[#111] px-4 py-4 text-sm text-white/80 outline-none"
          />
        </div>

        {!!lastSavedAt && (
          <div className="mt-4 text-right text-xs text-white/35">
            Dernière synchro : {lastSavedAt}
          </div>
        )}
      </div>
    </div>
  );
}
