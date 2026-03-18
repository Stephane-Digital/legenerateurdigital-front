"use client";

import { useState } from "react";

type Props = {
  label: string;
  value: string;
  helper?: string;
  className?: string;
};

export default function CopyField({ label, value, helper, className = "" }: Props) {
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
      <p className="text-xs text-gray-400 mb-2 text-left">{label}</p>

      <div className="w-full rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] px-4 py-3 text-left">
        <p className="text-sm text-yellow-200 break-all">{value}</p>
      </div>

      {helper ? <p className="mt-2 text-xs text-gray-400 text-left">{helper}</p> : null}

      <button
        onClick={copy}
        className="mt-3 w-[72%] mx-auto py-2 rounded-2xl bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] text-black font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5 transition-all duration-300"
      >
        {copied ? "Copié ✅" : "Copier"}
      </button>
    </div>
  );
}
