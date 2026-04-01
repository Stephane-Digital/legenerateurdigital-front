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
          ctaUrl: String((item as SavedArchive).ctaUrl || ""),
          canvasHeight: safeParseHeight(String((item as SavedArchive).canvasHeight ?? "")) ?? 1800,
        } as SavedArchive;
      })
      .filter(Boolean) as SavedArchive[];
  } catch {
    return [];
  }
}

function getBestExportCanvasFromTarget(node: HTMLElement): HTMLCanvasElement | null {
  const canvases = Array.from(node.querySelectorAll("canvas")) as HTMLCanvasElement[];
  const visible = canvases.filter((canvas) => {
    const style = window.getComputedStyle(canvas);
    const rect = canvas.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0
    );
  });

  if (visible.length === 0) return null;

  return visible.sort((a, b) => {
    const areaA = Math.max(a.width, a.clientWidth, 0) * Math.max(a.height, a.clientHeight, 0);
    const areaB = Math.max(b.width, b.clientWidth, 0) * Math.max(b.height, b.clientHeight, 0);
    return areaB - areaA;
  })[0] ?? null;
}

function exportCanvasToBlob(
  sourceCanvas: HTMLCanvasElement,
  type: "png" | "jpeg",
  quality = 0.95
): Promise<Blob> {
  const width = Math.max(1, sourceCanvas.width || Math.round(sourceCanvas.clientWidth) || 1);
  const height = Math.max(1, sourceCanvas.height || Math.round(sourceCanvas.clientHeight) || 1);

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = width;
  exportCanvas.height = height;

  const ctx = exportCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D indisponible.");

  if (type === "jpeg") {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Blob export indisponible."));
          return;
        }
        resolve(blob);
      },
      type === "png" ? "image/png" : "image/jpeg",
      quality
    );
  });
}

async function elementToRasterDataUrl(
  node: HTMLElement,
  type: "png" | "jpeg",
  quality = 0.95
): Promise<string> {
  const liveCanvas = getBestExportCanvasFromTarget(node);
  if (liveCanvas) {
    const blob = await exportCanvasToBlob(liveCanvas, type, quality);
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        if (!result) {
          reject(new Error("Lecture Blob impossible."));
          return;
        }
        resolve(result);
      };
      reader.onerror = () => reject(new Error("Lecture Blob impossible."));
      reader.readAsDataURL(blob);
    });
  }

  const rect = node.getBoundingClientRect();
  const clone = node.cloneNode(true) as HTMLElement;

  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top left";
  clone.style.boxSizing = "border-box";

  const html = `
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="utf-8" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: transparent;
          }
          body {
            width: ${Math.ceil(rect.width)}px;
            height: ${Math.ceil(rect.height)}px;
            overflow: hidden;
          }
          * {
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>${clone.outerHTML}</body>
    </html>
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(rect.width)}" height="${Math.ceil(rect.height)}">
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
    canvas.width = Math.ceil(rect.width);
    canvas.height = Math.ceil(rect.height);
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

  useEffect(() => {
    try {
      const savedLayers = safeParseLayers(window.localStorage.getItem(STORAGE_KEY));
      const savedCta = window.localStorage.getItem(STORAGE_CTA_KEY) || "";
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
      setCtaUrl("");
      setCanvasHeight(1800);
      setArchives([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_CTA_KEY, ctaUrl);
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

    const snapshot =
      normalizeLayersSnapshot(layers).length > 0
        ? normalizeLayersSnapshot(layers)
        : normalizeLayersSnapshot(initialLayers);

    if (snapshot.length === 0) return;

    const next: SavedArchive = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      createdAt: new Date().toISOString(),
      layers: snapshot,
      ctaUrl,
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
    setCtaUrl(found.ctaUrl);
    setCanvasHeight(found.canvasHeight);
    setEditorKey((value) => value + 1);
    setLastSavedAt(new Date().toLocaleTimeString());

    persistLayers(snapshot);

    try {
      window.localStorage.setItem(STORAGE_CANVAS_HEIGHT_KEY, String(found.canvasHeight));
      window.localStorage.setItem(STORAGE_CTA_KEY, found.ctaUrl);
    } catch {
      // noop
    }
  }

  function deleteArchive(archiveId: string) {
    setArchives((prev) => prev.filter((item) => item.id !== archiveId));
  }

  async function exportRaster(type: "png" | "jpeg") {
    if (!rootRef.current) return;

    const target = rootRef.current.querySelector(
      '[data-lead-engine-canvas-export="true"]'
    ) as HTMLElement | null;

    if (!target) {
      window.alert("Export impossible : canvas introuvable.");
      return;
    }

    try {
      setExporting(type);
      const dataUrl = await elementToRasterDataUrl(target, type, 0.95);
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
              onCtaUrlChange={setCtaUrl}
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
