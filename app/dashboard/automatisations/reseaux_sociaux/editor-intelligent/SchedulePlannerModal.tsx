"use client";

import { useMemo, useState } from "react";

type NetworkKey = "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube" | "pinterest";

type Props = {
  open: boolean;
  loading?: boolean;
  defaultTitle: string;
  onClose: () => void;
  onConfirm: (args: { network: NetworkKey; datetimeISO: string; title: string }) => Promise<void> | void;
};

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SchedulePlannerModal({ open, loading, defaultTitle, onClose, onConfirm }: Props) {
  const [network, setNetwork] = useState<NetworkKey>("instagram");
  const [title, setTitle] = useState(defaultTitle);

  const initial = useMemo(() => toDatetimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)), []);
  const [dtLocal, setDtLocal] = useState(initial);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* overlay */}
      <button aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-black/70" />

      {/* modal */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-yellow-500/20 bg-[#0b0b0f]/95 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-yellow-300 font-semibold text-lg">Planifier dans le Planner</div>
            <div className="text-yellow-100/60 text-sm mt-1">
              Choisis le réseau + la date/heure. (Le contenu actuel de l’éditeur sera envoyé au Planner.)
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-yellow-500/25 bg-black/30 px-3 py-2 text-yellow-200 hover:bg-black/40"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-yellow-200/80 text-sm mb-2">Réseau</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as NetworkKey)}
              className="w-full rounded-xl bg-[#111] border border-yellow-500/25 px-3 py-3 text-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="pinterest">Pinterest</option>
            </select>
          </div>

          <div>
            <label className="block text-yellow-200/80 text-sm mb-2">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre dans le Planner"
              className="w-full rounded-xl bg-[#111] border border-yellow-500/25 px-3 py-3 text-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-yellow-200/80 text-sm mb-2">Date & heure</label>
            <input
              type="datetime-local"
              value={dtLocal}
              onChange={(e) => setDtLocal(e.target.value)}
              className="w-full rounded-xl bg-[#111] border border-yellow-500/25 px-3 py-3 text-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-yellow-500/25 bg-black/30 px-4 py-2 text-yellow-200 hover:bg-black/40"
          >
            Annuler
          </button>

          <button
            disabled={!!loading}
            onClick={() => onConfirm({ network, datetimeISO: dtLocal, title })}
            className="rounded-xl bg-[#ffb800] px-4 py-2 font-semibold text-black hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Planification..." : "Ajouter au Planner"}
          </button>
        </div>
      </div>
    </div>
  );
}
