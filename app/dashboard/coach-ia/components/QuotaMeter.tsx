"use client";

import React from "react";

function formatInt(n: number) {
  try {
    return new Intl.NumberFormat("fr-FR").format(n);
  } catch {
    return String(n);
  }
}

function planFromLimit(limit?: number): string {
  const safeLimit = Number(limit || 0);
  if (safeLimit === 70_000) return "AZUR";
  if (safeLimit === 2_500_000) return "ULTIME";
  if (safeLimit === 1_000_000) return "PRO";
  if (safeLimit === 400_000) return "ESSENTIEL";
  return "ESSENTIEL";
}

function normalizePlanLabel(label?: string, limit?: number): string {
  const safeLimit = Number(limit || 0);
  const l = String(label || "").toLowerCase().trim();

  // ✅ SOURCE DE VÉRITÉ COACH = limit d'abord
  if (safeLimit > 0) {
    return planFromLimit(safeLimit);
  }

  if (l.includes("azur") || l.includes("trial") || l.includes("starter") || l.includes("découverte") || l.includes("decouverte")) {
    return "AZUR";
  }
  if (l.includes("ult")) return "ULTIME";
  if (l.includes("pro")) return "PRO";
  if (l.includes("ess")) return "ESSENTIEL";

  return "ESSENTIEL";
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
  dailyLimit?: number;
}) {
  const { used, limit, remaining, loading, planLabel, dailyLimit } = props;

  const safeLimit = Number.isFinite(limit) ? limit : 0;
  const safeUsed = Number.isFinite(used) ? used : 0;
  const safeRemaining = Number.isFinite(remaining) ? remaining : Math.max(safeLimit - safeUsed, 0);

  const displayPlan = normalizePlanLabel(planLabel, safeLimit);
  const totalMonthly = safeLimit > 0 ? safeLimit : 0;
  const resolvedDaily =
    Number.isFinite(dailyLimit as number) && Number(dailyLimit || 0) > 0
      ? Number(dailyLimit)
      : displayPlan === "AZUR"
        ? 10_000
        : totalMonthly > 0
          ? Math.round(totalMonthly / 30)
          : 0;

  const ratio = safeLimit > 0 ? Math.min(100, Math.max(0, (safeUsed / safeLimit) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-[#2a2416] bg-[#0b0f16]/70 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/70">IA-Quotas</div>
          <div className="mt-1 text-[13px] text-white/90">
            Plan:{" "}
            <span className="font-semibold text-yellow-300">{displayPlan}</span>{" "}
            <span className="text-white/55">
              ({loading ? "…" : safeLimit > 0 ? `${formatInt(totalMonthly)}/mois` : "—"})
            </span>
          </div>
          <div className="mt-0.5 text-[12px] text-white/65">
            Quota / jour : {loading ? "…" : resolvedDaily > 0 ? formatInt(resolvedDaily) : "—"}
          </div>
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
