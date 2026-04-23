'use client';

import * as React from 'react';
import type { AdminQuotaItem, AdminQuotaFeatureStrict, AdminQuotasMeta, AdminQuotaPlan } from '../lib/types';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function fmtInt(n: number) {
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('fr-FR').format(Math.trunc(n));
}

type PageSize = 10 | 25 | 50;

export default function QuotaTable(props: {
  rows: AdminQuotaItem[];
  loading: boolean;
  meta?: AdminQuotasMeta;
  page: number;
  pageCount: number;
  pageSize: PageSize;
  totalRows: number;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: PageSize) => void;
  onReset: (args: { user_id: number; feature: AdminQuotaFeatureStrict }) => Promise<void>;
  onSetLimit: (args: { user_id: number; feature: AdminQuotaFeatureStrict; tokens_limit: number }) => Promise<void>;
  onOverridePlan: (args: { user_id: number; override_plan: AdminQuotaPlan }) => Promise<void>;
  onClearOverride: (args: { user_id: number }) => Promise<void>;
}) {
  const {
    rows,
    loading,
    meta,
    page,
    pageCount,
    pageSize,
    totalRows,
    onPageChange,
    onPageSizeChange,
    onReset,
    onSetLimit,
    onOverridePlan,
    onClearOverride,
  } = props;

  async function handleSetLimit(row: AdminQuotaItem) {
    const current = row.tokens_limit ?? 0;
    const val = prompt('Nouvelle limite tokens :', String(current));
    if (val === null) return;
    const n = Number(String(val).replace(/[^\d]/g, ''));
    if (!Number.isFinite(n) || n <= 0) return;
    await onSetLimit({ user_id: row.user_id, feature: row.feature, tokens_limit: Math.trunc(n) });
  }

  return (
    <div className="mt-5 rounded-2xl border border-amber-300/15 bg-black/25 p-4 shadow-[0_0_0_1px_rgba(255,200,80,0.06)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-white/70">
          <span className="font-semibold text-white">Total :</span> {fmtInt(totalRows)}{' '}
          <span className="text-white/40">•</span> <span className="text-white/60">Source :</span>{' '}
          <span className="text-white/80">{meta?.source ?? 'unknown'}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-white/50">Lignes</div>
          <select
            className="h-9 rounded-xl border border-white/10 bg-black/40 px-2 text-sm text-white outline-none"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value) as any)}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <button
            type="button"
            className={cx(
              'h-9 w-9 rounded-xl border border-white/10 bg-black/40 text-white',
              'hover:border-amber-300/30 hover:bg-black/55 disabled:opacity-50'
            )}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            aria-label="Page précédente"
          >
            ‹
          </button>

          <div className="text-sm text-white/70">
            Page <span className="text-white">{page}</span> / <span className="text-white">{pageCount}</span>
          </div>

          <button
            type="button"
            className={cx(
              'h-9 w-9 rounded-xl border border-white/10 bg-black/40 text-white',
              'hover:border-amber-300/30 hover:bg-black/55 disabled:opacity-50'
            )}
            onClick={() => onPageChange(Math.min(pageCount, page + 1))}
            disabled={page >= pageCount || loading}
            aria-label="Page suivante"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-white/60">
            <tr className="border-b border-white/10">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Feature</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Limit</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">%</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="text-white/80">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-white/50" colSpan={8}>
                  Chargement…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-white/50" colSpan={8}>
                  Aucun résultat.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const used = Number(r.tokens_used ?? 0);
                const limit = Number(r.tokens_limit ?? 0);
                const remaining = Math.max(0, limit - used);
                const pct = limit > 0 ? Math.min(100, Math.max(0, Math.round((used / limit) * 100))) : 0;

                return (
                  <tr key={`${r.user_id}-${r.feature}`} className="border-b border-white/5">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{r.user_id}</div>
                      <div className="text-xs text-white/45">{r.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-xs text-amber-200">
                        {r.plan || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.feature}</td>
                    <td className="px-4 py-3">{fmtInt(used)}</td>
                    <td className="px-4 py-3">{fmtInt(limit)}</td>
                    <td className="px-4 py-3">{fmtInt(remaining)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-amber-300/60" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-10 text-xs text-white/60">{pct}%</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          className="h-9 rounded-xl border border-white/10 bg-black/35 px-3 text-xs text-white hover:bg-black/55"
                          onClick={() => onReset({ user_id: r.user_id, feature: r.feature })}
                        >
                          Reset
                        </button>
                        <button
                          className="h-9 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 text-xs text-amber-200 hover:bg-amber-300/15"
                          onClick={() => handleSetLimit(r)}
                        >
                          Limite
                        </button>
                        <button
                          className="h-9 rounded-xl border border-amber-300/20 bg-black/30 px-3 text-xs text-white/90 hover:border-amber-300/35"
                          onClick={() => onOverridePlan({ user_id: r.user_id, override_plan: 'pro' })}
                        >
                          Pro 3 mois
                        </button>
                        <button
                          className="h-9 rounded-xl border border-amber-300/20 bg-black/30 px-3 text-xs text-white/90 hover:border-amber-300/35"
                          onClick={() => onOverridePlan({ user_id: r.user_id, override_plan: 'ultime' })}
                        >
                          Ultime 3 mois
                        </button>
                        <button
                          className="h-9 rounded-xl border border-white/10 bg-black/25 px-3 text-xs text-white/70 hover:bg-black/45"
                          onClick={() => onClearOverride({ user_id: r.user_id })}
                        >
                          Annuler
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="text-sm font-semibold text-white">Tests rapides</div>
        <div className="mt-2 text-xs text-white/55">
          Utile quand les filtres donnent 0 résultat : tu peux tester l'override/limit sur un user_id précis.
        </div>

        <TestPanel onOverridePlan={onOverridePlan} onSetLimit={onSetLimit} onReset={onReset} />
      </div>
    </div>
  );
}

function TestPanel(props: {
  onReset: (args: { user_id: number; feature: AdminQuotaFeatureStrict }) => Promise<void>;
  onSetLimit: (args: { user_id: number; feature: AdminQuotaFeatureStrict; tokens_limit: number }) => Promise<void>;
  onOverridePlan: (args: { user_id: number; override_plan: AdminQuotaPlan }) => Promise<void>;
}) {
  const { onOverridePlan, onSetLimit, onReset } = props;
  const [userId, setUserId] = React.useState<string>('');
  const [limit, setLimit] = React.useState<string>('200000');
  const [feature, setFeature] = React.useState<AdminQuotaFeatureStrict>('global');

  const uid = Number(userId);
  const isOk = Number.isFinite(uid) && uid > 0;

  return (
    <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex-1">
        <div className="text-xs text-white/50">user_id</div>
        <input
          className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="ex: 10"
        />
      </div>

      <div className="w-full md:w-[200px]">
        <div className="text-xs text-white/50">Feature</div>
        <select
          className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-2 text-sm text-white outline-none"
          value={feature}
          onChange={(e) => setFeature(e.target.value as any)}
        >
          <option value="global">global</option>
          <option value="coach">coach</option>
          <option value="posts">posts</option>
          <option value="carrousel">carrousel</option>
          <option value="audit">audit</option>
        </select>
      </div>

      <div className="w-full md:w-[220px]">
        <div className="text-xs text-white/50">Limite tokens</div>
        <input
          className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white outline-none"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          placeholder="ex: 200000"
        />
      </div>

      <div className="flex flex-wrap gap-2 md:justify-end">
        <button
          className="h-10 rounded-xl border border-white/10 bg-black/35 px-4 text-xs text-white hover:bg-black/55 disabled:opacity-50"
          disabled={!isOk}
          onClick={() => onReset({ user_id: uid, feature })}
        >
          Reset
        </button>
        <button
          className="h-10 rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 text-xs text-amber-200 hover:bg-amber-300/15 disabled:opacity-50"
          disabled={!isOk}
          onClick={() => onSetLimit({ user_id: uid, feature, tokens_limit: Number(limit) || 0 })}
        >
          Set limit
        </button>
        <button
          className="h-10 rounded-xl border border-amber-300/20 bg-black/30 px-4 text-xs text-white/90 hover:border-amber-300/35 disabled:opacity-50"
          disabled={!isOk}
          onClick={() => onOverridePlan({ user_id: uid, override_plan: 'pro' })}
        >
          Pro 3 mois
        </button>
        <button
          className="h-10 rounded-xl border border-amber-300/20 bg-black/30 px-4 text-xs text-white/90 hover:border-amber-300/35 disabled:opacity-50"
          disabled={!isOk}
          onClick={() => onOverridePlan({ user_id: uid, override_plan: 'ultime' })}
        >
          Ultime 3 mois
        </button>
      </div>
    </div>
  );
}

