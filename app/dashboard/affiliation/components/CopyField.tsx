"use client";

import { useState } from "react";

type Props = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  helper?: string;
  className?: string;
};

export default function CopyField({
  label,
  value,
  onChange,
  helper,
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <label className="mb-2 block text-left text-xs text-gray-400 sm:text-sm">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        rows={3}
        spellCheck={false}
        className="w-full resize-y rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] px-4 py-3 text-left text-sm leading-relaxed text-yellow-200 outline-none transition focus:border-yellow-400 sm:text-[15px]"
        aria-label={label}
      />

      {helper ? (
        <p className="mt-2 text-left text-xs text-gray-400 sm:text-sm">{helper}</p>
      ) : null}

      <button
        type="button"
        onClick={copy}
        className="mt-4 inline-flex w-full min-w-[220px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] px-6 py-3 font-semibold text-black shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-yellow-400/40 sm:w-auto"
      >
        {copied ? "Copié ✅" : "Copier"}
      </button>
    </div>
  );
}
