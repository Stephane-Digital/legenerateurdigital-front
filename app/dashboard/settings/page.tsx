"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCog, FaEnvelope, FaRegCopy } from "react-icons/fa";

type MeResponse = {
  email?: string | null;
  plan?: string | null;
};

type QuotaResponse = {
  plan?: string | null;
  limit_tokens?: number | null;
  used_tokens?: number | null;
  tokens_used?: number | null;
  remaining_tokens?: number | null;
};

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/+$/, "");
}

function getAuthHeaders() {
  if (typeof window === "undefined") return {};

  const token =
    window.localStorage.getItem("access_token") ||
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("jwt") ||
    window.localStorage.getItem("lgd_token") ||
    "";

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizePlan(raw?: string | null) {
  const plan = String(raw || "").trim().toLowerCase();
  if (plan === "ultime") return "ultime";
  if (plan === "pro") return "pro";
  if (plan === "essentiel" || plan === "free" || plan === "basic") return "essentiel";
  return "essentiel";
}

function formatPlanBadge(plan?: string | null) {
  const p = normalizePlan(plan);
  if (p === "ultime") return "ULTIME";
  if (p === "pro") return "PRO";
  return "ESSENTIEL";
}

function formatPlanName(plan?: string | null) {
  const p = normalizePlan(plan);
  if (p === "ultime") return "Plan Ultime LGD";
  if (p === "pro") return "Plan Pro LGD";
  return "Accès de base LGD";
}

function planQuotaLimit(plan?: string | null) {
  const p = normalizePlan(plan);
  if (p === "ultime") return 2_500_000;
  if (p === "pro") return 1_000_000;
  return 400_000;
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("fr-FR").format(Number(value || 0));
}

type UiState = {
  email: string;
  plan: string;
  quotaLimit: number;
  quotaRemaining: number;
};

async function fetchJson(url: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || `Erreur ${response.status}`);
  }

  return data;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [state, setState] = useState<UiState>({
    email: "",
    plan: "essentiel",
    quotaLimit: 400_000,
    quotaRemaining: 400_000,
  });

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const supportEmail = "contact@legenerateurdigital.com";

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [meResult, quotaResult] = await Promise.allSettled([
          fetchJson(`${apiBaseUrl}/auth/me`),
          fetchJson(`${apiBaseUrl}/ai-quota/global`),
        ]);

        const me =
          meResult.status === "fulfilled" ? (meResult.value as MeResponse) : {};
        const quota =
          quotaResult.status === "fulfilled" ? (quotaResult.value as QuotaResponse) : {};

        const planFromMe = normalizePlan(me?.plan);
        const planFromQuota = normalizePlan(quota?.plan);
        const finalPlan =
          planFromMe && planFromMe !== "essentiel"
            ? planFromMe
            : planFromQuota || planFromMe || "essentiel";

        const rawLimit = Number(quota?.limit_tokens ?? 0);
        const rawRemaining = Number(quota?.remaining_tokens ?? 0);
        const rawUsed = Number(quota?.used_tokens ?? quota?.tokens_used ?? 0);

        const finalLimit = rawLimit > 0 ? rawLimit : planQuotaLimit(finalPlan);
        const finalRemaining =
          rawRemaining > 0
            ? rawRemaining
            : rawLimit > 0
            ? Math.max(rawLimit - rawUsed, 0)
            : planQuotaLimit(finalPlan);

        if (!active) return;

        setState({
          email: String(me?.email || ""),
          plan: finalPlan,
          quotaLimit: finalLimit,
          quotaRemaining: finalRemaining,
        });

        if (meResult.status !== "fulfilled" && quotaResult.status !== "fulfilled") {
          setError("Impossible de charger les informations du compte.");
        }
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Impossible de charger les informations du compte.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [apiBaseUrl]);

  const mailSubject = encodeURIComponent("Demande de résiliation abonnement LGD");
  const mailBody = encodeURIComponent(
    `Bonjour,

Je souhaite résilier mon abonnement LGD.

Email du compte LGD : ${state.email || "[à compléter]"}
Plan actuel : ${formatPlanBadge(state.plan)}
Date de la demande : ${new Date().toLocaleDateString("fr-FR")}

Merci de prendre en compte ma demande.

Cordialement`
  );
  const mailtoUrl = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;

  function handleMailto() {
    try {
      window.location.href = mailtoUrl;
    } catch {
      setError("Impossible d’ouvrir votre messagerie. Copie l’adresse email ci-dessous.");
    }
  }

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 1800);
    } catch {
      setError("Impossible de copier l’adresse email.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-5 md:px-6">
        <div className="mx-auto mb-7 flex max-w-4xl flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-3">
            <FaCog className="text-2xl text-[#cfc3d9]" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[#f5b700] md:text-3xl">
              Paramètres du compte
            </h1>
          </div>

          <p className="max-w-3xl text-sm text-white/80 md:text-base">
            Gère ton abonnement LGD, vérifie ton plan actif et consulte la procédure officielle de résiliation.
          </p>
        </div>

        {error ? (
          <div className="mx-auto mb-5 w-full max-w-4xl rounded-2xl border border-red-800 bg-red-950/40 px-4 py-3 text-center text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="rounded-[24px] border border-[#1f1607] bg-[#050505] p-6 shadow-[0_0_24px_rgba(245,183,0,0.06)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-[0.32em] text-[#d6a300]">
                  Abonnement LGD
                </p>
                <h2 className="text-xl font-extrabold text-[#f5b700] md:text-2xl">
                  Statut du compte
                </h2>
              </div>

              <div className="rounded-full border border-[#6d5500] bg-[#231a00] px-3 py-1.5 text-xs font-bold text-[#ffe082]">
                {loading ? "..." : formatPlanBadge(state.plan)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[22px] border border-white/15 bg-white/[0.03] p-4">
                <p className="mb-1 text-sm text-white/55">Compte</p>
                <p className="break-all text-lg font-semibold text-white md:text-xl">
                  {loading ? "Chargement..." : state.email || "—"}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/15 bg-white/[0.03] p-4">
                <p className="mb-1 text-sm text-white/55">Plan actif</p>
                <p className="text-lg font-semibold text-white md:text-xl">
                  {loading ? "Chargement..." : formatPlanName(state.plan)}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/15 bg-white/[0.03] p-4">
                <p className="mb-1 text-sm text-white/55">Quota IA restant</p>
                <p className="text-lg font-semibold text-white md:text-xl">
                  {loading
                    ? "Chargement..."
                    : `${formatNumber(state.quotaRemaining)} / ${formatNumber(state.quotaLimit)}`}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#1f1607] bg-[#050505] p-6 shadow-[0_0_24px_rgba(245,183,0,0.06)]">
            <div className="mb-5">
              <p className="mb-1 text-[11px] uppercase tracking-[0.32em] text-[#d6a300]">
                Gestion abonnement
              </p>
              <h2 className="text-xl font-extrabold text-[#f5b700] md:text-2xl">
                Résiliation par email
              </h2>
            </div>

            <p className="mb-5 text-sm leading-7 text-white/82 md:text-base">
              Pour résilier ton abonnement LGD, envoie simplement ta demande à notre équipe depuis l’adresse email liée à ton compte.
            </p>

            <div className="mb-5 rounded-[22px] border border-[#6d5500] bg-[#231a00]/30 p-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-[#d6a300]">
                Adresse de contact
              </p>
              <p className="break-all text-lg font-bold text-white md:text-xl">
                {supportEmail}
              </p>
            </div>

            <div className="mb-5 rounded-[22px] border border-white/15 bg-white/[0.03] p-4 text-sm leading-7 text-white/82 md:text-base">
              Envoie ta demande de résiliation à <span className="font-semibold text-[#f5bf21]">{supportEmail}</span> depuis l’adresse email de ton compte LGD pour faciliter la vérification.
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleMailto}
                className="flex w-full items-center justify-center gap-3 rounded-[22px] bg-[#f5bf21] px-5 py-4 text-center text-lg font-extrabold text-black transition hover:brightness-105"
              >
                <FaEnvelope className="text-base" />
                Envoyer la demande de résiliation
              </button>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/20 bg-white/[0.03] px-5 py-4 text-center text-base font-bold text-white transition hover:bg-white/[0.06]"
              >
                <FaRegCopy className="text-sm" />
                {copySuccess ? "Adresse email copiée" : "Copier l’adresse email de contact"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
