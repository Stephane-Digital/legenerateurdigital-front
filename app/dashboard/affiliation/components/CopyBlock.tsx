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
    <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] px-4 py-4 text-left sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-yellow-200 sm:text-base">{title}</p>
          {hint ? <p className="mt-1 text-xs text-gray-400 sm:text-sm">{hint}</p> : null}
        </div>

        <button
          onClick={copy}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-yellow-600/25 px-4 py-2 text-yellow-200 transition-all duration-300 hover:bg-yellow-500/10"
        >
          {copied ? "Copié ✅" : "Copier"}
        </button>
      </div>

      <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-200 sm:text-[15px]">
        {text}
      </pre>
    </div>
  );
}

