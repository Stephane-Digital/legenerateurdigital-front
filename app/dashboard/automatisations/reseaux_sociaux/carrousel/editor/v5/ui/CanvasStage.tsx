"use client";

import type { Dispatch, SetStateAction } from "react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { LayerData } from "../types/layers";
import EditorCanvasV5 from "./EditorCanvasV5";

const HANDLE_SIZE = 10;
const RESIZE_HIT = 12;
const BACKGROUND_LAYER_ID = "background-post";

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
  corner: "tl" | "tr" | "bl" | "br";
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
  origW: number;
  origH: number;
  origFontSize: number;
} | null;

type ResizeState = ResizeImageState | ResizeTextState;
type Guides = { x: number | null; y: number | null };
type Hud =
  | {
      cx: number;
      cy: number;
      L: number;
      T: number;
      R: number;
      B: number;
    }
  | null;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mergeStyle(a: any, b: any) {
  const A = a ?? {};
  const B = b ?? {};
  return { ...A, ...B };
}

function cornerCursor(corner: "tl" | "tr" | "bl" | "br") {
  if (corner === "tl" || corner === "br") return "nwse-resize";
  return "nesw-resize";
}

export default function CanvasStage({
  layers,
  setLayers,
  format,
  onSelectLayer,
}: {
  layers: LayerData[];
  setLayers: Dispatch<SetStateAction<LayerData[]>>;
  format: { w: number; h: number };
  onSelectLayer?: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [drag, setDrag] = useState<DragState>(null);
  const [resize, setResize] = useState<ResizeState>(null);
  const [scale, setScale] = useState(1);

  const [guides, setGuides] = useState<Guides>({ x: null, y: null });
  const [hud, setHud] = useState<Hud>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const { clientWidth, clientHeight } = el;
      const sx = clientWidth / (format.w || 1);
      const sy = clientHeight / (format.h || 1);
      setScale(Math.min(sx, sy));
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [format.w, format.h]);

  const backgroundLayer = useMemo(
    () =>
      ((layers as any[]).find((l: any) => l.id === BACKGROUND_LAYER_ID) as any) ??
      ((layers as any[]).find((l: any) => l.id === "bg") as any) ??
      ((layers as any[]).find((l: any) => l.id === "background") as any) ??
      ((layers as any[]).find((l: any) => l.type === "background") as any),
    [layers]
  );

  const overlay = (backgroundLayer?.style as any)?.overlay;

  const orderedLayers = useMemo(() => {
    const filtered = (layers as any[]).filter(
      (l: any) =>
        l.type !== "background" &&
        l.id !== BACKGROUND_LAYER_ID &&
        l.id !== "bg" &&
        l.id !== "background"
    );
    return [...filtered].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  }, [layers]);

  const overlayZ = useMemo(() => {
    let m = 0;
    for (const l of layers as any[]) {
      if ((l as any).type === "text") continue;
      const z = typeof (l as any).zIndex === "number" ? (l as any).zIndex : 0;
      m = Math.max(m, z);
    }
    return m + 1;
  }, [layers]);

  const textZBase = useMemo(() => overlayZ + 1000, [overlayZ]);
  const uiZBase = useMemo(() => textZBase + 2000, [textZBase]);

  const updateLayer = useCallback(
    (id: string, patch: Partial<LayerData>) => {
      setLayers((prev) =>
        prev.map((l: any) =>
          l.id === id
            ? {
                ...l,
                ...patch,
                style: mergeStyle(l.style, (patch as any).style),
              }
            : l
        )
      );
    },
    [setLayers]
  );

  const setSelected = useCallback(
    (id: string | null) => {
      setLayers((prev) =>
        prev.map((l: any) => ({ ...l, selected: id ? l.id === id : false }))
      );
      onSelectLayer?.(id);
    },
    [setLayers, onSelectLayer]
  );

  const getLocalPoint = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();

      const stageWidth = (format.w || 0) * scale;
      const stageLeft = r.left + (r.width - stageWidth) / 2;
      const stageTop = r.top;

      return {
        x: (clientX - stageLeft) / scale,
        y: (clientY - stageTop) / scale,
      };
    },
    [format.w, scale]
  );

  const getLayerDims = (layer: any) => {
    const w = typeof layer.width === "number" ? layer.width : 0;
    const h = typeof layer.height === "number" ? layer.height : 0;
    return { w, h };
  };

  const SNAP_THRESHOLD = 10;

  const applySnap = useCallback(
    (id: string, x: number, y: number, w: number, h: number) => {
      const maxX = Math.max(0, format.w - w);
      const maxY = Math.max(0, format.h - h);

      let nx = clamp(x, 0, maxX);
      let ny = clamp(y, 0, maxY);

      let gx: number | null = null;
      let gy: number | null = null;

      const candidatesX: Array<{ target: number; guide: number }> = [
        { target: 0, guide: 0 },
        { target: format.w / 2 - w / 2, guide: format.w / 2 },
        { target: format.w - w, guide: format.w },
      ];

      const candidatesY: Array<{ target: number; guide: number }> = [
        { target: 0, guide: 0 },
        { target: format.h / 2 - h / 2, guide: format.h / 2 },
        { target: format.h - h, guide: format.h },
      ];

      for (const other of orderedLayers as any[]) {
        if (!other || other.id === id) continue;
        if (other.visible === false) continue;

        const ox = other.x ?? 0;
        const oy = other.y ?? 0;
        const ow = other.width ?? 0;
        const oh = other.height ?? 0;

        candidatesX.push(
          { target: ox, guide: ox },
          { target: ox + ow / 2 - w / 2, guide: ox + ow / 2 },
          { target: ox + ow - w, guide: ox + ow }
        );

        candidatesY.push(
          { target: oy, guide: oy },
          { target: oy + oh / 2 - h / 2, guide: oy + oh / 2 },
          { target: oy + oh - h, guide: oy + oh }
        );
      }

      for (const c of candidatesX) {
        if (Math.abs(nx - c.target) <= SNAP_THRESHOLD) {
          nx = c.target;
          gx = c.guide;
          break;
        }
      }

      for (const c of candidatesY) {
        if (Math.abs(ny - c.target) <= SNAP_THRESHOLD) {
          ny = c.target;
          gy = c.guide;
          break;
        }
      }

      const L = Math.max(0, Math.round(nx));
      const T = Math.max(0, Math.round(ny));
      const R = Math.max(0, Math.round(format.w - (nx + w)));
      const B = Math.max(0, Math.round(format.h - (ny + h)));

      const hudCx = clamp(nx + w / 2, 0, format.w);
      const hudCy = clamp(ny, 0, format.h);

      return {
        x: nx,
        y: ny,
        gx,
        gy,
        hud: { cx: hudCx, cy: hudCy, L, T, R, B } as Hud,
      };
    },
    [format.w, format.h, orderedLayers]
  );

  const getTextCornerHit = (layer: any, localX: number, localY: number) => {
    const x = layer.x ?? 0;
    const y = layer.y ?? 0;
    const w = typeof layer.width === "number" ? layer.width : 420;
    const h = typeof layer.height === "number" ? layer.height : 120;

    const rx = localX - x;
    const ry = localY - y;
    if (rx < 0 || ry < 0 || rx > w || ry > h) return null;

    const left = rx <= RESIZE_HIT;
    const right = rx >= w - RESIZE_HIT;
    const top = ry <= RESIZE_HIT;
    const bottom = ry >= h - RESIZE_HIT;

    if (left && top) return "tl" as const;
    if (right && top) return "tr" as const;
    if (left && bottom) return "bl" as const;
    if (right && bottom) return "br" as const;
    return null;
  };

  const onMouseDownLayer = (e: React.MouseEvent, layer: LayerData) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      (layer as any).id === BACKGROUND_LAYER_ID ||
      (layer as any).id === "bg" ||
      (layer as any).id === "background"
    )
      return;

    if ((layer as any).type === "background") return;

    const p = getLocalPoint(e.clientX, e.clientY);

    setSelected((layer as any).id);
    setGuides({ x: null, y: null });
    setHud(null);

    if ((layer as any).type === "text") {
      const corner = getTextCornerHit(layer, p.x, p.y);
      if (corner) {
        const fontSize =
          typeof ((layer as any).style as any)?.fontSize === "number"
            ? ((layer as any).style as any).fontSize
            : 48;

        const baseW =
          typeof (layer as any).width === "number" ? (layer as any).width : 420;
        const baseH =
          typeof (layer as any).height === "number" ? (layer as any).height : 120;

        setResize({
          kind: "text",
          id: (layer as any).id,
          corner,
          startX: p.x,
          startY: p.y,
          origW: baseW,
          origH: baseH,
          origFontSize: fontSize,
        });
        return;
      }
    }

    setDrag({
      id: (layer as any).id,
      startX: p.x,
      startY: p.y,
      origX: (layer as any).x ?? 0,
      origY: (layer as any).y ?? 0,
    });
  };

  const onMouseDownResizeImage = (
    e: React.MouseEvent,
    layer: any,
    corner: "tl" | "tr" | "bl" | "br"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const p = getLocalPoint(e.clientX, e.clientY);

    setSelected(layer.id);
    setGuides({ x: null, y: null });
    setHud(null);

    setResize({
      kind: "image",
      id: layer.id,
      corner,
      startX: p.x,
      startY: p.y,
      origX: layer.x ?? 0,
      origY: layer.y ?? 0,
      origW: layer.width ?? 300,
      origH: layer.height ?? 300,
    });
  };

  const onMouseDownResizeText = (
    e: React.MouseEvent,
    layer: any,
    corner: "tl" | "tr" | "bl" | "br"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const p = getLocalPoint(e.clientX, e.clientY);

    setSelected(layer.id);
    setGuides({ x: null, y: null });
    setHud(null);

    const fontSize =
      typeof (layer.style as any)?.fontSize === "number" ? (layer.style as any).fontSize : 48;

    const baseW = typeof layer.width === "number" ? layer.width : 420;
    const baseH = typeof layer.height === "number" ? layer.height : 120;

    setResize({
      kind: "text",
      id: layer.id,
      corner,
      startX: p.x,
      startY: p.y,
      origW: baseW,
      origH: baseH,
      origFontSize: fontSize,
    });
  };

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!drag && !resize) return;

      const p = getLocalPoint(clientX, clientY);

      if (resize?.kind === "image") {
        const dx = p.x - resize.startX;
        const dy = p.y - resize.startY;

        let newX = resize.origX;
        let newY = resize.origY;
        let newW = resize.origW;
        let newH = resize.origH;

        if (resize.corner.includes("r")) newW = clamp(resize.origW + dx, 20, format.w * 10);
        if (resize.corner.includes("l")) {
          newW = clamp(resize.origW - dx, 20, format.w * 10);
          newX = resize.origX + dx;
        }
        if (resize.corner.includes("b")) newH = clamp(resize.origH + dy, 20, format.h * 10);
        if (resize.corner.includes("t")) {
          newH = clamp(resize.origH - dy, 20, format.h * 10);
          newY = resize.origY + dy;
        }

        updateLayer(resize.id, { x: newX, y: newY, width: newW, height: newH } as any);
        return;
      }

      if (resize?.kind === "text") {
        const dx = p.x - resize.startX;
        const dy = p.y - resize.startY;

        const delta = Math.max(dx, dy);
        const scaleFactor = 1 + delta / 300;

        const nextFontSize = clamp(resize.origFontSize * scaleFactor, 10, 220);
        const newW = clamp(resize.origW * scaleFactor, 50, format.w * 2);
        const newH = clamp(resize.origH * scaleFactor, 30, format.h * 2);

        updateLayer(resize.id, {
          width: newW,
          height: newH,
          style: { fontSize: nextFontSize } as any,
        } as any);
        return;
      }

      if (drag) {
        const layer = layers.find((l: any) => l.id === drag.id);
        if (!layer) return;

        const { w, h } = getLayerDims(layer as any);

        const rawX = drag.origX + (p.x - drag.startX);
        const rawY = drag.origY + (p.y - drag.startY);

        const snapped = applySnap(drag.id, rawX, rawY, w, h);

        updateLayer(drag.id, {
          x: snapped.x,
          y: snapped.y,
        } as any);

        setGuides({ x: snapped.gx, y: snapped.gy });
        setHud(snapped.hud);
      }
    },
    [drag, resize, getLocalPoint, format.w, format.h, updateLayer, layers, applySnap]
  );

  const handlePointerUp = useCallback(() => {
    setDrag(null);
    setResize(null);
    setGuides({ x: null, y: null });
    setHud(null);
  }, []);

  useEffect(() => {
    if (!drag && !resize) return;

    const onWindowMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onWindowUp = () => {
      handlePointerUp();
    };

    window.addEventListener("mousemove", onWindowMove);
    window.addEventListener("mouseup", onWindowUp);

    return () => {
      window.removeEventListener("mousemove", onWindowMove);
      window.removeEventListener("mouseup", onWindowUp);
    };
  }, [drag, resize, handlePointerMove, handlePointerUp]);

  const canvasCursor = useMemo(() => {
    if (!resize && !drag) return "default";
    if (resize?.kind === "image") return cornerCursor(resize.corner);
    if (resize?.kind === "text") return cornerCursor(resize.corner);
    if (drag) return "move";
    return "default";
  }, [resize, drag]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div
        className="absolute left-1/2 top-0"
        style={{
          width: format.w,
          height: format.h,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center",
          cursor: canvasCursor,
        }}
        onMouseDown={() => {
          setSelected(null);
          setGuides({ x: null, y: null });
          setHud(null);
        }}
      >
        <EditorCanvasV5 width={format.w} height={format.h}>
          <div
            className="absolute inset-0"
            style={{
              background: (backgroundLayer as any)?.style?.color ?? "#111",
              zIndex: -9999,
              pointerEvents: "none",
            }}
          />

          {(backgroundLayer as any)?.id === BACKGROUND_LAYER_ID &&
            (backgroundLayer as any)?.type === "image" &&
            (backgroundLayer as any)?.src && (
              <img
                src={(backgroundLayer as any).src}
                alt=""
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  zIndex: -9998,
                  pointerEvents: "none",
                }}
              />
            )}

          {overlay && (
            <div
              className="absolute inset-0"
              style={{
                background: overlay.value,
                opacity: overlay.opacity ?? 0.4,
                zIndex: overlayZ,
                pointerEvents: "none",
              }}
            />
          )}

          {guides.x !== null && (
            <div
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: guides.x,
                background: "rgba(255,184,0,0.55)",
                boxShadow: "0 0 12px rgba(255,184,0,0.25)",
                pointerEvents: "none",
                zIndex: uiZBase,
              }}
            />
          )}
          {guides.y !== null && (
            <div
              className="absolute left-0 right-0 h-px"
              style={{
                top: guides.y,
                background: "rgba(255,184,0,0.55)",
                boxShadow: "0 0 12px rgba(255,184,0,0.25)",
                pointerEvents: "none",
                zIndex: uiZBase,
              }}
            />
          )}

          {hud && (
            <div
              className="absolute text-[11px] font-semibold"
              style={{
                left: hud.cx,
                top: hud.cy,
                transform: "translate(-50%, -100%)",
                color: "rgba(255,184,0,0.95)",
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,184,0,0.25)",
                borderRadius: 10,
                padding: "6px 10px",
                pointerEvents: "none",
                zIndex: uiZBase + 1,
              }}
            >
              L:{hud.L} &nbsp; T:{hud.T} &nbsp; R:{hud.R} &nbsp; B:{hud.B}
            </div>
          )}

          {orderedLayers.map((layer: any) => {
            if (layer.visible === false) return null;

            const x = layer.x ?? 0;
            const y = layer.y ?? 0;
            const isSelected = layer.selected === true;

            if (layer.type === "image") {
              const w = layer.width ?? 300;
              const h = layer.height ?? 300;

              return (
                <div
                  key={layer.id}
                  className="absolute"
                  style={{
                    left: x,
                    top: y,
                    width: w,
                    height: h,
                    zIndex: layer.zIndex,
                  }}
                  onMouseDown={(e) => onMouseDownLayer(e, layer)}
                >
                  <img
                    src={layer.src}
                    draggable={false}
                    className="w-full h-full object-cover rounded-lg"
                    alt=""
                  />

                  {isSelected &&
                    (["tl", "tr", "bl", "br"] as const).map((corner) => (
                      <div
                        key={corner}
                        onMouseDown={(e) => onMouseDownResizeImage(e, layer, corner)}
                        className="absolute bg-[#ffb800] rounded-full"
                        style={{
                          width: HANDLE_SIZE,
                          height: HANDLE_SIZE,
                          cursor: cornerCursor(corner),
                          left: corner.includes("l") ? -5 : undefined,
                          right: corner.includes("r") ? -5 : undefined,
                          top: corner.includes("t") ? -5 : undefined,
                          bottom: corner.includes("b") ? -5 : undefined,
                        }}
                      />
                    ))}
                </div>
              );
            }

            if (layer.type === "text") {
              const rawText = layer.text ?? "";

              const fontFamily =
                typeof layer.style?.fontFamily === "string" && layer.style.fontFamily.trim().length
                  ? layer.style.fontFamily
                  : "Inter";

              const fontWeight = layer.style?.fontWeight ?? "normal";
              const fontStyle =
                layer.style?.fontStyle === "italic" || layer.style?.italic === true
                  ? "italic"
                  : "normal";
              const textDecoration =
                layer.style?.textDecoration === "underline" || layer.style?.underline === true
                  ? "underline"
                  : "none";

              const textAlign =
                layer.style?.textAlign === "center" || layer.style?.textAlign === "right"
                  ? layer.style.textAlign
                  : "left";

              const w = typeof layer.width === "number" ? layer.width : 420;
              const h = typeof layer.height === "number" ? layer.height : 120;

              return (
                <div
                  key={layer.id}
                  className="absolute whitespace-pre-wrap break-words select-none"
                  style={{
                    left: x,
                    top: y,
                    width: w,
                    height: h,
                    zIndex: textZBase + (layer.zIndex ?? 0),
                    fontSize: layer.style?.fontSize ?? 48,
                    color: layer.style?.color ?? "#ffffff",
                    fontFamily,
                    fontWeight,
                    fontStyle,
                    textDecoration,
                    lineHeight: layer.style?.lineHeight ?? 1.35,
                    textAlign,
                    cursor: "move",
                    boxShadow: "none",
                    padding: 6,
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                  onMouseDown={(e) => onMouseDownLayer(e, layer)}
                >
                  <div style={{ width: "100%" }}>{rawText}</div>

                  {isSelected &&
                    (["tl", "tr", "bl", "br"] as const).map((corner) => (
                      <div
                        key={corner}
                        onMouseDown={(e) => onMouseDownResizeText(e, layer, corner)}
                        className="absolute bg-[#ffb800] rounded-full"
                        style={{
                          width: HANDLE_SIZE,
                          height: HANDLE_SIZE,
                          cursor: cornerCursor(corner),
                          left: corner.includes("l") ? -5 : undefined,
                          right: corner.includes("r") ? -5 : undefined,
                          top: corner.includes("t") ? -5 : undefined,
                          bottom: corner.includes("b") ? -5 : undefined,
                          boxShadow: "0 0 0 2px rgba(0,0,0,0.45)",
                        }}
                      />
                    ))}
                </div>
              );
            }

            return null;
          })}
        </EditorCanvasV5>
      </div>
    </div>
  );
}
