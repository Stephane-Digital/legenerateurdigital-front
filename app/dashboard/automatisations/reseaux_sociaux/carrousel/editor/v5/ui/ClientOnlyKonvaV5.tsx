"use client";

import type { ReactNode } from "react";

interface Props {
  width: number;
  height: number;
  children: ReactNode;
}

/**
 * ClientOnlyKonvaV5
 * - Conteneur 100% client, SANS react-konva
 * - On garde width/height pour garder la logique claire
 */
export default function ClientOnlyKonvaV5({ width, height, children }: Props) {
  return (
    <div
      style={{ width, height }}
      className="relative flex items-center justify-center"
    >
      {children}
    </div>
  );
}
