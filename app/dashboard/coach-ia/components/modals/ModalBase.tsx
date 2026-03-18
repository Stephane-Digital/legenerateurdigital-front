"use client";

import React, { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClassName?: string; // e.g. "max-w-5xl"
};

export default function ModalBase({
  open,
  title,
  onClose,
  children,
  maxWidthClassName = "max-w-5xl",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <button
        aria-label="Fermer"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "relative w-full",
          maxWidthClassName,
          "rounded-3xl border border-[#2a2416] bg-gradient-to-b from-[#0b1220] to-[#070a10]",
          "shadow-[0_0_0_1px_rgba(255,215,0,0.06),0_24px_60px_rgba(0,0,0,0.65)]",
          "overflow-hidden",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5">
          <div className="text-lg font-semibold text-white">{title}</div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            Fermer
          </button>
        </div>

        <div className="max-h-[78vh] overflow-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
