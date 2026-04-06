"use client";

import { useEffect, useMemo, useState } from "react";
import ThumbStage from "./ThumbStage";

type LibraryKind = "post" | "carrousel";

export type LibraryItemUI = {
  id: number | string;
  kind: LibraryKind;
  title: string;
  // ⚠️ selon backend: created_at/updated_at ou createdAt/updatedAt
  createdAt?: string | null;
  updatedAt?: string | null;
  relativeTime?: string; // legacy
};

type Props = {
  items: LibraryItemUI[];
  selectedIds: (string | number)[];
  onToggleSelect: (id: string | number) => void;
  onOpen: (id: string | number) => void;
  onDeleteSelected: () => void;
  onOpenEditor: () => void;
};

type AnyObj = Record<string, any>;

function safeJsonParse(v: any) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

function formatFRDateTime(dt?: string | null) {
  if (!dt) return "";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizePayload(raw: any): AnyObj {
  const payload = safeJsonParse(raw) as AnyObj;

  // ✅ cas fréquents:
  // - payload = { canvas: { layers: [...] } }
  // - payload = { draft: { canvas: { layers } } }
  // - payload = { draft: {...} }
  // - payload = { payload: {...} }
  // - payload = { content: {...} }
  const candidates = [payload?.draft, payload?.payload, payload?.content, payload].filter(Boolean);

  // Si on trouve un objet qui contient déjà canvas/layers/slides, on le prend
  for (const c of candidates) {
    if (c?.canvas?.layers || c?.layers || c?.slides) return c;
  }

  return payload || {};
}

function extractPostLayers(payloadLike: any): AnyObj[] {
  const p = normalizePayload(payloadLike);

  const layers =
    p?.layers ??
    p?.canvas?.layers ??
    p?.data?.layers ??
    p?.content?.layers ??
    p?.draft?.layers ??
    p?.draft?.canvas?.layers ??
    null;

  return Array.isArray(layers) ? layers : [];
}

function extractCarrouselSlides(payloadLike: any): AnyObj[] {
  const p = normalizePayload(payloadLike);

  // formats possibles
  const slides =
    p?.slides ??
    p?.carrousel?.slides ??
    p?.draft?.slides ??
    p?.draft?.carrousel?.slides ??
    p?.data?.slides ??
    null;

  return Array.isArray(slides) ? slides : [];
}

function getFirstSlideLayers(content: any) {
  const slides = extractCarrouselSlides(content);
  const first = slides[0] || null;
  if (!first) return null;

  // structure 1: first.layers
  if (Array.isArray(first.layers)) return first.layers;

  // structure 2: first.canvas.layers
  if (Array.isArray(first?.canvas?.layers)) return first.canvas.layers;

  // structure 3: first.data.layers
  if (Array.isArray(first?.data?.layers)) return first.data.layers;

  // ✅ V5/V6: slides store "elements" (not "layers")
  // We can render these directly in <ThumbStage /> because it understands {type:"image"/"text"...} + src/url.
  const elements =
    first?.elements ||
    first?.canvas?.elements ||
    first?.data?.elements ||
    first?.payload?.elements ||
    first?.content?.elements ||
    first?.doc?.elements;

  if (Array.isArray(elements)) return elements;

  // Some formats embed elements under "nodes" or "objects"
  const nodes =
    first?.nodes ||
    first?.canvas?.nodes ||
    first?.data?.nodes ||
    first?.objects ||
    first?.canvas?.objects ||
    first?.data?.objects;

  if (Array.isArray(nodes)) return nodes;

  return null;
}

function guessCanvasSizeFromLayers(layers: AnyObj[]) {
  let w = 1080;
  let h = 1080;

  for (const l of layers || []) {
    const cw = Number(l?.canvasWidth ?? l?.cw ?? l?.stageWidth ?? l?.w_canvas ?? NaN);
    const ch = Number(l?.canvasHeight ?? l?.ch ?? l?.stageHeight ?? l?.h_canvas ?? NaN);
    if (Number.isFinite(cw) && Number.isFinite(ch) && cw > 200 && ch > 200) {
      w = cw;
      h = ch;
      break;
    }
  }

  return { w, h };
}

function CanvaThumb({
  itemId,
  kind,
}: {
  itemId: string | number;
  kind: LibraryKind;
}) {
  const [loading, setLoading] = useState(true);
  const [layers, setLayers] = useState<AnyObj[]>([]);
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number }>({ w: 1080, h: 1350 });

  useEffect(() => {
    let mounted = true;

    async function run() {
      setLoading(true);
      try {
        // ✅ endpoint existant dans ton backend lib V2: /library/raw/{id}
        const res = await fetch(`/api/proxy/library/raw/${itemId}`);
        const data = await res.json();

        const payloadRaw = data?.payload ?? data?.generated_content ?? data?.data ?? data ?? null;

        if (kind === "post") {
          const ll = extractPostLayers(payloadRaw);
          const cs = guessCanvasSizeFromLayers(ll);
          if (!mounted) return;
          setLayers(ll);
          setCanvasSize(cs);
        } else {
          const ll = getFirstSlideLayers(payloadRaw);
          // carrousel = slide (souvent 1080x1080)
          const cs = guessCanvasSizeFromLayers(ll);
          if (!mounted) return;
          setLayers(ll);
          setCanvasSize(cs);
        }
      } catch {
        if (!mounted) return;
        setLayers([]);
        setCanvasSize({ w: 1080, h: 1350 });
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [itemId, kind]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-xs text-white/40">
        Chargement…
      </div>
    );
  }

  if (!layers || layers.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-xs text-white/40">
        Aperçu indisponible
      </div>
    );
  }

  return <ThumbStage layers={layers} canvasWidth={canvasSize.w} canvasHeight={canvasSize.h} cover />;
}

export default function LibraryCanvaGrid({
  items,
  selectedIds,
  onToggleSelect,
  onOpen,
  onDeleteSelected,
  onOpenEditor,
}: Props) {
  const selectedSet = useMemo(() => new Set(selectedIds.map(String)), [selectedIds]);

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Récents</h2>
          <p className="mt-1 text-sm text-white/60">Miniatures réutilisables & modifiables (style Canva)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onDeleteSelected}
            disabled={!selectedIds.length}
            className="h-10 rounded-xl border border-yellow-500/20 bg-black/30 px-4 text-sm text-white/80 hover:bg-black/40 hover:text-white transition disabled:opacity-40"
          >
            Supprimer
          </button>

          <button
            onClick={onOpenEditor}
            className="h-10 inline-flex items-center rounded-xl bg-[#ffb800] px-4 text-sm font-semibold text-black hover:brightness-110 transition"
          >
            Ouvrir l’éditeur
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => {
          const isSel = selectedSet.has(String(it.id));
          const dt = formatFRDateTime(
            (it as any).updated_at ??
              (it as any).updatedAt ??
              (it as any).created_at ??
              (it as any).createdAt ??
              null
          );

          return (
            <div key={String(it.id)} className="group relative">
              <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-black/30 shadow-[0_0_0_1px_rgba(255,184,0,0.08)] transition hover:border-yellow-500/35 hover:bg-black/40">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSelect(it.id);
                  }}
                  className="absolute left-3 top-3 z-20 h-5 w-5 rounded-md border border-yellow-500/35 bg-black/40 hover:bg-black/60"
                  aria-label="Sélectionner"
                >
                  {isSel ? <div className="m-0.5 h-3.5 w-3.5 rounded-sm bg-[#ffb800]" /> : null}
                </button>

                <button onClick={() => onOpen(it.id)} className="relative block w-full" style={{ aspectRatio: "1 / 1" }}>
                  <div className="absolute inset-0 bg-black" />
                  <div className="absolute inset-0 overflow-hidden">
                    <CanvaThumb itemId={it.id} kind={it.kind} />
                  </div>
                </button>

                <div className="px-4 py-3">
                  <div className="text-[13px] font-semibold text-yellow-200/95 line-clamp-1">{it.title || "Sans titre"}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/60">
                    <span className="capitalize">{it.kind}</span>
                    <span className="text-white/30">•</span>
                    <span>{it.kind === "carrousel" ? "Carrousel" : "Post"}</span>
                    {dt ? (
                      <>
                        <span className="text-white/30">•</span>
                        <span>Modifié le {dt}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

