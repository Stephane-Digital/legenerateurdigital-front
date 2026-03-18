// app/components/campagnes/ModalNouvelleCampagne.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import CampaignForm from "./CampaignForm";

type ModalNouvelleCampagneProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { titre: string; type: string; objectif: string }) => void;
  loading?: boolean;
};

export default function ModalNouvelleCampagne({
  open,
  onClose,
  onCreate,
  loading,
}: ModalNouvelleCampagneProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[200]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[#050505] max-w-2xl w-full rounded-2xl border border-yellow-400/30 shadow-2xl shadow-yellow-500/20 p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-yellow-400">
                Nouvelle campagne IA
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <CampaignForm onSubmit={onCreate} loading={loading} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
