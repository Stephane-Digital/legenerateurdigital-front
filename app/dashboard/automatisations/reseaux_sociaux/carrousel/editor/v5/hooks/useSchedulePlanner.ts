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

function isHugeDataUrl(value: unknown) {
  return (
    typeof value === "string" &&
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value)
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
    const src =
      layer.src || layer.url || layer.image_url || layer.imageUrl || "";
    return {
      id: String(layer.id || `image-${Date.now()}`),
      type: "image",
      has_image: !!src,
      // Ne jamais envoyer de base64/canvas complet au Planner.
      image_url: isHugeDataUrl(src) ? undefined : src || undefined,
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


function firstStringValue(...values: any[]) {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const v = value.trim();
    if (v) return v;
  }
  return "";
}

function looksLikePlannerVisual(value: unknown) {
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("blob:") ||
    v.startsWith("data:image/")
  );
}

function extractVisualFromLayers(layers: any): string {
  if (!Array.isArray(layers)) return "";

  for (const layer of layers) {
    if (!layer || typeof layer !== "object") continue;

    const candidate = firstStringValue(
      layer.planner_preview_image,
      layer.preview_image,
      layer.rendered_image,
      layer.src,
      layer.url,
      layer.image,
      layer.imageUrl,
      layer.image_url,
      layer.media_url,
      layer.mediaUrl,
      layer.preview_url,
      layer.previewUrl,
      layer.thumbnail_url,
      layer.thumbnailUrl,
      layer.background,
      layer.backgroundUrl,
      layer.background_url,
    );

    if (looksLikePlannerVisual(candidate)) return candidate;
  }

  return "";
}

function extractVisualFromSlides(slides: any): string {
  if (!Array.isArray(slides)) return "";

  for (const slide of slides) {
    if (!slide || typeof slide !== "object") continue;

    const direct = firstStringValue(
      slide.planner_preview_image,
      slide.preview_image,
      slide.rendered_image,
      slide.image_url,
      slide.media_url,
      slide.imageUrl,
      slide.mediaUrl,
      slide.preview_url,
      slide.previewUrl,
      slide.thumbnail_url,
      slide.thumbnailUrl,
      slide.src,
      slide.url,
      slide.background,
      slide.backgroundUrl,
      slide.background_url,
    );

    if (looksLikePlannerVisual(direct)) return direct;

    const fromLayers =
      extractVisualFromLayers(slide.layers) ||
      extractVisualFromLayers(slide.elements) ||
      extractVisualFromLayers(slide.objects);

    if (looksLikePlannerVisual(fromLayers)) return fromLayers;
  }

  return "";
}

function extractPlannerVisualSource(source: any): string {
  if (!source || typeof source !== "object") return "";

  const direct = firstStringValue(
    source.planner_preview_image,
    source.plannerPreviewImage,
    source.preview_image,
    source.previewImage,
    source.rendered_image,
    source.renderedImage,
    source.media_url,
    source.mediaUrl,
    source.image_url,
    source.imageUrl,
    source.preview_url,
    source.previewUrl,
    source.thumbnail_url,
    source.thumbnailUrl,
    source.cover_url,
    source.coverUrl,
  );

  if (looksLikePlannerVisual(direct)) return direct;

  const nested =
    extractPlannerVisualSource(source.payload) ||
    extractPlannerVisualSource(source.draft) ||
    extractPlannerVisualSource(source.canvas) ||
    extractPlannerVisualSource(source.editor);

  if (looksLikePlannerVisual(nested)) return nested;

  const fromLayers =
    extractVisualFromLayers(source.layers) ||
    extractVisualFromLayers(source.elements) ||
    extractVisualFromLayers(source.objects);

  if (looksLikePlannerVisual(fromLayers)) return fromLayers;

  const fromSlides = extractVisualFromSlides(source.slides);
  if (looksLikePlannerVisual(fromSlides)) return fromSlides;

  return "";
}

function extractCaptionFromLayers(layers: any[]) {
  const text = layers
    .map((layer) => (layer?.type === "text" ? String(layer.text || "") : ""))
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return trimString(text, 1800);
}

const PLANNER_PREVIEW_CACHE_KEY = "lgd_planner_preview_cache_v1";

type PlannerPreviewCacheItem = {
  preview_image: string;
  title?: string;
  titre?: string;
  network?: string;
  scheduled_at?: string;
  created_at: number;
};

function readPlannerPreviewCache(): Record<string, PlannerPreviewCacheItem> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PLANNER_PREVIEW_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function writePlannerPreviewCache(
  cache: Record<string, PlannerPreviewCacheItem>,
) {
  if (typeof window === "undefined") return;
  try {
    const entries = Object.entries(cache)
      .filter(([, item]) => !!item?.preview_image)
      .sort(
        (a, b) => Number(b[1]?.created_at || 0) - Number(a[1]?.created_at || 0),
      )
      .slice(0, 8);
    window.localStorage.setItem(
      PLANNER_PREVIEW_CACHE_KEY,
      JSON.stringify(Object.fromEntries(entries)),
    );
  } catch {
    // Le Planner doit rester fonctionnel même si le cache navigateur est plein.
  }
}

