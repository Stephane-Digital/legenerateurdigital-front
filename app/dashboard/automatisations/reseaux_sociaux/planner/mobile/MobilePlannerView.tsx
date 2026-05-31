"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PlannerPost = Record<string, any>;

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
};

function getAuthHeaders() {
  if (typeof window === "undefined") return {};

  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    window.localStorage.getItem("lgd_token") ||
    "";

  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

function looksLikeImageUrl(value: string) {
  const v = String(value || "").toLowerCase();
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("blob:") ||
    v.startsWith("data:image/")
  );
}

function extractLayers(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function extractSlides(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function unwrapPayload(root: any): any[] {
  const out: any[] = [];
  const seen = new Set<any>();

  const visit = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (seen.has(node)) return;
    seen.add(node);
    out.push(node);

    visit(node.payload);
    visit(node.data);
    visit(node.draft);
    visit(node.content);
    visit(node.contenu);
    visit(node.editor);
    visit(node.canvas);
    visit(node.raw);
  };

  visit(root);
  return out;
}

function getImageFromLayer(layer: any) {
  return firstNonEmptyString(
    layer?.src,
    layer?.url,
    layer?.image,
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
  );
}

function getTextFromLayer(layer: any) {
  return firstNonEmptyString(
    layer?.text,
    layer?.content,
    layer?.value,
    layer?.label,
    layer?.title,
    layer?.name,
  );
}

function normalizeLayer(raw: any, index: number): PreviewLayer | null {
  if (!raw || typeof raw !== "object") return null;

  const typeRaw = String(raw?.type || raw?.kind || raw?.layerType || "").toLowerCase();
  const src = getImageFromLayer(raw);
  const text = getTextFromLayer(raw);

  const type: PreviewLayer["type"] = typeRaw.includes("background")
    ? "background"
    : typeRaw.includes("image") || !!src
      ? "image"
      : "text";

  if (type === "image" && !src) return null;
  if (type === "text" && !text) return null;

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
      opacity: raw?.opacity ?? raw?.style?.opacity,
      background: raw?.background ?? raw?.style?.background,
    },
  };
}

function inferCanvasSize(layers: PreviewLayer[], root: any) {
  const w = Number(root?.width ?? root?.w ?? root?.canvasWidth ?? root?.formatWidth ?? root?.ui?.width ?? root?.ui?.w ?? 0);
  const h = Number(root?.height ?? root?.h ?? root?.canvasHeight ?? root?.formatHeight ?? root?.ui?.height ?? root?.ui?.h ?? 0);

  if (w > 0 && h > 0) return { width: w, height: h };

  let maxX = 1080;
  let maxY = 1080;
  for (const layer of layers) {
    maxX = Math.max(maxX, (layer.x || 0) + (layer.width || (layer.type === "text" ? 420 : 300)));
    maxY = Math.max(maxY, (layer.y || 0) + (layer.height || (layer.type === "text" ? 160 : 300)));
  }

  return { width: Math.max(300, Math.round(maxX)), height: Math.max(300, Math.round(maxY)) };
}

function extractPreviewCanvas(post: PlannerPost, parsed: any): PreviewCanvas | null {
  const roots = unwrapPayload({ ...post, ...(parsed && typeof parsed === "object" ? parsed : {}) });

  for (const root of roots) {
    const layerGroups = [root?.layers, root?.elements, root?.objects, root?.json_layers];
    for (const group of layerGroups) {
      const rawLayers = extractLayers(group);
      if (!rawLayers.length) continue;
      const layers = rawLayers.map(normalizeLayer).filter(Boolean) as PreviewLayer[];
      if (!layers.length) continue;
      const size = inferCanvasSize(layers, root);
      return { width: size.width, height: size.height, layers };
    }

    const slides = extractSlides(root?.slides);
    for (const slide of slides) {
      const slideLayers = extractLayers(slide?.layers || slide?.elements || slide?.objects);
      if (!slideLayers.length) continue;
      const layers = slideLayers.map(normalizeLayer).filter(Boolean) as PreviewLayer[];
      if (!layers.length) continue;
      const size = inferCanvasSize(layers, slide || root);
      return { width: size.width, height: size.height, layers };
    }
  }

  return null;
}

