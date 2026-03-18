"use client";

import { MIN_ELEMENT_SIZE } from "@/lib/restrictions";
import type Konva from "konva";

// ✅ FIX TS: SlideElement n’est plus exporté par ../types
// On garde le runtime inchangé → type local build-safe
type SlideElement = any;

// ------------------------------------------------------------
// 🧲 SNAPPING INTELLIGENT (type Canva)
// ------------------------------------------------------------

export type SnapGuide = {
  x?: number;
  y?: number;
  distance: number;
  type: "center" | "edge";
  axis: "x" | "y";
};

export type SnapResult = {
  snappedX?: number;
  snappedY?: number;
  guides: SnapGuide[];
};

const SNAP_THRESHOLD = 6;

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function clampMinSize(w: number, h: number) {
  return {
    w: Math.max(MIN_ELEMENT_SIZE, w),
    h: Math.max(MIN_ELEMENT_SIZE, h),
  };
}

function getNodeBox(node: Konva.Node) {
  const rect = node.getClientRect({ skipShadow: true, skipStroke: false });
  return {
    x: rect.x,
    y: rect.y,
    w: rect.width,
    h: rect.height,
    cx: rect.x + rect.width / 2,
    cy: rect.y + rect.height / 2,
    r: rect.x + rect.width,
    b: rect.y + rect.height,
  };
}

function getElementBox(el: SlideElement) {
  const x = Number(el?.x ?? 0);
  const y = Number(el?.y ?? 0);
  const w = Number(el?.width ?? 0);
  const h = Number(el?.height ?? 0);

  return {
    x,
    y,
    w,
    h,
    cx: x + w / 2,
    cy: y + h / 2,
    r: x + w,
    b: y + h,
  };
}

// ------------------------------------------------------------
// 🎯 Snapping: renvoie la meilleure accroche pour X et Y
// (centre + bords) + guides (HUD)
// ------------------------------------------------------------

export function computeSnap(
  node: Konva.Node,
  elements: SlideElement[],
  selectedId: string | null
): SnapResult {
  const me = getNodeBox(node);

  let bestX: SnapGuide | null = null;
  let bestY: SnapGuide | null = null;

  for (const el of elements) {
    if (!el) continue;
    if (selectedId && el.id === selectedId) continue;

    const other = getElementBox(el);

    // AXE X : centre, gauche, droite
    const candidatesX: Array<{ a: number; b: number; type: "center" | "edge" }> =
      [
        { a: me.cx, b: other.cx, type: "center" },
        { a: me.x, b: other.x, type: "edge" },
        { a: me.r, b: other.r, type: "edge" },
        { a: me.x, b: other.r, type: "edge" },
        { a: me.r, b: other.x, type: "edge" },
      ];

    for (const c of candidatesX) {
      const d = Math.abs(c.a - c.b);
      if (d <= SNAP_THRESHOLD) {
        if (!bestX || d < bestX.distance) {
          bestX = { x: c.b, distance: d, type: c.type, axis: "x" };
        }
      }
    }

    // AXE Y : centre, haut, bas
    const candidatesY: Array<{ a: number; b: number; type: "center" | "edge" }> =
      [
        { a: me.cy, b: other.cy, type: "center" },
        { a: me.y, b: other.y, type: "edge" },
        { a: me.b, b: other.b, type: "edge" },
        { a: me.y, b: other.b, type: "edge" },
        { a: me.b, b: other.y, type: "edge" },
      ];

    for (const c of candidatesY) {
      const d = Math.abs(c.a - c.b);
      if (d <= SNAP_THRESHOLD) {
        if (!bestY || d < bestY.distance) {
          bestY = { y: c.b, distance: d, type: c.type, axis: "y" };
        }
      }
    }
  }

  const guides: SnapGuide[] = [];
  if (bestX) guides.push(bestX);
  if (bestY) guides.push(bestY);

  let snappedX: number | undefined;
  let snappedY: number | undefined;

  // Recalcule la position snapped pour garder le même "anchor"
  if (bestX?.x != null) {
    // On snap sur centre si c'est un center match, sinon bord (gauche)
    // Ici, simple : on décale node pour que son centre corresponde.
    snappedX = bestX.type === "center" ? bestX.x - me.w / 2 : bestX.x;
  }

  if (bestY?.y != null) {
    snappedY = bestY.type === "center" ? bestY.y - me.h / 2 : bestY.y;
  }

  return { snappedX, snappedY, guides };
}

// ------------------------------------------------------------
// ✅ Resize safe (min size)
// ------------------------------------------------------------

export function applySafeResize(width: number, height: number) {
  const { w, h } = clampMinSize(width, height);
  return { width: w, height: h };
}
