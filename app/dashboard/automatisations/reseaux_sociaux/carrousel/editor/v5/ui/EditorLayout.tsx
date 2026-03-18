"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fileToBase64 } from "../../utils/fileToBase64";
import { rehydrateRuntimeImages } from "../../utils/rehydrateRuntimeImages";
import { CANVAS_FORMATS, CanvasFormatKey } from "../config/formats";
import type { LayerData } from "../types/layers";
import { applyAutoLayoutImages } from "../utils/autoLayout";
import CanvasStage from "./CanvasStage";
import LayersPanelV5 from "./LayersPanelV5";
import PropertiesDrawer from "./PropertiesDrawer";

const BACKGROUND_LAYER_ID = "background-post";

type BackgroundMode = "color" | "gradient" | "image";
type OverlayType = "color" | "gradient";

/* ================= LGD MICRO PATCH — TYPES ================= */
type EditorUIState = {
  formatKey: CanvasFormatKey;
  bgMode: BackgroundMode;
  bgColor: string;
  bgColor1: string;
  bgColor2: string;
  bgAngle: number;
  bgImage: string | null;
  overlayEnabled: boolean;
  overlayType: OverlayType;
  overlayColor1: string;
  overlayColor2: string;
  overlayOpacity: number;
};

interface Props {
  initialLayers?: LayerData[];
  initialLayersKey?: string | number;
  initialUI?: Partial<EditorUIState>;
  onUIChange?: (ui: EditorUIState) => void;

  // (Carrousel mode) persist slide layers
  onChange?: (layers: LayerData[]) => void;

  // MOBILE tools driven by Button A
  mobileToolsOpen?: boolean;
  onCloseMobileTools?: () => void;
}
/* ========================================================== */

const GRADIENT_PRESETS = [
  { label: "LGD Gold", color1: "#ffb800", color2: "#ff8c00", angle: 135 },
  { label: "Midnight", color1: "#0f2027", color2: "#203a43", angle: 135 },
  { label: "Neon Mint", color1: "#00ffcc", color2: "#00b4db", angle: 135 },
  { label: "Rose Power", color1: "#ff0066", color2: "#ffb800", angle: 135 },
];

function isProbablyDomImage(v: any) {
  return !!v && typeof v === "object" && (v.tagName === "IMG" || v.nodeName === "IMG");
}

function stripNonSerializable(input: any): any {
  if (input == null) return input;
  if (typeof input !== "object") return input;
  if (isProbablyDomImage(input)) return undefined;

  if (Array.isArray(input)) {
    return input
      .map((x) => stripNonSerializable(x))
      .filter((x) => x !== undefined);
  }

  const out: any = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;

    if (k === "runtime" || k === "_runtime" || k === "__runtime") continue;
    if (k === "imageElement" || k === "imgEl" || k === "htmlImage") continue;
    if (k === "konva" || k === "_konva" || k === "__konva") continue;

    if ((k === "image" || k === "img") && typeof v === "object" && !Array.isArray(v)) {
      if (isProbablyDomImage(v)) continue;
    }

    const cleaned = stripNonSerializable(v);
    if (cleaned !== undefined) out[k] = cleaned;
  }
  return out;
}

function coerceIncomingLayers(incoming: LayerData[]): LayerData[] {
  return incoming.map((l: any) => {
    if (l?.id === "background") return { ...l, id: BACKGROUND_LAYER_ID } as any;
    return l;
  });
}

function stableSerialize(value: any): string {
  const seen = new WeakSet();

  const normalize = (input: any): any => {
    if (input == null || typeof input !== "object") return input;
    if (seen.has(input)) return undefined;
    seen.add(input);

    if (Array.isArray(input)) return input.map(normalize);

    const out: Record<string, any> = {};
    for (const key of Object.keys(input).sort()) {
      const normalized = normalize(input[key]);
      if (normalized !== undefined) out[key] = normalized;
    }
    return out;
  };

  try {
    return JSON.stringify(normalize(value));
  } catch {
    return String(value);
  }
}

function layersSignatureForSync(layers: LayerData[]): string {
  const minimal = layers.map((l: any) => ({
    id: l.id,
    type: l.type,
    src: typeof l.src === "string" ? l.src : undefined,
    text: typeof l.text === "string" ? l.text : undefined,
    x: l.x,
    y: l.y,
    width: l.width,
    height: l.height,
    zIndex: l.zIndex,
    visible: l.visible,
    style: l.style,
  }));
  return stableSerialize(minimal);
}

