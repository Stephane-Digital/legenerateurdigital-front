"use client";

import { useMemo } from "react";
import useBackgroundModeA from "../hooks/useBackgroundModeA";
import normalizeSlide from "../utils/normalizeSlide";

// ✅ NormalizedSlide = { id, elements: [...] } (pas layers)
type NormalizedSlide = ReturnType<typeof normalizeSlide>;

interface Props {
  slide: NormalizedSlide | null;
  onUpdateSlide: (next: NormalizedSlide) => void;
}

export default function BackgroundToolbar({ slide, onUpdateSlide }: Props) {
  // ✅ FIX BUILD: le hook attend 1 argument
  const bg = (useBackgroundModeA as any)(slide) as any;

  const canEdit = !!slide;

  const quickColors = useMemo(
    () => ["#000000", "#0B1220", "#111827", "#1F2937", "#0f0f0f", "#ffffff"],
    []
  );

  const applyColor = (color: string) => {
    if (!slide) return;

    // Hook Mode A: si dispo, on utilise son API
    if (typeof bg?.applySolidColor === "function") {
      const next = bg.applySolidColor(slide, color);
      onUpdateSlide(next);
      return;
    }

    // ✅ Fallback : NormalizedSlide => elements[]
    const next: NormalizedSlide = {
      ...slide,
      elements: (slide.elements ?? []).map((el: any) =>
        el?.type === "background" ? { ...el, color } : el
      ),
    };

    onUpdateSlide(next);
  };

  const openFilePicker = () => {
    if (!slide) return;

    if (typeof bg?.openFilePicker === "function") {
      bg.openFilePicker();
      return;
    }

    // fallback: on clique sur l'input file via DOM
    const input = document.getElementById("bg-upload-input") as HTMLInputElement | null;
    input?.click();
  };

  const onFileSelected = async (file: File | null) => {
    if (!slide || !file) return;

    if (typeof bg?.applyImageFile === "function") {
      const next = await bg.applyImageFile(slide, file);
      onUpdateSlide(next);
      return;
    }

    alert("Import image: le hook background ne fournit pas applyImageFile().");
  };

  return (
    <div className="w-full rounded-2xl border border-yellow-500/15 bg-black/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-yellow-200">
          🎨 Background (Mode A)
        </div>

        <button
          type="button"
          disabled={!canEdit}
          onClick={openFilePicker}
          className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200 hover:bg-yellow-500/15 disabled:opacity-40"
        >
          Importer une image
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs text-yellow-200/70 mb-2">Couleurs rapides</div>
        <div className="flex flex-wrap gap-2">
          {quickColors.map((c) => (
            <button
              key={c}
              type="button"
              disabled={!canEdit}
              onClick={() => applyColor(c)}
              className="h-8 w-8 rounded-lg border border-white/10 disabled:opacity-40"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Fallback input file */}
      <input
        id="bg-upload-input"
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
