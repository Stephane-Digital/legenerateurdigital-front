"use client";

import { useEffect, useState } from "react";

type Props = {
  feature?: string;
  plan?: string;
  q?: string;
  onChange: (next: { feature?: string; plan?: string; q?: string }) => void;
};

export default function FiltersBar({ feature, plan, q, onChange }: Props) {
  const [localQ, setLocalQ] = useState(q ?? "");

  useEffect(() => {
    setLocalQ(q ?? "");
  }, [q]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex-1">
        <label className="mb-1 block text-xs text-white/50">Recherche (email / user_id)</label>
        <input
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange({ q: localQ, plan, feature });
            }
          }}
          placeholder="ex: stephane@… ou 9"
          className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-yellow-500/30"
        />
      </div>

      <div className="flex gap-3">
        <div>
          <label className="mb-1 block text-xs text-white/50">Plan</label>
          <select
            value={plan ?? ""}
            onChange={(e) => onChange({ q: localQ, feature, plan: e.target.value || undefined })}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-yellow-500/30"
          >
            <option value="">Tous</option>
            <option value="essentiel">Essentiel</option>
            <option value="pro">Pro</option>
            <option value="ultime">Ultime</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">Feature</label>
          <select
            value={feature ?? ""}
            onChange={(e) => onChange({ q: localQ, plan, feature: e.target.value || undefined })}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-yellow-500/30"
          >
            <option value="">Toutes</option>
            <option value="coach">coach</option>
          </select>
        </div>

        <button
          onClick={() => onChange({ q: localQ, plan, feature })}
          className="h-10 rounded-xl bg-yellow-500 px-4 text-xs font-bold text-black hover:bg-yellow-400"
        >
          OK
        </button>
      </div>
    </div>
  );
}

