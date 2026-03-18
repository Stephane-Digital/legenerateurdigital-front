"use client";

import * as React from "react";

type Props = {
  open: boolean;
  initialValue?: string;
  onClose: () => void;

  /** Preferred callback (new versions) */
  onSubmit?: (value: string) => void;

  /** Backward-compatible alias */
  onSave?: (value: string) => void;
};

export default function ObjectiveModal({
  open,
  initialValue = "",
  onClose,
  onSubmit,
  onSave,
}: Props) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    if (open) setValue(initialValue || "");
  }, [open, initialValue]);

  if (!open) return null;

  const handleSave = () => {
    const v = (value || "").trim();
    // Never crash if the parent forgot a callback
    if (typeof onSubmit === "function") onSubmit(v);
    else if (typeof onSave === "function") onSave(v);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* modal */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#2a2416] bg-gradient-to-br from-[#0b0f16] to-[#0b1220] p-8 shadow-[0_0_0_1px_rgba(255,212,96,0.08),0_25px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-semibold text-white">
              Objectif — Définir / mettre à jour
            </div>
            <div className="mt-1 text-sm text-white/55">
              Décris ton objectif en <span className="text-yellow-300">1 phrase</span> +{" "}
              <span className="text-yellow-300">une cible mesurable</span> (ex: “2 ventes MRR en 30 jours”).
              <div className="mt-1 text-xs text-white/45">
                Astuce : clair, concret, orienté exécution. Alex s&apos;appuie dessus pour ajuster l’action du jour + le plan.
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 hover:bg-white/10"
          >
            Fermer
          </button>
        </div>

        <div className="mt-6">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-h-[160px] w-full resize-none rounded-2xl border border-[#2a2416] bg-black/30 p-4 text-white outline-none placeholder:text-white/30 focus:border-yellow-500/40"
            placeholder='Ex: "2 ventes MRR en 30 jours"'
          />
          <div className="mt-2 flex items-center justify-between text-xs text-white/45">
            <span>{value.trim() ? "OK" : ""}</span>
            <span>{value.length} caractères</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/75 hover:bg-white/10"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-black shadow hover:from-yellow-300 hover:to-yellow-500"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
