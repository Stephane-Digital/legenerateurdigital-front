"use client";

import useCanvasFormat from "../hooks/useCanvasFormat";

export default function CanvasFormatSelector() {
  // ✅ FIX TS minimal : on caste la fonction (export default parfois typé bizarrement)
  const hook = useCanvasFormat as any;
  const { format, changeFormat, availableFormats } = hook();

  return (
    <div className="space-y-2">
      <p className="text-yellow-400 text-sm font-semibold">Format du carrousel</p>

      <select
        value={format}
        onChange={(e) => changeFormat(e.target.value as any)}
        className="w-full bg-[#111] border border-yellow-600/40 text-yellow-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-400"
      >
        {Object.entries(availableFormats || {}).map(([key, item]: any) => (
          <option key={key} value={key} className="bg-black text-yellow-300">
            {item?.label ?? key}
          </option>
        ))}
      </select>
    </div>
  );
}
