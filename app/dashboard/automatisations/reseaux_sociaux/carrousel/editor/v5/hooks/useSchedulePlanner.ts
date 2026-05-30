"use client";

import { useCallback, useState } from "react";
import { renderEditorCreationToDataUrl } from "../../utils/downloadEditorCreation";

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

function pickLayerImageSource(layer: any) {
  return String(
    layer?.src ||
      layer?.url ||
      layer?.image_url ||
      layer?.imageUrl ||
      layer?.media_url ||
      layer?.mediaUrl ||
      layer?.preview_url ||
      layer?.previewUrl ||
      ""
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
    };
  }

  if (type === "image") {
    const src = pickLayerImageSource(layer);
    return {
      id: String(layer.id || `image-${Date.now()}`),
      type: "image",
      has_image: !!src,
      // IMPORTANT LGD : on conserve src même si c'est un data:image.
      // Le Planner peut ainsi reconstruire le bon visuel si l'aperçu final manque.
      src: src || undefined,
      url: !isHugeDataUrl(src) ? src || undefined : undefined,
      image_url: !isHugeDataUrl(src) ? src || undefined : undefined,
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

function compactContentForPlanner(input: any, fallbackTitle?: string, fallbackFormat?: string, freshPreviewImage = "") {
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

  const hasEditablePayload =
    (Array.isArray(rawLayers) && rawLayers.length > 0) ||
    (Array.isArray(rawSlides) && rawSlides.length > 0);

  const layers = compactLayers(rawLayers);
  const slides = Array.isArray(rawSlides)
    ? rawSlides.slice(0, 20).map((slide: any, index: number) => {
        const slideLayers = compactLayers(slide?.layers || slide?.elements || []);
        return {
          id: String(slide?.id || `slide-${index + 1}`),
          layers: slideLayers,
          caption: extractCaptionFromLayers(slideLayers),
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

  const storedPreviewImage =
    source.planner_preview_image ||
    source.plannerPreviewImage ||
    source.preview_image ||
    source.previewImage ||
    source.rendered_image ||
    source.renderedImage ||
    "";

  // Si le contenu courant contient des layers/slides, l'ancien aperçu stocké n'est plus fiable.
  // On privilégie donc uniquement l'aperçu fraîchement rendu au moment de l'envoi Planner.
  const previewImage = freshPreviewImage || (hasEditablePayload ? "" : storedPreviewImage);

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

function extractRawLayers(input: any): any[] {
  const source = input && typeof input === "object" ? input : {};
  const raw =
    source.layers ||
    source.canvas?.layers ||
    source.draft?.layers ||
    source.payload?.layers ||
    [];
  return Array.isArray(raw) ? raw : [];
}

function extractRawSlides(input: any): any[] {
  const source = input && typeof input === "object" ? input : {};
  const raw =
    source.slides ||
    source.canvas?.slides ||
    source.draft?.slides ||
    source.payload?.slides ||
    [];
  return Array.isArray(raw) ? raw : [];
}

async function buildFreshPlannerPreview(input: any, isCarrousel: boolean): Promise<string> {
  if (typeof window === "undefined") return "";

  const source = input && typeof input === "object" ? input : {};
  const rawLayers = extractRawLayers(source);
  const rawSlides = extractRawSlides(source);

  try {
    if (isCarrousel && rawSlides.length > 0) {
      const slides = rawSlides
        .map((slide: any, index: number) => ({
          id: String(slide?.id || `slide-${index + 1}`),
          ui: slide?.ui || source?.ui || source?.canvas?.ui || source?.draft?.ui,
          layers: Array.isArray(slide?.layers)
            ? slide.layers
            : Array.isArray(slide?.elements)
              ? slide.elements
              : [],
        }))
        .filter((slide: any) => Array.isArray(slide.layers) && slide.layers.length > 0);

      if (slides.length > 0) {
        return await renderEditorCreationToDataUrl({
          mode: "carrousel",
          draft: { ui: source?.ui || source?.canvas?.ui || source?.draft?.ui, slides },
          slideIndex: 0,
        });
      }
    }

    if (rawLayers.length > 0) {
      return await renderEditorCreationToDataUrl({
        mode: "post",
        draft: { ui: source?.ui || source?.canvas?.ui || source?.draft?.ui, layers: rawLayers },
      });
    }
  } catch (error) {
    console.error("[LGD Planner] fresh preview render failed", error);
  }

  return "";
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

      const freshPreviewImage = await buildFreshPlannerPreview(payload.contenu, isCarrousel);

      const compactContent = compactContentForPlanner(
        payload.contenu,
        payload.titre,
        isCarrousel ? "carrousel" : payload.format || "post",
        freshPreviewImage
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
            preview_image: freshPreviewImage || undefined,
            planner_preview_image: freshPreviewImage || undefined,
            rendered_image: freshPreviewImage || undefined,
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
            preview_image: freshPreviewImage || undefined,
            planner_preview_image: freshPreviewImage || undefined,
            rendered_image: freshPreviewImage || undefined,
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
