"use client";

import { useCallback, useState } from "react";

type Network = "instagram" | "facebook" | "linkedin" | string;

type SchedulePayload = {
  reseau?: Network;
  network?: Network;

  date_programmee?: string;
  scheduled_at?: string;

  statut?: string;
  supprimer_apres?: boolean;

  titre?: string;
  format?: "post" | "carrousel" | string;
  archive?: boolean;

  contenu?: any;

  carrousel_id?: number | string;
  slides?: any[];
};

function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "");
}

function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("lgd_token") ||
      localStorage.getItem("jwt") ||
      null
    );
  } catch {
    return null;
  }
}

function pickNetwork(payload: SchedulePayload): string {
  return String(payload.network || payload.reseau || "instagram").toLowerCase().trim();
}

function pickScheduledAt(payload: SchedulePayload): string {
  return String(payload.scheduled_at || payload.date_programmee || "").trim();
}

function looksLikeCarrousel(payload: SchedulePayload): boolean {
  if ((payload.format || "").toLowerCase() === "carrousel") return true;
  if (payload.carrousel_id != null) return true;
  if (Array.isArray(payload.slides) && payload.slides.length > 0) return true;

  const c = payload.contenu;
  if (c && typeof c === "object") {
    if (String(c.type || "").toLowerCase() === "carrousel") return true;
    if (c.carrousel_id != null) return true;
    if (Array.isArray(c.slides) && c.slides.length > 0) return true;
  }

  return false;
}

function isHugeDataUrl(value: unknown) {
  return typeof value === "string" && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value);
}

function looksLikeImageSource(value: unknown) {
  const v = String(value || "").trim();
  return (
    v.startsWith("data:image/") ||
    v.startsWith("blob:") ||
    v.startsWith("http://") ||
    v.startsWith("https://")
  );
}

function firstImageSourceFromLayer(layer: any): string {
  if (!layer || typeof layer !== "object") return "";

  const candidates = [
    layer.planner_preview_image,
    layer.plannerPreviewImage,
    layer.preview_image,
    layer.previewImage,
    layer.rendered_image,
    layer.renderedImage,
    layer.src,
    layer.url,
    layer.image_url,
    layer.imageUrl,
    layer.media_url,
    layer.mediaUrl,
    layer.preview_url,
    layer.previewUrl,
    layer.thumbnail_url,
    layer.thumbnailUrl,
    layer.background,
    layer.background_url,
    layer.backgroundUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && looksLikeImageSource(candidate)) {
      return candidate.trim();
    }
  }

  return "";
}

function findPreviewImageDeep(value: any): string {
  const wantedKeys = new Set([
    "planner_preview_image",
    "plannerPreviewImage",
    "preview_image",
    "previewImage",
    "rendered_image",
    "renderedImage",
    "exact_preview_image",
    "exactPreviewImage",
    "media_url",
    "mediaUrl",
    "image_url",
    "imageUrl",
    "src",
  ]);

  const seen = new Set<any>();

  const walk = (node: any): string => {
    if (!node || typeof node !== "object" || seen.has(node)) return "";
    seen.add(node);

    const layerCandidate = firstImageSourceFromLayer(node);
    if (layerCandidate) return layerCandidate;

    for (const [key, raw] of Object.entries(node)) {
      if (!wantedKeys.has(key)) continue;
      if (typeof raw === "string" && looksLikeImageSource(raw)) return raw.trim();
    }

    for (const raw of Object.values(node)) {
      const found = walk(raw);
      if (found) return found;
    }

    return "";
  };

  return walk(value);
}

function trimString(value: unknown, max = 1200) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function extractTextFromLayer(layer: any) {
  if (!layer || typeof layer !== "object") return "";
  const type = String(layer.type || "").toLowerCase();
  if (type !== "text") return "";
  return trimString(layer.text ?? layer.value ?? layer.content ?? "", 800);
}

function compactLayer(layer: any) {
  if (!layer || typeof layer !== "object") return null;

  const type = String(layer.type || "").toLowerCase();

  if (type === "text") {
    const text = extractTextFromLayer(layer);
    if (!text) return null;

    return {
      id: String(layer.id || `text-${Date.now()}`),
      type: "text",
      text,
    };
  }

  if (type === "image") {
    const src = firstImageSourceFromLayer(layer);
    return {
      id: String(layer.id || `image-${Date.now()}`),
      type: "image",
      has_image: !!src,
      // LGD mobile planner fix : conserver une référence exploitable.
      // Si l'éditeur mobile n'a pas encore généré d'aperçu final, le Planner
      // peut au moins détecter et afficher l'image runtime/importée.
      image_url: src || undefined,
      src: src || undefined,
      preview_image: src || undefined,
    };
  }

  return {
    id: String(layer.id || `${type || "layer"}-${Date.now()}`),
    type: type || "layer",
  };
}

function compactLayers(layers: any): any[] {
  if (!Array.isArray(layers)) return [];
  return layers.map(compactLayer).filter(Boolean);
}

