"use client";

import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Send,
  Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";

type ManualStatus = "published" | "scheduled";

type Props = {
  open: boolean;
  post: any | null;
  onClose: () => void;
  onMarkStatus: (postId: number | string, status: ManualStatus) => Promise<void>;
};

type PreviewLayer = {
  id: string;
  type: "text" | "image" | "background";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  src?: string;
  visible?: boolean;
  zIndex?: number;
  style?: Record<string, any>;
};

type PreviewCanvas = {
  width: number;
  height: number;
  layers: PreviewLayer[];
  source: string;
};

function safeParseJSON(value: any) {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const v = String(value || "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }

  return out;
}

function extractSlides(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function extractLayers(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function looksLikeImageUrl(value: string) {
  const v = String(value || "").toLowerCase();
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("blob:") ||
    v.startsWith("data:image/")
  );
}

function getTextFromLayer(layer: any) {
  return firstNonEmptyString(
    layer?.text,
    layer?.content,
    layer?.value,
    layer?.label,
    layer?.title,
    layer?.name
  );
}

function getImageFromLayer(layer: any) {
  return firstNonEmptyString(
    layer?.src,
    layer?.url,
    layer?.image,
    layer?.imageUrl,
    layer?.image_url,
    layer?.imageUrl,
    layer?.image_url,
    layer?.media_url,
    layer?.mediaUrl,
    layer?.preview_url,
    layer?.previewUrl,
    layer?.thumbnail_url,
    layer?.thumbnailUrl,
    layer?.background,
    layer?.backgroundUrl,
    layer?.background_url,
    layer?.imageUrl,
    layer?.image_url
  );
}

function normalizeLayer(raw: any, index: number): PreviewLayer | null {
  if (!raw || typeof raw !== "object") return null;

  const typeRaw = String(raw?.type || raw?.kind || raw?.layerType || "").toLowerCase();
  const type: PreviewLayer["type"] =
    typeRaw.includes("background")
      ? "background"
      : typeRaw.includes("image") || raw?.src || raw?.imageUrl || raw?.image_url
      ? "image"
      : "text";

  const text = getTextFromLayer(raw);
  const src = getImageFromLayer(raw);

  return {
    id: String(raw?.id || `layer-${index}`),
    type,
    x: Number(raw?.x ?? 0),
    y: Number(raw?.y ?? 0),
    width: typeof raw?.width === "number" ? raw.width : undefined,
    height: typeof raw?.height === "number" ? raw.height : undefined,
    text: text || undefined,
    src: src || undefined,
    visible: raw?.visible !== false && raw?.hidden !== true,
    zIndex: typeof raw?.zIndex === "number" ? raw.zIndex : index,
    style: {
      ...(typeof raw?.style === "object" && raw?.style ? raw.style : {}),
      fontSize: raw?.fontSize ?? raw?.style?.fontSize,
      fontFamily: raw?.fontFamily ?? raw?.style?.fontFamily,
      color: raw?.color ?? raw?.style?.color,
      fontWeight: raw?.fontWeight ?? raw?.style?.fontWeight,
      italic: raw?.italic ?? raw?.style?.italic,
      underline: raw?.underline ?? raw?.style?.underline,
      align: raw?.align ?? raw?.style?.align,
      opacity: raw?.opacity ?? raw?.style?.opacity,
      rotation: raw?.rotation ?? raw?.style?.rotation,
      background: raw?.background ?? raw?.style?.background,
    },
  };
}

function getCanvasMeta(parsed: any, post: any) {
  const candidates = [
    parsed?.canvas,
    parsed?.format,
    parsed?.formatMeta,
    parsed?.ui,
    parsed?.meta,
    parsed?.editor,
    parsed,
    post,
  ];

  for (const c of candidates) {
    const width = Number(c?.width ?? c?.w ?? c?.canvasWidth ?? c?.formatWidth ?? 0);
    const height = Number(c?.height ?? c?.h ?? c?.canvasHeight ?? c?.formatHeight ?? 0);
    if (width > 0 && height > 0) return { width, height };
  }

  return { width: 0, height: 0 };
}

function snapToCommonFormat(width: number, height: number) {
  const COMMON = [
    { width: 1080, height: 1080 },
    { width: 1080, height: 1350 },
    { width: 1080, height: 1920 },
    { width: 1200, height: 628 },
    { width: 1080, height: 566 },
    { width: 1000, height: 1500 },
  ];

  if (width <= 0 || height <= 0) return { width: 1080, height: 1350 };

  const ratio = width / height;
  let best = COMMON[0];
  let bestDiff = Math.abs(best.width / best.height - ratio);

  for (const item of COMMON.slice(1)) {
    const diff = Math.abs(item.width / item.height - ratio);
    if (diff < bestDiff) {
      best = item;
      bestDiff = diff;
    }
  }

  if (bestDiff <= 0.12) return best;
  return { width, height };
}

function inferCanvasSize(layers: PreviewLayer[], parsed: any, post: any) {
  const fromMeta = getCanvasMeta(parsed, post);
  if (fromMeta.width > 0 && fromMeta.height > 0) return snapToCommonFormat(fromMeta.width, fromMeta.height);

  let maxX = 0;
  let maxY = 0;

  for (const layer of layers) {
    const w = typeof layer.width === "number" ? layer.width : layer.type === "text" ? 420 : 0;
    const h = typeof layer.height === "number" ? layer.height : layer.type === "text" ? 160 : 0;
    maxX = Math.max(maxX, (layer.x || 0) + w);
    maxY = Math.max(maxY, (layer.y || 0) + h);
  }

  return snapToCommonFormat(Math.max(300, Math.round(maxX)), Math.max(300, Math.round(maxY)));
}

function extractPreviewCanvas(post: any, parsed: any): PreviewCanvas | null {
  const directLayerSources = [
    { source: "parsed.layers", layers: extractLayers(parsed?.layers) },
    { source: "parsed.elements", layers: extractLayers(parsed?.elements) },
    { source: "parsed.objects", layers: extractLayers(parsed?.objects) },
    { source: "parsed.contenu.layers", layers: extractLayers(parsed?.contenu?.layers) },
    { source: "parsed.content.layers", layers: extractLayers(parsed?.content?.layers) },
  ];

  for (const item of directLayerSources) {
    if (!item.layers.length) continue;
    const layers = item.layers.map(normalizeLayer).filter(Boolean) as PreviewLayer[];
    if (!layers.length) continue;
    const size = inferCanvasSize(layers, parsed, post);
    return { width: size.width, height: size.height, layers, source: item.source };
  }

  const slides = extractSlides(parsed?.slides);
  if (slides.length) {
    for (let i = 0; i < slides.length; i += 1) {
      const slide = slides[i];
      const sourceLayers = [
        { source: `parsed.slides[${i}].layers`, layers: extractLayers(slide?.layers) },
        { source: `parsed.slides[${i}].elements`, layers: extractLayers(slide?.elements) },
        { source: `parsed.slides[${i}].objects`, layers: extractLayers(slide?.objects) },
      ];

      for (const item of sourceLayers) {
        if (!item.layers.length) continue;
        const layers = item.layers.map(normalizeLayer).filter(Boolean) as PreviewLayer[];
        if (!layers.length) continue;
        const size = inferCanvasSize(layers, slide ?? parsed, post);
        return { width: size.width, height: size.height, layers, source: item.source };
      }
    }
  }

  return null;
}

function flattenPossibleTextSources(post: any, parsed: any) {
  const slideTexts = extractSlides(parsed?.slides).flatMap((slide: any) => [
    firstNonEmptyString(
      slide?.caption,
      slide?.text,
      slide?.title,
      slide?.hook,
      slide?.headline,
      slide?.description,
      slide?.content,
      slide?.message
    ),
  ]);

  const layerTexts = [
    ...extractLayers(parsed?.layers),
    ...extractLayers(parsed?.elements),
    ...extractLayers(parsed?.objects),
  ].map((layer: any) => {
    const type = String(layer?.type || layer?.kind || "").toLowerCase();
    if (type.includes("text") || !type) return getTextFromLayer(layer);
    return "";
  });

  const nestedCaption = firstNonEmptyString(
    parsed?.post?.caption,
    parsed?.post?.text,
    parsed?.post?.message,
    parsed?.post?.description,
    parsed?.metadata?.caption,
    parsed?.metadata?.description,
    parsed?.seo?.description,
    parsed?.editor?.caption,
    parsed?.editor?.description
  );

  return uniqueStrings([
    firstNonEmptyString(
      post?.caption,
      post?.text,
      post?.message,
      post?.description,
      post?.generated_caption,
      post?.generated_text,
      post?.generatedText,
      typeof post?.contenu === "string" && post.contenu.trim().startsWith("{") ? "" : post?.contenu,
      typeof post?.content === "string" && post.content.trim().startsWith("{") ? "" : post?.content
    ),
    firstNonEmptyString(
      parsed?.caption,
      parsed?.text,
      parsed?.texte,
      parsed?.message,
      parsed?.description,
      parsed?.content,
      parsed?.generated_caption,
      parsed?.generated_text,
      parsed?.generatedText,
      parsed?.prompt_output,
      parsed?.output,
      parsed?.copy
    ),
    nestedCaption,
    ...slideTexts,
    ...layerTexts,
  ]);
}

function extractCaption(post: any, parsed: any) {
  const candidates = flattenPossibleTextSources(post, parsed)
    .map((s) => String(s || "").trim())
    .filter(Boolean);

  if (!candidates.length) return "";

  const longEnough = candidates.find((text) => text.length >= 24);
  if (longEnough) return longEnough;

  return candidates[0] || "";
}

function flattenPossibleMediaSources(post: any, parsed: any) {
  const slideMedia = extractSlides(parsed?.slides).flatMap((slide: any) => [
    firstNonEmptyString(
      slide?.image_url,
      slide?.media_url,
      slide?.imageUrl,
      slide?.mediaUrl,
      slide?.preview_url,
      slide?.previewUrl,
      slide?.thumbnail_url,
      slide?.thumbnailUrl,
      slide?.src,
      slide?.url,
      slide?.background,
      slide?.backgroundUrl,
      slide?.background_url
    ),
  ]);

  const layerMedia = [
    ...extractLayers(parsed?.layers),
    ...extractLayers(parsed?.elements),
    ...extractLayers(parsed?.objects),
    ...extractSlides(parsed?.slides).flatMap((slide: any) => [
      ...extractLayers(slide?.layers),
      ...extractLayers(slide?.elements),
      ...extractLayers(slide?.objects),
    ]),
  ].flatMap((layer: any) => {
    const candidate = getImageFromLayer(layer);
    return candidate ? [candidate] : [];
  });

  const nestedMedia = firstNonEmptyString(
    parsed?.post?.media_url,
    parsed?.post?.image_url,
    parsed?.post?.mediaUrl,
    parsed?.post?.imageUrl,
    parsed?.post?.preview_url,
    parsed?.post?.previewUrl,
    parsed?.editor?.preview_url,
    parsed?.editor?.previewUrl,
    parsed?.editor?.cover_url,
    parsed?.editor?.coverUrl,
    parsed?.metadata?.image,
    parsed?.metadata?.image_url,
    parsed?.metadata?.imageUrl,
    parsed?.cover,
    parsed?.cover_url,
    parsed?.coverUrl,
    parsed?.background,
    parsed?.background_url,
    parsed?.backgroundUrl
  );

  return uniqueStrings([
    firstNonEmptyString(
      post?.media_url,
      post?.image_url,
      post?.mediaUrl,
      post?.imageUrl,
      post?.preview_url,
      post?.previewUrl,
      post?.thumbnail_url,
      post?.thumbnailUrl,
      post?.cover_url,
      post?.coverUrl
    ),
    firstNonEmptyString(
      parsed?.media_url,
      parsed?.image_url,
      parsed?.mediaUrl,
      parsed?.imageUrl,
      parsed?.preview_url,
      parsed?.previewUrl,
      parsed?.thumbnail_url,
      parsed?.thumbnailUrl
    ),
    nestedMedia,
    ...slideMedia,
    ...layerMedia,
  ]).filter(looksLikeImageUrl);
}

function extractMediaUrl(post: any, parsed: any) {
  const candidates = flattenPossibleMediaSources(post, parsed);
  return candidates[0] || "";
}

function extractAllMediaUrls(post: any, parsed: any) {
  return flattenPossibleMediaSources(post, parsed);
}

function extractTitle(post: any, parsed: any) {
  return firstNonEmptyString(
    post?.titre,
    post?.title,
    parsed?.title,
    parsed?.titre,
    parsed?.name,
    parsed?.text_title,
    parsed?.headline,
    "Publication LGD"
  );
}

function buildNetworkUrl(network: string) {
  const n = String(network || "").toLowerCase().trim();
  if (n === "instagram") return "https://www.instagram.com/";
  if (n === "facebook") return "https://www.facebook.com/";
  if (n === "pinterest") return "https://www.pinterest.com/";
  if (n === "linkedin") return "https://www.linkedin.com/feed/";
  if (n === "snapchat") return "https://web.snapchat.com/";
  return "";
}

function getStatus(post: any, parsed: any) {
  return String(post?.statut ?? post?.status ?? parsed?.statut ?? parsed?.status ?? "scheduled")
    .toLowerCase()
    .trim();
}

function PreviewCanvasView({ canvas }: { canvas: PreviewCanvas }) {
  const sortedLayers = [...canvas.layers]
    .filter((layer) => layer.visible !== false)
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-black/30 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-yellow-300/80">Aperçu réel</p>
          <p className="mt-1 text-[11px] text-white/45">
            Format détecté : {canvas.width} × {canvas.height}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/50">
          {canvas.source}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b]">
        <div
          className="relative w-full"
          style={{ aspectRatio: `${canvas.width}/${canvas.height}` }}
        >
          {sortedLayers.map((layer) => {
            const baseStyle: React.CSSProperties = {
              position: "absolute",
              left: `${(layer.x / canvas.width) * 100}%`,
              top: `${(layer.y / canvas.height) * 100}%`,
              width:
                typeof layer.width === "number"
                  ? `${(layer.width / canvas.width) * 100}%`
                  : layer.type === "text"
                  ? "38%"
                  : undefined,
              height:
                typeof layer.height === "number"
                  ? `${(layer.height / canvas.height) * 100}%`
                  : undefined,
              zIndex: layer.zIndex ?? 0,
              opacity:
                typeof layer.style?.opacity === "number"
                  ? Number(layer.style.opacity)
                  : 1,
              transform:
                typeof layer.style?.rotation === "number"
                  ? `rotate(${layer.style.rotation}deg)`
                  : undefined,
              transformOrigin: "top left",
            };

            if (layer.type === "background") {
              return (
                <div
                  key={layer.id}
                  style={{
                    ...baseStyle,
                    inset: 0,
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    background:
                      layer.style?.background ||
                      layer.style?.color ||
                      "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
                  }}
                />
              );
            }

            if (layer.type === "image" && layer.src && looksLikeImageUrl(layer.src)) {
              return (
                <img
                  key={layer.id}
                  src={layer.src}
                  alt="preview"
                  style={{
                    ...baseStyle,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
              );
            }

            if (layer.type === "text" && layer.text) {
              const fontSize = Number(layer.style?.fontSize || 48);
              return (
                <div
                  key={layer.id}
                  style={{
                    ...baseStyle,
                    color: String(layer.style?.color || "#ffffff"),
                    fontSize: `${(fontSize / canvas.height) * 100}cqh`,
                    fontFamily: String(layer.style?.fontFamily || "inherit"),
                    fontWeight: Number(layer.style?.fontWeight || 700),
                    fontStyle: layer.style?.italic ? "italic" : "normal",
                    textDecoration: layer.style?.underline ? "underline" : "none",
                    textAlign: (layer.style?.align as any) || "left",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.1,
                    textShadow: "0 2px 10px rgba(0,0,0,0.45)",
                    overflow: "hidden",
                  }}
                >
                  {layer.text}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}

export default function AssistedPublishModal({ open, post, onClose, onMarkStatus }: Props) {
  const [copied, setCopied] = useState<"" | "caption" | "media">("");
  const [saving, setSaving] = useState<"" | ManualStatus>("");

  const parsed = useMemo(() => safeParseJSON(post?.contenu ?? post?.content ?? null), [post]);

  const title = useMemo(() => extractTitle(post, parsed), [post, parsed]);
  const caption = useMemo(() => extractCaption(post, parsed), [post, parsed]);
  const mediaUrl = useMemo(() => extractMediaUrl(post, parsed), [post, parsed]);
  const mediaUrls = useMemo(() => extractAllMediaUrls(post, parsed), [post, parsed]);
  const slides = useMemo(() => extractSlides(parsed?.slides), [parsed]);
  const previewCanvas = useMemo(() => extractPreviewCanvas(post, parsed), [post, parsed]);
  const network = useMemo(
    () =>
      String(post?.reseau ?? post?.network ?? parsed?.reseau ?? parsed?.network ?? "").toLowerCase(),
    [post, parsed]
  );
  const networkUrl = useMemo(() => buildNetworkUrl(network), [network]);
  const status = useMemo(() => getStatus(post, parsed), [post, parsed]);
  const isPublished =
    status.includes("published") || status.includes("envoy") || status.includes("success");

  if (!open || !post) return null;

  const copyValue = async (value: string, type: "caption" | "media") => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      alert("Copie impossible sur cet appareil.");
    }
  };

  const handleMark = async (nextStatus: ManualStatus) => {
    if (!post?.id) return;
    setSaving(nextStatus);
    try {
      await onMarkStatus(post.id, nextStatus);
      onClose();
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto mt-10 w-full max-w-5xl rounded-[28px] border border-[#2a2a2a] bg-[#0b0b0b] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-yellow-500/80">Publication assistée</p>
            <h3 className="mt-2 text-xl font-semibold text-white md:text-2xl">{title}</h3>
            <p className="mt-2 text-sm text-white/55">
              Ouvre le réseau, colle la légende, ajoute le visuel et garde le suivi directement dans le Planner.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:border-yellow-500/40 hover:text-white"
          >
            Fermer
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.3fr_0.7fr] md:px-8 md:py-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">Légende prête</p>
                  <p className="mt-2 text-sm text-white/70">
                    Utilise ce texte tel quel ou adapte-le avant de publier.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyValue(caption, "caption")}
                  disabled={!caption}
                  className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300 disabled:opacity-40"
                >
                  {copied === "caption" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copier
                </button>
              </div>

              <div className="mt-4 max-h-[240px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/85">
                {caption || "Aucune légende détectée. Ouvre l’éditeur pour enrichir le contenu avant publication."}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">Visuel / média</p>
                  <p className="mt-2 text-sm text-white/70">
                    LGD essaie d’afficher le rendu final réel en respectant le format du design.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyValue(mediaUrl, "media")}
                    disabled={!mediaUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 disabled:opacity-40"
                  >
                    {copied === "media" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    Copier le lien
                  </button>

                  {mediaUrl && (
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-300"
                    >
                      <Download className="h-4 w-4" />
                      Ouvrir le média
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/70">
                {previewCanvas ? (
                  <PreviewCanvasView canvas={previewCanvas} />
                ) : mediaUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/85">
                      <ImageIcon className="h-4 w-4 text-yellow-400" />
                      Média détecté pour cette publication.
                    </div>
                    <img
                      src={mediaUrl}
                      alt="preview"
                      className="max-h-[420px] w-full rounded-xl border border-white/10 object-contain bg-black/40"
                    />
                    <div className="break-all rounded-xl bg-black/30 px-3 py-2 text-xs text-white/55">
                      {mediaUrl}
                    </div>
                  </div>
                ) : (
                  <p>
                    Aucun média détecté automatiquement. Utilise l’éditeur intelligent ou la bibliothèque pour récupérer le visuel.
                  </p>
                )}

                {!previewCanvas && mediaUrls.length > 1 && (
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.18em] text-yellow-300/80">
                      Médias détectés
                    </p>
                    <div className="space-y-2">
                      {mediaUrls.slice(0, 6).map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="break-all rounded-lg bg-black/30 px-3 py-2 text-[11px] text-white/55"
                        >
                          {index + 1}. {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {slides.length > 1 && (
                  <p className="text-xs text-yellow-300/90">
                    Ce carrousel contient {slides.length} slides. LGD affiche ici la première composition exploitable détectée.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-yellow-300/85">Flux recommandé</p>
              <ol className="mt-4 space-y-3 text-sm text-white/80">
                <li>1. Copie la légende LGD.</li>
                <li>2. Ouvre {network || "le réseau"} dans un nouvel onglet.</li>
                <li>3. Vérifie l’aperçu réel du format puis ajoute le média préparé.</li>
                <li>4. Publie manuellement et reviens marquer la publication comme envoyée.</li>
              </ol>

              {networkUrl && (
                <a
                  href={networkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400 px-4 py-3 text-sm font-extrabold text-black hover:opacity-95"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir {network || "le réseau"}
                </a>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#121212] p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/40">Suivi Planner</p>
              <p className="mt-3 text-sm text-white/70">
                Garde ton calendrier propre même sans auto-publication Meta.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  onClick={() => handleMark("published")}
                  disabled={saving !== ""}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-yellow-400 px-4 py-3 text-sm font-extrabold text-black hover:opacity-95 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {saving === "published"
                    ? "Mise à jour..."
                    : isPublished
                    ? "Confirmer publication"
                    : "Marquer comme publié"}
                </button>

                <button
                  type="button"
                  onClick={() => handleMark("scheduled")}
                  disabled={saving !== ""}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:border-yellow-500/30 disabled:opacity-60"
                >
                  <Undo2 className="h-4 w-4" />
                  {saving === "scheduled" ? "Mise à jour..." : "Remettre en planifié"}
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/55">
                Statut actuel : <span className="text-white/80">{isPublished ? "Publié" : "Planifié"}</span>
                <br />
                Publication assistée = LGD prépare le contenu, l’horaire et le suivi. L’utilisateur garde le contrôle final sur le clic publier.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
