"use client";

import { useMemo } from "react";
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

export default function PropertiesDrawer({ open, layer, onClose, onChange }: Props) {
  const isText = layer?.type === "text";
  const isImage = layer?.type === "image";

  const style = ((layer as any)?.style ?? {}) as any;

  const metrics = useMemo(() => {
    if (!layer) return null;
    const w = typeof (layer as any).width === "number" ? (layer as any).width : isText ? 420 : 300;
    const h = typeof (layer as any).height === "number" ? (layer as any).height : isText ? 120 : 300;
    const fontSize = typeof style.fontSize === "number" ? style.fontSize : 48;
    return { w, h, fontSize };
  }, [layer, isText, style.fontSize]);

  if (!open || !layer) return null;

  const setStyle = (patch: any) => {
    onChange({ style: { ...(style ?? {}), ...(patch ?? {}) } } as any);
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

  const lineHeight =
    typeof style.lineHeight === "number" && Number.isFinite(style.lineHeight) ? style.lineHeight : 1.2;

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
                {" "}
                • Police : <span className="text-yellow-100">{Math.round(metrics.fontSize)}px</span>
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
            <div className="col-span-2 text-[11px] text-white/45 flex items-center">
              Déplacer au pixel près
            </div>
          </div>
        </div>
      )}

      {isText && (
        <div className="space-y-4">
          <div>
            <label className="block text-yellow-400 text-xs mb-2">Texte</label>
            <textarea
              value={String((layer as any).text ?? "")}
              onChange={(e) => onChange({ text: e.target.value } as any)}
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
                onChange={(e) => setStyle({ lineHeight: Number(e.target.value) })}
                className="flex-1 accent-[#ffb800]"
              />
              <input
                type="number"
                min={0.8}
                max={3}
                step={0.05}
                value={lineHeight}
                onChange={(e) => setStyle({ lineHeight: Number(e.target.value) })}
                className="w-20 rounded-xl bg-black/40 border border-yellow-500/20 px-2 py-2 text-yellow-100 text-sm"
              />
            </div>
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
                onChange={(e) => onChange({ width: clamp(Number(e.target.value || 0), 40, 4000) } as any)}
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