export default function EditorLayout({
  initialLayers,
  initialLayersKey,
  initialUI,
  onUIChange,
  onChange,
  mobileToolsOpen = false,
  onCloseMobileTools,
}: Props) {
  /* ================= FORMAT ================= */
  const [formatKey, setFormatKey] = useState<CanvasFormatKey>(
    initialUI?.formatKey ?? "instagram_post"
  );
  const rawFormat = CANVAS_FORMATS[formatKey] as any;

  // Provide both width/height and w/h to be compatible with CanvasStage
  const format = useMemo(() => {
    const w = rawFormat?.w ?? rawFormat?.width ?? 1080;
    const h = rawFormat?.h ?? rawFormat?.height ?? 1080;
    return {
      ...rawFormat,
      w,
      h,
      width: rawFormat?.width ?? w,
      height: rawFormat?.height ?? h,
    };
  }, [rawFormat]);

  const [layers, setLayers] = useState<LayerData[]>([]);
  const [showProps, setShowProps] = useState(false);

  /* ================= BACKGROUND STATE ================= */
  const [bgMode, setBgMode] = useState<BackgroundMode>(initialUI?.bgMode ?? "color");
  const [bgColor, setBgColor] = useState(initialUI?.bgColor ?? "#111111");
  const [bgColor1, setBgColor1] = useState(initialUI?.bgColor1 ?? "#ffb800");
  const [bgColor2, setBgColor2] = useState(initialUI?.bgColor2 ?? "#00ffcc");
  const [bgAngle, setBgAngle] = useState(initialUI?.bgAngle ?? 135);
  const [bgImage, setBgImage] = useState<string | null>(initialUI?.bgImage ?? null);

  /* ================= OVERLAY STATE ================= */
  const [overlayEnabled, setOverlayEnabled] = useState(initialUI?.overlayEnabled ?? false);
  const [overlayType, setOverlayType] = useState<OverlayType>(initialUI?.overlayType ?? "color");
  const [overlayColor1, setOverlayColor1] = useState(initialUI?.overlayColor1 ?? "#000000");
  const [overlayColor2, setOverlayColor2] = useState(initialUI?.overlayColor2 ?? "#000000");
  const [overlayOpacity, setOverlayOpacity] = useState(initialUI?.overlayOpacity ?? 0.35);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgImageInputRef = useRef<HTMLInputElement | null>(null);

  // guards to prevent loops
  const hydratingRef = useRef(false);
  const lastReceivedSigRef = useRef<string>("");
  const lastInitKeyRef = useRef<string | number | null>(null);
  const lastEmittedSigRef = useRef<string>("");
  const lastUiSigRef = useRef<string>("");
  const onUIChangeRef = useRef<Props["onUIChange"]>(onUIChange);
  const onChangeRef = useRef<Props["onChange"]>(onChange);

  /* ================= CANVA-LIKE GUIDES (HTML overlay) ================= */
  const stageWrapRef = useRef<HTMLDivElement | null>(null);
  const [stagePx, setStagePx] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setStagePx({ w: r.width, h: r.height });
    });
    ro.observe(el);

    const r0 = el.getBoundingClientRect();
    setStagePx({ w: r0.width, h: r0.height });

    return () => ro.disconnect();
  }, []);

  const scale = useMemo(() => {
    if (!stagePx.w || !stagePx.h) return 1;
    const sx = stagePx.w / (format.w || 1);
    const sy = stagePx.h / (format.h || 1);
    return Math.min(sx, sy);
  }, [stagePx.w, stagePx.h, format.w, format.h]);

  const centerX = useMemo(() => (format.w * scale) / 2, [format.w, scale]);
  const centerY = useMemo(() => (format.h * scale) / 2, [format.h, scale]);

  useEffect(() => {
    onUIChangeRef.current = onUIChange;
  }, [onUIChange]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /* ================= UI SYNC ================= */
  useEffect(() => {
    if (!onUIChangeRef.current) return;

    const nextUI: EditorUIState = {
      formatKey,
      bgMode,
      bgColor,
      bgColor1,
      bgColor2,
      bgAngle,
      bgImage,
      overlayEnabled,
      overlayType,
      overlayColor1,
      overlayColor2,
      overlayOpacity,
    };

    const sig = JSON.stringify(nextUI);
    if (sig === lastUiSigRef.current) return;

    lastUiSigRef.current = sig;
    onUIChangeRef.current(nextUI);
  }, [
    formatKey,
    bgMode,
    bgColor,
    bgColor1,
    bgColor2,
    bgAngle,
    bgImage,
    overlayEnabled,
    overlayType,
    overlayColor1,
    overlayColor2,
    overlayOpacity,
  ]);

  /* ================= INIT (from parent slide) ================= */
  const incomingSig = useMemo(() => {
    // ✅ If parent provides an empty array, it's authoritative (no fallback template).
    if (typeof initialLayers === "undefined") return "";
    const coerced = coerceIncomingLayers(initialLayers ?? []);
    const cleaned = stripNonSerializable(coerced) as LayerData[];
    return layersSignatureForSync(cleaned);
  }, [initialLayers]);

  useEffect(() => {
    let cancelled = false;

    const nextKey =
      typeof initialLayersKey === "undefined" ? null : (initialLayersKey as any);
    const keyChanged = nextKey !== lastInitKeyRef.current;

    const init = async () => {
      // If parent provides layers (even empty array), we must hydrate from it.
      const parentProvided = typeof initialLayers !== "undefined";

      if (parentProvided) {
        // Avoid infinite loop when parent echoes the same content for the same key.
        if (!keyChanged && incomingSig && incomingSig === lastEmittedSigRef.current) return;

        const coerced = coerceIncomingLayers(initialLayers ?? []);
        let cleaned = stripNonSerializable(coerced) as LayerData[];

        // Safety: always ensure we have a background layer.
        const hasBg = cleaned.some(
          (l: any) => l?.id === BACKGROUND_LAYER_ID || l?.type === "background"
        );
        if (!hasBg) {
          cleaned = [
            {
              id: BACKGROUND_LAYER_ID,
              type: "background",
              visible: true,
              selected: false,
              zIndex: -1000,
              style: { color: bgColor },
            } as any,
            ...cleaned,
          ];
        }

        lastReceivedSigRef.current = incomingSig || layersSignatureForSync(cleaned);
        lastInitKeyRef.current = nextKey;

        hydratingRef.current = true;
        const hydrated = await rehydrateRuntimeImages(cleaned);

        if (!cancelled) {
          setLayers(hydrated);
          requestAnimationFrame(() => {
            hydratingRef.current = false;
          });
        }
        return;
      }

      // default (only when parent hasn't provided layers yet)
      hydratingRef.current = true;
      if (!cancelled) {
        setLayers([
          {
            id: BACKGROUND_LAYER_ID,
            type: "background",
            visible: true,
            selected: false,
            zIndex: -1000,
            style: { color: bgColor },
          } as any,
          {
            id: "text-main",
            type: "text",
            text: "VOTRE TEXTE ICI",
            x: 120,
            y: 80,
            zIndex: 10,
            visible: true,
            selected: false,
            style: {
              fontSize: 40,
              color: "#ffffff",
              fontFamily: "Inter",
              fontWeight: "bold",
              lineHeight: 1.1,
            } as any,
          } as any,
        ]);
        requestAnimationFrame(() => {
          hydratingRef.current = false;
        });
      }
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingSig, initialLayersKey]);

  /* ================= PERSIST TO PARENT (CARROUSEL) ================= */
  useEffect(() => {
    if (!onChangeRef.current) return;
    if (hydratingRef.current) return;

    const cleaned = stripNonSerializable(layers) as LayerData[];
    const sig = layersSignatureForSync(cleaned);

    if (sig === lastEmittedSigRef.current) return;
    if (sig === lastReceivedSigRef.current) return;

    lastEmittedSigRef.current = sig;
    onChangeRef.current(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers]);

  /* ================= SAFE AUTO-LAYOUT (never move background) ================= */
  const applyAutoLayoutSafe = useCallback(
    (input: LayerData[]) => {
      const bg = input.find((l: any) => l.id === BACKGROUND_LAYER_ID) as any;
      const rest = input.filter((l: any) => l.id !== BACKGROUND_LAYER_ID);
      const laid = applyAutoLayoutImages(rest as any, format as any) as any[];
      return bg ? ([bg, ...laid] as any) : (laid as any);
    },
    [format]
  );

  /* ================= SYNC BACKGROUND (COLOR/GRADIENT) ================= */
  useEffect(() => {
    if (bgMode === "image") return;

    let value = bgColor;
    if (bgMode === "gradient") {
      value = `linear-gradient(${bgAngle}deg, ${bgColor1}, ${bgColor2})`;
    }

    setLayers((prev: any[]) => {
      const bg = prev.find((l) => l.id === BACKGROUND_LAYER_ID) as any;

      if (bg) {
        const currentColor = bg?.style?.color;
        const alreadySynced =
          bg.type === "background" &&
          currentColor === value &&
          !bg.src &&
          bg.width == null &&
          bg.height == null &&
          bg.x === 0 &&
          bg.y === 0 &&
          bg.zIndex === -1000 &&
          bg.visible === true &&
          bg.selected === false;

        if (alreadySynced) return prev;

        return prev.map((l) =>
          l.id === BACKGROUND_LAYER_ID
            ? {
                ...l,
                type: "background",
                src: undefined,
                width: undefined,
                height: undefined,
                x: 0,
                y: 0,
                zIndex: -1000,
                visible: true,
                selected: false,
                style: { ...(l.style ?? {}), color: value },
              }
            : l
        );
      }

      return [
        {
          id: BACKGROUND_LAYER_ID,
          type: "background",
          visible: true,
          selected: false,
          zIndex: -1000,
          style: { color: value },
        } as any,
        ...prev,
      ];
    });
  }, [bgMode, bgColor, bgColor1, bgColor2, bgAngle]);

  /* ================= BACKGROUND IMAGE : FIXED + RESIZE WITH FORMAT ================= */
  useEffect(() => {
    if (bgMode !== "image") return;
    if (!bgImage) return;

    setLayers((prev: any[]) => {
      let changed = false;
      const next = prev.map((l) => {
        if (l.id !== BACKGROUND_LAYER_ID) return l;

        const alreadySynced =
          l.x === 0 &&
          l.y === 0 &&
          l.width === format.w &&
          l.height === format.h &&
          l.zIndex === -1000 &&
          l.visible === true &&
          l.selected === false;

        if (alreadySynced) return l;
        changed = true;
        return {
          ...l,
          x: 0,
          y: 0,
          width: format.w,
          height: format.h,
          zIndex: -1000,
          visible: true,
          selected: false,
        };
      });

      return changed ? next : prev;
    });
  }, [bgMode, bgImage, format.w, format.h]);

  /* ================= SYNC OVERLAY (WORKS ON ANY BACKGROUND) ================= */
  useEffect(() => {
    setLayers((prev: any[]) => {
      let changed = false;
      const next = prev.map((l: any) => {
        if (l.id !== BACKGROUND_LAYER_ID) return l;

        const baseStyle = { ...(l.style ?? {}) };
        const currentOverlay = baseStyle?.overlay;

        if (!overlayEnabled) {
          if (!currentOverlay) return l;
          // @ts-ignore
          delete baseStyle.overlay;
          changed = true;
          return { ...l, style: baseStyle };
        }

        const value =
          overlayType === "color"
            ? overlayColor1
            : `linear-gradient(135deg, ${overlayColor1}, ${overlayColor2})`;

        const alreadySynced =
          currentOverlay?.type === overlayType &&
          currentOverlay?.value === value &&
          Number(currentOverlay?.opacity ?? 0) === Number(overlayOpacity) &&
          currentOverlay?.color1 === overlayColor1 &&
          currentOverlay?.color2 === overlayColor2;

        if (alreadySynced) return l;

        changed = true;
        return {
          ...l,
          style: {
            ...baseStyle,
            overlay: {
              type: overlayType,
              value,
              opacity: overlayOpacity,
              color1: overlayColor1,
              color2: overlayColor2,
            },
          },
        };
      });

      return changed ? next : prev;
    });
  }, [overlayEnabled, overlayType, overlayColor1, overlayColor2, overlayOpacity]);

  const selectedLayer = useMemo(
    () => (layers.find((l: any) => l.selected) as any) ?? null,
    [layers]
  );

  const selectLayer = useCallback((id: string | null) => {
    setLayers((prev: any[]) =>
      prev.map((l) => ({ ...l, selected: id ? l.id === id : false }))
    );
    setShowProps(!!id);
  }, []);

  const updateLayer = useCallback((id: string, patch: Partial<LayerData>) => {
    setLayers((prev: any[]) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              ...patch,
              style: {
                ...(l.style ?? {}),
                ...(patch.style ?? {}),
              },
            }
          : l
      )
    );
  }, []);

  const toggleVisible = useCallback((id: string) => {
    if (id === BACKGROUND_LAYER_ID) return;
    setLayers((prev: any[]) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  }, []);

  const reorder = useCallback((id: string, dir: "up" | "down") => {
    if (id === BACKGROUND_LAYER_ID) return;
    setLayers((prev: any[]) => {
      const sorted = [...prev].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
      const i = sorted.findIndex((l) => l.id === id);
      const j = dir === "up" ? i + 1 : i - 1;
      if (j < 0 || j >= sorted.length) return prev;
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      return sorted.map((l, idx) => ({ ...l, zIndex: idx }));
    });
  }, []);

  const deleteLayer = useCallback((id: string) => {
    if (id === BACKGROUND_LAYER_ID) return;

    setLayers((prev: any[]) => {
      const filtered = prev.filter((l) => l.id !== id);
      if (!filtered.some((l) => l.selected)) setShowProps(false);
      return filtered;
    });
  }, []);

  /* ================= ACTIONS ================= */
  const addText = useCallback(() => {
    const id = `text-${Date.now()}`;
    setLayers((prev: any[]) => [
      ...prev.map((l) => ({ ...l, selected: false })),
      {
        id,
        type: "text",
        text: "Nouveau texte",
        x: Math.round(format.w * 0.12),
        y: Math.round(format.h * 0.08),
        zIndex: prev.length + 10,
        visible: true,
        selected: true,
        style: {
          fontSize: 48,
          color: "#ffffff",
          fontFamily: "Inter",
        },
      } as any,
    ]);
    setShowProps(true);
  }, [format.w, format.h]);

  const reapplyAutoLayout = useCallback(() => {
    setLayers((prev) => applyAutoLayoutSafe(prev));
  }, [applyAutoLayoutSafe]);

  const onImportImages = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const built: LayerData[] = [];

      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file);

        built.push({
          id: `image-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: "image",
          src: base64,
          x: 0,
          y: 0,
          width: 300,
          height: 300,
          zIndex: 0,
          visible: true,
          selected: false,
        } as any);
      }

      setLayers((prev: any[]) => {
        const baseZ = prev.length + 1;
        const imgs = built.map((l, i) => ({ ...l, zIndex: baseZ + i }));

        const combined = [...prev.map((l) => ({ ...l, selected: false })), ...imgs];
        // ✅ never move BG
        return applyAutoLayoutSafe(combined as any);
      });
    },
    [applyAutoLayoutSafe]
  );

  /**
   * Background Mode A: single image replacement
   * Must stay fixed and resized with format, never auto-layout moved
   */
  const onImportBackgroundImage = useCallback(
    async (file: File | null) => {
      if (!file) return;
      const base64 = await fileToBase64(file);

      setBgMode("image");
      setBgImage(base64);

      setLayers((prev: any[]) => {
        const withoutBg = prev.filter((l) => l.id !== BACKGROUND_LAYER_ID);
        const oldBg = prev.find((l) => l.id === BACKGROUND_LAYER_ID) as any;

        return [
          {
            id: BACKGROUND_LAYER_ID,
            type: "image",
            src: base64,
            x: 0,
            y: 0,
            width: format.w,
            height: format.h,
            zIndex: -1000,
            visible: true,
            selected: false,
            // keep overlay style if exists
            style: { ...(oldBg?.style ?? {}) },
          } as any,
          ...withoutBg,
        ];
      });
    },
    [format.w, format.h]
  );

  const removeBackgroundImage = useCallback(() => {
    setBgImage(null);
    setBgMode("color");

    setLayers((prev: any[]) => {
      const hasBg = prev.some((l) => l.id === BACKGROUND_LAYER_ID);
      if (!hasBg) return prev;

      return prev.map((l: any) => {
        if (l.id !== BACKGROUND_LAYER_ID) return l;
        return {
          ...l,
          type: "background",
          src: undefined,
          width: undefined,
          height: undefined,
          x: 0,
          y: 0,
          zIndex: -1000,
          visible: true,
          selected: false,
          style: { ...(l.style ?? {}), color: bgColor },
        };
      });
    });
  }, [bgColor]);

  /* ================= CANVA-LIKE MEASURES (selected layer distances) ================= */
  const selectedMetrics = useMemo(() => {
    if (!selectedLayer) return null;
    const w = selectedLayer.width ?? 0;
    const h = selectedLayer.height ?? 0;
    const x = selectedLayer.x ?? 0;
    const y = selectedLayer.y ?? 0;

    const left = Math.max(0, x);
    const top = Math.max(0, y);
    const right = Math.max(0, format.w - (x + w));
    const bottom = Math.max(0, format.h - (y + h));

    return { x, y, w, h, left, top, right, bottom };
  }, [selectedLayer, format.w, format.h]);

  /* ================= RENDER ================= */
  return (
    <div className="w-full h-full relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          onImportImages(e.currentTarget.files);
          // ✅ allow re-importing the same file
          e.currentTarget.value = "";
        }}
      />

      <input
        ref={bgImageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onImportBackgroundImage(e.currentTarget.files?.[0] ?? null);
          // ✅ allow re-importing the same file
          e.currentTarget.value = "";
        }}
      />

      {/* ================= MOBILE/TABLET TOOLS (overlay over canvas) ================= */}
      {mobileToolsOpen && (
        <div className="min-[900px]:hidden absolute left-0 right-0 top-0 z-50 px-6">
          <div className="w-full max-w-[420px] mx-auto mt-4 rounded-2xl border border-yellow-500/20 bg-black/75 backdrop-blur p-4 space-y-4 shadow-2xl max-h-[78vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="text-yellow-300 font-semibold text-sm">Outils de l’éditeur</div>
              <button
                onClick={() => onCloseMobileTools?.()}
                className="text-yellow-200/80 hover:text-yellow-200 text-sm"
              >
                ✖
              </button>
            </div>

            {/* ===== ACTIONS ===== */}
            <button
              onClick={() => {
                addText();
              }}
              className="w-full rounded-xl bg-[#ffb800] text-black font-semibold py-3"
            >
              + Ajouter un texte
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-3"
            >
              📥 Importer une image
            </button>

            <button
              onClick={reapplyAutoLayout}
              className="w-full rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-3"
            >
              🔄 Auto-layout
            </button>

            {/* ===== FORMAT ===== */}
            <div className="pt-4 border-t border-yellow-500/15">
              <label className="block text-yellow-400 text-sm mb-2">Format de publication</label>
              <select
                value={formatKey}
                onChange={(e) => setFormatKey(e.target.value as CanvasFormatKey)}
                className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
              >
                {Object.entries(CANVAS_FORMATS).map(([key, f]: any) => (
                  <option key={key} value={key}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ===== BACKGROUND ===== */}
            <div className="pt-4 border-t border-yellow-500/15">
              <label className="block text-yellow-400 text-sm mb-2">Fond du post</label>

              <div className="flex gap-2 mb-4">
                {(["color", "gradient", "image"] as BackgroundMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBgMode(mode)}
                    className={`flex-1 rounded-lg py-2 text-sm border ${
                      bgMode === mode
                        ? "bg-[#ffb800] text-black"
                        : "border-yellow-500/20 text-yellow-200"
                    }`}
                  >
                    {mode === "color" ? "Couleur" : mode === "gradient" ? "Gradient" : "Image"}
                  </button>
                ))}
              </div>

              {bgMode === "color" && (
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded-lg bg-black/40 border border-yellow-500/20"
                />
              )}

              {bgMode === "gradient" && (
                <>
                  <div
                    className="w-full h-10 rounded-lg border border-yellow-500/20 mb-3"
                    style={{
                      background: `linear-gradient(${bgAngle}deg, ${bgColor1}, ${bgColor2})`,
                    }}
                  />
                  <div className="flex gap-2 mb-3">
                    <input
                      type="color"
                      value={bgColor1}
                      onChange={(e) => setBgColor1(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30"
                    />
                    <input
                      type="color"
                      value={bgColor2}
                      onChange={(e) => setBgColor2(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30"
                    />
                  </div>

                  <label className="block text-yellow-400 text-xs mb-2">Angle ({bgAngle}°)</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={bgAngle}
                    onChange={(e) => setBgAngle(Number(e.target.value))}
                    className="w-full"
                  />

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setBgMode("gradient");
                          setBgColor1(p.color1);
                          setBgColor2(p.color2);
                          setBgAngle(p.angle);
                        }}
                        className="rounded-lg border border-yellow-500/20 bg-black/40 px-3 py-2 text-yellow-200 text-sm hover:bg-yellow-500/10"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {bgMode === "image" && (
                <div className="space-y-3">
                  <button
                    onClick={() => bgImageInputRef.current?.click()}
                    className="w-full rounded-lg border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-2"
                  >
                    📸 Importer / remplacer
                  </button>

                  {bgImage && (
                    <button
                      onClick={removeBackgroundImage}
                      className="w-full rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 py-2"
                    >
                      ❌ Supprimer l’image
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ===== OVERLAY ===== */}
            <div className="pt-4 border-t border-yellow-500/15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-400 text-sm">Overlay</span>
                <button
                  onClick={() => setOverlayEnabled((v) => !v)}
                  className={`rounded-lg px-3 py-1 text-xs border ${
                    overlayEnabled
                      ? "bg-[#ffb800] text-black"
                      : "border-yellow-500/20 text-yellow-200"
                  }`}
                >
                  {overlayEnabled ? "Activé" : "Désactivé"}
                </button>
              </div>

              <div className={`space-y-3 ${overlayEnabled ? "" : "opacity-50 pointer-events-none"}`}>
                <div className="flex gap-2">
                  {(["color", "gradient"] as OverlayType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOverlayType(t)}
                      className={`flex-1 rounded-lg py-2 text-sm border ${
                        overlayType === t
                          ? "bg-[#ffb800] text-black"
                          : "border-yellow-500/20 text-yellow-200"
                      }`}
                    >
                      {t === "color" ? "Couleur" : "Gradient"}
                    </button>
                  ))}
                </div>

                {overlayType === "color" && (
                  <input
                    type="color"
                    value={overlayColor1}
                    onChange={(e) => setOverlayColor1(e.target.value)}
                    className="w-full h-10 rounded-lg bg-black/40 border border-yellow-500/20"
                  />
                )}

                {overlayType === "gradient" && (
                  <>
                    <div
                      className="w-full h-10 rounded-lg border border-yellow-500/20"
                      style={{
                        background: `linear-gradient(135deg, ${overlayColor1}, ${overlayColor2})`,
                      }}
                    />
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={overlayColor1}
                        onChange={(e) => setOverlayColor1(e.target.value)}
                        className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30"
                      />
                      <input
                        type="color"
                        value={overlayColor2}
                        onChange={(e) => setOverlayColor2(e.target.value)}
                        className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-yellow-400 text-xs mb-2">
                    Opacité ({Math.round(overlayOpacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* ===== LAYERS + PROPERTIES (mobile/tablet) ===== */}
            <div className="pt-4 border-t border-yellow-500/15">
              <div className="text-yellow-300 font-semibold text-sm mb-3">Layers</div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-3">
                <LayersPanelV5
                  layers={layers.filter((l: any) => l.id !== BACKGROUND_LAYER_ID)}
                  selectedLayerId={selectedLayer?.id ?? null}
                  onSelectLayer={selectLayer}
                  onToggleVisible={toggleVisible}
                  onReorder={reorder}
                  onDuplicate={() => {}}
                  onDelete={deleteLayer}
                />

                {selectedLayer && (
                  <PropertiesDrawer
                    open
                    layer={selectedLayer}
                    onClose={() => setShowProps(false)}
                    onChange={(patch) => updateLayer(selectedLayer.id, patch)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1800px] px-6 pb-10">
        <div className="grid grid-cols-1 min-[900px]:grid-cols-[280px_1fr_360px] gap-6">
          {/* LEFT (desktop only) */}
          <aside className="hidden min-[900px]:block rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
            <button
              onClick={addText}
              className="w-full rounded-xl bg-[#ffb800] text-black font-semibold py-3"
            >
              + Ajouter un texte
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-3 rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-3"
            >
              📥 Importer une image
            </button>

            <button
              onClick={reapplyAutoLayout}
              className="w-full mt-3 rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-3"
            >
              🔄 Auto-layout
            </button>

            {/* FORMAT */}
            <div className="mt-4">
              <label className="block text-yellow-400 text-sm mb-2">Format de publication</label>
              <select
                value={formatKey}
                onChange={(e) => setFormatKey(e.target.value as CanvasFormatKey)}
                className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
              >
                {Object.entries(CANVAS_FORMATS).map(([key, f]: any) => (
                  <option key={key} value={key}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* BACKGROUND */}
            <div className="mt-6 border-t border-yellow-500/15 pt-4">
              <label className="block text-yellow-400 text-sm mb-2">Fond du post</label>

              <div className="flex gap-2 mb-4">
                {(["color", "gradient", "image"] as BackgroundMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBgMode(mode)}
                    className={`flex-1 rounded-lg py-2 text-sm border ${
                      bgMode === mode
                        ? "bg-[#ffb800] text-black"
                        : "border-yellow-500/20 text-yellow-200"
                    }`}
                  >
                    {mode === "color" ? "Couleur" : mode === "gradient" ? "Gradient" : "Image"}
                  </button>
                ))}
              </div>

              {bgMode === "color" && (
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded-lg bg-black/40 border border-yellow-500/20"
                />
              )}

              {bgMode === "gradient" && (
                <>
                  <div
                    className="w-full h-10 rounded-lg border border-yellow-500/20 mb-3"
                    style={{
                      background: `linear-gradient(${bgAngle}deg, ${bgColor1}, ${bgColor2})`,
                    }}
                  />
                  <div className="flex gap-2 mb-3">
                    <input
                      type="color"
                      value={bgColor1}
                      onChange={(e) => setBgColor1(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30"
                    />
                    <input
                      type="color"
                      value={bgColor2}
                      onChange={(e) => setBgColor2(e.target.value)}
                      className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30"
                    />
                  </div>

                  <label className="block text-yellow-400 text-xs mb-2">Angle ({bgAngle}°)</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={bgAngle}
                    onChange={(e) => setBgAngle(Number(e.target.value))}
                    className="w-full"
                  />

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setBgMode("gradient");
                          setBgColor1(p.color1);
                          setBgColor2(p.color2);
                          setBgAngle(p.angle);
                        }}
                        className="rounded-lg border border-yellow-500/20 bg-black/40 px-3 py-2 text-yellow-200 text-sm hover:bg-yellow-500/10"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {bgMode === "image" && (
                <div className="space-y-3">
                  <button
                    onClick={() => bgImageInputRef.current?.click()}
                    className="w-full rounded-lg border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-2"
                  >
                    📸 Importer / remplacer
                  </button>

                  {bgImage && (
                    <button
                      onClick={removeBackgroundImage}
                      className="w-full rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 py-2"
                    >
                      ❌ Supprimer l’image
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* OVERLAY */}
            <div className="mt-6 border-t border-yellow-500/15 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-yellow-400 text-sm">Overlay</label>

                <button
                  onClick={() => setOverlayEnabled((v) => !v)}
                  className={`rounded-lg px-3 py-1 text-xs border ${
                    overlayEnabled
                      ? "bg-[#ffb800] text-black border-[#ffb800]"
                      : "border-yellow-500/20 text-yellow-200"
                  }`}
                >
                  {overlayEnabled ? "Activé" : "Désactivé"}
                </button>
              </div>

              <p className="text-xs text-yellow-100/60 mb-3">
                Assombrit / améliore la lisibilité du texte au-dessus d’une image.
              </p>

              <div className={`space-y-3 ${overlayEnabled ? "" : "opacity-50 pointer-events-none"}`}>
                <div className="flex gap-2">
                  {(["color", "gradient"] as OverlayType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOverlayType(t)}
                      className={`flex-1 rounded-lg py-2 text-sm border ${
                        overlayType === t
                          ? "bg-[#ffb800] text-black"
                          : "border-yellow-500/20 text-yellow-200"
                      }`}
                    >
                      {t === "color" ? "Couleur" : "Gradient"}
                    </button>
                  ))}
                </div>

                {overlayType === "color" && (
                  <div>
                    <label className="block text-yellow-400 text-xs mb-2">Couleur overlay</label>
                    <input
                      type="color"
                      value={overlayColor1}
                      onChange={(e) => setOverlayColor1(e.target.value)}
                      className="w-full h-10 rounded-lg bg-black/40 border border-yellow-500/20"
                    />
                  </div>
                )}

                {overlayType === "gradient" && (
                  <div>
                    <label className="block text-yellow-400 text-xs mb-2">Gradient overlay</label>
                    <div
                      className="w-full h-10 rounded-lg border border-yellow-500/20 mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${overlayColor1}, ${overlayColor2})`,
                      }}
                    />
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={overlayColor1}
                        onChange={(e) => setOverlayColor1(e.target.value)}
                        className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30"
                      />
                      <input
                        type="color"
                        value={overlayColor2}
                        onChange={(e) => setOverlayColor2(e.target.value)}
                        className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-yellow-400 text-xs mb-2">
                    Opacité ({Math.round(overlayOpacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER */}
          <main className="rounded-2xl border border-white/10 bg-black/25 p-5 relative">
            <div
              ref={stageWrapRef}
              className="w-full h-[72vh] rounded-2xl border border-yellow-500/20 overflow-hidden relative"
            >
              {/* CANVA center guides (light) */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ opacity: 0.55 }}
              >
                <div
                  className="absolute top-0 bottom-0 w-px bg-yellow-400/25"
                  style={{ left: `${centerX}px` }}
                />
                <div
                  className="absolute left-0 right-0 h-px bg-yellow-400/25"
                  style={{ top: `${centerY}px` }}
                />
              </div>

              {/* distance labels (selected layer) */}
              {selectedMetrics && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-3 top-3 text-[11px] text-yellow-200/70">
                    L:{Math.round(selectedMetrics.left)} · T:{Math.round(selectedMetrics.top)} ·
                    R:{Math.round(selectedMetrics.right)} · B:{Math.round(selectedMetrics.bottom)}
                  </div>
                </div>
              )}

              <CanvasStage
                key={formatKey}
                layers={layers}
                setLayers={setLayers}
                onSelectLayer={selectLayer}
                format={format as any}
              />
            </div>
          </main>

          {/* RIGHT (desktop only) */}
          <aside className="hidden min-[900px]:block rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
            <LayersPanelV5
              layers={layers.filter((l: any) => l.id !== BACKGROUND_LAYER_ID)}
              selectedLayerId={selectedLayer?.id ?? null}
              onSelectLayer={selectLayer}
              onToggleVisible={toggleVisible}
              onReorder={reorder}
              onDuplicate={() => {}}
              onDelete={deleteLayer}
            />

            {selectedLayer && (
              <PropertiesDrawer
                open
                layer={selectedLayer}
                onClose={() => setShowProps(false)}
                onChange={(patch) => updateLayer(selectedLayer.id, patch)}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