function addPlannerPreviewCacheKeys(
  cache: Record<string, PlannerPreviewCacheItem>,
  keys: Array<string | number | null | undefined>,
  item: PlannerPreviewCacheItem,
) {
  for (const rawKey of keys) {
    const key = String(rawKey ?? "").trim();
    if (!key) continue;
    cache[key] = item;
  }
}

function cachePlannerPreviewAfterSchedule(
  result: any,
  body: any,
  previewImage: string,
) {
  if (!previewImage || !isHugeDataUrl(previewImage)) return;

  const item: PlannerPreviewCacheItem = {
    preview_image: previewImage,
    title: body?.titre || body?.title || body?.contenu?.title || "",
    titre: body?.titre || body?.title || body?.contenu?.title || "",
    network: body?.network || "",
    scheduled_at: body?.scheduled_at || "",
    created_at: Date.now(),
  };

  const cache = readPlannerPreviewCache();
  const ids = [
    result?.id,
    result?.post_id,
    result?.planner_id,
    result?.data?.id,
    result?.post?.id,
    result?.item?.id,
  ];
  const semanticKey = `${item.network}|${item.scheduled_at}|${item.titre}`;
  const looseTitleKey = `title|${item.titre}`;
  const looseNetworkTitleKey = `${item.network}|${item.titre}`;

  addPlannerPreviewCacheKeys(
    cache,
    [...ids, semanticKey, looseTitleKey, looseNetworkTitleKey, "__latest__"],
    item,
  );
  writePlannerPreviewCache(cache);
}

const PLANNER_EDITOR_PAYLOAD_CACHE_KEY = "lgd_planner_editor_payload_cache_v1";

type PlannerEditorPayloadCacheItem = {
  payload: any;
  title?: string;
  titre?: string;
  network?: string;
  scheduled_at?: string;
  created_at: number;
};

function readPlannerEditorPayloadCache(): Record<
  string,
  PlannerEditorPayloadCacheItem
> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PLANNER_EDITOR_PAYLOAD_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function writePlannerEditorPayloadCache(
  cache: Record<string, PlannerEditorPayloadCacheItem>,
) {
  if (typeof window === "undefined") return;
  try {
    const entries = Object.entries(cache)
      .filter(([, item]) => !!item?.payload)
      .sort(
        (a, b) => Number(b[1]?.created_at || 0) - Number(a[1]?.created_at || 0),
      )
      .slice(0, 6);
    window.localStorage.setItem(
      PLANNER_EDITOR_PAYLOAD_CACHE_KEY,
      JSON.stringify(Object.fromEntries(entries)),
    );
  } catch {
    // Ne jamais bloquer l’envoi Planner si le navigateur refuse le cache local.
  }
}

const PLANNER_MEDIA_IDB_NAME = "lgd_planner_media_cache_v1";
const PLANNER_MEDIA_IDB_STORE = "items";

type PlannerMediaCacheItem = PlannerEditorPayloadCacheItem & {
  preview_image?: string;
  planner_preview_image?: string;
  rendered_image?: string;
};

function openPlannerMediaDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window))
    return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = window.indexedDB.open(PLANNER_MEDIA_IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PLANNER_MEDIA_IDB_STORE)) {
        db.createObjectStore(PLANNER_MEDIA_IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function writePlannerMediaCacheToIDB(
  keys: Array<string | number | null | undefined>,
  item: PlannerMediaCacheItem,
) {
  const cleanKeys = keys.map((key) => String(key ?? "").trim()).filter(Boolean);
  if (!cleanKeys.length || !item?.payload) return;

  const db = await openPlannerMediaDB();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(PLANNER_MEDIA_IDB_STORE, "readwrite");
      const store = tx.objectStore(PLANNER_MEDIA_IDB_STORE);
      for (const key of cleanKeys) {
        store.put(item, key);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  }).finally(() => {
    try {
      db.close();
    } catch {
      // ignore
    }
  });
}

async function cachePlannerEditorPayloadAfterSchedule(
  result: any,
  body: any,
  originalPayload: any,
) {
  if (typeof window === "undefined") return;

  const title = String(
    body?.titre ||
      body?.title ||
      body?.contenu?.title ||
      originalPayload?.title ||
      originalPayload?.titre ||
      "",
  ).trim();
  const network = String(body?.network || "").trim();
  const scheduledAt = String(body?.scheduled_at || "").trim();

  const original =
    originalPayload && typeof originalPayload === "object"
      ? originalPayload
      : {};
  const compact =
    body?.contenu && typeof body.contenu === "object" ? body.contenu : {};

  const payload = {
    ...compact,
    ...original,
    title,
    titre: title,
    network,
    scheduled_at: scheduledAt,
    type: body?.format || original?.type || compact?.type || "post",
    // Important : le cache local doit conserver le draft vivant complet.
    // Les données compactées envoyées à l’API ne doivent jamais écraser
    // les layers/slides complets utilisés par le modal pour reconstruire le visuel.
    layers: Array.isArray(original?.layers)
      ? original.layers
      : Array.isArray(compact?.layers)
        ? compact.layers
        : undefined,
    slides: Array.isArray(original?.slides)
      ? original.slides
      : Array.isArray(compact?.slides)
        ? compact.slides
        : undefined,
    ui: original?.ui || compact?.ui || undefined,
    preview_image:
      body?.preview_image ||
      compact?.preview_image ||
      original?.preview_image ||
      undefined,
    planner_preview_image:
      body?.planner_preview_image ||
      compact?.planner_preview_image ||
      original?.planner_preview_image ||
      undefined,
    rendered_image:
      body?.rendered_image ||
      compact?.rendered_image ||
      original?.rendered_image ||
      undefined,
  };

  const item: PlannerEditorPayloadCacheItem = {
    payload,
    title,
    titre: title,
    network,
    scheduled_at: scheduledAt,
    created_at: Date.now(),
  };

  const cache = readPlannerEditorPayloadCache();
  const ids = [
    result?.id,
    result?.post_id,
    result?.planner_id,
    result?.data?.id,
    result?.post?.id,
    result?.item?.id,
  ];
  const keys = [
    ...ids,
    `${network}|${scheduledAt}|${title}`,
    `title|${title}`,
    `${network}|${title}`,
    "__latest__",
  ];

  addPlannerPreviewCacheKeys(cache as any, keys, item as any);
  writePlannerEditorPayloadCache(cache);

  await writePlannerMediaCacheToIDB(keys, {
    ...item,
    preview_image:
      payload?.preview_image ||
      payload?.planner_preview_image ||
      payload?.rendered_image ||
      undefined,
    planner_preview_image:
      payload?.planner_preview_image ||
      payload?.preview_image ||
      payload?.rendered_image ||
      undefined,
    rendered_image:
      payload?.rendered_image ||
      payload?.planner_preview_image ||
      payload?.preview_image ||
      undefined,
  });
}

function compactContentForPlanner(
  input: any,
  fallbackTitle?: string,
  fallbackFormat?: string,
) {
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
        const slideLayers = compactLayers(
          slide?.layers || slide?.elements || [],
        );
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

  const previewImage = extractPlannerVisualSource(source);

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
      
      const previewImage = extractPlannerVisualSource(originalContent);

      alert(
  `LGD DEBUG\n\npreviewImage=${previewImage ? "TROUVEE" : "VIDE"}`
);

      
      const title =
        payload.titre ||
        originalContent?.titre ||
        originalContent?.title ||
        (isCarrousel ? "Carrousel planifié" : "Post planifié");

      const fullContent = {
        ...originalContent,
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
              slides: Array.isArray(originalContent?.slides)
                ? originalContent.slides
                : Array.isArray(payload.slides)
                  ? payload.slides
                  : [],
            }
          : {
              layers: Array.isArray(originalContent?.layers)
                ? originalContent.layers
                : [],
            }),
        preview_image: previewImage || undefined,
        planner_preview_image: previewImage || undefined,
        rendered_image: previewImage || undefined,
        media_url: previewImage || undefined,
        image_url: previewImage || undefined,
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
        preview_image: previewImage || undefined,
        planner_preview_image: previewImage || undefined,
        rendered_image: previewImage || undefined,
        media_url: previewImage || undefined,
        image_url: previewImage || undefined,
        ...(isCarrousel
          ? {
              carrousel_id:
                payload.carrousel_id ??
                originalContent?.carrousel_id ??
                originalContent?.id ??
                null,
              slides: Array.isArray(fullContent.slides) ? fullContent.slides : [],
            }
          : {}),
        contenu: fullContent,
      };

      // LGD — cache média immédiat avant appel API : le modal Planner doit pouvoir
      // récupérer le visuel même si la liste Planner renvoie un payload compacté
      // ou si le fetch secondaire /planner/posts arrive avant la synchro backend.
      await cachePlannerEditorPayloadAfterSchedule(
        {
          id: "__pending__",
          post_id: "__pending__",
          planner_id: "__pending__",
        },
        body,
        payload.contenu,
      );

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

      const result = await res.json().catch(() => null);
      cachePlannerPreviewAfterSchedule(result, body, previewImage);
      await cachePlannerEditorPayloadAfterSchedule(
        result,
        body,
        payload.contenu,
      );
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { schedule, loading };
}

export default useSchedulePlanner;
