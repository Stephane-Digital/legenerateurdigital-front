"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Plan = "azur" | "essentiel" | "pro" | "ultime";
type Feature = "coach" | "posts" | "carrousel" | "audit" | "global";

type QuotaRow = {
  user_id: number;
  email: string;
  plan: Plan;
  feature: Feature;
  used: number;
  limit: number;
  remaining: number;
  pct: number;
};

type ListResponse = {
  items: any[];
  total?: number;
  page?: number;
  page_size?: number;
  source?: string;
};

type Query = {
  admin_key?: string;
  q?: string;
  plan?: Plan;
  feature?: Feature;
  page: number;
  page_size: number;
};

function apiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!raw || raw === "undefined" || raw === "null") return "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "");
}

function qs(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text);
      throw new Error(j?.detail || JSON.stringify(j));
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text.slice(0, 200) || "Invalid JSON");
  }
}

function toInt(n: any): number {
  const v = typeof n === "string" ? Number(n) : Number(n);
  return Number.isFinite(v) ? Math.trunc(v) : 0;
}

function planDefaultDailyLimit(plan: Plan): number {
  // Rappel LGD (limite / jour)
  if (plan === "azur") return 70_000;
  if (plan === "pro") return 1_000_000;
  if (plan === "ultime") return 2_500_000;
  return 400_000; // essentiel
}

function fmtInt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("fr-FR").format(Math.trunc(n));
}

function coalesce(...vals: any[]): any {
  for (const v of vals) if (v !== undefined && v !== null) return v;
  return undefined;
}

function inferPlanFromLimit(limit: number): Plan {
  if (limit === 70_000) return "azur";
  if (limit === 1_000_000) return "pro";
  if (limit === 2_500_000) return "ultime";
  return "essentiel";
}

function normalizePlanValue(rawPlan: any, limit: number): Plan {
  const planRaw = String(rawPlan || "").toLowerCase().trim();
  if (planRaw === "azur" || planRaw === "trial" || planRaw === "starter" || planRaw === "decouverte" || planRaw === "découverte") return "azur";
  if (planRaw === "pro") return "pro";
  if (planRaw === "ultime") return "ultime";
  if (planRaw === "essentiel") {
    return limit === 70_000 ? "azur" : "essentiel";
  }
  return inferPlanFromLimit(limit);
}