function extractImage(post: PlannerPost, parsed: any) {
  return firstNonEmptyString(
    parsed?.planner_preview_image,
    parsed?.preview_image,
    parsed?.rendered_image,
    parsed?.plannerPreviewImage,
    parsed?.previewImage,
    parsed?.renderedImage,
    parsed?.payload?.planner_preview_image,
    parsed?.payload?.preview_image,
    parsed?.payload?.rendered_image,
    post?.planner_preview_image,
    post?.preview_image,
    post?.rendered_image,
    post?.media_url,
    post?.image_url,
    post?.preview_url,
  );
}

function extractTitle(post: PlannerPost, parsed: any) {
  return firstNonEmptyString(
    post?.titre,
    post?.title,
    parsed?.titre,
    parsed?.title,
    parsed?.headline,
    "Publication LGD",
  );
}

function extractDate(post: PlannerPost, parsed: any) {
  const raw = firstNonEmptyString(
    post?.scheduled_at,
    post?.date_programmee,
    parsed?.scheduled_at,
    parsed?.date_programmee,
  );

  if (!raw) return "Date non définie";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;

  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractNetwork(post: PlannerPost, parsed: any) {
  return firstNonEmptyString(post?.reseau, post?.network, parsed?.reseau, parsed?.network, "instagram");
}


function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  return raw.replace(/\/$/, "");
}

function normalizePlannerPostsResponse(data: any): PlannerPost[] {
  if (Array.isArray(data)) return data;

  const candidates = [
    data?.items,
    data?.posts,
    data?.publications,
    data?.results,
    data?.data,
    data?.data?.items,
    data?.data?.posts,
    data?.data?.publications,
    data?.payload,
    data?.payload?.items,
    data?.payload?.posts,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

async function fetchPlannerPostsNoRedirect(): Promise<PlannerPost[]> {
  const base = getApiBase();
  const headers = { ...getAuthHeaders() };

  const urls = [
    "/api/proxy/planner/posts",
    "/api/proxy/planner",
    base ? `${base}/planner/posts` : "",
    base ? `${base}/planner` : "",
  ].filter(Boolean);

  let lastStatus = 0;
  let lastMessage = "";

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        credentials: "include",
        headers,
        cache: "no-store",
      });

      lastStatus = res.status;

      if (res.status === 401 || res.status === 403) {
        lastMessage = `Session mobile non authentifiée (${res.status})`;
        continue;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        lastMessage = text || `Chargement impossible (${res.status})`;
        continue;
      }

      const data = await res.json().catch(() => []);
      const posts = normalizePlannerPostsResponse(data);

      // Si l'endpoint répond correctement, on accepte la réponse même vide.
      return posts;
    } catch (error: any) {
      lastMessage = String(error?.message || "Chargement impossible.");
    }
  }

  if (lastStatus === 401 || lastStatus === 403) {
    throw new Error(lastMessage || "Session mobile non authentifiée.");
  }

  throw new Error(lastMessage || "Impossible de charger les publications.");
}

