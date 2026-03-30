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

type LinkModalState = {
  open: boolean;
  layerId: string | null;
  url: string;
  targetBlank: boolean;
  nofollow: boolean;
};

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

function textToHtml(text: string) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

function stripHtmlToText(html: string) {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, "");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText;
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
  const editorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const savedRangeRef = useRef<Range | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const linkModalRef = useRef<HTMLDivElement | null>(null);

  const [drag, setDrag] = useState<DragState>(null);
  const [resize, setResize] = useState<ResizeState>(null);
  const [scale, setScale] = useState(1);

  const [guides, setGuides] = useState<Guides>({ x: null, y: null });
  const [hud, setHud] = useState<Hud>(null);

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const [linkModal, setLinkModal] = useState<LinkModalState>({
    open: false,
    layerId: null,
    url: "",
    targetBlank: true,
    nofollow: false,
  });

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

  const hideToolbar = useCallback(() => {
    if (linkModal.open) return;
    setToolbarPos((prev) => ({ ...prev, visible: false }));
  }, [linkModal.open]);

  const updateToolbarFromSelection = useCallback(() => {
    if (linkModal.open) return;
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    const activeEl = document.activeElement as HTMLElement | null;

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    if (selection.isCollapsed) {
      if (activeEl?.closest?.('[contenteditable="true"]')) {
        return;
      }
      hideToolbar();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const stageRect = containerRef.current?.getBoundingClientRect();
    if (!stageRect || !rect.width) {
      hideToolbar();
      return;
    }

    savedRangeRef.current = range.cloneRange();
    setToolbarPos({
      visible: true,
      x: rect.left - stageRect.left + rect.width / 2,
      y: rect.top - stageRect.top - 14,
    });
  }, [hideToolbar, linkModal.open]);

  const persistInlineHtml = useCallback(
    (layerId: string) => {
      const editor = editorRefs.current[layerId];
      if (!editor) return;
      const nextHtml = editor.innerHTML;
      updateLayer(layerId, {
        html: nextHtml as any,
        text: stripHtmlToText(nextHtml) as any,
      } as any);
    },
    [updateLayer]
  );

  const handleDoubleClickText = useCallback(
    (layerId: string) => {
      setEditingTextId(layerId);
      setSelected(layerId);
      hideToolbar();

      setTimeout(() => {
        const editor = editorRefs.current[layerId];
        if (!editor) return;

        const currentLayer = (orderedLayers as any[]).find((l: any) => l.id === layerId);
        const currentHtml =
          typeof currentLayer?.html === "string" && currentLayer.html.trim()
            ? currentLayer.html
            : textToHtml(currentLayer?.text ?? "");

        if (editor.innerHTML !== currentHtml) {
          editor.innerHTML = currentHtml;
        }

        editor.focus();

        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }, 0);
    },
    [setSelected, hideToolbar, orderedLayers]
  );

  useEffect(() => {
    for (const layer of orderedLayers as any[]) {
      if (layer?.type !== "text") continue;

      const editor = editorRefs.current[layer.id];
      if (!editor) continue;

      const layerHtml =
        typeof layer.html === "string" && layer.html.trim()
          ? layer.html
          : textToHtml(layer.text ?? "");

      if (editingTextId === layer.id) continue;

      if (editor.innerHTML !== layerHtml) {
        editor.innerHTML = layerHtml;
      }
    }
  }, [orderedLayers, editingTextId]);

  const onMouseDownLayer = (e: React.MouseEvent, layer: LayerData) => {
    if (editingTextId && editingTextId === (layer as any).id) return;

    if (editingTextId && editingTextId !== (layer as any).id) {
      persistInlineHtml(editingTextId);
      hideToolbar();
      setEditingTextId(null);
    }

    e.preventDefault();
    e.stopPropagation();

    if (
      (layer as any).id === BACKGROUND_LAYER_ID ||
      (layer as any).id === "bg" ||
      (layer as any).id === "background"
    ) {
      return;
    }

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

        const baseW = typeof (layer as any).width === "number" ? (layer as any).width : 420;
        const baseH = typeof (layer as any).height === "number" ? (layer as any).height : 120;

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
    if (editingTextId) {
      persistInlineHtml(editingTextId);
      hideToolbar();
      setEditingTextId(null);
    }

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
    if (editingTextId) {
      persistInlineHtml(editingTextId);
      hideToolbar();
      setEditingTextId(null);
    }

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
    if ((!drag && !resize) || editingTextId) return;

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
  }, [drag, resize, editingTextId, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    const onSelectionChange = () => {
      if (!editingTextId) return;
      updateToolbarFromSelection();
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [editingTextId, updateToolbarFromSelection]);

  const restoreSelection = useCallback(() => {
    if (!savedRangeRef.current) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  }, []);

  const saveCurrentSelection = useCallback(() => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }, []);

  const applyCommand = useCallback(
    (command: "bold" | "italic" | "underline") => {
      if (!editingTextId) return;

      const editor = editorRefs.current[editingTextId];
      editor?.focus();

      restoreSelection();
      document.execCommand(command, false);

      persistInlineHtml(editingTextId);

      requestAnimationFrame(() => {
        editor?.focus();
        updateToolbarFromSelection();
      });
    },
    [editingTextId, persistInlineHtml, restoreSelection, updateToolbarFromSelection]
  );

  const openLinkModal = useCallback(() => {
    if (!editingTextId) return;

    saveCurrentSelection();
    restoreSelection();

    const selection = window.getSelection();
    const anchor =
      selection?.anchorNode?.parentElement?.closest("a") ??
      selection?.focusNode?.parentElement?.closest("a");

    setLinkModal({
      open: true,
      layerId: editingTextId,
      url: anchor?.getAttribute("href") ?? "",
      targetBlank: anchor?.getAttribute("target") === "_blank",
      nofollow: (anchor?.getAttribute("rel") ?? "").includes("nofollow"),
    });

    requestAnimationFrame(() => {
      linkModalRef.current?.focus();
    });
  }, [editingTextId, restoreSelection, saveCurrentSelection]);

  const confirmLinkModal = useCallback(() => {
    if (!linkModal.layerId) return;
    restoreSelection();

    if (linkModal.url.trim()) {
      document.execCommand("createLink", false, linkModal.url.trim());

      const selection = window.getSelection();
      const anchor =
        selection?.anchorNode?.parentElement?.closest("a") ??
        selection?.focusNode?.parentElement?.closest("a");

      if (anchor) {
        if (linkModal.targetBlank) {
          anchor.setAttribute("target", "_blank");
        } else {
          anchor.removeAttribute("target");
        }

        const relParts = new Set<string>();
        if (linkModal.targetBlank) relParts.add("noopener");
        if (linkModal.targetBlank) relParts.add("noreferrer");
        if (linkModal.nofollow) relParts.add("nofollow");

        if (relParts.size > 0) {
          anchor.setAttribute("rel", Array.from(relParts).join(" "));
        } else {
          anchor.removeAttribute("rel");
        }
      }
    }

    persistInlineHtml(linkModal.layerId);
    setLinkModal({
      open: false,
      layerId: null,
      url: "",
      targetBlank: true,
      nofollow: false,
    });

    requestAnimationFrame(() => {
      const editor = editorRefs.current[linkModal.layerId!];
      editor?.focus();
      updateToolbarFromSelection();
    });
  }, [linkModal, persistInlineHtml, restoreSelection, updateToolbarFromSelection]);

  const cancelLinkModal = useCallback(() => {
    const currentLayerId = linkModal.layerId;
    setLinkModal({
      open: false,
      layerId: null,
      url: "",
      targetBlank: true,
      nofollow: false,
    });

    requestAnimationFrame(() => {
      if (!currentLayerId) return;
      const editor = editorRefs.current[currentLayerId];
      editor?.focus();
      restoreSelection();
      updateToolbarFromSelection();
    });
  }, [linkModal.layerId, restoreSelection, updateToolbarFromSelection]);

  useEffect(() => {
    if (!linkModal.open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelLinkModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [linkModal.open, cancelLinkModal]);

  const canvasCursor = useMemo(() => {
    if (editingTextId) return "text";
    if (!resize && !drag) return "default";
    if (resize?.kind === "image") return cornerCursor(resize.corner);
    if (resize?.kind === "text") return cornerCursor(resize.corner);
    if (drag) return "move";
    return "default";
  }, [resize, drag, editingTextId]);

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
          if (editingTextId) {
            persistInlineHtml(editingTextId);
            hideToolbar();
            setEditingTextId(null);
          }
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

          {toolbarPos.visible && editingTextId && (
            <div
              ref={toolbarRef}
              className="lgd-inline-toolbar absolute z-[99999] -translate-x-1/2 -translate-y-full rounded-2xl border border-yellow-500/20 bg-[#111] p-2 shadow-2xl"
              style={{
                left: toolbarPos.x,
                top: toolbarPos.y,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => applyCommand("bold")}
                  className="h-9 min-w-[36px] rounded-lg px-3 text-sm font-bold text-white hover:bg-white/10"
                  title="Gras"
                >
                  B
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => applyCommand("italic")}
                  className="h-9 min-w-[36px] rounded-lg px-3 text-sm italic text-white hover:bg-white/10"
                  title="Italique"
                >
                  I
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => applyCommand("underline")}
                  className="h-9 min-w-[36px] rounded-lg px-3 text-sm underline text-white hover:bg-white/10"
                  title="Souligné"
                >
                  U
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    saveCurrentSelection();
                  }}
                  onClick={openLinkModal}
                  className="h-9 min-w-[36px] rounded-lg px-3 text-sm text-white hover:bg-white/10"
                  title="Ajouter un lien"
                >
                  🔗
                </button>
              </div>
            </div>
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
            const isEditing = editingTextId === layer.id;

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
              const html =
                typeof layer.html === "string" && layer.html.trim()
                  ? layer.html
                  : textToHtml(layer.text ?? "");

              return (
                <div
                  key={layer.id}
                  className={`absolute whitespace-pre-wrap break-words ${
                    isEditing ? "select-text" : "select-none"
                  }`}
                  style={{
                    left: x,
                    top: y,
                    width: w,
                    minHeight: h,
                    zIndex: textZBase + (layer.zIndex ?? 0),
                    fontSize: layer.style?.fontSize ?? 48,
                    color: layer.style?.color ?? "#ffffff",
                    fontFamily,
                    fontWeight,
                    fontStyle,
                    textDecoration,
                    lineHeight: layer.style?.lineHeight ?? 1.35,
                    textAlign,
                    direction: "ltr",
                    unicodeBidi: "normal",
                    writingMode: "horizontal-tb",
                    transform: "none",
                    cursor: isEditing ? "text" : "move",
                    boxShadow: "none",
                    padding: 6,
                    display: "flex",
                    alignItems: "flex-start",
                    outline: isEditing ? "1px dashed rgba(255,184,0,0.45)" : "none",
                    borderRadius: 8,
                  }}
                  onMouseDown={(e) => {
                    if (isEditing) {
                      e.stopPropagation();
                      return;
                    }
                    onMouseDownLayer(e, layer);
                  }}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDoubleClickText(layer.id);
                  }}
                >
                  <div
                    ref={(node) => {
                      editorRefs.current[layer.id] = node;
                    }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    spellCheck={false}
                    dir="ltr"
                    tabIndex={isEditing ? 0 : -1}
                    onMouseDown={(e) => {
                      if (isEditing) {
                        e.stopPropagation();
                        const editor = editorRefs.current[layer.id];
                        editor?.focus();
                        return;
                      }

                      const target = e.target as HTMLElement | null;
                      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;

                      if (anchor) {
                        e.stopPropagation();
                        const href = anchor.getAttribute("href");
                        if (href) {
                          window.open(href, "_blank", "noopener,noreferrer");
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const nextTarget = e.relatedTarget as HTMLElement | null;
                      const activeEl =
                        typeof document !== "undefined"
                          ? (document.activeElement as HTMLElement | null)
                          : null;

                      if (
                        linkModal.open ||
                        nextTarget?.closest(".lgd-inline-toolbar") ||
                        nextTarget?.closest(".lgd-link-modal") ||
                        activeEl?.closest(".lgd-inline-toolbar") ||
                        activeEl?.closest(".lgd-link-modal")
                      ) {
                        return;
                      }

                      persistInlineHtml(layer.id);
                      hideToolbar();
                      setEditingTextId(null);
                    }}
                    onFocus={() => {
                      setEditingTextId(layer.id);
                      setSelected(layer.id);
                      saveCurrentSelection();
                    }}
                    onInput={() => {
                      if (isEditing) {
                        saveCurrentSelection();
                      }
                    }}
                    onMouseUp={() => {
                      if (isEditing) {
                        saveCurrentSelection();
                        updateToolbarFromSelection();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!isEditing) return;

                      const isMeta = e.ctrlKey || e.metaKey;
                      const key = e.key.toLowerCase();

                      if (isMeta && key === "b") {
                        e.preventDefault();
                        applyCommand("bold");
                        return;
                      }

                      if (isMeta && key === "i") {
                        e.preventDefault();
                        applyCommand("italic");
                        return;
                      }

                      if (isMeta && key === "u") {
                        e.preventDefault();
                        applyCommand("underline");
                        return;
                      }

                      if (e.key === "Escape") {
                        e.preventDefault();
                        persistInlineHtml(layer.id);
                        hideToolbar();
                        setEditingTextId(null);
                      }
                    }}
                    onKeyUp={() => {
                      if (isEditing) {
                        saveCurrentSelection();
                      }
                    }}
                    onPaste={(e) => {
                      if (!isEditing) return;
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text/plain");
                      document.execCommand("insertText", false, pasted);
                      saveCurrentSelection();
                    }}
                    onClick={(e) => {
                      if (isEditing) {
                        e.stopPropagation();
                        saveCurrentSelection();
                        updateToolbarFromSelection();
                      }
                    }}
                    style={{
                      width: "100%",
                      minHeight: "1em",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      outline: "none",
                      cursor: isEditing ? "text" : "inherit",
                      userSelect: "text",
                      direction: "ltr",
                      unicodeBidi: "normal",
                      writingMode: "horizontal-tb",
                      textAlign,
                    }}
                    dangerouslySetInnerHTML={isEditing ? undefined : { __html: html }}
                  />

                  {isSelected &&
                    !isEditing &&
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

      {linkModal.open && (
        <div
          className="absolute inset-0 z-[100000] flex items-center justify-center bg-black/55"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            ref={linkModalRef}
            tabIndex={-1}
            className="lgd-link-modal w-[520px] max-w-[92vw] rounded-[24px] border border-white/10 bg-[#f5f5f5] p-0 text-black shadow-2xl"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="border-b border-black/10 px-6 py-5">
              <div className="flex items-center gap-6 text-[15px]">
                <label className="flex items-center gap-2">
                  <input type="radio" checked readOnly />
                  Privilège
                </label>
                <label className="flex items-center gap-2 opacity-70">
                  <input type="radio" readOnly />
                  Surgir
                </label>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="mb-3 text-[18px] font-semibold text-black">Privilège</div>

              <div className="flex overflow-hidden rounded-xl border border-black/15 bg-white">
                <input
                  type="text"
                  autoFocus
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  value={linkModal.url}
                  onChange={(e) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                  placeholder="Tapez l'URL"
                  className="flex-1 bg-transparent px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  className="flex w-14 items-center justify-center border-l border-black/10 text-lg"
                >
                  ⤴
                </button>
              </div>
            </div>

            <div className="border-t border-black/10 px-6 py-4">
              <label className="mb-3 flex items-center gap-3 text-[15px]">
                <input
                  type="checkbox"
                  checked={linkModal.targetBlank}
                  onChange={(e) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      targetBlank: e.target.checked,
                    }))
                  }
                />
                Ouvrir le lien dans un nouvel onglet
              </label>

              <label className="flex items-center gap-3 text-[15px]">
                <input
                  type="checkbox"
                  checked={linkModal.nofollow}
                  onChange={(e) =>
                    setLinkModal((prev) => ({
                      ...prev,
                      nofollow: e.target.checked,
                    }))
                  }
                />
                Nofollow
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-black/10 px-6 py-4">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={cancelLinkModal}
                className="rounded-xl border border-black/15 bg-white px-5 py-2.5 text-[15px] text-[#0b8bf1]"
              >
                Annuler
              </button>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={confirmLinkModal}
                className="rounded-xl bg-[#0b8bf1] px-5 py-2.5 text-[15px] font-semibold text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
