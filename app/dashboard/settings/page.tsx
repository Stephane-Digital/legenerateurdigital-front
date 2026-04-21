"use client";

import { useEffect, useMemo, useState } from "react";

type SubscriptionResponse = {
  id?: number;
  email?: string;
  plan?: string;
  is_active?: boolean;
  is_admin?: boolean;
};

type QuotaResponse = {
  plan?: string;
  tokens_used?: number;
  tokens_limit?: number;
  remaining?: number;
};

type CancelResponse = {
  ok?: boolean;
  email?: string;
  cancel_mode?: string;
  remote?: {
    transport?: string;
    status_code?: number;
    response?: unknown;
  };
  local?: {
    plan?: string;
    reset_usage?: boolean;
    source?: string;
  };
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

function planLabel(plan?: string) {
  const value = String(plan || "essentiel").toLowerCase();
  if (value.includes("ult")) return "ULTIME";
  if (value.includes("pro")) return "PRO";
  return "ESSENTIEL";
}

function planDescription(plan?: string) {
  const value = String(plan || "essentiel").toLowerCase();
  if (value.includes("ult")) return "Accès premium complet LGD";
  if (value.includes("pro")) return "Accès avancé LGD";
  return "Accès de base LGD";
}

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (typeof window !== "undefined" && !headers.Authorization) {
    const token =
      window.localStorage.getItem("access_token") ||
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("jwt") ||
      window.localStorage.getItem("lgd_token") ||
      "";

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (init?.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [quota, setQuota] = useState<QuotaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const plan = useMemo(() => subscription?.plan || quota?.plan || "essentiel", [subscription, quota]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [sub, quotaData] = await Promise.all([
        fetchJSON<SubscriptionResponse>("/auth/subscription"),
        fetchJSON<QuotaResponse>("/ai-quota/global"),
      ]);
      setSubscription(sub);
      setQuota(quotaData);
    } catch (err: any) {
      setError(String(err?.message || err || "Impossible de charger les paramètres du compte."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCancel(cancelMode: "end_of_period" | "immediate") {
    const confirmText =
      cancelMode === "immediate"
        ? "Confirmer le désabonnement immédiat ? L'accès payant et les quotas seront réinitialisés tout de suite."
        : "Confirmer le désabonnement en fin de période ?";

    if (!window.confirm(confirmText)) return;

    setCancelLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await fetchJSON<CancelResponse>("/auth/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({ cancel_mode: cancelMode }),
      });

      if (cancelMode === "immediate") {
        setSubscription((prev) => ({ ...(prev || {}), plan: "essentiel" }));
        setQuota((prev) => {
          const limit = prev?.tokens_limit || 400000;
          return {
            ...(prev || {}),
            plan: "essentiel",
            tokens_used: 0,
            remaining: limit,
          };
        });
      }

      setMessage(
        cancelMode === "immediate"
          ? "Désabonnement immédiat envoyé à Systeme.io et synchronisation LGD appliquée."
          : "Demande de désabonnement envoyée à Systeme.io. La synchronisation finale sera confirmée par webhook."
      );

      if (result?.local?.plan) {
        setSubscription((prev) => ({ ...(prev || {}), plan: result.local?.plan }));
      }

      await loadData();
    } catch (err: any) {
      setError(String(err?.message || err || "Impossible de traiter le désabonnement."));
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] px-6 py-[70px] text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8">
        <div className="w-full max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-[#ffb800] drop-shadow-[0_0_18px_rgba(255,184,0,0.2)]">
            ⚙️ Paramètres du compte
          </h1>
          <p className="text-gray-300">
            Gère ton abonnement LGD, vérifie ton plan actif et sécurise la synchronisation avec Systeme.io.
          </p>
        </div>

        {message ? (
          <div className="w-full max-w-3xl rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-center text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="w-full max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-center text-sm text-red-200 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}

        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-yellow-500/20 bg-[#111] p-8 shadow-2xl shadow-black/40">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-yellow-500/70">Abonnement LGD</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#ffcc4d]">Statut du compte</h2>
              </div>
              <span className="rounded-full border border-yellow-400/30 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-200">
                {planLabel(plan)}
              </span>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-gray-400">Compte</p>
                <p className="mt-1 text-base font-medium text-white">
                  {loading ? "Chargement..." : subscription?.email || "Email indisponible"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-gray-400">Plan actif</p>
                <p className="mt-1 text-base font-medium text-white">{loading ? "Chargement..." : planDescription(plan)}</p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-gray-400">Quota IA restant</p>
                <p className="mt-1 text-base font-medium text-white">
                  {loading ? "Chargement..." : `${Number(quota?.remaining || 0).toLocaleString("fr-FR")} / ${Number(quota?.tokens_limit || 0).toLocaleString("fr-FR")}`}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-yellow-500/20 bg-[#111] p-8 shadow-2xl shadow-black/40">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-500/70">Gestion abonnement</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#ffcc4d]">Désabonnement sécurisé</h2>
            <p className="mt-4 text-sm leading-6 text-gray-300">
              Le bouton déclenche l'action côté Systeme.io puis LGD synchronise ton plan et tes quotas. En mode fin de période,
              la mise à jour finale est confirmée par webhook. En mode immédiat, LGD rebascule aussitôt sur le plan Essentiel.
            </p>

            <div className="mt-6 space-y-4">
              <button
                type="button"
                onClick={() => handleCancel("end_of_period")}
                disabled={cancelLoading || loading}
                className="w-full rounded-2xl border border-yellow-400/30 bg-gradient-to-r from-[#ffb800] to-[#ffcc4d] px-5 py-4 font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,184,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelLoading ? "Traitement..." : "Se désabonner en fin de période"}
              </button>

              <button
                type="button"
                onClick={() => handleCancel("immediate")}
                disabled={cancelLoading || loading}
                className="w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-semibold text-red-200 transition hover:-translate-y-0.5 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelLoading ? "Traitement..." : "Se désabonner immédiatement"}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4 text-xs leading-6 text-gray-400">
              Sécurité LGD : l'utilisateur authentifié est vérifié côté backend avant toute demande d'annulation. Le plan et les quotas
              sont resynchronisés uniquement pour l'utilisateur connecté ou via le webhook Systeme.io signé.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
