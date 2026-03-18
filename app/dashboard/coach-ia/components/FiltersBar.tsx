// app/dashboard/coach-ia/components/FiltersBar.tsx
"use client";

type Props = {
  focus: string;
  onFocusChange: (v: string) => void;
};

export default function FiltersBar({ focus, onFocusChange }: Props) {
  return (
    <div className="flex items-center justify-end">
      <select
        value={focus}
        onChange={(e) => onFocusChange(e.target.value)}
        className="h-9 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-yellow-500/30"
      >
        <option value="jour">Focus : Jour</option>
        <option value="objectif">Focus : Objectif</option>
        <option value="diagnostic">Focus : Diagnostic</option>
      </select>
    </div>
  );
}
