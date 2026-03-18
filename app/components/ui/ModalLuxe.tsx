"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function ModalLuxe({ open, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div
          aria-modal
          role="dialog"
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="
              relative z-[101] w-[92vw] max-w-[560px]
              rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e0e0e] to-black
              shadow-[0_10px_30px_rgba(0,0,0,0.6)]
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <h3 className="text-lg font-semibold text-[#ffb800]">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:text-white"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
