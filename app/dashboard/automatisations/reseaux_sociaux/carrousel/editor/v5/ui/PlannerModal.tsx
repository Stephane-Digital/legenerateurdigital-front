"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSchedule: (payload: {
    network: string;
    date: string;
    time: string;
  }) => void;
}

export default function PlannerModal({ open, onClose, onSchedule }: Props) {
  const [network, setNetwork] = useState("instagram");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* modal */}
      <div className="relative w-full max-w-xl mx-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-400">
          Planifier la publication
        </h3>

        <p className="text-sm text-gray-400 mt-2">
          Choisissez le réseau et la date de publication.
        </p>

        <div className="mt-6 space-y-4">
          {/* Réseau */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Réseau social
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-gray-200"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X (Twitter)</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-gray-200"
            />
          </div>

          {/* Heure */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Heure
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#121212] border border-[#2a2a2a] rounded-md px-3 py-2 text-sm text-gray-200"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[#2a2a2a] rounded-md text-gray-300 hover:border-gray-400 transition-colors"
          >
            Annuler
          </button>

          <button
            onClick={() =>
              onSchedule({ network, date, time })
            }
            className="px-4 py-2 text-sm rounded-md bg-yellow-400 text-black hover:bg-yellow-300 transition-colors"
          >
            Planifier
          </button>
        </div>
      </div>
    </div>
  );
}