export default function AdminIAQuotasShell() {
  const [rows, setRows] = useState<QuotaRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [source, setSource] = useState<string>("unknown");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<Query>({
    admin_key: "lgd_admin_1234",
    q: "",
    plan: undefined,
    feature: undefined,
    page: 1,
    page_size: 10,
  });

  // ✅ Local "truth" for instant UI updates even if list endpoint does not reflect changes immediately.
  // Key: `${user_id}` for plan override, `${user_id}:${feature}` for limit override.
  const planOverridesRef = useRef<Record<number, Plan>>({});
  const limitOverridesRef = useRef<Record<string, number>>({});

  const pageCount = useMemo(() => Math.max(1, Math.ceil((total || 0) / (query.page_size || 10))), [total, query.page_size]);

  function applyOverrides(base: QuotaRow[]): QuotaRow[] {
    const planOv = planOverridesRef.current;
    const limitOv = limitOverridesRef.current;

    return base.map((r) => {
      const p = planOv[r.user_id] || r.plan;
      const key = `${r.user_id}:${r.feature}`;

      const ovLimit = limitOv[key];
      const planned = planDefaultDailyLimit(p);

      const effectiveLimit = Number.isFinite(ovLimit) ? ovLimit : (r.limit > 0 ? r.limit : planned);
      const used = r.used;
      const remaining = Math.max(effectiveLimit - used, 0);
      const pct = effectiveLimit > 0 ? Math.min(999, Math.max(0, Math.round((used / effectiveLimit) * 100))) : 0;

      return {
        ...r,
        plan: p,
        limit: effectiveLimit,
        remaining,
        pct,
      };
    });
  }

  function normalizeQuotaItem(raw: any): QuotaRow {
    const user_id = toInt(coalesce(raw.user_id, raw.id, raw.userId));
    const email = String(coalesce(raw.email, raw.user_email, raw.userEmail, ""));

    const limitHintRaw = coalesce(
      raw.limit_tokens,
      raw.limitTokens,
      raw.daily_limit_tokens,
      raw.dailyLimitTokens,
      raw.limit_per_day,
      raw.limitPerDay,
      raw.limit,
      raw.quota_limit,
      raw.quotaLimit,
      raw.credits,
      raw.tokens_limit
    );
    const limitHint = limitHintRaw === null || limitHintRaw === undefined ? 0 : toInt(limitHintRaw);

    const plan = normalizePlanValue(
      coalesce(raw.display_plan, raw.plan, raw.user_plan, raw.plan_name),
      limitHint
    );

    const featureRaw = String(coalesce(raw.feature, raw.module, raw.scope, "global")).toLowerCase();
    const feature: Feature =
      featureRaw === "coach" || featureRaw === "posts" || featureRaw === "carrousel" || featureRaw === "audit" || featureRaw === "global"
        ? (featureRaw as Feature)
        : "global";

    // Accept multiple backend naming conventions
    const limitRaw = coalesce(
      raw.limit_tokens,
      raw.limitTokens,
      raw.daily_limit_tokens,
      raw.dailyLimitTokens,
      raw.limit_per_day,
      raw.limitPerDay,
      raw.limit,
      raw.quota_limit,
      raw.quotaLimit
    );

    const usedRaw = coalesce(
      raw.tokens_used,
      raw.tokensUsed,
      raw.used_tokens,
      raw.usedTokens,
      raw.tokens_used_today,
      raw.tokensUsedToday,
      raw.used,
      raw.quota_used,
      raw.quotaUsed
    );

    const limit = limitRaw === null || limitRaw === undefined ? 0 : toInt(limitRaw);
    const used = usedRaw === null || usedRaw === undefined ? 0 : toInt(usedRaw);

    const planned = planDefaultDailyLimit(plan);
    const effectiveLimit = limit > 0 ? limit : planned;

    const remaining = Math.max(effectiveLimit - used, 0);
    const pct = effectiveLimit > 0 ? Math.min(999, Math.max(0, Math.round((used / effectiveLimit) * 100))) : 0;

    return { user_id, email, plan, feature, used, limit: effectiveLimit, remaining, pct };
  }

  async function refresh(next?: Partial<Query>) {
    const q: Query = { ...query, ...(next || {}) };
    setQuery(q);

    setLoading(true);
    setError(null);
    try {
      const url = `${apiBase()}/admin/ia/quotas${qs({
        admin_key: q.admin_key,
        q: q.q,
        plan: q.plan,
        feature: q.feature,
        page: q.page,
        page_size: q.page_size,
      })}`;

      const data = await fetchJSON<ListResponse>(url);
      const baseRows = (data.items || []).map(normalizeQuotaItem);
      const finalRows = applyOverrides(baseRows);

      setRows(finalRows);
      setTotal(toInt((data as any).total));
      setSource(String((data as any).source || "db"));
    } catch (e: any) {
      setRows([]);
      setTotal(0);
      setSource("unknown");
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.plan, query.feature, query.page, query.page_size, query.q, query.admin_key]);

  function patchRow(userId: number, feature: Feature, patch: Partial<QuotaRow>) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.user_id !== userId) return r;
        if (r.feature !== feature) return r;
        const merged = { ...r, ...patch } as QuotaRow;
        // recompute derived
        const remaining = Math.max(merged.limit - merged.used, 0);
        const pct = merged.limit > 0 ? Math.min(999, Math.max(0, Math.round((merged.used / merged.limit) * 100))) : 0;
        return { ...merged, remaining, pct };
      })
    );
  }

  function patchUserPlan(userId: number, plan: Plan) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.user_id !== userId) return r;
        const planned = planDefaultDailyLimit(plan);
        const key = `${userId}:${r.feature}`;
        const ovLimit = limitOverridesRef.current[key];
        const limit = Number.isFinite(ovLimit) ? ovLimit : planned;
        const remaining = Math.max(limit - r.used, 0);
        const pct = limit > 0 ? Math.min(999, Math.max(0, Math.round((r.used / limit) * 100))) : 0;
        return { ...r, plan, limit, remaining, pct };
      })
    );
  }

  async function setLimit(userId: number, feature: Feature, limit: number) {
    setLoading(true);
    setError(null);

    // ✅ instant UI (even if list doesn't reflect)
    limitOverridesRef.current[`${userId}:${feature}`] = limit;
    patchRow(userId, feature, { limit });

    try {
      const url = `${apiBase()}/admin/ia/users/${userId}/quota/limit`;
      await fetchJSON(url + qs({ admin_key: query.admin_key, feature, limit_tokens: limit }), {
        method: "POST",
        body: JSON.stringify({ feature, limit_tokens: limit }),
      });
      // Re-fetch to keep consistent, but keep local overrides applied.
      await refresh();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function resetUser(userId: number, feature: Feature) {
    setLoading(true);
    setError(null);

    // instant UI
    patchRow(userId, feature, { used: 0 });

    try {
      const url = `${apiBase()}/admin/ia/users/${userId}/quota/reset`;
      await fetchJSON(url + qs({ admin_key: query.admin_key, feature }), {
        method: "POST",
        body: JSON.stringify({ feature }),
      });
      await refresh();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function applyPlan(userId: number, feature: Feature, plan: Plan, months: number) {
    setLoading(true);
    setError(null);

    // instant UI
    planOverridesRef.current[userId] = plan;
    patchUserPlan(userId, plan);

    try {
      const url = `${apiBase()}/admin/ia/users/${userId}/plan-override`;
      await fetchJSON(url + qs({ admin_key: query.admin_key, plan, months }), { method: "POST" });
      // Ensure backend quota limit follows the chosen plan (prevents UI reverting after refresh)
      const limitJour = planDefaultDailyLimit(plan);
      limitOverridesRef.current[`${userId}:${feature}`] = limitJour;
      patchRow(userId, feature, { limit: limitJour });

      const url2 = `${apiBase()}/admin/ia/users/${userId}/quota/limit`;
      await fetchJSON(url2 + qs({ admin_key: query.admin_key, feature, limit_tokens: limitJour }), {
        method: "POST",
        body: JSON.stringify({ feature, limit_tokens: limitJour }),
      });

      await refresh();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function clearPlan(userId: number, feature: Feature) {
    setLoading(true);
    setError(null);

    // instant UI: back to essentiel
    delete planOverridesRef.current[userId];
    patchUserPlan(userId, "essentiel");

    try {
      const url = `${apiBase()}/admin/ia/users/${userId}/plan-clear`;
      await fetchJSON(url + qs({ admin_key: query.admin_key }), { method: "POST" });
      // Ensure backend quota limit is reset to Essentiel daily limit
      const limitJour = planDefaultDailyLimit("essentiel");
      limitOverridesRef.current[`${userId}:${feature}`] = limitJour;
      patchRow(userId, feature, { limit: limitJour });

      const url2 = `${apiBase()}/admin/ia/users/${userId}/quota/limit`;
      await fetchJSON(url2 + qs({ admin_key: query.admin_key, feature, limit_tokens: limitJour }), {
        method: "POST",
        body: JSON.stringify({ feature, limit_tokens: limitJour }),
      });

      await refresh();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  // Quick tests panel state
  const [quickUserId, setQuickUserId] = useState<string>("");
  const [quickLimit, setQuickLimit] = useState<string>("200000");
  const [quickFeature, setQuickFeature] = useState<Feature>("coach");
  const quickUserIdInt = useMemo(() => Number(quickUserId), [quickUserId]);

  return (
    <div className="min-h-[calc(100vh-120px)] px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold text-zinc-100">Admin — IA Quotas</div>
              <div className="text-sm text-zinc-500 mt-1">
                Source: <span className="text-zinc-300">{source}</span>
                <span className="mx-2 text-zinc-700">•</span>
                Total: <span className="text-zinc-300">{total}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm text-zinc-200"
                disabled={loading}
                onClick={() => refresh()}
              >
                Rafraîchir
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/10 bg-black/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-zinc-500">Recherche (email / user_id)</label>
                <input
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-yellow-500/40"
                  placeholder="ex: stephane@..."
                  value={query.q || ""}
                  onChange={(e) => refresh({ q: e.target.value, page: 1 })}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500">Plan</label>
                <select
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-zinc-200 outline-none focus:border-yellow-500/40"
                  value={query.plan || ""}
                  onChange={(e) => refresh({ plan: (e.target.value || undefined) as any, page: 1 })}
                >
                  <option value="">Tous</option>
                  <option value="azur">azur</option>
                  <option value="essentiel">essentiel</option>
                  <option value="pro">pro</option>
                  <option value="ultime">ultime</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Feature</label>
                <select
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-zinc-200 outline-none focus:border-yellow-500/40"
                  value={query.feature || ""}
                  onChange={(e) => refresh({ feature: (e.target.value || undefined) as any, page: 1 })}
                >
                  <option value="">Toutes</option>
                  <option value="global">global</option>
                  <option value="coach">coach</option>
                  <option value="posts">posts</option>
                  <option value="carrousel">carrousel</option>
                  <option value="audit">audit</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Page size</label>
                <select
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-zinc-200 outline-none focus:border-yellow-500/40"
                  value={String(query.page_size)}
                  onChange={(e) => refresh({ page_size: Number(e.target.value), page: 1 })}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-zinc-500">
                {loading ? "Chargement..." : error ? <span className="text-red-400">{error}</span> : "OK"}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="h-10 px-3 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                  disabled={loading || query.page <= 1}
                  onClick={() => refresh({ page: Math.max(1, query.page - 1) })}
                >
                  ←
                </button>
                <div className="text-sm text-zinc-500">
                  Page <span className="text-zinc-200">{query.page}</span> / <span className="text-zinc-200">{pageCount}</span>
                </div>
                <button
                  className="h-10 px-3 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                  disabled={loading || query.page >= pageCount}
                  onClick={() => refresh({ page: Math.min(pageCount, query.page + 1) })}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/10 bg-black/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[960px]">
                <thead className="bg-black/30">
                  <tr className="text-left text-zinc-400">
                    <th className="px-4 py-3 min-w-[260px]">User</th>
                    <th className="px-4 py-3 min-w-[110px]">Plan</th>
                    <th className="px-4 py-3 min-w-[110px]">Feature</th>
                    <th className="px-4 py-3 min-w-[120px] text-right">Used</th>
                    <th className="px-4 py-3 min-w-[140px] text-right">Limit / jour</th>
                    <th className="px-4 py-3 min-w-[140px] text-right">Remaining</th>
                    <th className="px-4 py-3 min-w-[80px] text-right">%</th>
                    <th className="px-4 py-3 min-w-[360px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_*]:tabular-nums">
                  {rows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-5 text-zinc-500" colSpan={8}>
                        {loading ? "Chargement..." : "Aucun résultat."}
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={`${r.user_id}:${r.feature}`} className="border-t border-yellow-500/10">
                        <td className="px-4 py-3 text-zinc-200 truncate max-w-[260px]">{r.email || `user#${r.user_id}`}</td>
                        <td className="px-4 py-3 text-zinc-300">{r.plan}</td>
                        <td className="px-4 py-3 text-zinc-300">{r.feature}</td>
                        <td className="px-4 py-3 text-zinc-300 text-right">{fmtInt(r.used)}</td>
                        <td className="px-4 py-3 text-zinc-300 text-right">{fmtInt(r.limit)}</td>
                        <td className="px-4 py-3 text-zinc-300 text-right">{fmtInt(r.remaining)}</td>
                        <td className="px-4 py-3 text-zinc-300 text-right">{r.pct}%</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              className="h-9 px-3 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-xs"
                              onClick={() => clearPlan(r.user_id, r.feature)}
                              disabled={loading}
                            >
                              Reset (Essentiel)
                            </button>
                            <button
                              className="h-9 px-3 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-xs"
                              onClick={() => applyPlan(r.user_id, r.feature, "pro", 3)}
                              disabled={loading}
                            >
                              Pro 3 mois
                            </button>
                            <button
                              className="h-9 px-3 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-xs"
                              onClick={() => applyPlan(r.user_id, r.feature, "ultime", 3)}
                              disabled={loading}
                            >
                              Ultime 3 mois
                            </button>
                            <button
                              className="h-9 px-3 rounded-xl bg-yellow-500/90 hover:bg-yellow-500 text-black text-xs font-medium"
                              onClick={() => {
                                const n = window.prompt("Nouveau limit / jour (tokens)", String(r.limit));
                                const v = n ? Number(n) : NaN;
                                if (Number.isFinite(v)) setLimit(r.user_id, r.feature, v);
                              }}
                              disabled={loading}
                            >
                              Set limit
                            </button>

                            <button
                              className="h-9 px-3 rounded-xl border border-yellow-500/10 hover:border-yellow-500/25 text-xs text-zinc-200"
                              onClick={() => resetUser(r.user_id, r.feature)}
                              disabled={loading}
                              title="Reset quota (tokens_used → 0) sur la feature"
                            >
                              Reset quota
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-yellow-500/10 bg-black/20 p-4">
            <div className="font-semibold text-zinc-200 mb-1">Tests rapides</div>
            <div className="text-sm text-zinc-500 mb-4">
              Utile quand les filtres donnent 0 résultat : tu peux tester l&apos;override/limit sur un user_id précis.
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
              <div className="flex-1">
                <label className="text-xs text-zinc-500">user_id</label>
                <input
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-zinc-200 outline-none focus:border-yellow-500/40"
                  value={quickUserId}
                  onChange={(e) => setQuickUserId(e.target.value)}
                  placeholder="ex: 12"
                />
              </div>

              <div className="flex-1">
                <label className="text-xs text-zinc-500">feature</label>
                <select
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-zinc-200 outline-none focus:border-yellow-500/40"
                  value={quickFeature}
                  onChange={(e) => setQuickFeature(e.target.value as Feature)}
                >
                  <option value="global">global</option>
                  <option value="coach">coach</option>
                  <option value="posts">posts</option>
                  <option value="carrousel">carrousel</option>
                  <option value="audit">audit</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs text-zinc-500">limit_tokens / jour</label>
                <input
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-zinc-200 outline-none focus:border-yellow-500/40"
                  value={quickLimit}
                  onChange={(e) => setQuickLimit(e.target.value)}
                  placeholder="ex: 200000"
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="h-10 px-4 rounded-xl bg-yellow-500/90 hover:bg-yellow-500 text-black text-sm font-medium"
                  disabled={loading || !Number.isFinite(quickUserIdInt)}
                  onClick={() => {
                    const v = Number(quickLimit);
                    if (Number.isFinite(v)) setLimit(quickUserIdInt, quickFeature, v);
                  }}
                >
                  Set limit
                </button>
                <button
                  className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                  disabled={loading || !Number.isFinite(quickUserIdInt)}
                  onClick={() => resetUser(quickUserIdInt, quickFeature)}
                >
                  Reset quota
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                disabled={loading || !Number.isFinite(quickUserIdInt)}
                onClick={() => applyPlan(quickUserIdInt, quickFeature, "pro", 3)}
              >
                Pro 3 mois
              </button>
              <button
                className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                disabled={loading || !Number.isFinite(quickUserIdInt)}
                onClick={() => applyPlan(quickUserIdInt, quickFeature, "ultime", 3)}
              >
                Ultime 3 mois
              </button>
              <button
                className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                disabled={loading || !Number.isFinite(quickUserIdInt)}
                onClick={() => clearPlan(quickUserIdInt, quickFeature)}
              >
                Reset (Essentiel)
              </button>
            </div>

            <div className="mt-3 text-xs text-zinc-600">
              Rappel limites / jour : Essentiel 400 000 • Pro 1 000 000 • Ultime 2 500 000.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// === LGD FINAL DISPLAY FIX (SAFE / NO DUPLICATES) ===
const LGD_PLAN_LIMITS: Record<string, number> = {
  essentiel: 400_000,
  pro: 1_000_000,
  ultime: 2_500_000,
};

function lgdLimitJour(plan?: string, manualLimit?: number) {
  if (manualLimit && manualLimit > 0) return manualLimit;
  if (plan && LGD_PLAN_LIMITS[plan]) return LGD_PLAN_LIMITS[plan];
  return 400_000;
}
// === END LGD FINAL DISPLAY FIX ===
