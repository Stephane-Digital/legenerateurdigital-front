"use client";

import type { ReactNode } from "react";

interface Props {
  width: number;
  height: number;
  children: ReactNode;
}

export default function EditorCanvasV5({ width, height, children }: Props) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width, height }}
    >
      {children}
    </div>
  );
}
