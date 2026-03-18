"use client";

import dynamic from "next/dynamic";

// ✅ Wrapper léger côté client pour Konva
// On réutilise le CanvasStage déjà existant (client-only)
const CanvasStage = dynamic(() => import("../components/CanvasStage.client"), {
  ssr: false,
});

export default function KonvaStageWrapper(props: any) {
  return <CanvasStage {...props} />;
}