function extractCaptionFromLayers(layers: any[]) {
  const text = layers
    .map((layer) => (layer?.type === "text" ? String(layer.text || "") : ""))
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return trimString(text, 1800);
}

function compactContentForPlanner(input: any, fallbackTitle?: string, fallbackFormat?: string) {
  const source = input && typeof input === "object" ? input : {};
  const rawLayers =
    source.layers ||
    source.canvas?.layers ||
    source.draft?.layers ||
    source.payload?.layers ||
    [];

  const rawSlides =
    source.slides ||
    source.canvas?.slides ||
    source.draft?.slides ||
    source.payload?.slides ||
    [];

  const layers = compactLayers(rawLayers);
  const slides = Array.isArray(rawSlides)
    ? rawSlides.slice(0, 20).map((slide: any, index: number) => {
        const slideLayers = compactLayers(slide?.layers || slide?.elements || []);
        const slidePreview = findPreviewImageDeep(slide) || findPreviewImageDeep(slideLayers);
        return {
          id: String(slide?.id || `slide-${index + 1}`),
          layers: slideLayers,
          caption: extractCaptionFromLayers(slideLayers),
          preview_image: slidePreview || undefined,
          planner_preview_image: slidePreview || undefined,
          rendered_image: slidePreview || undefined,
        };
      })
    : [];

  const type = String(source.type || source.kind || fallbackFormat || (slides.length ? "carrousel" : "post")).toLowerCase();
  const title = trimString(source.title || source.titre || fallbackTitle || (type === "carrousel" ? "Carrousel planifié" : "Post planifié"), 180);
  const caption =
    trimString(
      source.caption ||
        source.text ||
        source.texte ||
        source.description ||
        extractCaptionFromLayers(layers) ||
        (slides[0]?.caption || ""),
      2000
    ) || "";

  const previewImage =
    source.planner_preview_image ||
    source.plannerPreviewImage ||
    source.preview_image ||
    source.previewImage ||
    source.rendered_image ||
    source.renderedImage ||
    findPreviewImageDeep(source) ||
    findPreviewImageDeep(rawLayers) ||
    findPreviewImageDeep(rawSlides) ||
    "";

  return {
    type: type.includes("carrousel") || type.includes("carousel") ? "carrousel" : "post",
    title,
    titre: title,
    caption,
    text: caption,
    format: fallbackFormat || source.format || type,
    // Résumé léger pour le Planner.
    layers,
    slides,
    has_visual: !!previewImage || layers.length > 0 || slides.length > 0,
    source: "editor",
    // LGD FIX — aperçu fidèle du modal Planner.
    // On conserve seulement l'image de rendu finale, pas tout le draft brut.
    preview_image: previewImage || undefined,
    planner_preview_image: previewImage || undefined,
    rendered_image: previewImage || undefined,
  };
}

function compactSlidesForPlanner(slides: any): any[] {
  if (!Array.isArray(slides)) return [];
  return slides.slice(0, 20).map((slide: any, index: number) => {
    const layers = compactLayers(slide?.layers || slide?.elements || []);
    return {
      id: String(slide?.id || `slide-${index + 1}`),
      layers,
      caption: extractCaptionFromLayers(layers),
    };
  });
}

export function useSchedulePlanner() {
  const [loading, setLoading] = useState(false);

  const schedule = useCallback(async (payload: SchedulePayload) => {
    setLoading(true);

    const token = getTokenFromStorage();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const network = pickNetwork(payload);
    const scheduled_at = pickScheduledAt(payload);

    try {
      const isCarrousel = looksLikeCarrousel(payload);
      const endpoint = isCarrousel ? "/planner/schedule-carrousel" : "/planner/schedule-post";

      const compactContent = compactContentForPlanner(
        payload.contenu,
        payload.titre,
        isCarrousel ? "carrousel" : payload.format || "post"
      );

      const compactSlides = compactSlidesForPlanner(payload.slides ?? payload.contenu?.slides ?? []);

      const body = isCarrousel
        ? {
            network,
            scheduled_at,
            supprimer_apres: !!payload.supprimer_apres,
            carrousel_id:
              payload.carrousel_id ??
              payload.contenu?.carrousel_id ??
              payload.contenu?.id ??
              null,
            slides: compactSlides.length ? compactSlides : compactContent.slides || [],
            titre: payload.titre ?? compactContent.title,
            format: "carrousel",
            contenu: {
              ...compactContent,
              type: "carrousel",
              slides: compactSlides.length ? compactSlides : compactContent.slides || [],
            },
          }
        : {
            network,
            scheduled_at,
            supprimer_apres: !!payload.supprimer_apres,
            titre: payload.titre ?? compactContent.title,
            format: payload.format ?? "post",
            contenu: {
              ...compactContent,
              type: "post",
            },
          };

      const res = await fetch(`${getApiBase()}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (res.status === 401) {
        throw new Error("Non authentifié (401) — cookies/token non envoyés ou expirés.");
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Erreur API (${res.status}) ${text || ""}`.trim());
      }

      return await res.json().catch(() => null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedule, loading };
}

export default useSchedulePlanner;
