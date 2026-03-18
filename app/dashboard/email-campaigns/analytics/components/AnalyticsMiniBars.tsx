
"use client";

import type { AnalyticsMiniBarItem } from "./types";

type Props = {
  title: string;
  description: string;
  items: AnalyticsMiniBarItem[];
  loading?: boolean;
};

export default function AnalyticsMiniBars({
  title,
  description,
  items,
  loading = false,
}: Props) {
  return (
    <section className="rounded-[28px] border border-[#7a5c16]/35 bg-[linear-gradient(180deg,#111111_0%,#090909_100%)] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c8a64d]">
        Histogramme premium
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#d2d2d2]">{description}</p>

      <div className="mt-7 space-y-5">
        {items.map((item) => {
          const ratio = item.max > 0 ? Math.max(8, Math.round((item.value / item.max) * 100)) : 0;
          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm text-[#ececec]">{item.label}</span>
                <span className="text-sm font-semibold text-[#f3d98b]">
                  {loading ? "..." : item.value}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#191919]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#6f5313_0%,#c8a64d_48%,#f5df9f_100%)] transition-all duration-700"
                  style={{ width: loading ? "18%" : `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
