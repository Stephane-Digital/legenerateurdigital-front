"use client";

import { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function EditorMobileDrawer({ open, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="
          absolute bottom-0 left-0 right-0
          max-h-[85vh]
          bg-[#1e1e1e]
          rounded-t-2xl
          border-t border-yellow-500/30
          p-4 overflow-y-auto
        "
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-yellow-400 font-semibold text-lg">
            Outils de l'éditeur intelligent
          </h3>
          <button
            onClick={onClose}
            className="text-yellow-300 text-sm"
          >
            Fermer ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
