"use client";

import { CanvasFormat } from "../hooks/useCanvasFormat";

export default function FormatSelector({
  format,
  changeFormat,
  formats,
}: {
  format: CanvasFormat;
  changeFormat: (f: CanvasFormat) => void;
  formats: Record<
    CanvasFormat,
    { label: string; width: number; height: number; ratio: number }
  >;
}) {
  return (
    <div className="bg-[#111] border border-yellow-600/20 rounded-xl p-4 space-y-3 shadow-lg">
      <h2 className="text-yellow-400 font-bold text-lg">
        Format du carrousel
      </h2>

      <div className="flex flex-col gap-2">
        {Object.entries(formats).map(([key, data]) => (
          <button
            key={key}
            onClick={() => changeFormat(key as CanvasFormat)}
            className={`px-3 py-2 rounded-lg text-sm border transition-all ${
              format === key
                ? "bg-yellow-500 text-black font-semibold border-yellow-400"
                : "bg-[#1a1a1a] text-yellow-300 border-yellow-600/20 hover:border-yellow-500"
            }`}
          >
            {data.label}
          </button>
        ))}
      </div>
    </div>
  );
}
