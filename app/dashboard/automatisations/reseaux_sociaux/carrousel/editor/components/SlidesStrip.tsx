"use client";

import type { Slide } from "./types";

interface Props {
  slides: Slide[];
  activeSlideId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function SlidesStrip({
  slides,
  activeSlideId,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <div className="mt-4 rounded-xl border border-yellow-500/15 bg-black/30 p-3">
      <div className="flex items-center gap-3 overflow-x-auto">
        {slides.map((slide, idx) => {
          const active = slide.id === activeSlideId;

          return (
            <button
              key={slide.id}
              onClick={() => onSelect(slide.id)}
              className={[
                "shrink-0 w-28 h-16 rounded-lg border flex items-center justify-center text-sm font-semibold",
                active
                  ? "border-[#ffb800] bg-yellow-500/20 text-yellow-200"
                  : "border-yellow-500/20 bg-black/40 text-yellow-200/60 hover:bg-black/50",
              ].join(" ")}
            >
              Slide {idx + 1}
            </button>
          );
        })}

        {/* ADD */}
        <button
          onClick={onAdd}
          className="shrink-0 w-28 h-16 rounded-lg border border-dashed border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
        >
          + Ajouter
        </button>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={onDuplicate}
            className="px-3 py-2 rounded-lg border border-yellow-500/20 bg-black/40 text-yellow-200"
          >
            📄
          </button>

          <button
            onClick={onDelete}
            disabled={slides.length <= 1}
            className={[
              "px-3 py-2 rounded-lg border",
              slides.length <= 1
                ? "border-white/10 text-white/30 cursor-not-allowed"
                : "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
            ].join(" ")}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
