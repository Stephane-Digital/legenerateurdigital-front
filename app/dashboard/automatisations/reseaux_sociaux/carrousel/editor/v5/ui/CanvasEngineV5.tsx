"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { LayerData } from "../types/layers";
import EditorCanvasV5 from "./EditorCanvasV5";

type DragState = {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
} | null;

type ResizeImageState = {
  kind: "image";
  id: string;
  handle: "tl" | "tr" | "bl" | "br";
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
} | null;

type ResizeTextState = {
  kind: "text";
  id: string;
  corner: "tl" | "tr" | "bl" | "br";
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
} | null;

type ResizeState = ResizeImageState | ResizeTextState;

type Guides = { x: number | null; y: number | null };
type Hud = { L: number; T: number; R: number; B: number } | null;

const HANDLE_SIZE = 10;

// 🎯 curseur selon poignée d’angle
const cornerCursor = (c: "tl" | "tr" | "bl" | "br") =>
  c === "tl" || c === "br" ? "nwse-resize" : "nesw-resize";

// Snap = + permissif (plus “Canva”)
const SNAP_THRESHOLD = 10;

export default function CanvasEngineV5({
  format,
  layers,
  selectedLayerId,
  onSelectLayer,
  setLayers,
}: {
  format: { w: number; h: number };
  layers: LayerData[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  setLayers: React.Dispatch<React.SetStateAction<LayerData[]>>;
}) {
  const [drag, setDrag] = useState<DragState>(null);
  const [resize, setResize] = useState<ResizeState>(null);
  const [guides, setGuides] = useState<Guides>({ x: null, y: null });
  const [hud, setHud] = useState<Hud>(null);

  const layerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const updateLayer = useCallback(
    (id: string, patch: Partial<LayerData>) => {
      setLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
      );
    },
    [setLayers]
  );

  const getLocalPoint = useCallback(
    (clientX: number, clientY: number) => {
      const host = document.getElementById("lgd-canvas-host");
      if (!host) return { x: 0, y: 0 };

      const rect = host.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * format.w;
      const y = ((clientY - rect.top) / rect.height) * format.h;
      return { x, y };
    },
    [format.w, format.h]
  );

  const getLayerSize = useCallback(
    (id: string) => {
      const el = layerRefs.current[id];
      if (!el) {
        const layer = layers.find((l) => l.id === id) as any;
        const w =
          typeof layer?.width === "number"
            ? layer.width
            : layer?.type === "image"
            ? 360
            : 420;
        const h =
          typeof layer?.height === "number"
            ? layer.height
            : layer?.type === "image"
            ? 240
            : 120;
        return { w, h };
      }
      const r = el.getBoundingClientRect();
      const host = document.getElementById("lgd-canvas-host");
      if (!host) return { w: r.width, h: r.height };
      const hostRect = host.getBoundingClientRect();
      const w = (r.width / hostRect.width) * format.w;
      const h = (r.height / hostRect.height) * format.h;
      return { w, h };
    },
    [layers, format.w, format.h]
  );

  const applySnap = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const candidatesX = [
        { val: 0, guide: 0 },
        { val: format.w - w, guide: format.w },
        { val: format.w / 2 - w / 2, guide: format.w / 2 },
      ];
      const candidatesY = [
        { val: 0, guide: 0 },
        { val: format.h - h, guide: format.h },
        { val: format.h / 2 - h / 2, guide: format.h / 2 },
      ];

      let nx = x;
      let ny = y;
      let gx: number | null = null;
      let gy: number | null = null;

      let bestDx = Infinity;
      for (const c of candidatesX) {
        const dx = Math.abs(nx - c.val);
        if (dx < bestDx) {
          bestDx = dx;
          if (dx <= SNAP_THRESHOLD) {
            nx = c.val;
            gx = c.guide;
          }
        }
      }

      let bestDy = Infinity;
      for (const c of candidatesY) {
        const dy = Math.abs(ny - c.val);
        if (dy < bestDy) {
          bestDy = dy;
          if (dy <= SNAP_THRESHOLD) {
            ny = c.val;
            gy = c.guide;
          }
        }
      }

      const hud = {
        L: Math.round(nx),
        T: Math.round(ny),
        R: Math.round(format.w - (nx + w)),
        B: Math.round(format.h - (ny + h)),
      };

      return { x: nx, y: ny, gx, gy, hud };
    },
    [format.w, format.h]
  );

  const onMouseDownSelect = (e: React.MouseEvent, layer: LayerData) => {
    e.preventDefault();
    e.stopPropagation();

    onSelectLayer(layer.id);

    const p = getLocalPoint(e.clientX, e.clientY);
    setDrag({
      id: layer.id,
      startX: p.x,
      startY: p.y,
      origX: layer.x ?? 0,
      origY: layer.y ?? 0,
    });

    const { w, h } = getLayerSize(layer.id);
    const { hud, gx, gy } = applySnap(layer.x ?? 0, layer.y ?? 0, w, h);
    setHud(hud);
    setGuides({ x: gx, y: gy });
  };

  const onMouseDownResizeImage = (
    e: React.MouseEvent,
    layer: LayerData,
    handle: "tl" | "tr" | "bl" | "br"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const p = getLocalPoint(e.clientX, e.clientY);

    const w = typeof layer.width === "number" ? layer.width : 360;
    const h = typeof layer.height === "number" ? layer.height : 240;

    setResize({
      kind: "image",
      id: layer.id,
      handle,
      startX: p.x,
      startY: p.y,
      origX: layer.x ?? 0,
      origY: layer.y ?? 0,
      origW: w,
      origH: h,
    });
  };

  const onMouseDownResizeText = (
    e: React.MouseEvent,
    layer: LayerData,
    corner: "tl" | "tr" | "bl" | "br"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const p = getLocalPoint(e.clientX, e.clientY);

    const w =
      typeof layer.width === "number"
        ? layer.width
        : Math.min(820, Math.max(180, ((layer as any).text?.length ?? 8) * 14));

    const h =
      typeof layer.height === "number"
        ? layer.height
        : Math.max(
            60,
            Math.min(
              260,
              ((((layer as any).text ?? "") as string).split("\n").length || 1) * 56
            )
          );

    setResize({
      kind: "text",
      id: layer.id,
      corner,
      startX: p.x,
      startY: p.y,
      origX: layer.x ?? 0,
      origY: layer.y ?? 0,
      origW: w,
      origH: h,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag && !resize) return;

    const p = getLocalPoint(e.clientX, e.clientY);

    if (resize?.kind === "image") {
      const dx = p.x - resize.startX;
      const dy = p.y - resize.startY;

      let x = resize.origX;
      let y = resize.origY;
      let w = resize.origW;
      let h = resize.origH;

      const handle = resize.handle;

      if (handle.includes("r")) w = resize.origW + dx;
      if (handle.includes("l")) {
        w = resize.origW - dx;
        x = resize.origX + dx;
      }

      if (handle.includes("b")) h = resize.origH + dy;
      if (handle.includes("t")) {
        h = resize.origH - dy;
        y = resize.origY + dy;
      }

      const nextW = Math.max(40, w);
      const nextH = Math.max(40, h);

      updateLayer(resize.id, { x, y, width: nextW, height: nextH });

      setHud({
        L: Math.round(x),
        T: Math.round(y),
        R: Math.round(format.w - (x + nextW)),
        B: Math.round(format.h - (y + nextH)),
      });
      setGuides({ x: null, y: null });
      return;
    }

    if (resize?.kind === "text") {
      const dx = p.x - resize.startX;
      const dy = p.y - resize.startY;

      let x = resize.origX;
      let y = resize.origY;
      let w = resize.origW;
      let h = resize.origH;

      const c = resize.corner;

      if (c.includes("r")) w = resize.origW + dx;
      if (c.includes("l")) {
        w = resize.origW - dx;
        x = resize.origX + dx;
      }

      if (c.includes("b")) h = resize.origH + dy;
      if (c.includes("t")) {
        h = resize.origH - dy;
        y = resize.origY + dy;
      }

      const nextW = Math.max(140, w);
      const nextH = Math.max(50, h);

      updateLayer(resize.id, {
        x,
        y,
        width: nextW,
        height: nextH,
      });

      setHud({
        L: Math.round(x),
        T: Math.round(y),
        R: Math.round(format.w - (x + nextW)),
        B: Math.round(format.h - (y + nextH)),
      });
      setGuides({ x: null, y: null });
      return;
    }

    if (drag) {
      const dx = p.x - drag.startX;
      const dy = p.y - drag.startY;

      const layer = layers.find((l) => l.id === drag.id);
      if (!layer) return;

      const { w, h } = getLayerSize(layer.id);
      const rawX = drag.origX + dx;
      const rawY = drag.origY + dy;

      const snapped = applySnap(rawX, rawY, w, h);

      updateLayer(drag.id, { x: snapped.x, y: snapped.y });
      setGuides({ x: snapped.gx, y: snapped.gy });
      setHud(snapped.hud);
    }
  };

  const onMouseUp = () => {
    if (drag) setDrag(null);
    if (resize) setResize(null);
    setGuides({ x: null, y: null });
    if (!selectedLayerId) setHud(null);
  };

  const renderLayer = (layer: LayerData) => {
    const isSelected = selectedLayerId === layer.id;
    const layerType = (layer as any).type as string | undefined;

    if (layerType === "background") {
      const bgColor = (layer as any).color ?? "#000000";
      return (
        <div
          key={layer.id}
          className="absolute inset-0"
          style={{ background: bgColor }}
        />
      );
    }

    if (layerType === "image") {
      const url = (layer as any).url ?? (layer as any).src ?? "";
      const w = typeof layer.width === "number" ? layer.width : 360;
      const h = typeof layer.height === "number" ? layer.height : 240;

      return (
        <div
          key={layer.id}
          ref={(el) => {
            layerRefs.current[layer.id] = el;
          }}
          className="absolute"
          style={{
            left: layer.x ?? 0,
            top: layer.y ?? 0,
            width: w,
            height: h,
            userSelect: "none",
            cursor: "move",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: isSelected
              ? "0 0 0 2px rgba(255,184,0,0.9)"
              : "none",
          }}
          onMouseDown={(e) => onMouseDownSelect(e, layer)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />

          {isSelected &&
            (["tl", "tr", "bl", "br"] as const).map((handle) => (
              <div
                key={handle}
                className="absolute bg-[#ffb800] rounded"
                style={{
                  width: HANDLE_SIZE,
                  height: HANDLE_SIZE,
                  left: handle.includes("l") ? -HANDLE_SIZE / 2 : undefined,
                  right: handle.includes("r") ? -HANDLE_SIZE / 2 : undefined,
                  top: handle.includes("t") ? -HANDLE_SIZE / 2 : undefined,
                  bottom: handle.includes("b") ? -HANDLE_SIZE / 2 : undefined,
                  cursor:
                    handle === "tl" || handle === "br"
                      ? "nwse-resize"
                      : "nesw-resize",
                }}
                onMouseDown={(e) => onMouseDownResizeImage(e, layer, handle)}
              />
            ))}
        </div>
      );
    }

    if (layerType === "text") {
      const rawText = (((layer as any).text ?? "") as string).toString();

      const fontSize = (((layer as any).fontSize as number) ?? 48) as number;
      const fontFamily = ((layer as any).fontFamily ?? "Inter") as string;
      const color = ((layer as any).color ?? "#FFFFFF") as string;
      const align = (((layer as any).align as any) ?? "center") as any;
      const lineHeight = (((layer as any).lineHeight as number) ?? 1.25) as number;

      const isParagraph = rawText.includes("\n") || rawText.length > 22;

      const width =
        typeof layer.width === "number" ? layer.width : isParagraph ? 420 : 320;

      const height =
        typeof layer.height === "number" ? layer.height : isParagraph ? 140 : 90;

      return (
        <div
          key={layer.id}
          ref={(el) => {
            layerRefs.current[layer.id] = el;
          }}
          className="absolute"
          style={{
            left: layer.x ?? 0,
            top: layer.y ?? 0,
            width: width,
            height: height,
            padding: 12,
            borderRadius: 10,
            userSelect: "none",
            cursor: "move",
            boxShadow: "none",
          }}
          onMouseDown={(e) => onMouseDownSelect(e, layer)}
        >
          <div
            style={{
              fontSize,
              fontFamily,
              color,
              textAlign: align,
              lineHeight,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {rawText}
          </div>

          {isSelected &&
            (["tl", "tr", "bl", "br"] as const).map((corner) => (
              <div
                key={corner}
                onMouseDown={(e) => onMouseDownResizeText(e, layer, corner)}
                className="absolute bg-[#ffb800] rounded-full"
                style={{
                  width: HANDLE_SIZE,
                  height: HANDLE_SIZE,
                  left: corner.includes("l") ? -HANDLE_SIZE / 2 : undefined,
                  right: corner.includes("r") ? -HANDLE_SIZE / 2 : undefined,
                  top: corner.includes("t") ? -HANDLE_SIZE / 2 : undefined,
                  bottom: corner.includes("b") ? -HANDLE_SIZE / 2 : undefined,
                  cursor: cornerCursor(corner),
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.45)",
                }}
              />
            ))}
        </div>
      );
    }

    return null;
  };

  const ordered = useMemo(() => {
    return [...layers].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  }, [layers]);

  // ✅ FIX TS minimal : EditorCanvasV5 Props dans ton projet ne contiennent pas "format"
  const EditorCanvasV5Any = EditorCanvasV5 as any;

  return (
    <EditorCanvasV5Any format={format} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      {guides.x !== null && (
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: guides.x,
            width: 1,
            background: "rgba(255,184,0,0.55)",
            boxShadow: "0 0 12px rgba(255,184,0,0.25)",
            pointerEvents: "none",
          }}
        />
      )}
      {guides.y !== null && (
        <div
          className="absolute left-0 right-0"
          style={{
            top: guides.y,
            height: 1,
            background: "rgba(255,184,0,0.55)",
            boxShadow: "0 0 12px rgba(255,184,0,0.25)",
            pointerEvents: "none",
          }}
        />
      )}

      {hud && (
        <div
          className="absolute left-3 top-3 text-[11px] font-semibold"
          style={{
            color: "rgba(255,184,0,0.95)",
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,184,0,0.25)",
            borderRadius: 10,
            padding: "6px 10px",
            pointerEvents: "none",
          }}
        >
          L:{hud.L} &nbsp; T:{hud.T} &nbsp; R:{hud.R} &nbsp; B:{hud.B}
        </div>
      )}

      {ordered.map(renderLayer)}
    </EditorCanvasV5Any>
  );
}
