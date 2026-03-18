"use client";

import { SlideData } from "../components/types";

export default function SlideEditor({
  slide,
  elementId,
  updateElement,
  deleteElement,
  changeSlide,
  slides,
}: {
  slide: SlideData;
  elementId: string | null;
  updateElement: (id: string, patch: Partial<any>) => void; // ✅ build-safe
  deleteElement: (id: string) => void;
  changeSlide: (index: number) => void;
  slides: SlideData[];
}) {
  if (!slide) return null;

  // ✅ FIX TS: SlideData peut ne pas exposer "elements" au type-level
  const elements = ((slide as any)?.elements ?? []) as any[];
  const element = elements.find((el) => el.id === elementId) || null;

  // ============================================================
  //    UI : Panneau vide si aucun élément n’est sélectionné
  // ============================================================
  if (!element) {
    return (
      <div className="w-full bg-[#0d0d0d] border border-yellow-700/30 rounded-xl p-6 text-gray-400 text-center shadow-lg">
        Sélectionnez un élément sur le canevas pour commencer l’édition.
      </div>
    );
    // END
  }

  // ============================================================
  //    Rendu éditeur selon le type d’élément
  // ============================================================

  const isText = element.type === "text";
  const isImage = element.type === "image";
  const isBackground = element.type === "background";

  return (
    <div className="w-full bg-[#0d0d0d] border border-yellow-700/30 rounded-xl p-6 space-y-6 shadow-lg">
      {/* TITRE */}
      <h2 className="text-xl font-bold text-yellow-400">
        Éditer : {isText ? "Texte" : isImage ? "Image" : "Background"}
      </h2>

      {/* ======================================================== */}
      {/* 🟦 TEXTE */}
      {/* ======================================================== */}
      {isText && (
        <div className="space-y-4">
          {/* CONTENU */}
          <div>
            <label className="text-yellow-300 text-sm">Contenu</label>
            <textarea
              value={(element as any).content}
              onChange={(e) => updateElement(element.id, { content: e.target.value })}
              className="w-full mt-1 bg-black border border-yellow-700/40 rounded-lg p-2 text-white"
              rows={4}
            />
          </div>

          {/* COULEUR */}
          <div>
            <label className="text-yellow-300 text-sm">Couleur</label>
            <input
              type="color"
              value={(element as any).color}
              onChange={(e) => updateElement(element.id, { color: e.target.value })}
              className="w-16 h-10 p-1 rounded bg-black mt-1"
            />
          </div>

          {/* TAILLE DE POLICE */}
          <div>
            <label className="text-yellow-300 text-sm">Taille (px)</label>
            <input
              type="number"
              min={10}
              max={200}
              value={(element as any).fontSize}
              onChange={(e) =>
                updateElement(element.id, { fontSize: Number(e.target.value) })
              }
              className="w-full mt-1 bg-black border border-yellow-700/40 rounded-lg p-2 text-white"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🟧 IMAGE + BACKGROUND */}
      {/* ======================================================== */}
      {(isImage || isBackground) && (
        <div className="space-y-4">
          {/* OPACITÉ */}
          <div>
            <label className="text-yellow-300 text-sm">Opacité</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={(element as any).opacity ?? 1}
              onChange={(e) =>
                updateElement(element.id, {
                  opacity: Number(e.target.value),
                })
              }
              className="w-full mt-1"
            />
          </div>

          {/* LARGEUR */}
          <div>
            <label className="text-yellow-300 text-sm">Largeur</label>
            <input
              type="number"
              value={(element as any).width}
              onChange={(e) =>
                updateElement(element.id, { width: Number(e.target.value) })
              }
              className="w-full mt-1 bg-black border border-yellow-700/40 rounded-lg p-2 text-white"
            />
          </div>

          {/* HAUTEUR */}
          <div>
            <label className="text-yellow-300 text-sm">Hauteur</label>
            <input
              type="number"
              value={(element as any).height}
              onChange={(e) =>
                updateElement(element.id, { height: Number(e.target.value) })
              }
              className="w-full mt-1 bg-black border border-yellow-700/40 rounded-lg p-2 text-white"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🔴 SUPPRESSION */}
      {/* ======================================================== */}
      <div className="pt-4 border-t border-yellow-700/30">
        <button
          onClick={() => deleteElement(element.id)}
          className="w-full bg-red-700/70 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Supprimer l’élément
        </button>
      </div>

      {/* ======================================================== */}
      {/* CHANGEMENT DE SLIDE */}
      {/* ======================================================== */}
      <div className="pt-4 border-t border-yellow-700/30">
        <label className="text-yellow-300 text-sm">Changer de slide</label>

        <div className="flex flex-wrap gap-2 mt-2">
          {slides.map((s, index) => (
            <button
              key={(s as any).id}
              onClick={() => changeSlide(index)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                (slide as any).id === (s as any).id
                  ? "border-yellow-400 text-yellow-400"
                  : "border-yellow-700/40 text-gray-400"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
