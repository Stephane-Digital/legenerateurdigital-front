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
type CopilotAction = "hooks" | "cta" | "benefits" | "variants" | "landing";

type GeneratedItem = {
  id: string;
  kind: "hook" | "subtitle" | "cta" | "benefit" | "closing";
  label: string;
  text: string;
};

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
  onChange?: (layers: LayerData[]) => void;
  mobileToolsOpen?: boolean;
  onCloseMobileTools?: () => void;
  canvasHeight?: number;
  onCanvasHeightChange?: (nextHeight: number) => void;
  ctaUrl?: string;
  onCtaUrlChange?: (nextValue: string) => void;
}

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
    return input.map((x) => stripNonSerializable(x)).filter((x) => x !== undefined);
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

function estimateWrappedTextHeight({
  text,
  width,
  fontSize,
  fontFamily,
  lineHeight,
}: {
  text: string;
  width: number;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
}) {
  const safeText = String(text ?? "");
  const safeWidth = Math.max(120, Math.round(width || 0));
  const safeFontSize = Math.max(10, Number(fontSize || 48));
  const safeLineHeight = Math.max(0.8, Number(lineHeight || 1.2));
  const horizontalPadding = 24;
  const innerWidth = Math.max(40, safeWidth - horizontalPadding);

  const measureWithCanvas = () => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.font = `${safeFontSize}px ${fontFamily || "Inter"}`;

    const paragraphs = safeText.split("\n");
    let lines = 0;

    for (const paragraph of paragraphs) {
      const words = String(paragraph || "").split(/\s+/).filter(Boolean);
      if (!words.length) {
        lines += 1;
        continue;
      }

      let current = "";
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        const candidateWidth = ctx.measureText(candidate).width;

        if (candidateWidth <= innerWidth || !current) {
          current = candidate;
          continue;
        }

        lines += 1;
        current = word;
      }

      if (current) lines += 1;
    }

    return Math.max(1, lines);
  };

  const measuredLines = measureWithCanvas();
  const approxLines =
    measuredLines ?? Math.max(1, Math.ceil((safeText.length * safeFontSize * 0.58) / innerWidth));
  const verticalPadding = 24;
  return Math.max(56, Math.ceil(approxLines * safeFontSize * safeLineHeight + verticalPadding));
}