function PreviewCanvasCard({ canvas }: { canvas: PreviewCanvas }) {
  const layers = [...canvas.layers]
    .filter((layer) => layer.visible !== false)
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#f5bf21]/15 bg-[#050505]" style={{ aspectRatio: `${canvas.width}/${canvas.height}` }}>
      {layers.map((layer) => {
        const baseStyle = {
          position: "absolute" as const,
          left: `${((layer.x || 0) / canvas.width) * 100}%`,
          top: `${((layer.y || 0) / canvas.height) * 100}%`,
          width: layer.width ? `${(layer.width / canvas.width) * 100}%` : layer.type === "text" ? "42%" : undefined,
          height: layer.height ? `${(layer.height / canvas.height) * 100}%` : undefined,
          zIndex: layer.zIndex ?? 0,
          opacity: typeof layer.style?.opacity === "number" ? Number(layer.style.opacity) : 1,
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
                background: String(layer.style?.background || layer.style?.color || "#111111"),
              }}
            />
          );
        }

        if (layer.type === "image" && layer.src && looksLikeImageUrl(layer.src)) {
          return <img key={layer.id} src={layer.src} alt="" style={{ ...baseStyle, objectFit: "cover" }} />;
        }

        if (layer.type === "text" && layer.text) {
          const fontSize = Number(layer.style?.fontSize || 48);
          return (
            <div
              key={layer.id}
              style={{
                ...baseStyle,
                color: String(layer.style?.color || layer.style?.fill || "#ffffff"),
                fontSize: `${Math.max(8, (fontSize / canvas.height) * 100)}cqh`,
                fontFamily: String(layer.style?.fontFamily || "Inter"),
                fontWeight: layer.style?.fontWeight || 700,
                lineHeight: 1.1,
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                textShadow: "0 2px 12px rgba(0,0,0,0.45)",
              }}
            >
              {layer.text}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function MobilePlannerView() {
  const [posts, setPosts] = useState<PlannerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const safe = await fetchPlannerPostsNoRedirect();
      setPosts(safe);
    } catch (err: any) {
      setPosts([]);
      setError(String(err?.message || "Impossible de charger les publications."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const normalizedPosts = useMemo(
    () =>
      posts.map((post) => {
        const parsed = safeParseJSON(post?.contenu ?? post?.content ?? null);
        const image = extractImage(post, parsed);
        const canvas = extractPreviewCanvas(post, parsed);

        return {
          post,
          parsed,
          title: extractTitle(post, parsed),
          date: extractDate(post, parsed),
          network: extractNetwork(post, parsed),
          image: image && looksLikeImageUrl(image) ? image : "",
          canvas,
        };
      }),
    [posts],
  );

  return (
    <section className="min-h-screen w-full bg-[#050505] px-3 pb-28 pt-[96px] text-white sm:hidden">
      <div className="mx-auto w-full max-w-[560px]">
        <div className="mb-5 rounded-3xl border border-[#f5bf21]/18 bg-[#090909] p-4 shadow-[0_16px_60px_rgba(0,0,0,0.45)]">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#f5bf21]/80">Planner mobile</div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">Publications planifiées</h1>
          <p className="mt-2 text-sm leading-6 text-white/55">Vue mobile isolée : elle ne modifie pas le Planner desktop validé.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#f5bf21]/15 bg-[#090909] p-5 text-sm text-white/65">Chargement des publications…</div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-3xl border border-red-500/25 bg-red-500/10 p-5">
            <div className="text-sm font-bold text-red-200">Planner mobile indisponible</div>
            <p className="mt-2 text-sm text-red-100/75">{error}</p>
            <button
              type="button"
              onClick={loadPosts}
              className="mt-4 h-11 rounded-2xl bg-[#f5bf21] px-5 text-sm font-black text-black"
            >
              Réessayer
            </button>
          </div>
        ) : null}

        {!loading && !error && normalizedPosts.length === 0 ? (
          <div className="rounded-3xl border border-[#f5bf21]/15 bg-[#090909] p-5 text-sm text-white/65">Aucune publication planifiée pour le moment.</div>
        ) : null}

        <div className="space-y-4">
          {normalizedPosts.map((item, index) => (
            <article key={String(item.post?.id ?? index)} className="overflow-hidden rounded-3xl border border-[#f5bf21]/15 bg-[#090909] shadow-[0_16px_60px_rgba(0,0,0,0.38)]">
              <div className="p-3">
                {item.image ? (
                  <img src={item.image} alt="Aperçu publication" className="block w-full rounded-2xl border border-white/10 bg-black object-contain" />
                ) : item.canvas ? (
                  <PreviewCanvasCard canvas={item.canvas} />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-black/45 p-6 text-center text-sm text-white/45">
                    Aucun visuel détecté pour cette publication.
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-black text-white">{item.title}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#f5bf21]/80">{item.network}</p>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-[#f5bf21]/20 bg-[#f5bf21]/10 px-3 py-2 text-xs font-bold text-[#ffe49a]">{item.date}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

