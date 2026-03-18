"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnyObj = Record<string, any>;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getScaleCover({
  containerW,
  containerH,
  canvasW,
  canvasH,
}: {
  containerW: number;
  containerH: number;
  canvasW: number;
  canvasH: number;
}) {
  const sx = containerW / canvasW;
  const sy = containerH / canvasH;
  const scale = Math.max(sx, sy); // cover
  const scaledW = canvasW * scale;
  const scaledH = canvasH * scale;
  const offsetX = (containerW - scaledW) / 2;
  const offsetY = (containerH - scaledH) / 2;
  return { scale, offsetX, offsetY };
}

function normalizeLayerType(l: AnyObj) {
  const t = String(l?.type ?? l?.kind ?? l?.elementType ?? "").toLowerCase().trim();
  if (t.includes("background")) return "background";
  if (t.includes("image") || t.includes("img")) return "image";
  if (t.includes("text")) return "text";
  if (t.includes("shape") || t.includes("rect") || t.includes("rectangle")) return "shape";
  return t || "unknown";
}

function pickBackground(layers: AnyObj[]) {
  // background via couleur/gradient/url
  const bg = layers.find((l) => normalizeLayerType(l) === "background") ?? null;
  if (!bg) return null;

  const fill =
    bg?.fill ??
    bg?.color ??
    bg?.background ??
    bg?.props?.fill ??
    bg?.props?.color ??
    bg?.attrs?.fill ??
    null;

  const url =
    bg?.url ??
    bg?.src ??
    bg?.imageUrl ??
    bg?.image_url ??
    bg?.props?.url ??
    bg?.props?.src ??
    null;

  return { fill, url };
}

export default function ThumbStage({
  layers,
  canvasWidth,
  canvasHeight,
  cover = true,
}: {
  layers: AnyObj[];
  canvasWidth: number;
  canvasHeight: number;
  cover?: boolean;
}) {
  const safeW = Math.max(200, Number(canvasWidth) || 1080);
  const safeH = Math.max(200, Number(canvasHeight) || 1350);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [container, setContainer] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const r = entries?.[0]?.contentRect;
      if (!r) return;
      const w = Math.max(0, Math.floor(r.width));
      const h = Math.max(0, Math.floor(r.height));
      setContainer((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bg = useMemo(() => pickBackground(layers), [layers]);

  const coverTransform = useMemo(() => {
    const containerW = container.w;
    const containerH = container.h;
    const canvasW = safeW;
    const canvasH = safeH;

    if (!cover) return { transform: "translate(0px, 0px) scale(1)", origin: "top left" };

    // ✅ fallback stable (avant 1er ResizeObserver tick)
    const cw = containerW > 0 ? containerW : 1000;
    const ch = containerH > 0 ? containerH : 1000;

    const { scale, offsetX, offsetY } = getScaleCover({
      containerW: cw,
      containerH: ch,
      canvasW,
      canvasH,
    });

    return {
      transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
      origin: "top left",
    };
  }, [cover, container.w, container.h, safeW, safeH]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        {/* Fond */}
        {bg?.url ? (
          <img
            src={String(bg.url)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : bg?.fill ? (
          <div className="absolute inset-0" style={{ background: String(bg.fill) }} />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}

        {/* We render with a “virtual canvas” scaled in COVER inside the tile (CANVA-like). */}
        <div
          className="absolute inset-0"
          style={{ transformOrigin: coverTransform.origin, transform: coverTransform.transform }}
        >
          <div className="absolute left-0 top-0" style={{ width: safeW, height: safeH }}>
            {layers.map((layer, idx) => {
              const type = normalizeLayerType(layer);
              if (type === "background") return null;

              // ✅ IMPORTANT: coordonnées en TOP-LEFT (Konva)
              const x = Number(layer?.x ?? layer?.left ?? layer?.attrs?.x ?? 0) || 0;
              const y = Number(layer?.y ?? layer?.top ?? layer?.attrs?.y ?? 0) || 0;

              const ww = Number(layer?.width ?? layer?.w ?? layer?.attrs?.width ?? 0) || 0;
              const hh = Number(layer?.height ?? layer?.h ?? layer?.attrs?.height ?? 0) || 0;

              const rotation = Number(layer?.rotation ?? layer?.rotate ?? 0) || 0;
              const opacity = clamp(Number(layer?.opacity ?? 1) || 1, 0, 1);

              const id = String(layer?.id ?? layer?.key ?? `${idx}`);

              if (type === "text") {
                const text = String(layer?.text ?? layer?.value ?? layer?.content ?? "");
                if (!text) return null;

                const fontSize = Number(layer?.fontSize ?? layer?.font_size ?? 48) || 48;
                const color = String(layer?.fill ?? layer?.color ?? "#ffffff");

                const w = ww > 0 ? ww : 800;

                return (
                  <div
                    key={id}
                    className="absolute pointer-events-none select-none whitespace-pre-wrap"
                    style={{
                      left: x,
                      top: y,
                      width: w,
                      opacity,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "top left",
                      fontSize,
                      lineHeight: 1.1,
                      color,
                      fontWeight: 700,
                      textShadow: "0 2px 10px rgba(0,0,0,0.45)",
                    }}
                  >
                    {text}
                  </div>
                );
              }

              if (type === "image") {
                const src =
                  layer?.url ??
                  layer?.src ??
                  layer?.imageUrl ??
                  layer?.image_url ??
                  layer?.props?.url ??
                  layer?.props?.src ??
                  layer?.attrs?.src ??
                  layer?.attrs?.url ??
                  null;

                if (!src) return null;

                const iw = ww > 0 ? ww : 600;
                const ih = hh > 0 ? hh : 600;

                return (
                  <img
                    key={id}
                    src={String(src)}
                    alt=""
                    draggable={false}
                    className="absolute pointer-events-none select-none"
                    style={{
                      left: x,
                      top: y,
                      width: iw,
                      height: ih,
                      objectFit: "cover",
                      opacity,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "top left",
                      borderRadius: Number(layer?.radius ?? layer?.r ?? 0) || 0,
                    }}
                  />
                );
              }

              if (type === "shape" || type === "rect" || type === "rectangle") {
                const fill = String(layer?.fill || layer?.color || "rgba(255,255,255,0.15)");
                const r = Number(layer?.radius ?? layer?.r ?? 0) || 0;

                const rw = ww > 0 ? ww : 200;
                const rh = hh > 0 ? hh : 120;

                return (
                  <div
                    key={id}
                    className="absolute pointer-events-none"
                    style={{
                      left: x,
                      top: y,
                      width: rw,
                      height: rh,
                      opacity,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "top left",
                      background: fill,
                      borderRadius: r,
                    }}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
