"use client";

// ✅ FIX TS: SlideElement n’est plus exporté => type local build-safe
type SlideElement = any;

export default function LayerManager({
  elements,
  selectedElementId,
  selectElement,
  moveElement,
}: {
  elements: SlideElement[];
  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, direction: "up" | "down") => void;
}) {
  // ============================================================
  // UI — STYLE LUXE DORÉ RESPECTÉ, PAS DE MODIFICATION DESIGN
  // ============================================================
  return (
    <div className="w-full lg:w-72 bg-[#0a0a0a] border border-yellow-700/30 rounded-xl p-4 shadow-lg space-y-4">
      <h2 className="text-yellow-400 text-xl font-bold mb-2">Calques</h2>

      {/* AUCUN ÉLÉMENT */}
      {elements.length === 0 && (
        // ✅ FIX: classname -> className
        <p className="text-yellow-300/60 text-sm">Aucun élément</p>
      )}

      {/* LISTE DES CALQUES */}
      <div className="space-y-2">
        {elements.map((el: any) => {
          const isSelected = el.id === selectedElementId;

          return (
            <div
              key={el.id}
              className={`
                p-3 rounded-lg border cursor-pointer transition
                ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-yellow-700/30 hover:border-yellow-500/40"
                }
              `}
              onClick={() => selectElement(el.id)}
            >
              {/* TITRE CALQUE */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-200">
                  {el.type === "text" && "Texte"}
                  {el.type === "image" && "Image"}
                  {el.type === "background" && "Background"}
                </span>
              </div>

              {/* BOUTONS ORDER (avant / arrière) */}
              <div className="flex gap-2 mt-2">
                <button
                  className="flex-1 bg-yellow-600/30 hover:bg-yellow-500/40 text-yellow-300 text-xs py-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElement(el.id, "up");
                  }}
                >
                  Monter
                </button>

                <button
                  className="flex-1 bg-yellow-600/30 hover:bg-yellow-500/40 text-yellow-300 text-xs py-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElement(el.id, "down");
                  }}
                >
                  Descendre
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
