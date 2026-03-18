"use client";

import dynamic from "next/dynamic";

/*
  ⚠️ IMPORTANT — NE PAS IMPORTER react-konva ICI
  Konva est isolé dans SlateTextBoxKonva.tsx
  pour éviter le bug ReactCurrentOwner (Next 15)
*/

const SlateTextBoxKonva = dynamic(
  () => import("./SlateTextBoxKonva"),
  { ssr: false }
);

interface Props {
  id: string;
  content?: string;
  x: number;
  y: number;
  width?: number;
  isSelected: boolean;
  onSelect: () => void;
  onResize: (newWidth: number) => void;
}

export default function SlateTextBox(props: Props) {
  return <SlateTextBoxKonva {...props} />;
}
