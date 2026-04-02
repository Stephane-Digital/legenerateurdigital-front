"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaCopy, FaDownload, FaImage, FaMagic, FaRedo, FaSave, FaTrash } from "react-icons/fa";
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

const DEFAULT_CTA_URL = "https://legenerateurdigital.systeme.io/lgd";
const EXPORT_CANVAS_WIDTH = 1080;

type SavedArchive = {
  id: string;
  name: string;
  createdAt: string;
  layers: LayerData[];
  ctaUrl: string;
  canvasHeight: number;
};

type AIQuotaState = {
  plan: string;
  remaining: number;
  tokens_used: number;
  tokens_limit: number;
};

const DEFAULT_AI_QUOTA: AIQuotaState = {
  plan: "essentiel",
  remaining: 0,
  tokens_used: 0,
  tokens_limit: 0,
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
    const normalized = normalizeLayersSnapshot(Array.isArray(parsed) ? (parsed as LayerData[]) : null);
    return normalized.length > 0 ? normalized : null;
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
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const layers = normalizeLayersSnapshot((item as SavedArchive).layers);
        if (layers.length === 0) return null;

        return {
          id: String((item as SavedArchive).id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
          name: String((item as SavedArchive).name || "Archive sans nom"),
          createdAt: String((item as SavedArchive).createdAt || new Date().toISOString()),
          layers,
          ctaUrl: String((item as SavedArchive).ctaUrl || DEFAULT_CTA_URL),
          canvasHeight: safeParseHeight(String((item as SavedArchive).canvasHeight ?? "")) ?? 1800,
        } as SavedArchive;
      })
      .filter(Boolean) as SavedArchive[];
  } catch {
    return [];
  }
}

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
  const [ctaUrl, setCtaUrl] = useState(DEFAULT_CTA_URL);
  const [copied, setCopied] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [canvasHeight, setCanvasHeight] = useState(1800);
  const [archiveName, setArchiveName] = useState("");
  const [archives, setArchives] = useState<SavedArchive[]>([]);
  const [exporting, setExporting] = useState<"" | "png" | "jpeg">("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiBrief, setAiBrief] = useState("");
  const [aiGoal, setAiGoal] = useState<"landing_complete" | "hooks" | "cta" | "benefits" | "variants">("landing_complete");
  const [aiLastGoal, setAiLastGoal] = useState<"landing_complete" | "hooks" | "cta" | "benefits" | "variants">("landing_complete");
  const [aiQuota, setAiQuota] = useState<AIQuotaState>(DEFAULT_AI_QUOTA);
  const [aiQuotaLoading, setAiQuotaLoading] = useState(false);
  const [aiQuotaMessage, setAiQuotaMessage] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);


  function syncQuotaFromPayload(raw: any) {
    if (!raw || typeof raw !== "object") return;
    setAiQuota({
      plan: String(raw.plan || aiQuota.plan || "essentiel"),
      remaining: Math.max(0, Number(raw.remaining ?? 0) || 0),
      tokens_used: Math.max(0, Number(raw.tokens_used ?? 0) || 0),
      tokens_limit: Math.max(0, Number(raw.tokens_limit ?? 0) || 0),
    });
  }

  async function refreshAIQuota() {
    try {
      setAiQuotaLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-quota/global`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;
      syncQuotaFromPayload(data);
    } catch (error) {
      console.error("[LeadEngine quota]", error);
    } finally {
      setAiQuotaLoading(false);
    }
  }

  function handleQuotaExceeded(data: any) {
    const detail = data?.detail;
    const quota = detail?.quota || data?.quota;
    if (quota) syncQuotaFromPayload(quota);
    const message = detail?.message || data?.message || "Quota IA atteint pour le moment.";
    setAiQuotaMessage(String(message));
    window.alert(String(message));
  }

  function handleCtaUrlChange(nextValue: string) {
    const normalized = normalizeExportUrl(nextValue);
    setCtaUrl(normalized);
    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, normalized);
    } catch {
      // noop
    }
  }

  useEffect(() => {
    try {
      const savedLayers = safeParseLayers(window.localStorage.getItem(STORAGE_KEY));
      const savedCta = window.localStorage.getItem(STORAGE_CTA_KEY) || DEFAULT_CTA_URL;
      const savedCanvasHeight = safeParseHeight(window.localStorage.getItem(STORAGE_CANVAS_HEIGHT_KEY));
      const savedArchives = safeParseArchives(window.localStorage.getItem(STORAGE_ARCHIVES_KEY));

      const nextLayers = savedLayers && savedLayers.length > 0 ? savedLayers : buildLeadPreset();

      setInitialLayers(nextLayers);
      setLayers(nextLayers);
      setCtaUrl(normalizeExportUrl(savedCta));
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
    void refreshAIQuota();
  }, [hydrated]);

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

  async function autoSaveMemory(content: string) {
    const trimmed = String(content || "").trim();
    if (!trimmed) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-engine/ai/save-memory`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memory_type: "lead_brief",
          content: trimmed,
          emotional_profile: "human premium",
          business_context: "lead-engine",
        }),
      });
    } catch (error) {
      console.error("[LeadEngine memory]", error);
    }
  }

  useEffect(() => {
    if (!aiBrief.trim()) return;

    const timer = window.setTimeout(() => {
      void autoSaveMemory(aiBrief);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [aiBrief]);

  async function generateWithAI(goal: string) {
    try {
      setAiLoading(true);
      setAiLastGoal(goal as typeof aiLastGoal);
      setAiResult("");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-engine/ai/generate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          brief: aiBrief || "Créer une landing premium orientée conversion.",
          emotional_style: "humain, authentique, expert, sincère, orienté conversion",
          business_context: `lead generation premium | cta_url=${normalizeExportUrl(ctaUrl)}`,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        handleQuotaExceeded(data);
        throw new Error(typeof (data as any)?.detail === "string" ? (data as any).detail : "Erreur IA");
      }

      const content = String((data as any)?.content || "");
      setAiQuotaMessage("");
      if ((data as any)?.quota) syncQuotaFromPayload((data as any).quota);
      setAiResult(content);
    } catch (error) {
      console.error("[LeadEngine AI]", error);
      window.alert("Génération IA impossible pour le moment.");
    } finally {
      setAiLoading(false);
    }
  }

  function rewritePremiumResult() {
    void generateWithAI(aiLastGoal || aiGoal);
  }

  function clearPremiumResult() {
    setAiResult("");
  }

  const htmlExport = useMemo(() => {
    return buildLeadHtmlExport({
      layers,
      ctaUrl: normalizeExportUrl(ctaUrl),
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
    const snapshot = normalizeLayersSnapshot(nextLayers);
    if (snapshot.length === 0) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // noop
    }
  }

  function handleLayersChange(nextLayers: LayerData[]) {
    const snapshot = normalizeLayersSnapshot(nextLayers);
    if (snapshot.length === 0) return;

    setLayers(snapshot);
    setInitialLayers(snapshot);
    setLastSavedAt(new Date().toLocaleTimeString());
    persistLayers(snapshot);
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
      window.localStorage.setItem(STORAGE_CTA_KEY, DEFAULT_CTA_URL);
    } catch {
      // noop
    }

    setCtaUrl(DEFAULT_CTA_URL);
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
    const snapshot = normalizeLayersSnapshot(layers);
    if (snapshot.length === 0) return;

    const name =
      archiveName.trim() ||
      `Archive ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const next: SavedArchive = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      createdAt: new Date().toISOString(),
      layers: snapshot,
      ctaUrl: normalizeExportUrl(ctaUrl),
      canvasHeight,
    };

    setArchives((prev) => [next, ...prev].slice(0, 30));
    setArchiveName("");
  }

  function loadArchive(archiveId: string) {
    const found = archives.find((item) => item.id === archiveId);
    if (!found) return;

    const snapshot = normalizeLayersSnapshot(found.layers);
    if (snapshot.length === 0) return;

    setInitialLayers(snapshot);
    setLayers(snapshot);
    setCtaUrl(normalizeExportUrl(found.ctaUrl || DEFAULT_CTA_URL));
    setCanvasHeight(found.canvasHeight);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());

    persistLayers(snapshot);

    try {
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, String(found.canvasHeight));
      window.localStorage.setItem(STORAGE_CTA_KEY, normalizeExportUrl(found.ctaUrl || DEFAULT_CTA_URL));
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
          img.crossOrigin = "anonymous";
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
      window.alert(type === "png" ? "Export PNG impossible pour le moment." : "Export JPEG impossible pour le moment.");
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
                Lead Builder V4.7.2 — Front IA Memory Connector
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-[#ffb800] sm:text-4xl">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Export HTML SIO, export PNG / JPEG, archives locales et copilote IA mémoire branché sur le backend.
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
              <div className="mb-2 text-sm font-semibold text-yellow-300">Archive de landing</div>
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
                        <div className="truncate text-sm font-semibold text-white/85">{archive.name}</div>
                        <div className="text-[12px] text-white/45">{new Date(archive.createdAt).toLocaleString()}</div>
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

        <div className="mb-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-yellow-300">IA Lead Engine Premium</div>
                  <div className="mt-1 text-sm text-white/55">
                    Chaque brief est mémorisé automatiquement pour enrichir les futures générations.
                  </div>
                </div>

                <select
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value as typeof aiGoal)}
                  className="rounded-xl border border-yellow-600/20 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="landing_complete">Landing complète</option>
                  <option value="hooks">Hooks</option>
                  <option value="cta">CTA</option>
                  <option value="benefits">Bénéfices</option>
                  <option value="variants">Variantes A/B</option>
                </select>
              </div>

              <textarea
                value={aiBrief}
                onChange={(e) => setAiBrief(e.target.value)}
                placeholder="Décris précisément l'offre, la cible, la transformation promise, les douleurs, le niveau d'émotion souhaité, le ton et le résultat attendu..."
                className="mt-4 min-h-[180px] w-full rounded-2xl border border-yellow-600/20 bg-black/30 p-4 text-white outline-none placeholder:text-white/30"
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-yellow-600/20 bg-black/30 px-3 py-2 text-xs text-white/75">
                  {aiQuotaLoading ? "Quota IA..." : `Quota IA : ${aiQuota.remaining.toLocaleString()} / ${aiQuota.tokens_limit.toLocaleString()} • Plan ${aiQuota.plan}`}
                </div>
                <button
                  type="button"
                  onClick={() => generateWithAI(aiGoal)}
                  disabled={aiLoading || aiQuota.remaining <= 0}
                  className="rounded-2xl bg-[#ffb800] px-5 py-3 font-bold text-black disabled:opacity-60"
                >
                  {aiLoading ? "Génération..." : "Générer avec IA"}
                </button>

                <button
                  type="button"
                  onClick={rewritePremiumResult}
                  disabled={aiLoading || !aiBrief.trim() || aiQuota.remaining <= 0}
                  className="rounded-2xl border border-yellow-600/20 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-200 disabled:opacity-50"
                >
                  Réécrire
                </button>

                <button
                  type="button"
                  onClick={clearPremiumResult}
                  disabled={aiLoading || !aiResult.trim()}
                  className="rounded-2xl border border-yellow-600/20 bg-black/30 px-5 py-3 font-semibold text-white/80 disabled:opacity-50"
                >
                  Effacer le résultat
                </button>

                <div className="text-xs text-white/45">
                  {aiQuota.remaining <= 0 ? (aiQuotaMessage || "Quota IA atteint • génération temporairement bloquée") : "Mémoire automatique active • Backend OpenAI branché • IA-quotas reliés"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">Résultat IA</div>
              <div className="mt-1 text-sm text-white/55">
                Sortie humanisée, contextualisée et prête à être réinjectée dans le Lead Engine.
              </div>

              <textarea
                readOnly
                value={aiResult}
                placeholder="Les résultats IA apparaîtront ici. Ils seront nourris par le brief, le contexte métier et la mémoire utilisateur."
                className="mt-4 min-h-[260px] w-full rounded-2xl border border-yellow-600/20 bg-black/30 p-4 text-white/90 outline-none placeholder:text-white/25"
              />
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
              aiQuotaRemaining={aiQuota.remaining}
              aiQuotaLimit={aiQuota.tokens_limit}
              aiQuotaPlan={aiQuota.plan}
              aiQuotaLoading={aiQuotaLoading}
              onAiQuotaSync={syncQuotaFromPayload}
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
              <div className="text-sm font-semibold text-yellow-300">HTML SIO généré</div>
              <div className="mt-1 text-sm text-white/55">
                Le CTA principal utilise l’URL Systeme.io et l’export reste aligné sur la structure actuelle du Lead Engine.
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
          <div className="mt-4 text-right text-xs text-white/35">Dernière synchro : {lastSavedAt}</div>
        )}
      </div>
    </div>
  );
}

import type { LayerData } from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/types/layers";
import LeadEditorLayout from "@/dashboard/automatisations/reseaux_sociaux/carrousel/editor/v5/ui/LeadEditorLayout";
import { buildLeadHtmlExport } from "@/dashboard/lead-engine/utils/exportHtml";

const STORAGE_KEY = "lgd_lead_engine_builder_v4";
const STORAGE_CTA_KEY = "lgd_lead_engine_builder_v4_cta_url";
const STORAGE_CANVAS_HEIGHT_KEY = "lgd_lead_engine_builder_v4_canvas_height_manual";
const STORAGE_ARCHIVES_KEY = "lgd_lead_engine_builder_v4_archives";

const DEFAULT_CTA_URL = "https://legenerateurdigital.systeme.io/lgd";
const EXPORT_CANVAS_WIDTH = 1080;

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
    const normalized = normalizeLayersSnapshot(Array.isArray(parsed) ? (parsed as LayerData[]) : null);
    return normalized.length > 0 ? normalized : null;
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
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;

        const layers = normalizeLayersSnapshot((item as SavedArchive).layers);
        if (layers.length === 0) return null;

        return {
          id: String((item as SavedArchive).id || `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
          name: String((item as SavedArchive).name || "Archive sans nom"),
          createdAt: String((item as SavedArchive).createdAt || new Date().toISOString()),
          layers,
          ctaUrl: String((item as SavedArchive).ctaUrl || DEFAULT_CTA_URL),
          canvasHeight: safeParseHeight(String((item as SavedArchive).canvasHeight ?? "")) ?? 1800,
        } as SavedArchive;
      })
      .filter(Boolean) as SavedArchive[];
  } catch {
    return [];
  }
}

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
  const [ctaUrl, setCtaUrl] = useState(DEFAULT_CTA_URL);
  const [copied, setCopied] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [canvasHeight, setCanvasHeight] = useState(1800);
  const [archiveName, setArchiveName] = useState("");
  const [archives, setArchives] = useState<SavedArchive[]>([]);
  const [exporting, setExporting] = useState<"" | "png" | "jpeg">("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiBrief, setAiBrief] = useState("");
  const [aiGoal, setAiGoal] = useState<"landing_complete" | "hooks" | "cta" | "benefits" | "variants">("landing_complete");
  const [aiLastGoal, setAiLastGoal] = useState<"landing_complete" | "hooks" | "cta" | "benefits" | "variants">("landing_complete");
  const rootRef = useRef<HTMLDivElement | null>(null);

  function handleCtaUrlChange(nextValue: string) {
    const normalized = normalizeExportUrl(nextValue);
    setCtaUrl(normalized);
    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, normalized);
    } catch {
      // noop
    }
  }

  useEffect(() => {
    try {
      const savedLayers = safeParseLayers(window.localStorage.getItem(STORAGE_KEY));
      const savedCta = window.localStorage.getItem(STORAGE_CTA_KEY) || DEFAULT_CTA_URL;
      const savedCanvasHeight = safeParseHeight(window.localStorage.getItem(STORAGE_CANVAS_HEIGHT_KEY));
      const savedArchives = safeParseArchives(window.localStorage.getItem(STORAGE_ARCHIVES_KEY));

      const nextLayers = savedLayers && savedLayers.length > 0 ? savedLayers : buildLeadPreset();

      setInitialLayers(nextLayers);
      setLayers(nextLayers);
      setCtaUrl(normalizeExportUrl(savedCta));
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

  async function autoSaveMemory(content: string) {
    const trimmed = String(content || "").trim();
    if (!trimmed) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-engine/ai/save-memory`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memory_type: "lead_brief",
          content: trimmed,
          emotional_profile: "human premium",
          business_context: "lead-engine",
        }),
      });
    } catch (error) {
      console.error("[LeadEngine memory]", error);
    }
  }

  useEffect(() => {
    if (!aiBrief.trim()) return;

    const timer = window.setTimeout(() => {
      void autoSaveMemory(aiBrief);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [aiBrief]);

  async function generateWithAI(goal: string) {
    try {
      setAiLoading(true);
      setAiLastGoal(goal as typeof aiLastGoal);
      setAiResult("");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-engine/ai/generate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          brief: aiBrief || "Créer une landing premium orientée conversion.",
          emotional_style: "humain, authentique, expert, sincère, orienté conversion",
          business_context: `lead generation premium | cta_url=${normalizeExportUrl(ctaUrl)}`,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as any)?.detail || "Erreur IA");
      }

      const content = String((data as any)?.content || "");
      setAiResult(content);
    } catch (error) {
      console.error("[LeadEngine AI]", error);
      window.alert("Génération IA impossible pour le moment.");
    } finally {
      setAiLoading(false);
    }
  }

  function rewritePremiumResult() {
    void generateWithAI(aiLastGoal || aiGoal);
  }

  function clearPremiumResult() {
    setAiResult("");
  }

  const htmlExport = useMemo(() => {
    return buildLeadHtmlExport({
      layers,
      ctaUrl: normalizeExportUrl(ctaUrl),
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
    const snapshot = normalizeLayersSnapshot(nextLayers);
    if (snapshot.length === 0) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // noop
    }
  }

  function handleLayersChange(nextLayers: LayerData[]) {
    const snapshot = normalizeLayersSnapshot(nextLayers);
    if (snapshot.length === 0) return;

    setLayers(snapshot);
    setInitialLayers(snapshot);
    setLastSavedAt(new Date().toLocaleTimeString());
    persistLayers(snapshot);
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
      window.localStorage.setItem(STORAGE_CTA_KEY, DEFAULT_CTA_URL);
    } catch {
      // noop
    }

    setCtaUrl(DEFAULT_CTA_URL);
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
    const snapshot = normalizeLayersSnapshot(layers);
    if (snapshot.length === 0) return;

    const name =
      archiveName.trim() ||
      `Archive ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const next: SavedArchive = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      createdAt: new Date().toISOString(),
      layers: snapshot,
      ctaUrl: normalizeExportUrl(ctaUrl),
      canvasHeight,
    };

    setArchives((prev) => [next, ...prev].slice(0, 30));
    setArchiveName("");
  }

  function loadArchive(archiveId: string) {
    const found = archives.find((item) => item.id === archiveId);
    if (!found) return;

    const snapshot = normalizeLayersSnapshot(found.layers);
    if (snapshot.length === 0) return;

    setInitialLayers(snapshot);
    setLayers(snapshot);
    setCtaUrl(normalizeExportUrl(found.ctaUrl || DEFAULT_CTA_URL));
    setCanvasHeight(found.canvasHeight);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());

    persistLayers(snapshot);

    try {
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, String(found.canvasHeight));
      window.localStorage.setItem(STORAGE_CTA_KEY, normalizeExportUrl(found.ctaUrl || DEFAULT_CTA_URL));
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
          img.crossOrigin = "anonymous";
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
      window.alert(type === "png" ? "Export PNG impossible pour le moment." : "Export JPEG impossible pour le moment.");
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
                Lead Builder V4.7.2 — Front IA Memory Connector
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-[#ffb800] sm:text-4xl">
              Lead Engine branché sur la vraie structure éditeur
            </h1>
            <p className="mt-2 max-w-3xl text-white/65">
              Export HTML SIO, export PNG / JPEG, archives locales et copilote IA mémoire branché sur le backend.
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
              <div className="mb-2 text-sm font-semibold text-yellow-300">Archive de landing</div>
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
                        <div className="truncate text-sm font-semibold text-white/85">{archive.name}</div>
                        <div className="text-[12px] text-white/45">{new Date(archive.createdAt).toLocaleString()}</div>
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

        <div className="mb-6 rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-5">
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-yellow-300">IA Lead Engine Premium</div>
                  <div className="mt-1 text-sm text-white/55">
                    Chaque brief est mémorisé automatiquement pour enrichir les futures générations.
                  </div>
                </div>

                <select
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value as typeof aiGoal)}
                  className="rounded-xl border border-yellow-600/20 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="landing_complete">Landing complète</option>
                  <option value="hooks">Hooks</option>
                  <option value="cta">CTA</option>
                  <option value="benefits">Bénéfices</option>
                  <option value="variants">Variantes A/B</option>
                </select>
              </div>

              <textarea
                value={aiBrief}
                onChange={(e) => setAiBrief(e.target.value)}
                placeholder="Décris précisément l'offre, la cible, la transformation promise, les douleurs, le niveau d'émotion souhaité, le ton et le résultat attendu..."
                className="mt-4 min-h-[180px] w-full rounded-2xl border border-yellow-600/20 bg-black/30 p-4 text-white outline-none placeholder:text-white/30"
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => generateWithAI(aiGoal)}
                  disabled={aiLoading}
                  className="rounded-2xl bg-[#ffb800] px-5 py-3 font-bold text-black disabled:opacity-60"
                >
                  {aiLoading ? "Génération..." : "Générer avec IA"}
                </button>

                <button
                  type="button"
                  onClick={rewritePremiumResult}
                  disabled={aiLoading || !aiBrief.trim()}
                  className="rounded-2xl border border-yellow-600/20 bg-yellow-500/10 px-5 py-3 font-semibold text-yellow-200 disabled:opacity-50"
                >
                  Réécrire
                </button>

                <button
                  type="button"
                  onClick={clearPremiumResult}
                  disabled={aiLoading || !aiResult.trim()}
                  className="rounded-2xl border border-yellow-600/20 bg-black/30 px-5 py-3 font-semibold text-white/80 disabled:opacity-50"
                >
                  Effacer le résultat
                </button>

                <div className="text-xs text-white/45">
                  Mémoire automatique active • Backend OpenAI branché
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-600/20 bg-[#111] p-4">
              <div className="text-sm font-semibold text-yellow-300">Résultat IA</div>
              <div className="mt-1 text-sm text-white/55">
                Sortie humanisée, contextualisée et prête à être réinjectée dans le Lead Engine.
              </div>

              <textarea
                readOnly
                value={aiResult}
                placeholder="Les résultats IA apparaîtront ici. Ils seront nourris par le brief, le contexte métier et la mémoire utilisateur."
                className="mt-4 min-h-[260px] w-full rounded-2xl border border-yellow-600/20 bg-black/30 p-4 text-white/90 outline-none placeholder:text-white/25"
              />
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
              <div className="text-sm font-semibold text-yellow-300">HTML SIO généré</div>
              <div className="mt-1 text-sm text-white/55">
                Le CTA principal utilise l’URL Systeme.io et l’export reste aligné sur la structure actuelle du Lead Engine.
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
          <div className="mt-4 text-right text-xs text-white/35">Dernière synchro : {lastSavedAt}</div>
        )}
      </div>
    </div>
  );
}
