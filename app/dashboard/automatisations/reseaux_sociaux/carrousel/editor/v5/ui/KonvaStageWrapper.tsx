"use client";

import type { ReactNode } from "react";

interface Props {
  width: number;
  height: number;
  children: ReactNode;
}

/**
 * KonvaStageWrapper (placeholder)
 * - Conservé uniquement pour compatibilité éventuelle
 * - Ne fait plus appel à react-konva
 */
export default function KonvaStageWrapper({ width, height, children }: Props) {
  return (
    <div style={{ width, height }} className="relative">
      {children}
    </div>
  );
}
