"use client";

import React from "react";

function formatInt(n: number) {
  try {
    return new Intl.NumberFormat("fr-FR").format(n);
  } catch {
    return String(n);
  }
}

function planTotalsFromLabel(label?: string): { total: number; name: string } {
  const l = (label || "").toLowerCase();
  if (l.includes("ult")) return { name: "Ultime", total: 2_500_000 };
  if (l.includes("pro")) return { name: "Pro", total: 1_000_000 };
  return { name: label || "Essentiel", total: 400_000 };
}

function plansUrl() {
  return process.env.NEXT_PUBLIC_SYSTEME_PLANS_URL || "https://legenerateurdigital.systeme.io/plans";
}

export default function QuotaMeter(props: {
  used: number;
  limit: number;
  remaining: number;
  loading?: boolean;
  planLabel?: string;
}) {
  const { used, limit, remaining, loading, planLabel } = props;

  // Backend is the source of truth, but we also display plan totals for UX.
  const plan = planTotalsFromLabel(planLabel);
  const totalMonthly = plan.total;
  const dailySoft = Math.round(totalMonthly / 30);

  const safeLimit = Number.isFinite(limit) ? limit : 0;
  const safeUsed = Number.isFinite(used) ? used : 0;
  const safeRemaining = Number.isFinite(remaining) ? remaining : Math.max(safeLimit - safeUsed, 0);

  const ratio = safeLimit > 0 ? Math.min(100, Math.max(0, (safeUsed / safeLimit) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-[#2a2416] bg-[#0b0f16]/70 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/70">IA-Quotas</div>
          <div className="mt-1 text-[13px] text-white/90">
            Plan :{" "}
            <span className="font-semibold text-yellow-300">
              {plan.name}
            </span>{" "}
            <span className="text-white/55">({formatInt(totalMonthly)}/mois)</span>
          </div>
          <div className="mt-0.5 text-[12px] text-white/65">Quota / jour : {formatInt(dailySoft)}</div>
          <div className="mt-0.5 text-[12px] text-white/65">
            Restant : {loading ? "…" : safeLimit > 0 ? formatInt(safeRemaining) : "—"}
          </div>
        </div>

        <a
          href={plansUrl()}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-xl border border-yellow-500/25 bg-black/40 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-black/55"
        >
          Voir les plans
        </a>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-white/55">
          <span>{loading ? "…" : safeLimit > 0 ? `${formatInt(safeUsed)} / ${formatInt(safeLimit)}` : "0 / 0"}</span>
          <span>{loading ? "…" : safeLimit > 0 ? `${Math.round(ratio)}%` : "—"}</span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/40">
          <div className="h-full rounded-full bg-yellow-500/80 transition-all" style={{ width: `${loading ? 0 : ratio}%` }} />
        </div>
      </div>
    </div>
  );
}
