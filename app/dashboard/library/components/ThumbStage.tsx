"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnyObj = Record<string, any>;

const FONT_STYLESHEET_IDS: Record<string, string> = {
  inter: "lgd-thumb-font-inter",
  lora: "lgd-thumb-font-lora",
  oswald: "lgd-thumb-font-oswald",
  montserrat: "lgd-thumb-font-montserrat",
  merriweather: "lgd-thumb-font-merriweather",
  roboto: "lgd-thumb-font-roboto",
  "playfair display": "lgd-thumb-font-playfair-display",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toNumber(value: any, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/px$/i, "").trim();
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function firstDefined(...values: any[]) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
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
  const scale = Math.max(sx, sy);
  const scaledW = canvasW * scale;
  const scaledH = canvasH * scale;
  const offsetX = (containerW - scaledW) / 2;
  const offsetY = (containerH - scaledH) / 2;
  return { scale, offsetX, offsetY };
}

function getFontKey(font?: string) {
  return String(font || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getFontImportCss(font?: string) {
  const key = getFontKey(font);
  const map: Record<string, string> = {
    inter: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');",
    lora: "@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap');",
    oswald: "@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');",
    montserrat: "@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');",
    merriweather: "@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');",
    roboto: "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');",
    "playfair display": "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');",
  };
  return map[key] || "";
}

function ensureFontStylesheetLoaded(font?: string) {
  if (typeof document === "undefined") return;
  const key = getFontKey(font);
  const css = getFontImportCss(font);
  if (!css) return;
  const id = FONT_STYLESHEET_IDS[key] || `lgd-thumb-font-${key}`;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

function normalizeLayerType(l: AnyObj) {
  const t = String(l?.type ?? l?.kind ?? l?.elementType ?? "").toLowerCase().trim();
  if (t.includes("background")) return "background";
  if (t.includes("image") || t.includes("img")) return "image";
  if (t.includes("text")) return "text";
  if (t.includes("shape") || t.includes("rect") || t.includes("rectangle")) return "shape";
  return t || "unknown";
}

function normalizeAssetUrl(value: any) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("url(")) {
    return raw.replace(/^url\((.*)\)$/i, "$1").replace(/^['\"]|['\"]$/g, "").trim();
  }
  return raw;
}

function pickBackground(layers: AnyObj[]) {
  const bg = layers.find((l) => normalizeLayerType(l) === "background") ?? null;
  if (!bg) return null;

  const fill =
    bg?.fill ??
    bg?.color ??
    bg?.background ??
    bg?.style?.fill ??
    bg?.style?.color ??
    bg?.style?.background ??
    bg?.props?.fill ??
    bg?.props?.color ??
    bg?.attrs?.fill ??
    null;

  const url = normalizeAssetUrl(
    bg?.url ??
      bg?.src ??
      bg?.imageUrl ??
      bg?.image_url ??
      bg?.style?.backgroundImage ??
      bg?.props?.url ??
      bg?.props?.src ??
      null
  );

  return { fill, url };
}

function sortLayers(layers: AnyObj[]) {
  return [...(Array.isArray(layers) ? layers : [])].sort((a, b) => {
    const za = toNumber(firstDefined(a?.zIndex, a?.z, a?.attrs?.zIndex), 0);
    const zb = toNumber(firstDefined(b?.zIndex, b?.z, b?.attrs?.zIndex), 0);
    return za - zb;
  });
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
  const safeW = Math.max(200, toNumber(canvasWidth, 1080));
  const safeH = Math.max(200, toNumber(canvasHeight, 1350));

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [container, setContainer] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const families = Array.from(
      new Set(
        (Array.isArray(layers) ? layers : [])
          .filter((layer) => normalizeLayerType(layer) === "text")
          .map((layer) => String(firstDefined(layer?.fontFamily, layer?.style?.fontFamily, layer?.attrs?.fontFamily, "")).trim())
          .filter(Boolean)
      )
    );

    families.forEach((family) => ensureFontStylesheetLoaded(family));
  }, [layers]);

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

  const orderedLayers = useMemo(() => sortLayers(layers), [layers]);
  const bg = useMemo(() => pickBackground(orderedLayers), [orderedLayers]);

  const coverTransform = useMemo(() => {
    const containerW = container.w;
    const containerH = container.h;
    const canvasW = safeW;
    const canvasH = safeH;

    if (!cover) return { transform: "translate(0px, 0px) scale(1)", origin: "top left" };

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

        <div
          className="absolute inset-0"
          style={{ transformOrigin: coverTransform.origin, transform: coverTransform.transform }}
        >
          <div className="absolute left-0 top-0" style={{ width: safeW, height: safeH }}>
            {orderedLayers.map((layer, idx) => {
              const type = normalizeLayerType(layer);
              if (type === "background") return null;

              const x = toNumber(firstDefined(layer?.x, layer?.left, layer?.attrs?.x), 0);
              const y = toNumber(firstDefined(layer?.y, layer?.top, layer?.attrs?.y), 0);
              const ww = toNumber(firstDefined(layer?.width, layer?.w, layer?.attrs?.width), 0);
              const hh = toNumber(firstDefined(layer?.height, layer?.h, layer?.attrs?.height), 0);
              const rotation = toNumber(firstDefined(layer?.rotation, layer?.rotate), 0);
              const opacity = clamp(toNumber(layer?.opacity, 1), 0, 1);
              const id = String(layer?.id ?? layer?.key ?? `${idx}`);

              if (type === "text") {
                const text = String(firstDefined(layer?.text, layer?.value, layer?.content, ""));
                if (!text) return null;

                const fontFamily = String(
                  firstDefined(layer?.fontFamily, layer?.style?.fontFamily, layer?.attrs?.fontFamily, "inherit")
                );
                const fontSize = toNumber(
                  firstDefined(layer?.fontSize, layer?.font_size, layer?.style?.fontSize, layer?.attrs?.fontSize),
                  48
                );
                const color = String(
                  firstDefined(layer?.fill, layer?.color, layer?.style?.color, layer?.attrs?.fill, "#ffffff")
                );
                const fontWeight = firstDefined(layer?.fontWeight, layer?.style?.fontWeight, layer?.attrs?.fontWeight, 400);
                const fontStyle = String(firstDefined(layer?.fontStyle, layer?.style?.fontStyle, layer?.attrs?.fontStyle, "normal"));
                const textAlign = String(firstDefined(layer?.align, layer?.textAlign, layer?.style?.textAlign, layer?.attrs?.align, "left"));
                const lineHeight = toNumber(
                  firstDefined(layer?.lineHeight, layer?.style?.lineHeight, layer?.attrs?.lineHeight),
                  1.1
                );
                const letterSpacing = toNumber(
                  firstDefined(layer?.letterSpacing, layer?.style?.letterSpacing, layer?.attrs?.letterSpacing),
                  0
                );
                const textDecoration = String(
                  firstDefined(layer?.textDecoration, layer?.style?.textDecoration, layer?.attrs?.textDecoration, "none")
                );
                const textTransform = String(
                  firstDefined(layer?.textTransform, layer?.style?.textTransform, layer?.attrs?.textTransform, "none")
                );
                const shadow = firstDefined(layer?.textShadow, layer?.style?.textShadow, layer?.attrs?.textShadow, "none");
                const stroke = firstDefined(layer?.stroke, layer?.style?.stroke, layer?.attrs?.stroke);
                const strokeWidth = toNumber(
                  firstDefined(layer?.strokeWidth, layer?.style?.strokeWidth, layer?.attrs?.strokeWidth),
                  0
                );
                const w = ww > 0 ? ww : 800;
                const minH = hh > 0 ? hh : undefined;

                return (
                  <div
                    key={id}
                    className="absolute pointer-events-none select-none whitespace-pre-wrap break-words"
                    style={{
                      left: x,
                      top: y,
                      width: w,
                      minHeight: minH,
                      opacity,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "top left",
                      fontFamily,
                      fontSize,
                      lineHeight,
                      letterSpacing,
                      color,
                      fontWeight: String(fontWeight) as any,
                      fontStyle,
                      textAlign: textAlign as any,
                      textDecoration,
                      textTransform: textTransform as any,
                      textShadow: String(shadow || "none"),
                      WebkitTextStroke: stroke && strokeWidth > 0 ? `${strokeWidth}px ${stroke}` : undefined,
                    }}
                  >
                    {text}
                  </div>
                );
              }

              if (type === "image") {
                const src = normalizeAssetUrl(
                  firstDefined(
                    layer?.url,
                    layer?.src,
                    layer?.imageUrl,
                    layer?.image_url,
                    layer?.props?.url,
                    layer?.props?.src,
                    layer?.attrs?.src,
                    layer?.attrs?.url,
                    ""
                  )
                );

                if (!src) return null;

                const iw = ww > 0 ? ww : 600;
                const ih = hh > 0 ? hh : 600;
                const objectFit = String(firstDefined(layer?.objectFit, layer?.style?.objectFit, layer?.attrs?.objectFit, "cover"));

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
                      objectFit: objectFit as any,
                      opacity,
                      transform: `rotate(${rotation}deg)`,
                      transformOrigin: "top left",
                      borderRadius: toNumber(firstDefined(layer?.radius, layer?.r, layer?.style?.borderRadius), 0),
                    }}
                  />
                );
              }

              if (type === "shape" || type === "rect" || type === "rectangle") {
                const fill = String(
                  firstDefined(layer?.fill, layer?.color, layer?.style?.background, layer?.style?.color, "rgba(255,255,255,0.15)")
                );
                const r = toNumber(firstDefined(layer?.radius, layer?.r, layer?.style?.borderRadius), 0);
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
