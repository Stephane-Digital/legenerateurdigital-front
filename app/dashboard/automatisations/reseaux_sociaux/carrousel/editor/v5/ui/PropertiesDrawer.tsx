"use client";

import { useEffect, useMemo, useState } from "react";
import type { LayerData } from "../types/layers";

interface Props {
  open: boolean;
  layer: LayerData | null;
  onClose: () => void;
  onChange: (patch: Partial<LayerData>) => void;
}

const FONT_FAMILIES = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Oswald",
  "Roboto",
  "Lora",
  "Merriweather",
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function clampFloat(n: number, a: number, b: number) {
  const v = Number.isFinite(n) ? n : a;
  return Math.max(a, Math.min(b, v));
}


function normalizeHex(input: string) {
  let v = (input || "").trim();
  if (!v) return "#ffffff";
  if (!v.startsWith("#")) v = `#${v}`;
  v = "#" + v.slice(1).replace(/[^0-9a-fA-F]/g, "");
  if (v.length === 4) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (v.length === 7) return v.toLowerCase();
  return "#ffffff";
}


function textToHtml(text: string) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/
/g, "<br/>");
}

function estimateTextHeight(
  text: string,
  options: {
    width: number;
    fontSize: number;
    lineHeight: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
  }
) {
  const fontSize = clamp(options.fontSize || 48, 8, 400);
  const lineHeight = clampFloat(options.lineHeight || 1.2, 0.8, 3);
  const width = clamp(options.width || 420, 40, 4000);

  if (typeof document === "undefined") {
    return Math.max(120, Math.ceil(fontSize * lineHeight * 3));
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return Math.max(120, Math.ceil(fontSize * lineHeight * 3));

  ctx.font = `${options.fontStyle} ${options.fontWeight} ${fontSize}px ${options.fontFamily}`.trim();

  const usableWidth = Math.max(40, width - 24);
  const paragraphs = String(text || "").replace(/\r/g, "").split(/\n/);
  let lineCount = 0;

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lineCount += 1;
      continue;
    }

    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const measured = ctx.measureText(test).width;
      if (measured <= usableWidth || !current) {
        current = test;
      } else {
        lineCount += 1;
        current = word;
      }
    }

    lineCount += 1;
  }

  const height = Math.ceil(lineCount * fontSize * lineHeight + 24);
  return clamp(height, 40, 4000);
}

