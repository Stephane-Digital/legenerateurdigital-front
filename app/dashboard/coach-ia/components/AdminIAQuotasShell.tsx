"use client";

import React, { useEffect, useMemo, useState } from "react";

type Plan = "essentiel" | "pro" | "ultime";
type Feature = "coach" | "editeur" | "carrousel" | "audit" | "global";

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
  items: QuotaRow[];
  total: number;
  page: number;
  page_size: number;
  source: string;
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
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  // Allow empty (same-origin) in dev proxy setups.
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
    // Try to surface json detail, else raw text.
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
    // Some FastAPI errors can return HTML; show snippet.
    throw new Error(text.slice(0, 200));
  }
}

export default function AdminIAQuotasShell() {
  const [rows, setRows] = useState<QuotaRow[]>([]);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState<string>("unknown");

  const [adminKeyInput, setAdminKeyInput] = useState<string>("lgd_admin_1234");
  const [pendingQ, setPendingQ] = useState<string>("");

  const [query, setQuery] = useState<Query>({
    admin_key: "lgd_admin_1234",
    page: 1,
    page_size: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce email search input -> query.q
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((q) => ({ ...q, q: pendingQ.trim() || undefined, page: 1 }));
    }, 350);
    return () => clearTimeout(t);
  }, [pendingQ]);

  const canPrev = useMemo(() => query.page > 1, [query.page]);
  const canNext = useMemo(() => query.page * query.page_size < total, [query.page, query.page_size, total]);

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
      setRows(data.items || []);
      setTotal(data.total || 0);
      setSource(data.source || "unknown");
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
    // Auto refresh on query changes
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.plan, query.feature, query.page, query.page_size, query.q, query.admin_key]);

  async function setLimit(userId: number, feature: Feature, limit: number) {
    setLoading(true);
    setError(null);
    try {
      const url = `${apiBase()}/admin/ia/users/${userId}/quota/limit`;
      await fetchJSON(url, {
        method: "POST",
        body: JSON.stringify({ admin_key: query.admin_key, feature, limit_tokens: limit }),
      });
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
    try {
      const url = `${apiBase()}/admin/ia/users/${userId}/quota/reset`;
      await fetchJSON(url, {
        method: "POST",
        body: JSON.stringify({ admin_key: query.admin_key, feature }),
      });
      await refresh();
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function applyPlan(userId: number, plan: Plan, months: number) {
    setLoading(true);
    setError(null);
    try {
      const url = `${apiBase()}/admin/ia/users/${userId}/plan-override`;
      await fetchJSON(url, {
        method: "POST",
        body: JSON.stringify({ admin_key: query.admin_key, plan, months }),
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
  const [quickFeature, setQuickFeature] = useState<Feature>("coach");
  const [quickLimit, setQuickLimit] = useState<string>("200000");

  const quickUserIdInt = useMemo(() => {
    const n = Number(quickUserId);
    return Number.isFinite(n) ? n : NaN;
  }, [quickUserId]);

  return (
    <div className="w-full">
      <div className="text-sm text-zinc-400 mb-4">Recherche par email + filtres plan/feature (debounce 350ms).</div>

      <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-6 shadow-[0_0_0_1px_rgba(255,215,0,0.08)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="flex gap-3 flex-1">
              <select
                className="h-11 w-44 rounded-xl bg-black/40 border border-yellow-500/20 px-3 text-sm"
                value={query.feature || ""}
                onChange={(e) => {
                  const v = e.target.value as Feature;
                  setQuery((q) => ({ ...q, feature: v || undefined, page: 1 }));
                }}
              >
                <option value="">Toutes</option>
                <option value="coach">Coach</option>
                <option value="editeur">Éditeur</option>
                <option value="carrousel">Carrousel</option>
                <option value="audit">Audit</option>
                <option value="global">Global</option>
              </select>

              <select
                className="h-11 w-44 rounded-xl bg-black/40 border border-yellow-500/20 px-3 text-sm"
                value={query.plan || ""}
                onChange={(e) => {
                  const v = e.target.value as Plan;
                  setQuery((q) => ({ ...q, plan: v || undefined, page: 1 }));
                }}
              >
                <option value="">Tous</option>
                <option value="essentiel">Essentiel</option>
                <option value="pro">Pro</option>
                <option value="ultime">Ultime</option>
              </select>

              <input
                className="h-11 flex-1 rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-sm"
                placeholder="Rechercher un email..."
                value={pendingQ}
                onChange={(e) => setPendingQ(e.target.value)}
              />
            </div>

            <div className="flex gap-3 items-center">
              <input
                className="h-11 w-64 rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-sm"
                placeholder="admin_key"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
              />
              <button
                className="h-11 px-5 rounded-xl bg-yellow-500/90 hover:bg-yellow-500 text-black font-medium"
                onClick={() => setQuery((q) => ({ ...q, admin_key: adminKeyInput.trim() || undefined, page: 1 }))}
                disabled={loading}
              >
                Rafraîchir
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="text-sm text-zinc-300">
              <span className="font-semibold">Total :</span> {total} <span className="text-zinc-500">•</span> <span className="font-semibold">Source :</span> {source}
            </div>

            <div className="flex gap-3 items-center justify-end">
              <div className="text-sm text-zinc-400">Lignes</div>
              <select
                className="h-10 w-24 rounded-xl bg-black/40 border border-yellow-500/20 px-3 text-sm"
                value={query.page_size}
                onChange={(e) => setQuery((q) => ({ ...q, page_size: Number(e.target.value) || 10, page: 1 }))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <button
                className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                disabled={!canPrev || loading}
                onClick={() => setQuery((q) => ({ ...q, page: Math.max(1, q.page - 1) }))}
              >
                Précédent
              </button>

              <div className="text-sm text-zinc-400">Page {query.page}</div>

              <button
                className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                disabled={!canNext || loading}
                onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
              >
                Suivant
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-yellow-500/10 bg-black/30">
            <table className="w-full text-[12px]">
              <thead className="bg-black/30">
                <tr className="text-left text-zinc-400">
                  <th className="px-2 py-1.5">User</th>
                  <th className="px-2 py-1.5">Plan</th>
                  <th className="px-2 py-1.5">Feature</th>
                  <th className="px-2 py-1.5">Used</th>
                  <th className="px-2 py-1.5">Limit</th>
                  <th className="px-2 py-1.5">Remaining</th>
                  <th className="px-2 py-1.5">%</th>
                  <th className="px-2 py-1.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-2 py-3 text-zinc-500" colSpan={8}>
                      {loading ? "Chargement..." : "Aucun résultat."}
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={`${r.user_id}:${r.feature}`} className="border-t border-yellow-500/10">
                      <td className="px-2 py-1.5 text-zinc-200">{r.email || `user#${r.user_id}`}</td>
                      <td className="px-2 py-1.5 text-zinc-300">{r.plan}</td>
                      <td className="px-2 py-1.5 text-zinc-300">{r.feature}</td>
                      <td className="px-2 py-1.5 text-zinc-300">{r.used}</td>
                      <td className="px-2 py-1.5 text-zinc-300">{r.limit}</td>
                      <td className="px-2 py-1.5 text-zinc-300">{r.remaining}</td>
                      <td className="px-2 py-1.5 text-zinc-300">{r.pct}%</td>
                      <td className="px-2 py-1.5">
                        <div className="flex gap-1.5">
                          <button
                            className="h-7 px-2.5 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 text-[10px]"
                            onClick={() => resetUser(r.user_id, r.feature)}
                            disabled={loading}
                          >
                            Reset
                          </button>
                          <button
                            className="h-7 px-2.5 rounded-lg bg-yellow-500/90 hover:bg-yellow-500 text-black text-[10px] font-medium"
                            onClick={() => {
                              const n = window.prompt("Nouveau limit (tokens)", String(r.limit));
                              const v = n ? Number(n) : NaN;
                              if (Number.isFinite(v)) setLimit(r.user_id, r.feature, v);
                            }}
                            disabled={loading}
                          >
                            Set limit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-sm"
                  value={quickUserId}
                  onChange={(e) => setQuickUserId(e.target.value)}
                  placeholder="ex: 1"
                />
              </div>

              <div className="w-full lg:w-56">
                <label className="text-xs text-zinc-500">Feature</label>
                <select
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-3 text-sm"
                  value={quickFeature}
                  onChange={(e) => setQuickFeature(e.target.value as Feature)}
                >
                  <option value="coach">Coach</option>
                  <option value="editeur">Éditeur</option>
                  <option value="carrousel">Carrousel</option>
                  <option value="audit">Audit</option>
                  <option value="global">Global</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs text-zinc-500">Limite tokens</label>
                <input
                  className="mt-1 h-11 w-full rounded-xl bg-black/40 border border-yellow-500/20 px-4 text-sm"
                  value={quickLimit}
                  onChange={(e) => setQuickLimit(e.target.value)}
                  placeholder="200000"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  className="h-11 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                  disabled={loading || !Number.isFinite(quickUserIdInt)}
                  onClick={() => resetUser(quickUserIdInt, quickFeature)}
                >
                  Reset
                </button>
                <button
                  className="h-11 px-4 rounded-xl bg-yellow-500/90 hover:bg-yellow-500 text-black text-sm font-medium"
                  disabled={loading || !Number.isFinite(quickUserIdInt)}
                  onClick={() => setLimit(quickUserIdInt, quickFeature, Number(quickLimit) || 0)}
                >
                  Set limit
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 justify-end">
              <button
                className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                disabled={loading || !Number.isFinite(quickUserIdInt)}
                onClick={() => applyPlan(quickUserIdInt, "pro", 3)}
              >
                Pro 3 mois
              </button>
              <button
                className="h-10 px-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 text-sm"
                disabled={loading || !Number.isFinite(quickUserIdInt)}
                onClick={() => applyPlan(quickUserIdInt, "ultime", 3)}
              >
                Ultime 3 mois
              </button>
            </div>

            <div className="mt-3 text-xs text-zinc-600">
              Note : si la source de données quotas n&apos;est pas encore branchée côté backend, l&apos;API renverra une erreur explicite.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
