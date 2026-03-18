"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  width: number;
  height: number;
  children: React.ReactNode;
}

export default function ScaleWrapperV5({
  width,
  height,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width: cw, height: ch } = entry.contentRect;

      const scaleX = cw / width;
      const scaleY = ch / height;

      // 🔒 jamais agrandir au-delà de 1
      const nextScale = Math.min(scaleX, scaleY, 1);

      setScale(nextScale);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
    >
      <div
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