function autoFitTextLayerSize(layer: LayerData, patch: Partial<LayerData>) {
  if (layer.type !== "text") return patch;
  if (typeof patch.height === "number") return patch;

  const nextText = String((patch as any).text ?? (layer as any).text ?? "");
  const nextStyle = {
    ...(((layer as any).style ?? {}) as any),
    ...(((patch as any).style ?? {}) as any),
  } as any;

  const nextWidth =
    typeof patch.width === "number"
      ? patch.width
      : typeof (layer as any).width === "number"
        ? (layer as any).width
        : Math.min(820, Math.max(260, nextText.includes("\n") || nextText.length > 22 ? 420 : 320));

  const nextHeight = estimateWrappedTextHeight({
    text: nextText,
    width: nextWidth,
    fontSize: typeof nextStyle.fontSize === "number" ? nextStyle.fontSize : 48,
    fontFamily: typeof nextStyle.fontFamily === "string" ? nextStyle.fontFamily : "Inter",
    lineHeight: typeof nextStyle.lineHeight === "number" ? nextStyle.lineHeight : 1.2,
  });

  return {
    ...patch,
    width: nextWidth,
    height: nextHeight,
  } as Partial<LayerData>;
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
  canvasHeight = 1800,
  onCanvasHeightChange,
  ctaUrl = "",
  onCtaUrlChange,
}: Props) {
  const [formatKey, setFormatKey] = useState<CanvasFormatKey>(
    initialUI?.formatKey ?? "instagram_post"
  );
  const rawFormat = CANVAS_FORMATS[formatKey] as any;

  const format = useMemo(() => {
    const w = rawFormat?.w ?? rawFormat?.width ?? 1080;
    return {
      ...rawFormat,
      w,
      h: canvasHeight,
      width: rawFormat?.width ?? w,
      height: canvasHeight,
    };
  }, [rawFormat, canvasHeight]);

  const [layers, setLayers] = useState<LayerData[]>([]);
  const [showProps, setShowProps] = useState(false);

  const [bgMode, setBgMode] = useState<BackgroundMode>(initialUI?.bgMode ?? "color");
  const [bgColor, setBgColor] = useState(initialUI?.bgColor ?? "#111111");
  const [bgColor1, setBgColor1] = useState(initialUI?.bgColor1 ?? "#ffb800");
  const [bgColor2, setBgColor2] = useState(initialUI?.bgColor2 ?? "#00ffcc");
  const [bgAngle, setBgAngle] = useState(initialUI?.bgAngle ?? 135);
  const [bgImage, setBgImage] = useState(initialUI?.bgImage ?? null);

  const [overlayEnabled, setOverlayEnabled] = useState(initialUI?.overlayEnabled ?? false);
  const [overlayType, setOverlayType] = useState<OverlayType>(initialUI?.overlayType ?? "color");
  const [overlayColor1, setOverlayColor1] = useState(initialUI?.overlayColor1 ?? "#000000");
  const [overlayColor2, setOverlayColor2] = useState(initialUI?.overlayColor2 ?? "#000000");
  const [overlayOpacity, setOverlayOpacity] = useState(initialUI?.overlayOpacity ?? 0.35);

  const [copilotOpen, setCopilotOpen] = useState(true);
  const [briefOffer, setBriefOffer] = useState("");
  const [briefGoal, setBriefGoal] = useState("leads");
  const [briefAngle, setBriefAngle] = useState("lead-magnet");
  const [briefAudience, setBriefAudience] = useState("entrepreneurs");
  const [briefTone, setBriefTone] = useState("premium");
  const [briefLength, setBriefLength] = useState(120);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [copilotStatus, setCopilotStatus] = useState("");
  const [lastAction, setLastAction] = useState<CopilotAction | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotRawResult, setCopilotRawResult] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgImageInputRef = useRef<HTMLInputElement | null>(null);

  const hydratingRef = useRef(false);
  const lastReceivedSigRef = useRef<string>("");
  const lastInitKeyRef = useRef<string | number | null>(null);
  const lastEmittedSigRef = useRef<string>("");
  const lastUiSigRef = useRef<string>("");

  useEffect(() => {
    if (!onUIChange) return;

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
    onUIChange(nextUI);
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
    onUIChange,
  ]);

  const incomingSig = useMemo(() => {
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
      const parentProvided = typeof initialLayers !== "undefined";

      if (parentProvided) {
        if (!keyChanged && incomingSig && incomingSig === lastEmittedSigRef.current) return;

        const coerced = coerceIncomingLayers(initialLayers ?? []);
        let cleaned = stripNonSerializable(coerced) as LayerData[];

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
  }, [incomingSig, initialLayersKey, bgColor]);

  useEffect(() => {
    if (!onChange) return;
    if (hydratingRef.current) return;

    const cleaned = stripNonSerializable(layers) as LayerData[];
    const sig = layersSignatureForSync(cleaned);

    if (sig === lastEmittedSigRef.current) return;
    if (sig === lastReceivedSigRef.current) return;

    lastEmittedSigRef.current = sig;
    onChange(cleaned);
  }, [layers, onChange]);

  const applyAutoLayoutSafe = useCallback(
    (input: LayerData[]) => {
      const bg = input.find((l: any) => l.id === BACKGROUND_LAYER_ID) as any;
      const rest = input.filter((l: any) => l.id !== BACKGROUND_LAYER_ID);
      const laid = applyAutoLayoutImages(rest as any, format as any) as any[];
      return bg ? ([bg, ...laid] as any) : (laid as any);
    },
    [format]
  );

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

  useEffect(() => {
    setLayers((prev: any[]) => {
      let changed = false;
      const next = prev.map((l: any) => {
        if (l.id !== BACKGROUND_LAYER_ID) return l;

        const baseStyle = { ...(l.style ?? {}) };
        const currentOverlay = baseStyle?.overlay;

        if (!overlayEnabled) {
          if (!currentOverlay) return l;
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
      prev.map((l) => {
        if (l.id !== id) return l;

        const normalizedPatch = autoFitTextLayerSize(l as LayerData, patch);

        return {
          ...l,
          ...normalizedPatch,
          style: {
            ...(l.style ?? {}),
            ...((normalizedPatch as any).style ?? {}),
          },
        };
      })
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

  const addText = useCallback(() => {
    const id = `text-${Date.now()}`;
    setLayers((prev: any[]) => [
      ...prev.map((l) => ({ ...l, selected: false })),
      {
        id,
        type: "text",
        text: "Nouveau texte",
        x: Math.round(format.w * 0.12),
        y: 80,
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
  }, [format.w]);

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
        return applyAutoLayoutSafe(combined as any);
      });
    },
    [applyAutoLayoutSafe]
  );

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

  const currentBottomY = useMemo(() => {
    const content = layers.filter((l: any) => l.id !== BACKGROUND_LAYER_ID);
    if (!content.length) return 80;
    return content.reduce((maxY: number, l: any) => {
      const h = typeof l.height === "number" ? l.height : l.type === "text" ? 120 : 300;
      return Math.max(maxY, (l.y ?? 0) + h);
    }, 0);
  }, [layers]);

  const makeTextLayer = useCallback(
    (kind: GeneratedItem["kind"], label: string, textValue: string, x: number, y: number, zIndex: number): LayerData => {
      const styleByKind: Record<GeneratedItem["kind"], any> = {
        hook: { fontSize: 58, fontFamily: "Inter", color: "#ffffff", fontWeight: 800, lineHeight: 1.05 },
        subtitle: { fontSize: 24, fontFamily: "Inter", color: "#e4e4e7", fontWeight: 500, lineHeight: 1.4 },
        cta: { fontSize: 22, fontFamily: "Inter", color: "#111111", fontWeight: 800, lineHeight: 1.2, backgroundColor: "#ffb800" },
        benefit: { fontSize: 20, fontFamily: "Inter", color: "#ffffff", fontWeight: 600, lineHeight: 1.32 },
        closing: { fontSize: 22, fontFamily: "Inter", color: "#f4f4f5", fontWeight: 600, lineHeight: 1.35 },
      };

      const sizeByKind: Record<GeneratedItem["kind"], { width: number; height: number }> = {
        hook: { width: 620, height: 210 },
        subtitle: { width: 560, height: 130 },
        cta: { width: 360, height: 74 },
        benefit: { width: 560, height: 64 },
        closing: { width: 560, height: 120 },
      };

      return {
        id: `ai-${kind}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        type: "text",
        x,
        y,
        width: sizeByKind[kind].width,
        height: sizeByKind[kind].height,
        visible: true,
        selected: false,
        zIndex,
        text: textValue,
        style: styleByKind[kind],
      } as LayerData;
    },
    []
  );

  const buildHooks = useCallback(() => {
    const offer = briefOffer.trim() || "ton offre";
    const audience = briefAudience === "coachs" ? "tes futurs clients" : "des prospects qualifiés";
    const prefix =
      briefTone === "urgent"
        ? "Découvre comment"
        : briefTone === "coach"
          ? "Passe à l'action et apprends à"
          : briefTone === "story"
            ? "Et si tu pouvais enfin"
            : briefTone === "sio"
              ? "Voici la structure pour"
              : "Découvre comment";
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `hook-${i}`,
      kind: "hook" as const,
      label: `Hook ${i + 1}`,
      text: `${prefix} ${offer.toLowerCase()} et attirer ${audience} avec une landing premium qui convertit.`,
    }));
  }, [briefOffer, briefAudience, briefTone]);

  const buildBenefits = useCallback(() => {
    const offer = briefOffer.trim() || "ton offre";
    return [
      { id: "benefit-1", kind: "benefit" as const, label: "Bénéfice 1", text: `• Clarifie la valeur de ${offer} en quelques secondes.` },
      { id: "benefit-2", kind: "benefit" as const, label: "Bénéfice 2", text: "• Renforce la perception premium de ta page." },
      { id: "benefit-3", kind: "benefit" as const, label: "Bénéfice 3", text: "• Augmente l’intention de clic sur ton CTA." },
    ];
  }, [briefOffer]);

  const buildCtas = useCallback(() => {
    const goalText =
      briefGoal === "leads"
        ? "Recevoir la méthode maintenant"
        : briefGoal === "call"
          ? "Réserver mon appel maintenant"
          : briefGoal === "sale"
            ? "Accéder à l’offre premium"
            : "Télécharger le guide maintenant";
    return [
      { id: "cta-1", kind: "cta" as const, label: "CTA principal", text: goalText },
      { id: "cta-2", kind: "cta" as const, label: "CTA alternatif", text: "Je veux passer à l’action maintenant" },
    ];
  }, [briefGoal]);

  const buildLanding = useCallback(() => {
    const offer = briefOffer.trim() || "ton offre";
    const hooks = buildHooks();
    const benefits = buildBenefits();
    const ctas = buildCtas();

    return [
      hooks[0],
      {
        id: "subtitle-main",
        kind: "subtitle" as const,
        label: "Sous-titre",
        text: `Une landing prête à copier ou modifier pour transformer ${offer.toLowerCase()} en machine à leads plus claire, plus premium et plus convaincante.`,
      },
      ctas[0],
      ...benefits,
      {
        id: "closing-main",
        kind: "closing" as const,
        label: "Closing",
        text: "Passe d’une simple page à une landing optimisée pour capter des leads puis laisse l’éditeur te permettre de tout ajuster librement.",
      },
    ];
  }, [briefOffer, buildHooks, buildBenefits, buildCtas]);


  function shortenForCanvas(value: string, maxChars: number) {
    const clean = String(value || "").replace(/\s+/g, " ").trim();
    if (clean.length <= maxChars) return clean;
    const sliced = clean.slice(0, maxChars);
    const lastSpace = sliced.lastIndexOf(" ");
    return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
  }

  function buildStructuredLandingItems(items: GeneratedItem[], visualLayers: LayerData[]) {
    const imageLayers = visualLayers
      .filter((layer: any) => layer?.type === "image" && layer?.id !== BACKGROUND_LAYER_ID)
      .sort((a: any, b: any) => ((b?.width ?? 0) * (b?.height ?? 0)) - ((a?.width ?? 0) * (a?.height ?? 0)));

    const primaryVisual = imageLayers[0] as any | undefined;
    const textX = 74;
    const defaultRightPadding = 56;
    const visualGap = 28;

    let availableTextWidth = 620;
    if (primaryVisual && typeof primaryVisual.x === "number" && primaryVisual.x > format.w * 0.42) {
      availableTextWidth = Math.max(320, Math.min(620, Math.round(primaryVisual.x - textX - visualGap)));
    } else {
      availableTextWidth = Math.max(360, Math.min(620, Math.round(format.w - textX - defaultRightPadding)));
    }

    const ctaWidth = Math.max(280, Math.min(360, availableTextWidth));
    const normalized = items.map((item) => {
      if (item.kind === "hook") return { ...item, text: shortenForCanvas(item.text, 150) };
      if (item.kind === "subtitle") return { ...item, text: shortenForCanvas(item.text, 220) };
      if (item.kind === "cta") return { ...item, text: shortenForCanvas(item.text, 70) };
      if (item.kind === "benefit") return { ...item, text: shortenForCanvas(item.text, 95) };
      return { ...item, text: shortenForCanvas(item.text, 170) };
    });

    const placed: LayerData[] = [];
    let y = 86;
    const zStart = 10;

    normalized.forEach((item, index) => {
      const x = item.kind === "benefit" ? 78 : textX;
      const width =
        item.kind === "cta"
          ? ctaWidth
          : item.kind === "benefit"
            ? availableTextWidth
            : availableTextWidth;

      const base = makeTextLayer(item.kind, item.label, item.text, x, y, zStart + index) as any;
      let patched = autoFitTextLayerSize(base, { width }) as any;

      if (item.kind === "hook") {
        const heroFontSize = width <= 420 ? 42 : width <= 500 ? 48 : 54;
        patched = autoFitTextLayerSize(base, {
          width,
          style: { ...(base.style ?? {}), fontSize: heroFontSize, lineHeight: 1.04 },
        }) as any;
      }

      if (item.kind === "subtitle") {
        const subtitleFontSize = width <= 420 ? 21 : 24;
        patched = autoFitTextLayerSize(base, {
          width,
          style: { ...(base.style ?? {}), fontSize: subtitleFontSize, lineHeight: 1.35 },
        }) as any;
      }

      if (item.kind === "benefit") {
        patched = autoFitTextLayerSize(base, {
          width,
          style: { ...(base.style ?? {}), fontSize: 18, lineHeight: 1.28 },
        }) as any;
      }

      if (item.kind === "closing") {
        patched = autoFitTextLayerSize(base, {
          width,
          style: { ...(base.style ?? {}), fontSize: width <= 420 ? 18 : 21, lineHeight: 1.32 },
        }) as any;
      }

      const finalLayer = {
        ...base,
        ...patched,
        x,
        y,
        zIndex: zStart + index,
        selected: false,
      } as LayerData;

      placed.push(finalLayer);

      const layerHeight = typeof (finalLayer as any).height === "number" ? (finalLayer as any).height : 80;
      const spacing =
        item.kind === "hook" ? 26 :
        item.kind === "subtitle" ? 22 :
        item.kind === "cta" ? 34 :
        item.kind === "benefit" ? 16 : 28;

      y += layerHeight + spacing;
    });

    return {
      placed,
      requiredHeight: y + 80,
    };
  }

  function buildCopilotBrief(action: CopilotAction) {
    const offer = briefOffer.trim() || "ton offre";
    const objectiveMap: Record<string, string> = {
      leads: "générer des leads qualifiés",
      sale: "vendre une offre",
      call: "réserver un appel",
      optin: "capturer un email",
    };

    return [
      `Offre / sujet : ${offer}`,
      `Objectif : ${objectiveMap[briefGoal] || briefGoal}`,
      `Angle : ${briefAngle}`,
      `Audience : ${briefAudience}`,
      `Ton : ${briefTone}`,
      `Longueur max cible : ${briefLength}`,
      `URL CTA : ${ctaUrl || "non précisée"}`,
      `Action demandée : ${action}`,
    ].join("\n");
  }

  function buildCopilotBusinessContext(action: CopilotAction) {
    const base = `lead-engine-copilot | action=${action} | audience=${briefAudience} | angle=${briefAngle} | tone=${briefTone} | cta_url=${ctaUrl || ""}`;

    if (action === "hooks") {
      return `${base} | Retourne exactement 10 hooks puissants en français, un par ligne, sans introduction.`;
    }
    if (action === "cta") {
      return `${base} | Retourne exactement 6 CTA en français, un par ligne, orientés conversion.`;
    }
    if (action === "benefits") {
      return `${base} | Retourne exactement 6 bénéfices en français, un par ligne, concrets et orientés valeur.`;
    }
    if (action === "variants") {
      return `${base} | Retourne exactement 4 variantes marketing en français, une par ligne, avec des angles nettement différents.`;
    }
    return `${base} | Retourne une landing structurée avec les lignes préfixées exactement ainsi : HERO:, SUBTITLE:, CTA:, BENEFIT:, BENEFIT:, BENEFIT:, CLOSING:.`;
  }

  async function saveCopilotMemory(action: CopilotAction) {
    const payload = {
      memory_type: "lead_copilot_brief",
      goal: action,
      content: buildCopilotBrief(action),
      emotional_profile: briefTone,
      business_context: buildCopilotBusinessContext(action),
      metadata_json: JSON.stringify({
        action,
        audience: briefAudience,
        angle: briefAngle,
        tone: briefTone,
        cta_url: ctaUrl,
      }),
    };

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-engine/ai/save-memory`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("[LeadEngine Copilot memory]", error);
    }
  }

  function normalizeListLines(content: string) {
    return String(content || "")
      .split(/\n+/)
      .map((line) => line.trim())
      .map((line) => line.replace(/^[-•\d.\)\s]+/, "").trim())
      .filter(Boolean);
  }

  function parseGeneratedItemsFromAI(action: CopilotAction, content: string): GeneratedItem[] {
    const text = String(content || "").trim();
    if (!text) return [];

    if (action === "landing") {
      const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const items: GeneratedItem[] = [];
      let benefitIndex = 1;

      for (const line of lines) {
        if (/^HERO\s*:/i.test(line)) {
          items.push({ id: `ai-hero-${benefitIndex}`, kind: "hook", label: "Hero", text: line.replace(/^HERO\s*:/i, "").trim() });
          continue;
        }
        if (/^SUBTITLE\s*:/i.test(line)) {
          items.push({ id: `ai-subtitle-${benefitIndex}`, kind: "subtitle", label: "Sous-titre", text: line.replace(/^SUBTITLE\s*:/i, "").trim() });
          continue;
        }
        if (/^CTA\s*:/i.test(line)) {
          items.push({ id: `ai-cta-${benefitIndex}`, kind: "cta", label: "CTA principal", text: line.replace(/^CTA\s*:/i, "").trim() });
          continue;
        }
        if (/^BENEFIT\s*:/i.test(line)) {
          items.push({ id: `ai-benefit-${benefitIndex}`, kind: "benefit", label: `Bénéfice ${benefitIndex}`, text: line.replace(/^BENEFIT\s*:/i, "").trim() });
          benefitIndex += 1;
          continue;
        }
        if (/^CLOSING\s*:/i.test(line)) {
          items.push({ id: `ai-closing-${benefitIndex}`, kind: "closing", label: "Closing", text: line.replace(/^CLOSING\s*:/i, "").trim() });
        }
      }

      if (items.length > 0) return items;
      return [{ id: "ai-landing-fallback", kind: "closing", label: "Landing complète", text }];
    }

    const lines = normalizeListLines(text);
    const kind: GeneratedItem["kind"] =
      action === "cta" ? "cta" :
      action === "benefits" ? "benefit" :
      action === "variants" ? "subtitle" :
      "hook";

    return lines.map((line, index) => ({
      id: `ai-${action}-${index + 1}`,
      kind,
      label:
        action === "cta" ? `CTA ${index + 1}` :
        action === "benefits" ? `Bénéfice ${index + 1}` :
        action === "variants" ? `Variante ${index + 1}` :
        `Hook ${index + 1}`,
      text: line,
    }));
  }

  const handleGenerate = useCallback(
    async (action: CopilotAction, mode: "generate" | "rewrite" = "generate") => {
      try {
        setCopilotLoading(true);
        setLastAction(action);
        setCopilotStatus(mode === "rewrite" ? "Réécriture en cours..." : "Génération en cours...");
        setGeneratedItems([]);
        setCopilotRawResult("");

        const brief = buildCopilotBrief(action);
        await saveCopilotMemory(action);

        const goal = action === "landing" ? "landing_complete" : action;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lead-engine/ai/generate`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            goal,
            brief,
            emotional_style: `${briefTone}, humain, premium, sincère, expert marketing digital`,
            business_context: buildCopilotBusinessContext(action),
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.detail || "Erreur IA Lead Engine Copilot");
        }

        const content = String(data?.content || "").trim();
        const items = parseGeneratedItemsFromAI(action, content);
        setCopilotRawResult(content);
        setGeneratedItems(items);

        if (action === "landing") {
          setCopilotStatus(mode === "rewrite"
            ? "Landing réécrite. Tu peux injecter un bloc ou toute la landing."
            : "Landing complète générée. Tu peux injecter un bloc ou toute la landing.");
        } else if (action === "cta") {
          setCopilotStatus(mode === "rewrite"
            ? "CTA réécrits. Choisis la variante la plus forte."
            : "CTA générés. Injecte celui qui correspond le mieux à ton funnel.");
        } else if (action === "benefits") {
          setCopilotStatus(mode === "rewrite"
            ? "Bénéfices réécrits. Chaque bloc peut être injecté séparément."
            : "Bénéfices générés. Chaque bloc peut être injecté séparément.");
        } else if (action === "variants") {
          setCopilotStatus(mode === "rewrite"
            ? "Variantes A/B réécrites pour tester plusieurs angles."
            : "Variantes A/B générées pour tester plusieurs angles.");
        } else {
          setCopilotStatus(mode === "rewrite"
            ? "Hooks réécrits. Tu peux les injecter un par un dans le canvas."
            : "Hooks experts générés. Tu peux les injecter un par un dans le canvas.");
        }
      } catch (error) {
        console.error("[LeadEngine Copilot AI]", error);
        setCopilotStatus("Génération IA impossible pour le moment.");
      } finally {
        setCopilotLoading(false);
      }
    },
    [briefOffer, briefGoal, briefAngle, briefAudience, briefTone, briefLength, ctaUrl]
  );

  const injectGeneratedItem = useCallback(
    (item: GeneratedItem) => {
      const baseY = Math.max(80, currentBottomY + 28);
      const baseX = item.kind === "benefit" ? 78 : 74;
      const zBase = layers.length + 10;
      const layer = makeTextLayer(item.kind, item.label, item.text, baseX, baseY, zBase);

      setLayers((prev: any[]) => [
        ...prev.map((l: any) => ({ ...l, selected: false })),
        { ...layer, selected: true },
      ]);
      setShowProps(true);
    },
    [currentBottomY, layers.length, makeTextLayer]
  );

  const injectFullLanding = useCallback(() => {
    const items = lastAction === "landing" && generatedItems.length ? generatedItems : buildLanding();
    const background = layers.find((l: any) => l.id === BACKGROUND_LAYER_ID) as any;
    const visualLayers = layers
      .filter((l: any) => l.id !== BACKGROUND_LAYER_ID && l.type !== "text")
      .map((l: any) => ({ ...l, selected: false })) as LayerData[];

    const { placed, requiredHeight } = buildStructuredLandingItems(items, visualLayers);
    const nextCanvasHeight = Math.max(canvasHeight, Math.min(5000, Math.ceil(requiredHeight / 100) * 100));

    if (nextCanvasHeight !== canvasHeight) {
      onCanvasHeightChange?.(nextCanvasHeight);
    }

    setLayers([
      ...(background ? [{ ...background, selected: false }] : []),
      ...visualLayers,
      ...placed.map((l, idx) => ({ ...l, selected: idx === 0 })),
    ] as any);
    setShowProps(true);
    setCopilotStatus("Landing injectée proprement dans le canvas. La mise en page a été recalculée automatiquement.");
  }, [lastAction, generatedItems, buildLanding, layers, makeTextLayer, canvasHeight, onCanvasHeightChange, format.w]);

  function bumpCanvasHeight(delta: number) {
    const next = Math.max(1200, Math.min(5000, canvasHeight + delta));
    onCanvasHeightChange?.(next);
  }

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
          e.currentTarget.value = "";
        }}
      />

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

            <button
              onClick={addText}
              className="w-full rounded-xl bg-[#ffb800] text-black font-semibold py-3"
            >
              + Ajouter un bloc texte
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-3"
            >
              🖼️ Importer un visuel
            </button>

            <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-3">
              <div className="text-yellow-300 font-semibold text-sm mb-2">CTA Systeme.io</div>
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => onCtaUrlChange?.(e.target.value)}
                placeholder="https://ton-lien-systeme.io/ton-formulaire"
                className="w-full rounded-xl border border-yellow-500/15 bg-black/40 px-3 py-3 text-sm text-white/85 outline-none placeholder:text-white/25"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1800px] px-6 pb-10">
        <div className="mb-6 rounded-3xl border border-yellow-500/15 bg-black/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-yellow-300 font-semibold text-sm">✨ Copilote IA — Lead Engine Expert</div>
              <div className="mt-1 text-sm text-white/55">
                Génère hooks, CTA, bénéfices et landings prêtes à injecter dans le canvas, puis modifie-les librement.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCopilotOpen((v) => !v)}
              className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-200"
            >
              {copilotOpen ? "Réduire le copilote" : "Ouvrir le copilote"}
            </button>
          </div>

          {copilotOpen && (
            <div className="mt-4 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="xl:col-span-2">
                    <label className="mb-2 block text-xs font-semibold text-yellow-300">Sujet / offre</label>
                    <input
                      type="text"
                      value={briefOffer}
                      onChange={(e) => setBriefOffer(e.target.value)}
                      placeholder="Ex : vendre une formation MRR ou générer plus de leads pour un coach"
                      className="w-full rounded-2xl border border-yellow-500/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/25"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-yellow-300">Longueur max</label>
                    <input
                      type="number"
                      min={40}
                      max={400}
                      value={briefLength}
                      onChange={(e) => setBriefLength(Number(e.target.value) || 120)}
                      className="w-full rounded-2xl border border-yellow-500/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-yellow-300">Objectif</label>
                    <select
                      value={briefGoal}
                      onChange={(e) => setBriefGoal(e.target.value)}
                      className="w-full rounded-2xl border border-yellow-500/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none"
                    >
                      <option value="leads">Générer des leads</option>
                      <option value="sale">Vendre une offre</option>
                      <option value="call">Réserver un appel</option>
                      <option value="optin">Capturer un email</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-yellow-300">Angle</label>
                    <select
                      value={briefAngle}
                      onChange={(e) => setBriefAngle(e.target.value)}
                      className="w-full rounded-2xl border border-yellow-500/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none"
                    >
                      <option value="lead-magnet">Lead magnet</option>
                      <option value="coaching">Coaching</option>
                      <option value="audit">Audit</option>
                      <option value="premium">Funnel premium</option>
                      <option value="mrr">Offre MRR</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-yellow-300">Audience</label>
                    <select
                      value={briefAudience}
                      onChange={(e) => setBriefAudience(e.target.value)}
                      className="w-full rounded-2xl border border-yellow-500/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none"
                    >
                      <option value="entrepreneurs">Entrepreneurs</option>
                      <option value="freelances">Freelances</option>
                      <option value="coachs">Coachs</option>
                      <option value="debutants">Débutants</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-yellow-300">Ton / style</label>
                    <select
                      value={briefTone}
                      onChange={(e) => setBriefTone(e.target.value)}
                      className="w-full rounded-2xl border border-yellow-500/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none"
                    >
                      <option value="premium">Premium expert</option>
                      <option value="coach">Coach direct</option>
                      <option value="urgent">Conversion agressive</option>
                      <option value="story">Storytelling</option>
                      <option value="sio">Funnel SIO</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 xl:col-span-3">
                    <label className="mb-2 block text-xs font-semibold text-yellow-300">URL CTA</label>
                    <input
                      type="text"
                      value={ctaUrl}
                      onChange={(e) => onCtaUrlChange?.(e.target.value)}
                      placeholder="https://ton-lien-systeme.io/ton-formulaire"
                      className="w-full rounded-2xl border border-yellow-500/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/25"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-5">
                  <button type="button" onClick={() => void handleGenerate("hooks")} disabled={copilotLoading} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-200 disabled:opacity-50">{copilotLoading && lastAction === "hooks" ? "Génération..." : "Hook x10"}</button>
                  <button type="button" onClick={() => void handleGenerate("cta")} disabled={copilotLoading} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-200 disabled:opacity-50">{copilotLoading && lastAction === "cta" ? "Génération..." : "CTA"}</button>
                  <button type="button" onClick={() => void handleGenerate("benefits")} disabled={copilotLoading} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-200 disabled:opacity-50">{copilotLoading && lastAction === "benefits" ? "Génération..." : "Bénéfices"}</button>
                  <button type="button" onClick={() => void handleGenerate("variants")} disabled={copilotLoading} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-200 disabled:opacity-50">{copilotLoading && lastAction === "variants" ? "Génération..." : "Variantes A/B"}</button>
                  <button type="button" onClick={() => void handleGenerate("landing")} disabled={copilotLoading} className="rounded-2xl bg-[#ffb800] px-4 py-3 text-sm font-bold text-black disabled:opacity-50">{copilotLoading && lastAction === "landing" ? "Génération..." : "Landing complète"}</button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleGenerate(lastAction ?? "landing", "rewrite")}
                    disabled={copilotLoading || !briefOffer.trim()}
                    className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-200 disabled:opacity-50"
                  >
                    {copilotLoading ? "Réécriture..." : "Réécrire"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedItems([]);
                      setCopilotRawResult("");
                      setCopilotStatus("");
                    }}
                    disabled={copilotLoading || (generatedItems.length === 0 && !copilotRawResult.trim())}
                    className="rounded-2xl border border-yellow-500/20 bg-black/30 px-4 py-3 text-sm font-semibold text-white/80 disabled:opacity-50"
                  >
                    Effacer le résultat
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-yellow-300 font-semibold text-sm">Résultats générés</div>
                    <div className="mt-1 text-xs text-white/50">{copilotLoading ? "Connexion au moteur IA premium..." : copilotStatus || "Génère des hooks, CTA, bénéfices ou une landing complète."}</div>
                  </div>

                  {generatedItems.length > 0 && !copilotLoading && (
                    <button
                      type="button"
                      onClick={injectFullLanding}
                      className="rounded-2xl border border-yellow-500/20 bg-[#ffb800] px-4 py-2 text-sm font-bold text-black"
                    >
                      Injecter toute la landing
                    </button>
                  )}
                </div>

                <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {copilotLoading ? (
                    <div className="rounded-2xl border border-yellow-500/15 bg-black/25 px-4 py-8">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                        <div className="text-sm text-white/70">Analyse en cours...</div>
                        <div className="text-xs text-white/45 text-center">
                          LGD prépare une réponse premium à injecter dans le canvas.
                        </div>
                      </div>
                    </div>
                  ) : generatedItems.length === 0 ? (
                    copilotRawResult.trim() ? (
                      <div className="rounded-2xl border border-yellow-500/15 bg-black/25 p-4 text-sm leading-6 text-white/80 whitespace-pre-wrap">
                        {copilotRawResult}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-yellow-500/15 bg-black/20 px-4 py-6 text-sm text-white/45">
                        Les résultats IA apparaîtront ici, prêts à être injectés bloc par bloc dans le canvas.
                      </div>
                    )
                  ) : (
                    generatedItems.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-yellow-500/15 bg-black/25 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-yellow-300">{item.label}</div>
                          <button
                            type="button"
                            onClick={() => injectGeneratedItem(item)}
                            className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-200"
                          >
                            Injecter dans le canvas
                          </button>
                        </div>

                        <div className="mt-2 text-sm leading-6 text-white/80 whitespace-pre-wrap">
                          {item.text.length > briefLength ? `${item.text.slice(0, briefLength)}…` : item.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 min-[900px]:grid-cols-[280px_1fr_360px] gap-6">
          <aside className="hidden min-[900px]:block rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
            <button
              onClick={addText}
              className="w-full rounded-xl bg-[#ffb800] text-black font-semibold py-3"
            >
              + Ajouter un bloc texte
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-3 rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-3"
            >
              🖼️ Importer un visuel
            </button>

            <button
              onClick={reapplyAutoLayout}
              className="w-full mt-3 rounded-xl border border-yellow-500/25 bg-yellow-500/10 text-yellow-200 py-3"
            >
              🧩 Réorganiser la landing
            </button>

            <div className="mt-4">
              <label className="block text-yellow-400 text-sm mb-2">Format du lead</label>
              <select
                value="pinterest_pin"
                onChange={() => setFormatKey("pinterest_pin" as CanvasFormatKey)}
                className="w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 py-2 text-yellow-100"
              >
                <option value="pinterest_pin">Landing SIO pleine page</option>
              </select>
            </div>

            <div className="mt-6 border-t border-yellow-500/15 pt-4">
              <label className="block text-yellow-400 text-sm mb-2">Fond de la landing</label>

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
                      style={{ background: `linear-gradient(135deg, ${overlayColor1}, ${overlayColor2})` }}
                    />
                    <div className="flex gap-2">
                      <input type="color" value={overlayColor1} onChange={(e) => setOverlayColor1(e.target.value)} className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30" />
                      <input type="color" value={overlayColor2} onChange={(e) => setOverlayColor2(e.target.value)} className="w-16 h-10 rounded-lg border border-yellow-500/20 bg-black/30" />
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

            <div className="mt-6 border-t border-yellow-500/15 pt-4">
              <label className="block text-yellow-400 text-sm mb-2">CTA Systeme.io</label>
              <div className="text-xs text-white/55 mb-3">
                Lien utilisé pour l’export HTML et les CTA générés par le copilote.
              </div>
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => onCtaUrlChange?.(e.target.value)}
                placeholder="https://ton-lien-systeme.io/ton-formulaire"
                className="w-full rounded-xl border border-yellow-500/15 bg-black/40 px-3 py-3 text-sm text-white/85 outline-none placeholder:text-white/25"
              />
            </div>
          </aside>

          <main className="rounded-2xl border border-white/10 bg-black/25 p-5 relative flex items-start justify-center">
            <div
              data-lead-engine-canvas-export="true"
              className="w-full rounded-2xl border border-yellow-500/20 overflow-hidden relative"
              style={{ height: `${canvasHeight}px` }}
            >
              <CanvasStage
                key={`${formatKey}-${canvasHeight}`}
                layers={layers}
                setLayers={setLayers}
                onSelectLayer={selectLayer}
                format={format as any}
              />
            </div>
          </main>

          <aside className="hidden min-[900px]:block rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
            <div className="mb-4 rounded-2xl border border-yellow-500/15 bg-black/30 p-3">
              <div className="text-yellow-300 font-semibold text-sm mb-3">
                Hauteur du canvas
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => bumpCanvasHeight(-200)}
                  className="flex-1 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-3 py-2 text-yellow-200"
                >
                  - 200
                </button>
                <div className="min-w-[92px] text-center text-sm font-bold text-white">
                  {canvasHeight}px
                </div>
                <button
                  type="button"
                  onClick={() => bumpCanvasHeight(200)}
                  className="flex-1 rounded-xl bg-[#ffb800] px-3 py-2 font-bold text-black"
                >
                  + 200
                </button>
              </div>

              <div className="mt-3 text-[12px] text-white/55">
                Réglage manuel stable. Plus d’agrandissement automatique pendant le drag.
              </div>
            </div>

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
              <div className="mt-4">
                <PropertiesDrawer
                  open
                  layer={selectedLayer}
                  onClose={() => setShowProps(false)}
                  onChange={(patch) => updateLayer(selectedLayer.id, patch)}
                />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
