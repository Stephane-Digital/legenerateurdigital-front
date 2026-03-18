"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// ============================================================
// 🛡 SAFE CANVAS WRAPPER — React Konva Shield
// Empêche tout rendu SSR, protège le Canvas, évite les crashs
// ============================================================

// Chargement dynamique SANS SSR du Stage Konva
const ClientOnly = dynamic(() => Promise.resolve(ClientOnlyWrapper), {
  ssr: false,
});

// Petit wrapper interne ultra fiable
function ClientOnlyWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function SafeCanvasWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        w-full
        flex
        items-center
        justify-center
        bg-[#0c0c0c]
        border border-yellow-600/20
        rounded-xl
        shadow-xl
        p-4
      "
    >
      <ClientOnly>{children}</ClientOnly>
    </div>
  );
}
