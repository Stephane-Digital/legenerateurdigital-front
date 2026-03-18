"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function LibraryModal({ open, onClose, onSave }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-xl mx-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-400">
          Sauvegarder dans la bibliothèque
        </h3>

        <p className="text-sm text-gray-400 mt-2">
          Enregistrez ce carrousel pour le réutiliser plus tard.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[#2a2a2a] rounded-md text-gray-300 hover:border-gray-400 transition-colors"
          >
            Annuler
          </button>

          <button
            onClick={onSave}
            className="px-4 py-2 text-sm rounded-md bg-yellow-400 text-black hover:bg-yellow-300 transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
