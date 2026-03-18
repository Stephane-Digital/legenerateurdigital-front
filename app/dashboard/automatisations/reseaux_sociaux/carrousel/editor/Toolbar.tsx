"use client";

interface ToolbarProps {
  layer: any;
  updateLayer: (id: string, updates: any) => void;
}

export default function Toolbar({ layer, updateLayer }: ToolbarProps) {
  if (!layer) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-yellow-500/30 flex items-center gap-4 text-white">

      {/* FONT SIZE */}
      {layer.type === "text" && (
        <input
          type="number"
          value={layer.fontSize || 60}
          onChange={(e) =>
            updateLayer(layer.id, { fontSize: parseInt(e.target.value) })
          }
          className="w-16 bg-[#1a1a1a] border border-yellow-500/30 text-yellow-300 rounded px-2 py-1"
        />
      )}

      {/* COLOR */}
      <input
        type="color"
        value={layer.fill || "#ffffff"}
        onChange={(e) => updateLayer(layer.id, { fill: e.target.value })}
        className="w-8 h-8 rounded-full border border-yellow-400"
      />
    </div>
  );
}
