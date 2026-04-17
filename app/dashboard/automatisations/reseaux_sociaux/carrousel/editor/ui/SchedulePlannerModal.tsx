"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  defaultTitle: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (args: { reseau: string; date_programmee: string; titre?: string }) => void | Promise<void>;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * ISO compatible (évite les soucis backend si parsing strict)
 * -> "YYYY-MM-DDTHH:mm:ss+01:00"
 */
function toISOWithOffset(d: Date) {
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const offH = pad(Math.floor(abs / 60));
  const offM = pad(abs % 60);

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${sign}${offH}:${offM}`;
}

function defaultLocalDateTimeValue() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 10);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function SchedulePlannerModal({ open, defaultTitle, loading, onClose, onConfirm }: Props) {
  const [reseau, setReseau] = useState("instagram");
  const [dtLocal, setDtLocal] = useState<string>(defaultLocalDateTimeValue());
  const [title, setTitle] = useState<string>(defaultTitle || "Post");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setErr("");
    setTitle(defaultTitle || "Post");
  }, [open, defaultTitle]);

  const isoToSend = useMemo(() => {
    if (!dtLocal) return "";
    const d = new Date(dtLocal);
    if (Number.isNaN(d.getTime())) return "";
    return toISOWithOffset(d);
  }, [dtLocal]);

  if (!open) return null;

  async function submit() {
    setErr("");
    if (!isoToSend) {
      setErr("Date/heure invalide (date_programmee).");
      return;
    }

    try {
      await onConfirm({
        reseau,
        date_programmee: isoToSend,
        titre: title || defaultTitle || "Post",
      });
    } catch (e: any) {
      const msg = String(e?.message || e || "");
      setErr(msg.includes("date_programm") ? "Date/heure invalide (date_programmee)." : msg || "Erreur planification.");
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-[#2a2416] bg-[#0b0f16] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-bold text-[#ffb800]">Planifier dans le Planner</div>
            <div className="mt-1 text-sm text-white/60">Choisis le réseau + la date/heure, puis on crée l’entrée dans le Planner.</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/25 bg-black/30 text-yellow-200 hover:bg-black/40"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-2 text-sm font-semibold text-yellow-200">Réseau</div>
            <select
              value={reseau}
              onChange={(e) => setReseau(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#2a2416] bg-black/30 px-4 text-sm text-white outline-none"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-yellow-200">Date &amp; heure</div>
            <input
              type="datetime-local"
              value={dtLocal}
              onChange={(e) => setDtLocal(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#2a2416] bg-black/30 px-4 text-sm text-white outline-none"
            />
            <div className="mt-2 text-xs text-white/50">ISO envoyé : {isoToSend || "—"}</div>
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold text-yellow-200">Titre (optionnel)</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#2a2416] bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/35"
              placeholder={defaultTitle || "Post"}
            />
          </div>

          {err ? <div className="text-sm text-red-400">✕ {err}</div> : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-yellow-500/25 bg-black/30 px-5 text-sm font-semibold text-yellow-200 hover:bg-black/40"
            >
              Annuler
            </button>

            <button
              type="button"
              disabled={!!loading}
              onClick={submit}
              className="h-11 rounded-xl bg-[#ffb800] px-6 text-sm font-bold text-black disabled:opacity-60"
            >
              {!!loading ? "Planification…" : "✅ Planifier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


