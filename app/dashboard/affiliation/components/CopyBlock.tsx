"use client";

import { useState } from "react";

type Props = {
  title: string;
  text: string;
  hint?: string;
};

export default function CopyBlock({ title, text, hint }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
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
    <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 sm:px-5 py-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-semibold text-yellow-200">{title}</p>
          {hint ? <p className="text-xs sm:text-sm text-gray-400 mt-1">{hint}</p> : null}
        </div>

        <button
          onClick={copy}
          className="shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-xl border border-yellow-600/25 text-yellow-200 hover:bg-yellow-500/10 transition-all duration-300"
        >
          {copied ? "Copié ✅" : "Copier"}
        </button>
      </div>

      <pre className="mt-4 whitespace-pre-wrap break-words text-sm sm:text-[15px] text-gray-200 leading-relaxed font-sans">
        {text}
      </pre>
    </div>
  );
}

