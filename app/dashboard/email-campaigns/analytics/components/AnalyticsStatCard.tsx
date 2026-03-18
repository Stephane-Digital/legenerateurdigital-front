
"use client";

import type { LucideIcon } from "lucide-react";

type Accent = "gold";

type Props = {
  title: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  accent?: Accent;
  loading?: boolean;
};

export default function AnalyticsStatCard({
  title,
  value,
  helper,
  icon: Icon,
  loading = false,
}: Props) {
  return (
    <article className="rounded-[28px] border border-[#7a5c16]/35 bg-[linear-gradient(180deg,#111111_0%,#090909_100%)] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c8a64d]">
            {title}
          </p>
          <div className="mt-3 min-h-[48px]">
            {loading ? (
              <div className="h-11 w-24 animate-pulse rounded-2xl bg-[#1b1b1b]" />
            ) : (
              <p className="text-4xl font-semibold text-white">{value}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#7a5c16]/40 bg-[#15120c] p-3 text-[#f1d37d]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#cfcfcf]">{helper}</p>
    </article>
  );
}