export default function PropertiesDrawer({ open, layer, onClose, onChange }: Props) {
  const isText = layer?.type === "text";
  const isImage = layer?.type === "image";

  const style = ((layer as any)?.style ?? {}) as any;

  const [textDraft, setTextDraft] = useState<string>(String((layer as any)?.text ?? ""));

  useEffect(() => {
    if (!layer || !isText) return;
    setTextDraft(String((layer as any)?.text ?? ""));
  }, [layer?.id, (layer as any)?.text, isText]);

  const metrics = useMemo(() => {
    if (!layer) return null;
    const w = typeof (layer as any).width === "number" ? (layer as any).width : isText ? 420 : 300;
    const h = typeof (layer as any).height === "number" ? (layer as any).height : isText ? 120 : 300;
    const fontSize = typeof style.fontSize === "number" ? style.fontSize : 48;
    return { w, h, fontSize };
  }, [layer, isText, style.fontSize]);

  if (!open || !layer) return null;

  const lineHeight =
    typeof style.lineHeight === "number" && Number.isFinite(style.lineHeight) ? style.lineHeight : 1.2;

  const updateTextPatch = (value: string, widthOverride?: number, styleOverride?: any) => {
    const nextStyle = { ...(style ?? {}), ...(styleOverride ?? {}) };
    const width =
      typeof widthOverride === "number"
        ? widthOverride
        : typeof (layer as any)?.width === "number"
        ? (layer as any).width
        : 420;

    const nextHeight = estimateTextHeight(value, {
      width,
      fontSize: typeof nextStyle.fontSize === "number" ? nextStyle.fontSize : 48,
      lineHeight:
        typeof nextStyle.lineHeight === "number" && Number.isFinite(nextStyle.lineHeight)
          ? nextStyle.lineHeight
          : 1.2,
      fontFamily: String(nextStyle.fontFamily || "Inter"),
      fontWeight: String(nextStyle.fontWeight || "normal"),
      fontStyle: String(nextStyle.fontStyle || "normal"),
    });

    onChange({ text: value, html: textToHtml(value), height: nextHeight } as any);
  };

  const setStyle = (patch: any) => {
    const nextStyle = { ...(style ?? {}), ...(patch ?? {}) };

    if (isText) {
      const width = typeof (layer as any)?.width === "number" ? (layer as any).width : 420;
      const nextHeight = estimateTextHeight(String(textDraft || ""), {
        width,
        fontSize: typeof nextStyle.fontSize === "number" ? nextStyle.fontSize : 48,
        lineHeight:
          typeof nextStyle.lineHeight === "number" && Number.isFinite(nextStyle.lineHeight)
            ? nextStyle.lineHeight
            : 1.2,
        fontFamily: String(nextStyle.fontFamily || "Inter"),
        fontWeight: String(nextStyle.fontWeight || "normal"),
        fontStyle: String(nextStyle.fontStyle || "normal"),
      });
      onChange({ style: nextStyle, height: nextHeight } as any);
      return;
    }

    onChange({ style: nextStyle } as any);
  };

  const toggleStyleFlag = (key: string, onValue: any, offValue: any) => {
    const cur = (style as any)?.[key];
    setStyle({ [key]: cur === onValue ? offValue : onValue });
  };

  const nudge = (dx: number, dy: number) => {
    const x = (layer as any).x ?? 0;
    const y = (layer as any).y ?? 0;
    onChange({ x: x + dx, y: y + dy } as any);
  };

  const textAlign: "left" | "center" | "right" =
    style.textAlign === "center" || style.textAlign === "right" ? style.textAlign : "left";

  const currentColor =
    (typeof style.fill === "string" && style.fill) ||
    (typeof style.color === "string" && style.color) ||
    (typeof style.textColor === "string" && style.textColor) ||
    "#ffffff";

  const applyTextColor = (hex: string) => {
    const c = normalizeHex(hex);
    setStyle({ fill: c, color: c, textColor: c });
  };

  const setLineHeight = (v: number) => {
    setStyle({ lineHeight: clampFloat(v, 0.8, 3) });
  };

  return (
    <div className="mt-4 rounded-2xl border border-yellow-500/15 bg-black/40 p-4">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&family=Lora:wght@400;500;600;700&family=Merriweather:wght@300;400;700&display=swap");
      `}</style>

      <div className="flex items-center justify-between mb-3">
        <div className="text-yellow-300 font-semibold text-sm">Propriétés</div>
        <button onClick={onClose} className="text-yellow-200/80 hover:text-yellow-200 text-sm">
          ✖
        </button>
      </div>

      {metrics && (
        <div className="mb-4 rounded-xl border border-yellow-500/15 bg-black/30 p-3">
          <div className="text-[12px] text-yellow-200/80">
            Taille réelle :{" "}
            <span className="text-yellow-100">
              {Math.round(metrics.w)}×{Math.round(metrics.h)}px
            </span>
            {isText ? (
              <>
                {" "}• Police : <span className="text-yellow-100">{Math.round(metrics.fontSize)}px</span>
              </>
            ) : null}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              onClick={() => nudge(-1, 0)}
              className="rounded-lg border border-yellow-500/15 bg-black/30 px-2 py-2 text-xs text-yellow-200 hover:bg-yellow-500/10"
            >
              ←
            </button>
            <button
              onClick={() => nudge(0, -1)}
              className="rounded-lg border border-yellow-500/15 bg-black/30 px-2 py-2 text-xs text-yellow-200 hover:bg-yellow-500/10"
            >
              ↑
            </button>
            <button
              onClick={() => nudge(1, 0)}
              className="rounded-lg border border-yellow-500/15 bg-black/30 px-2 py-2 text-xs text-yellow-200 hover:bg-yellow-500/10"
            >
              →
            </button>
            <button
              onClick={() => nudge(0, 1)}
              className="rounded-lg border border-yellow-500/15 bg-black/30 px-2 py-2 text-xs text-yellow-200 hover:bg-yellow-500/10"
            >
              ↓
            </button>
            <div className="col-span-2 text-[11px] text-white/45 flex items-center">Déplacer au pixel près</div>
          </div>
        </div>
      )}

      {isText && (
        <div className="space-y-4">
          <div>
            <label className="block text-yellow-400 text-xs mb-2">Texte</label>
            <textarea
              value={textDraft}
              onChange={(e) => {
                const value = e.target.value;
                setTextDraft(value);
                updateTextPatch(value);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Tab") return;
                e.preventDefault();
                const target = e.currentTarget;
                const start = target.selectionStart ?? 0;
                const end = target.selectionEnd ?? 0;
                const value = `${textDraft.slice(0, start)}  ${textDraft.slice(end)}`;
                setTextDraft(value);
                updateTextPatch(value);
                requestAnimationFrame(() => {
                  target.selectionStart = target.selectionEnd = start + 2;
                });
              }}
              rows={4}
              className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100 outline-none"
            />
          </div>


          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-yellow-400 text-xs mb-2">Police</label>
              <select
                value={style.fontFamily ?? "Inter"}
                onChange={(e) => setStyle({ fontFamily: e.target.value })}
                className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-yellow-400 text-xs mb-2">Taille (px)</label>
              <input
                type="number"
                value={typeof style.fontSize === "number" ? style.fontSize : 48}
                onChange={(e) => setStyle({ fontSize: clamp(Number(e.target.value || 0), 10, 400) })}
                className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-yellow-400 text-xs mb-2">Interligne</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.8}
                max={3}
                step={0.05}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="flex-1 accent-[#ffb800]"
              />
              <input
                type="number"
                min={0.8}
                max={3}
                step={0.05}
                value={Number(lineHeight.toFixed(2))}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-24 rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
              />
            </div>
            <div className="mt-1 text-[11px] text-white/45">1.2 = standard • 0.8 serré • 1.6 aéré</div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-yellow-400 text-xs mb-2">Couleur du texte</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={normalizeHex(currentColor)}
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="h-11 w-12 rounded-xl bg-black/40 border border-yellow-500/20"
                />
                <input
                  value={normalizeHex(currentColor)}
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="flex-1 rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-yellow-400 text-xs mb-2">Alignement</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setStyle({ textAlign: "left" })}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    textAlign === "left"
                      ? "bg-[#ffb800] text-black border-[#ffb800]"
                      : "border-yellow-500/20 text-yellow-200 bg-black/30 hover:bg-yellow-500/10"
                  }`}
                >
                  Gauche
                </button>
                <button
                  onClick={() => setStyle({ textAlign: "center" })}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    textAlign === "center"
                      ? "bg-[#ffb800] text-black border-[#ffb800]"
                      : "border-yellow-500/20 text-yellow-200 bg-black/30 hover:bg-yellow-500/10"
                  }`}
                >
                  Centre
                </button>
                <button
                  onClick={() => setStyle({ textAlign: "right" })}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    textAlign === "right"
                      ? "bg-[#ffb800] text-black border-[#ffb800]"
                      : "border-yellow-500/20 text-yellow-200 bg-black/30 hover:bg-yellow-500/10"
                  }`}
                >
                  Droite
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-yellow-400 text-xs mb-2">Style</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => toggleStyleFlag("fontWeight", "bold", "normal")}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  style.fontWeight === "bold"
                    ? "bg-[#ffb800] text-black border-[#ffb800]"
                    : "border-yellow-500/20 text-yellow-200 bg-black/30 hover:bg-yellow-500/10"
                }`}
              >
                Gras
              </button>

              <button
                onClick={() => toggleStyleFlag("fontStyle", "italic", "normal")}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  style.fontStyle === "italic"
                    ? "bg-[#ffb800] text-black border-[#ffb800]"
                    : "border-yellow-500/20 text-yellow-200 bg-black/30 hover:bg-yellow-500/10"
                }`}
              >
                Italic
              </button>

              <button
                onClick={() => toggleStyleFlag("textDecoration", "underline", "none")}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  style.textDecoration === "underline"
                    ? "bg-[#ffb800] text-black border-[#ffb800]"
                    : "border-yellow-500/20 text-yellow-200 bg-black/30 hover:bg-yellow-500/10"
                }`}
              >
                Souligné
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-yellow-400 text-xs mb-2">Largeur (px)</label>
              <input
                type="number"
                value={typeof (layer as any).width === "number" ? (layer as any).width : 420}
                onChange={(e) => {
                  const width = clamp(Number(e.target.value || 0), 40, 4000);
                  const nextHeight = estimateTextHeight(textDraft, {
                    width,
                    fontSize: typeof style.fontSize === "number" ? style.fontSize : 48,
                    lineHeight,
                    fontFamily: String(style.fontFamily || "Inter"),
                    fontWeight: String(style.fontWeight || "normal"),
                    fontStyle: String(style.fontStyle || "normal"),
                  });
                  onChange({ width, height: nextHeight } as any);
                }}
                className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
              />
            </div>
            <div>
              <label className="block text-yellow-400 text-xs mb-2">Hauteur (px)</label>
              <input
                type="number"
                value={typeof (layer as any).height === "number" ? (layer as any).height : 120}
                onChange={(e) => onChange({ height: clamp(Number(e.target.value || 0), 40, 4000) } as any)}
                className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-3 text-[11px] text-white/55">
            La capsule peut maintenant être élargie horizontalement et verticalement sans grossir le texte.
            La taille de la police reste pilotée uniquement par le bloc <span className="text-yellow-200">Layer</span>.
          </div>
        </div>
      )}

      {isImage && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
            <div className="text-yellow-200 font-semibold mb-2">Image</div>
            <div className="text-[11px] text-white/55 mb-3 break-all">
              URL : <span className="text-yellow-100/70">{String((layer as any).url ?? "")}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-yellow-400 text-xs mb-2">Largeur (px)</label>
                <input
                  type="number"
                  value={typeof (layer as any).width === "number" ? (layer as any).width : 300}
                  onChange={(e) => onChange({ width: clamp(Number(e.target.value || 0), 40, 4000) } as any)}
                  className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
                />
              </div>
              <div>
                <label className="block text-yellow-400 text-xs mb-2">Hauteur (px)</label>
                <input
                  type="number"
                  value={typeof (layer as any).height === "number" ? (layer as any).height : 300}
                  onChange={(e) => onChange({ height: clamp(Number(e.target.value || 0), 40, 4000) } as any)}
                  className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
