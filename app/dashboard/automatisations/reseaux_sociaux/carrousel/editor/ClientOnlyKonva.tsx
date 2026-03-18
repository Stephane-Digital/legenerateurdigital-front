"use client";

import dynamic from "next/dynamic";

// ⛔ On NE charge PAS EditorCanvas ici.
// ✅ On charge KonvaStageWrapper (un wrapper léger)

const ClientOnlyKonva = dynamic(() => import("./KonvaStageWrapper"), {
  ssr: false,
});

export default ClientOnlyKonva;
