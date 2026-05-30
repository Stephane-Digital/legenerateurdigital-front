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
  return String(payload.network || payload.reseau || "instagram")
    .toLowerCase()
    .trim();
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

function isImageLike(value: unknown) {
  const text = String(value || "").trim();
  if (!text) return false;
  return (
    text.startsWith("data:image/") ||
    text.startsWith("blob:") ||
    text.startsWith("http://") ||
    text.startsWith("https://")
  );
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

function getLayerImage(layer: any) {
  if (!layer || typeof layer !== "object") return "";
  return String(
    layer.src ||
      layer.url ||
      layer.image ||
      layer.image_url ||
      layer.imageUrl ||
      layer.media_url ||
      layer.mediaUrl ||
      layer.preview_url ||
      layer.previewUrl ||
      "",
  ).trim();
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
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
      zIndex: layer.zIndex,
      style: layer.style,
    };
  }

  if (type === "image") {
    const src = getLayerImage(layer);
    return {
      id: String(layer.id || `image-${Date.now()}`),
      type: "image",
      has_image: !!src,
      image_url: src || undefined,
      src: src || undefined,
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
      zIndex: layer.zIndex,
      style: layer.style,
    };
  }

  return {
    id: String(layer.id || `${type || "layer"}-${Date.now()}`),
    type: type || "layer",
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    zIndex: layer.zIndex,
    style: layer.style,
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

function firstImageFromLayers(layers: any[]): string {
  for (const layer of layers || []) {
    const src = getLayerImage(layer);
    if (isImageLike(src)) return src;
  }
  return "";
}

function firstImageFromSlides(slides: any[]): string {
  for (const slide of slides || []) {
    const layers = Array.isArray(slide?.layers)
      ? slide.layers
      : Array.isArray(slide?.elements)
        ? slide.elements
        : [];
    const src = firstImageFromLayers(layers);
    if (src) return src;
  }
  return "";
}

function pickPreviewImage(source: any, layers: any[], slides: any[]) {
  const candidates = [
    source?.planner_preview_image,
    source?.plannerPreviewImage,
    source?.preview_image,
    source?.previewImage,
    source?.rendered_image,
    source?.renderedImage,
    source?.media_url,
    source?.mediaUrl,
    source?.image_url,
    source?.imageUrl,
    source?.cover_url,
    source?.coverUrl,
    firstImageFromLayers(layers),
    firstImageFromSlides(slides),
  ];

  for (const value of candidates) {
    const text = String(value || "").trim();
    if (isImageLike(text)) return text;
  }

  return "";
}

function getRawLayers(source: any) {
  return (
    source?.layers ||
    source?.canvas?.layers ||
    source?.draft?.layers ||
    source?.payload?.layers ||
    []
  );
}

function getRawSlides(source: any) {
  return (
    source?.slides ||
    source?.canvas?.slides ||
    source?.draft?.slides ||
    source?.payload?.slides ||
    []
  );
}

function compactContentForPlanner(input: any, fallbackTitle?: string, fallbackFormat?: string) {
  const source = input && typeof input === "object" ? input : {};
  const rawLayers = getRawLayers(source);
  const rawSlides = getRawSlides(source);

  const layers = compactLayers(rawLayers);
  const slides = Array.isArray(rawSlides)
    ? rawSlides.slice(0, 20).map((slide: any, index: number) => {
        const rawSlideLayers = slide?.layers || slide?.elements || [];
        const slideLayers = compactLayers(rawSlideLayers);
        return {
          id: String(slide?.id || `slide-${index + 1}`),
          layers: slideLayers,
          caption: extractCaptionFromLayers(slideLayers),
        };
      })
    : [];

  const type = String(
    source.type ||
      source.kind ||
      fallbackFormat ||
      (slides.length ? "carrousel" : "post"),
  ).toLowerCase();
  const title = trimString(
    source.title ||
      source.titre ||
      fallbackTitle ||
      (type === "carrousel" ? "Carrousel planifié" : "Post planifié"),
    180,
  );
  const caption =
    trimString(
      source.caption ||
        source.text ||
        source.texte ||
        source.description ||
        extractCaptionFromLayers(layers) ||
        slides[0]?.caption ||
        "",
      2000,
    ) || "";

  const previewImage = pickPreviewImage(source, Array.isArray(rawLayers) ? rawLayers : [], Array.isArray(rawSlides) ? rawSlides : []);

  return {
    type:
      type.includes("carrousel") || type.includes("carousel")
        ? "carrousel"
        : "post",
    title,
    titre: title,
    caption,
    text: caption,
    format: fallbackFormat || source.format || type,
    layers,
    slides,
    has_visual: !!previewImage || layers.length > 0 || slides.length > 0,
    source: "editor",
    preview_image: previewImage || undefined,
    planner_preview_image: previewImage || undefined,
    rendered_image: previewImage || undefined,
    media_url: previewImage || undefined,
    image_url: previewImage || undefined,
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
      const endpoint = isCarrousel
        ? "/planner/schedule-carrousel"
        : "/planner/schedule-post";

      const originalContent =
        payload.contenu && typeof payload.contenu === "object"
          ? payload.contenu
          : {};

      const rawLayers = Array.isArray(originalContent?.layers) ? originalContent.layers : [];
      const rawSlides = Array.isArray(originalContent?.slides)
        ? originalContent.slides
        : Array.isArray(payload.slides)
          ? payload.slides
          : [];

      const previewImage = pickPreviewImage(originalContent, rawLayers, rawSlides);

      const compactContent = compactContentForPlanner(
        {
          ...originalContent,
          preview_image: previewImage || originalContent?.preview_image,
          planner_preview_image: previewImage || originalContent?.planner_preview_image,
          rendered_image: previewImage || originalContent?.rendered_image,
          media_url: previewImage || originalContent?.media_url,
          image_url: previewImage || originalContent?.image_url,
        },
        payload.titre,
        isCarrousel ? "carrousel" : payload.format || "post",
      );

      const compactSlides = compactSlidesForPlanner(rawSlides);

      const title =
        payload.titre ||
        originalContent?.titre ||
        originalContent?.title ||
        compactContent.title ||
        (isCarrousel ? "Carrousel planifié" : "Post planifié");

      const fullContent = {
        ...originalContent,
        ...compactContent,
        type: isCarrousel ? "carrousel" : "post",
        format: isCarrousel ? "carrousel" : payload.format || "post",
        title,
        titre: title,
        network,
        reseau: network,
        scheduled_at,
        date_programmee: scheduled_at,
        source: originalContent?.source || "editor",
        ui: originalContent?.ui || {},
        ...(isCarrousel
          ? {
              slides: rawSlides,
              compact_slides: compactSlides.length ? compactSlides : compactContent.slides || [],
            }
          : {
              layers: rawLayers,
              compact_layers: compactContent.layers || [],
            }),
        has_visual: !!previewImage || rawLayers.length > 0 || rawSlides.length > 0,
        preview_image: previewImage || undefined,
        planner_preview_image: previewImage || undefined,
        rendered_image: previewImage || undefined,
        media_url: previewImage || undefined,
        image_url: previewImage || undefined,
        preview_generated_at: new Date().toISOString(),
      };

      const body = {
        reseau: network,
        network,
        scheduled_at,
        date_programmee: scheduled_at,
        supprimer_apres: !!payload.supprimer_apres,
        statut: payload.statut || "scheduled",
        status: payload.statut || "scheduled",
        titre: title,
        title,
        format: isCarrousel ? "carrousel" : payload.format || "post",
        has_visual: fullContent.has_visual,
        preview_image: previewImage || undefined,
        planner_preview_image: previewImage || undefined,
        rendered_image: previewImage || undefined,
        media_url: previewImage || undefined,
        image_url: previewImage || undefined,
        preview_generated_at: fullContent.preview_generated_at,
        ...(isCarrousel
          ? {
              carrousel_id:
                payload.carrousel_id ??
                originalContent?.carrousel_id ??
                originalContent?.id ??
                null,
              slides: rawSlides,
            }
          : {}),
        contenu: fullContent,
      };

      const res = await fetch(`${getApiBase()}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
      });

      if (res.status === 401) {
        throw new Error(
          "Non authentifié (401) — cookies/token non envoyés ou expirés.",
        );
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
