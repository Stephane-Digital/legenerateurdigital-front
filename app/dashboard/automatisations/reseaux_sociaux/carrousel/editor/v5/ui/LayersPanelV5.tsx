"use client";

import type { LayerData } from "../types/layers";

interface Props {
  layers: LayerData[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onToggleVisible: (id: string) => void;
  onReorder: (id: string, dir: "up" | "down") => void;
  onDuplicate: (id: string) => void;
  onDelete?: (id: string) => void; // ✅ SAFE : optionnel
}

export default function LayersPanelV5({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisible,
  onReorder,
  onDuplicate,
  onDelete,
}: Props) {
  const ordered = [...layers].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0));

  return (
    <div>
      <div className="mb-3 text-yellow-300 font-semibold">Layers</div>

      <div className="space-y-3">
        {ordered.map((l) => {
          const active = selectedLayerId === l.id;

          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onSelectLayer(l.id)}
              className={[
                "w-full text-left rounded-xl border p-3 transition",
                active
                  ? "border-yellow-400/60 bg-yellow-500/10"
                  : "border-yellow-500/15 bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-yellow-200 font-semibold truncate">
                    {l.type === "image" ? "image" : "text"}
                  </div>
                  <div className="text-xs text-yellow-200/60 truncate">
                    id: {l.id}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* visible */}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleVisible(l.id);
                    }}
                    className={[
                      "inline-flex items-center justify-center w-8 h-8 rounded-lg border cursor-pointer",
                      (l.visible ?? true)
                        ? "border-yellow-400/40 bg-yellow-500/10 text-yellow-200"
                        : "border-white/10 bg-black/30 text-white/50",
                    ].join(" ")}
                    title="Afficher / Masquer"
                  >
                    {(l.visible ?? true) ? "👁" : "🚫"}
                  </span>

                  {/* duplicate */}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDuplicate(l.id);
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-yellow-500/20 bg-black/30 text-yellow-200 hover:bg-black/40 cursor-pointer"
                    title="Dupliquer"
                  >
                    📄
                  </span>

                  {/* reorder */}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onReorder(l.id, "up");
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-yellow-500/20 bg-black/30 text-yellow-200 cursor-pointer"
                  >
                    ↑
                  </span>
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onReorder(l.id, "down");
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-yellow-500/20 bg-black/30 text-yellow-200 cursor-pointer"
                  >
                    ↓
                  </span>

                  {/* delete */}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete?.(l.id); // ✅ FIX SAFE
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-yellow-500/20 bg-black/30 text-yellow-200 cursor-pointer"
                    title="Supprimer"
                  >
                    🗑
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
