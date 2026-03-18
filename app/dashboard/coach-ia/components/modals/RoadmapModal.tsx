"use client";

import React from "react";
import ModalBase from "./ModalBase";

export default function RoadmapModal(props: {
  open: boolean;
  onClose: () => void;
  planText: string;
  onGenerate: () => Promise<void>;
}) {
  const { open, onClose, planText, onGenerate } = props;

  return (
    <ModalBase open={open} onClose={onClose} title="Plan d’action — 7 jours">
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#2a2416] bg-black/30 p-4 text-sm text-white/70">
          Ici, l’utilisateur retrouve <span className="text-yellow-300">son plan d’action complet</span> (7 jours) + les tâches.
          Tu peux générer/mettre à jour ce plan à tout moment.
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onGenerate}
            className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
          >
            Générer / Mettre à jour
          </button>

          <button
            onClick={() => window.print()}
            className="rounded-xl border border-[#3a2d12] bg-black/30 px-4 py-2 text-sm text-yellow-200 hover:bg-black/50"
          >
            Imprimer
          </button>
        </div>

        <div className="rounded-2xl border border-[#2a2416] bg-black/20 p-4">
          {planText ? (
            <pre className="whitespace-pre-wrap text-sm text-white/80">{planText}</pre>
          ) : (
            <div className="text-sm text-white/55">
              Aucun plan enregistré pour l’instant. Clique sur <b>Générer / Mettre à jour</b>.
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
}
