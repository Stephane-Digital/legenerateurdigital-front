"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ThumbStage from "./components/ThumbStage";
import SchedulePlannerModal from "../automatisations/reseaux_sociaux/carrousel/editor/ui/SchedulePlannerModal";
import useSchedulePlanner from "../automatisations/reseaux_sociaux/carrousel/editor/v5/hooks/useSchedulePlanner";
import { renderEditorCreationToDataUrl } from "../automatisations/reseaux_sociaux/carrousel/editor/utils/downloadEditorCreation";

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

type LibraryItem = {
  id: number;
  title: string;
  description?: string | null;
  kind?: string | null;
  filename?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  raw_url?: string | null;
  file_url?: string | null;
  preview_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type SavedWrapper = {
  kind?: string;
  savedAt?: string;
  saved_at?: string;
  updated_at?: string;
  created_at?: string;
  payload?: any;
};

const LS_POST = "lgd_editor_post_draft_v5";
const LS_CARROUSEL = "lgd_editor_carrousel_draft_v5";
const LS_EDITOR_MODE = "lgd_editor_mode_v5";

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function normalizeUrl(path: string) {
  const base = apiBase();
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}

async function fetchFirstOk(urls: string[]) {
  let lastErr: any = null;
  for (const u of urls) {
    try {
      const r = await fetch(u, { credentials: "include", headers: { ...getAuthHeaders() } });
      if (r.ok) return r;
      lastErr = new Error(String(r.status));
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("fetch failed");
}

function getImageSizeFromUrl(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 1080, height: img.naturalHeight || 1080 });
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function fitInsideBox(
  srcW: number,
  srcH: number,
  boxW: number,
  boxH: number
): { x: number; y: number; width: number; height: number } {
  const sw = Math.max(1, srcW);
  const sh = Math.max(1, srcH);
  const scale = Math.min(boxW / sw, boxH / sh);
  const width = Math.round(sw * scale);
  const height = Math.round(sh * scale);
  return {
    x: Math.round((boxW - width) / 2),
    y: Math.round((boxH - height) / 2),
    width,
    height,
  };
}

function formatFR(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pickBestDate(item?: any, wrapper?: any) {
  const w = wrapper || {};
  const i = item || {};
  const candidates = [
    w.savedAt,
    w.saved_at,
    w.updated_at,
    w.created_at,
    i.updated_at,
    i.updatedAt,
    i.created_at,
    i.createdAt,
  ].filter(Boolean) as string[];
  return candidates.length ? candidates[0] : null;
}

function detectEditorKind(item: LibraryItem, wrapper?: SavedWrapper | null) {
  const k = String(wrapper?.kind || item.kind || item.filename || "").toLowerCase();
  if (k.includes("lgd_post")) return "post" as const;
  if (k.includes("lgd_carrousel") || k.includes("carrousel")) return "carrousel" as const;
  return "file" as const;
}

function ratioToWH(ratio: "1:1" | "9:16" | "16:9") {
  const w = 1080;
  const h = ratio === "9:16" ? 1920 : ratio === "16:9" ? 608 : 1080;
  return { w, h };
}

function normalizeLayers(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return normalizeLayers(parsed);
    } catch {
      return [];
    }
  }

  if (typeof input === "object") {
    if (Array.isArray((input as any).layers)) return (input as any).layers;
    if (Array.isArray((input as any).json_layers)) return (input as any).json_layers;
    if (typeof (input as any).layers === "string") return normalizeLayers((input as any).layers);
    if (typeof (input as any).json_layers === "string") return normalizeLayers((input as any).json_layers);
  }

  return [];
}

function inferNetwork(formatKey: string, platform: string) {
  const v = `${platform || ""} ${formatKey || ""}`.toLowerCase();
  if (v.includes("instagram") || v.includes("insta")) return "instagram";
  if (v.includes("facebook") || v.includes("face")) return "facebook";
  if (v.includes("linkedin") || v.includes("link")) return "linkedin";
  if (v.includes("tiktok") || v.includes("tt")) return "tiktok";
  if (v.includes("youtube") || v.includes("yt")) return "youtube";
  if (v.includes("pinterest") || v.includes("pin")) return "pinterest";
  return "";
}

function inferRatio(formatKey: string) {
  const v = (formatKey || "").toLowerCase();
  if (v.includes("story") || v.includes("9:16") || v.includes("vertical") || v.includes("reel") || v.includes("short")) {
    return "9:16" as const;
  }
  if (v.includes("16:9") || v.includes("landscape") || v.includes("banner")) return "16:9" as const;
  return "1:1" as const;
}

function inferFormatLabel(formatKey: string, kind: "post" | "carrousel" | "file") {
  const v = (formatKey || "").toLowerCase();
  if (kind === "carrousel") return "Carrousel";
  if (v.includes("story")) return "Story";
  if (v.includes("reel")) return "Reel";
  if (v.includes("short")) return "Short";
  if (v.includes("cover")) return "Cover";
  if (v.includes("banner")) return "Banner";
  if (v.includes("pin")) return "Pin";
  return "Post";
}

function extractMeta(wrapper?: SavedWrapper | null, kind?: "post" | "carrousel" | "file") {
  const p = wrapper?.payload || {};
  const platform = String(p?.platform || p?.social || p?.network || p?.channel || p?.target || p?.provider || "").toLowerCase();
  const formatKey = String(p?.formatKey || p?.format || p?.platformFormat || p?.canvasFormat || "").toLowerCase();
  let blob = "";
  try {
    blob = JSON.stringify(p).toLowerCase();
  } catch {
    blob = "";
  }

  const ratio = inferRatio(formatKey);
  const network = inferNetwork(`${formatKey} ${blob}`, platform);
  const label = inferFormatLabel(formatKey, kind || "file");

  return { platform, formatKey, ratio, network, label };
}

function firstArray(...values: any[]): any[] {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function extractSlideLayers(slide: any): any[] {
  return normalizeLayers(
    slide?.layers ||
      slide?.canvas?.layers ||
      slide?.data?.layers ||
      slide?.content?.layers ||
      slide?.elements ||
      slide?.nodes ||
      slide?.objects ||
      []
  );
}

function extractArchivePostDraft(wrapper?: SavedWrapper | null) {
  const payload = wrapper?.payload || {};
  const layers = normalizeLayers(
    payload?.layers ||
      payload?.data?.layers ||
      payload?.canvas?.layers ||
      payload?.draft?.layers ||
      payload?.draft?.canvas?.layers ||
      payload?.content?.layers ||
      []
  );

  const ui =
    payload?.ui ||
    payload?.data?.ui ||
    payload?.canvas?.ui ||
    payload?.draft?.ui ||
    payload?.content?.ui ||
    {};

  return { layers, ui };
}

function extractArchiveCarrouselDraft(wrapper?: SavedWrapper | null) {
  const payload = wrapper?.payload || {};
  const rawSlides = firstArray(
    payload?.slides,
    payload?.data?.slides,
    payload?.canvas?.slides,
    payload?.draft?.slides,
    payload?.content?.slides
  );

  const slides = rawSlides.map((slide: any, index: number) => ({
    id: String(slide?.id || `slide-${index + 1}`),
    layers: extractSlideLayers(slide),
  }));

  const ui =
    payload?.ui ||
    payload?.data?.ui ||
    payload?.canvas?.ui ||
    payload?.draft?.ui ||
    payload?.content?.ui ||
    {};

  return { slides, ui };
}

function getFirstTextFromLayers(layers: any[]): string {
  return (layers || []).map((layer: any) => String(layer?.text || "").trim()).find(Boolean) || "";
}

function buildPlannerTitle(item: LibraryItem, wrapper?: SavedWrapper | null) {
  const kind = detectEditorKind(item, wrapper);

  if (kind === "carrousel") {
    const draft = extractArchiveCarrouselDraft(wrapper);
    const firstText = getFirstTextFromLayers(draft.slides?.[0]?.layers || []);
    return firstText || item.title || "Carrousel LGD";
  }

  if (kind === "post") {
    const draft = extractArchivePostDraft(wrapper);
    const firstText = getFirstTextFromLayers(draft.layers || []);
    return firstText || item.title || "Post LGD";
  }

  return item.title || "Contenu LGD";
}

function NetworkIcon({ network }: { network: string }) {
  const common = "h-4 w-4 text-yellow-200/90";
  if (network === "instagram") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7.5 2.8h9A4.7 4.7 0 0 1 21.2 7.5v9A4.7 4.7 0 0 1 16.5 21.2h-9A4.7 4.7 0 0 1 2.8 16.5v-9A4.7 4.7 0 0 1 7.5 2.8Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M12 16.3a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="M17.2 6.8h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (network === "facebook") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14 8.5V7.2c0-.9.7-1.7 1.6-1.7H17V3h-2.3C12.6 3 11 4.7 11 6.9v1.6H9v2.6h2V21h3v-9.9h2.3L16.9 8.5H14Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NetworkPill({ network }: { network: string }) {
  const label = network ? network : "unknown";
  return (
    <div
      className="inline-flex min-w-[32px] h-6 items-center justify-center rounded-full border border-yellow-500/25 bg-black/50 px-2.5 py-1 text-[11px] text-yellow-200/90"
      title={label}
      aria-label={label}
    >
      <NetworkIcon network={label} />
    </div>
  );
}

function FormatPill({ label }: { label: string }) {
  return (
    <div
      className="rounded-full border border-yellow-500/25 bg-black/40 px-2.5 py-1 text-[11px] text-yellow-200/90"
      title={label}
    >
      {label}
    </div>
  );
}

function LibraryCard({
  item,
  wrapper,
  selected,
  onToggle,
  onOpen,
}: {
  item: LibraryItem;
  wrapper: SavedWrapper | null;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const kind = detectEditorKind(item, wrapper);
  const meta = extractMeta(wrapper, kind);
  const savedAt = pickBestDate(item, wrapper);
  const [slideIdx, setSlideIdx] = useState(0);

  const postDraft = extractArchivePostDraft(wrapper);
  const carrouselDraft = extractArchiveCarrouselDraft(wrapper);
  const postLayers = postDraft.layers;
  const slides = carrouselDraft.slides;
  const currentLayers = kind === "post"
    ? postLayers
    : kind === "carrousel"
      ? slides[Math.min(slideIdx, Math.max(0, slides.length - 1))]?.layers || []
      : [];
  const canvasSize = ratioToWH(meta.ratio);

  useEffect(() => {
    if (kind !== "carrousel" || slides.length <= 1) return;
    const t = window.setInterval(() => {
      setSlideIdx((v) => (v + 1) % slides.length);
    }, 1100);
    return () => window.clearInterval(t);
  }, [kind, slides.length]);

  const hasFileImage = String(item.mime_type || "").startsWith("image/") && !!item.preview_url;
  const hasArchivePreview = (kind === "post" && postLayers.length > 0) || (kind === "carrousel" && currentLayers.length > 0);

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-black/30 shadow-[0_0_0_1px_rgba(255,184,0,0.08)] transition hover:border-yellow-500/35 hover:bg-black/40">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle();
          }}
          className="absolute left-3 top-3 z-20 h-5 w-5 rounded-md border border-yellow-500/35 bg-black/40 hover:bg-black/60"
          aria-label="Sélectionner"
        >
          {selected ? <div className="m-0.5 h-3.5 w-3.5 rounded-sm bg-[#ffb800]" /> : null}
        </button>

        <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
          <NetworkPill network={meta.network} />
          <FormatPill label={meta.label} />
        </div>

        <button
          onClick={onOpen}
          className="relative block w-full"
          style={{ aspectRatio: meta.ratio === "9:16" ? "9 / 12" : meta.ratio === "16:9" ? "16 / 10" : "1 / 1" }}
        >
          <div className="absolute inset-0 bg-black" />

          <div className="absolute inset-0 overflow-hidden">
            {hasFileImage ? (
              <img
                src={normalizeUrl(item.preview_url!)}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            ) : hasArchivePreview ? (
              <ThumbStage
                layers={currentLayers}
                canvasWidth={canvasSize.w}
                canvasHeight={canvasSize.h}
                cover
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50">
                Aperçu indisponible
              </div>
            )}
          </div>

          {kind === "carrousel" && slides.length > 1 ? (
            <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-1">
              {slides.slice(0, 7).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === slideIdx ? "bg-[#ffb800]" : "bg-white/30"}`}
                />
              ))}
            </div>
          ) : null}
        </button>

        <div className="px-4 py-3">
          <div className="text-[13px] font-semibold text-yellow-200/95 line-clamp-1">{item.title || "Sans titre"}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/60">
            <span className="capitalize">{kind}</span>
            <span className="text-white/30">•</span>
            <span>{kind === "carrousel" ? `${Math.max(slides.length, 1)} slide${slides.length > 1 ? "s" : ""}` : "1/1"}</span>
            {savedAt ? (
              <>
                <span className="text-white/30">•</span>
                <span>Modifié le {formatFR(savedAt)}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const router = useRouter();
  const apiUrl = apiBase();

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [wrappers, setWrappers] = useState<Record<number, SavedWrapper | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [plannerTargetId, setPlannerTargetId] = useState<number | null>(null);

  const loadAbort = useRef<AbortController | null>(null);
  const { schedule, loading: scheduleLoading } = useSchedulePlanner();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const s = `${it.title || ""} ${it.filename || ""} ${it.kind || ""}`.toLowerCase();
      return s.includes(q);
    });
  }, [items, query]);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[Number(k)]).map(Number),
    [selected]
  );

  async function loadListAndRaw() {
    if (!apiUrl) {
      setError("API indisponible");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    loadAbort.current?.abort();
    loadAbort.current = new AbortController();

    try {
      const res = await fetchFirstOk([`${apiUrl}/library/list`, `${apiUrl}/library/items`]);
      const data = (await res.json().catch(() => [])) as any;
      const list: LibraryItem[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setItems(list);

      const need = list.filter((it) => {
        const k = String(it.kind || it.filename || "").toLowerCase();
        const isLgd = k.includes("lgd_post") || k.includes("lgd_carrousel");
        return isLgd && !!it.raw_url;
      });

      const next: Record<number, SavedWrapper | null> = {};
      const concurrency = 6;
      let idx = 0;

      const worker = async () => {
        while (idx < need.length) {
          const current = need[idx++];
          try {
            const r = await fetch(normalizeUrl(current.raw_url!), { credentials: "include", headers: { ...getAuthHeaders() } });
            if (!r.ok) {
              next[current.id] = null;
              continue;
            }
            const txt = await r.text();
            const json = JSON.parse(txt) as SavedWrapper;
            next[current.id] = json;
          } catch {
            next[current.id] = null;
          }
        }
      };

      await Promise.all(Array.from({ length: Math.min(concurrency, need.length) }, () => worker()));
      setWrappers(next);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListAndRaw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openInEditor(it: LibraryItem) {
    const wrap = wrappers[it.id] || null;
    const kind = detectEditorKind(it, wrap);

    if (kind === "post") {
      router.push(`/dashboard/automatisations/reseaux_sociaux/editor-intelligent?openLibrary=1&kind=post&id=${it.id}`);
      return;
    }

    if (kind === "carrousel") {
      router.push(
        `/dashboard/automatisations/reseaux_sociaux/editor-intelligent?openLibrary=1&kind=carrousel&id=${it.id}`
      );
      return;
    }

    const preview = it.preview_url ? normalizeUrl(it.preview_url) : "";
    const file = it.file_url ? normalizeUrl(it.file_url) : "";
    const imageUrl = preview || file;

    if (!imageUrl) {
      alert("Impossible d'ouvrir cette image dans l'éditeur.");
      return;
    }

    getImageSizeFromUrl(imageUrl)
      .then((imgSize) => {
        const canvasW = 1080;
        const canvasH = 1080;
        const placed = fitInsideBox(imgSize.width, imgSize.height, canvasW, canvasH);

        const draft = {
          layers: [
            {
              id: "background-post",
              type: "background",
              visible: true,
              selected: false,
              zIndex: -1000,
              style: { color: "#111111" },
            },
            {
              id: `image-${Date.now()}`,
              type: "image",
              src: imageUrl,
              x: placed.x,
              y: placed.y,
              width: placed.width,
              height: placed.height,
              zIndex: 10,
              visible: true,
              selected: true,
            },
          ],
        };

        try {
          window.localStorage.removeItem(LS_CARROUSEL);
          window.localStorage.setItem(LS_EDITOR_MODE, "post");
          window.localStorage.setItem(LS_POST, JSON.stringify(draft));
          router.push(`/dashboard/automatisations/reseaux_sociaux/editor-intelligent?mode=post&fromLibrary=1&imageId=${it.id}`);
        } catch (e) {
          console.error("openInEditor lightweight draft failed", e);
          alert("Impossible d'ouvrir cette image dans l'éditeur.");
        }
      })
      .catch((e) => {
        console.error("openInEditor image load failed", e);
        alert("Impossible d'ouvrir cette image dans l'éditeur.");
      });
  }

  function openPlannerForSelected() {
    const firstId = selectedIds[0];
    if (!firstId) {
      alert("Sélectionne d’abord un élément.");
      return;
    }

    const it = items.find((x) => x.id === firstId);
    if (!it) {
      alert("Élément introuvable.");
      return;
    }

    const wrap = wrappers[it.id] || null;
    const kind = detectEditorKind(it, wrap);
    if (kind !== "post" && kind !== "carrousel") {
      alert("Seuls les posts et carrousels archivés peuvent être planifiés.");
      return;
    }

    setPlannerTargetId(firstId);
  }

  async function handlePlannerConfirm({ reseau, date_programmee, titre }: { reseau: string; date_programmee: string; titre?: string }) {
    const firstId = plannerTargetId;
    if (!firstId) return;

    const it = items.find((x) => x.id === firstId);
    if (!it) throw new Error("Archive introuvable.");

    const wrap = wrappers[it.id] || null;
    const kind = detectEditorKind(it, wrap);

    if (kind === "post") {
      const draft = extractArchivePostDraft(wrap);
      const safeLayers = Array.isArray(draft.layers) ? draft.layers : [];
      let previewImage = "";

      if (safeLayers.length) {
        try {
          previewImage = await renderEditorCreationToDataUrl({
            mode: "post",
            draft: {
              ui: draft.ui || {},
              layers: safeLayers,
            },
          });
        } catch (error) {
          console.error("LGD planner snapshot error (archive post):", error);
        }
      }

      await schedule({
        reseau,
        date_programmee,
        titre: titre || buildPlannerTitle(it, wrap),
        format: "post",
        contenu: {
          title: titre || buildPlannerTitle(it, wrap),
          type: "post",
          layers: safeLayers,
          ui: draft.ui || {},
          library_item_id: it.id,
          preview_image: previewImage || undefined,
          planner_preview_image: previewImage || undefined,
        },
      });
    } else if (kind === "carrousel") {
      const draft = extractArchiveCarrouselDraft(wrap);
      const safeSlides = Array.isArray(draft.slides) ? draft.slides : [];
      let previewImage = "";

      try {
        previewImage = await renderEditorCreationToDataUrl({
          mode: "carrousel",
          draft: {
            ui: draft.ui || {},
            slides: safeSlides,
          },
          slideIndex: 0,
        });
      } catch (error) {
        console.error("LGD planner snapshot error (archive carrousel):", error);
      }

      await schedule({
        reseau,
        date_programmee,
        titre: titre || buildPlannerTitle(it, wrap),
        format: "carrousel",
        slides: safeSlides,
        contenu: {
          title: titre || buildPlannerTitle(it, wrap),
          type: "carrousel",
          slides: safeSlides,
          ui: draft.ui || {},
          library_item_id: it.id,
          preview_image: previewImage || undefined,
          planner_preview_image: previewImage || undefined,
        },
      });
    }

    setPlannerTargetId(null);
    if (typeof window !== "undefined") window.alert("✅ Ajouté au Planner !");
  }

  async function deleteSelected() {
    if (!selectedIds.length) return;
    if (!apiUrl) return;

    const ok = window.confirm(`Supprimer ${selectedIds.length} élément(s) ?`);
    if (!ok) return;

    try {
      await Promise.all(
        selectedIds.map(async (id) => {
          await fetch(`${apiUrl}/library/${id}`, { method: "DELETE", credentials: "include", headers: { ...getAuthHeaders() } }).catch(() => null);
          await fetch(`${apiUrl}/library/items/${id}`, { method: "DELETE", credentials: "include", headers: { ...getAuthHeaders() } }).catch(() => null);
        })
      );
      setSelected({});
      await loadListAndRaw();
    } catch {
      alert("Erreur suppression. Voir console.");
    }
  }

  return (
    <div className="min-h-screen w-full pt-[120px] pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">Récents</h1>
            <p className="mt-1 text-sm text-white/60">Miniatures réutilisables & modifiables (style Canva)</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="h-10 w-[280px] rounded-xl border border-yellow-500/20 bg-black/30 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-yellow-500/40"
              />
            </div>

            <button
              onClick={openPlannerForSelected}
              disabled={!selectedIds.length}
              className="h-10 rounded-xl border border-yellow-500/20 bg-black/30 px-4 text-sm text-white/80 hover:bg-black/40 hover:text-white transition disabled:opacity-40"
            >
              Planifier
            </button>

            <button
              onClick={deleteSelected}
              disabled={!selectedIds.length}
              className="h-10 rounded-xl border border-yellow-500/20 bg-black/30 px-4 text-sm text-white/80 hover:bg-black/40 hover:text-white transition disabled:opacity-40"
            >
              Supprimer
            </button>

            <button
              onClick={() => {
                const firstId = selectedIds[0];
                if (!firstId) {
                  alert("Sélectionne d’abord un élément.");
                  return;
                }
                const it = items.find((x) => x.id === firstId);
                if (!it) {
                  alert("Élément introuvable.");
                  return;
                }
                openInEditor(it);
              }}
              className="h-10 inline-flex items-center rounded-xl bg-[#ffb800] px-4 text-sm font-semibold text-black hover:brightness-110 transition"
            >
              Ouvrir l’éditeur
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="text-white/60 text-sm">Chargement…</div>
          ) : error ? (
            <div className="text-red-300 text-sm">{error}</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((it) => {
                const sel = !!selected[it.id];
                const wrap = wrappers[it.id] || null;
                return (
                  <LibraryCard
                    key={it.id}
                    item={it}
                    wrapper={wrap}
                    selected={sel}
                    onToggle={() => setSelected((p) => ({ ...p, [it.id]: !p[it.id] }))}
                    onOpen={() => openInEditor(it)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <SchedulePlannerModal
          open={!!plannerTargetId}
          onClose={() => setPlannerTargetId(null)}
          loading={scheduleLoading}
          defaultTitle={
            plannerTargetId
              ? buildPlannerTitle(
                  items.find((x) => x.id === plannerTargetId) as LibraryItem,
                  wrappers[plannerTargetId] || null
                )
              : "Post LGD"
          }
          onConfirm={handlePlannerConfirm}
        />
      </div>
    </div>
  );
}
