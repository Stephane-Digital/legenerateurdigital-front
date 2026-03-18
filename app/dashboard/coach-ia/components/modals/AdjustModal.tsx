"use client";

import React from "react";
import ModalBase from "./ModalBase";

export default function AdjustModal({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: () => void;
}) {
  return (
    <ModalBase open={open} onClose={onClose} title="C — Réajuster mon plan" maxWidthClassName="max-w-4xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
        <div className="text-white font-semibold">Réajustement</div>
        <div className="mt-2">
          Modifie ton objectif, ton temps dispo, ou ton contexte : Alex recalculera un plan plus adapté.
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={onGenerate}
            className="rounded-xl bg-[#f5c542] px-5 py-3 text-sm font-semibold text-black hover:brightness-110 transition"
          >
            Réajuster maintenant
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-white transition"
          >
            Annuler
          </button>
        </div>
      </div>
    </ModalBase>
  );
}
