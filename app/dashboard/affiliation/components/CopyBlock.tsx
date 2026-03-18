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
    <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4 text-left">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-yellow-200">{title}</p>
          {hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
        </div>

        <button
          onClick={copy}
          className="shrink-0 px-4 py-2 rounded-xl border border-yellow-600/25 text-yellow-200 hover:bg-yellow-500/10 transition-all duration-300"
        >
          {copied ? "Copié ✅" : "Copier"}
        </button>
      </div>

      <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
        {text}
      </pre>
    </div>
  );
}
