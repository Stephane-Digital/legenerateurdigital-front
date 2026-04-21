"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCog, FaEnvelope } from "react-icons/fa";

type SubscriptionResponse = {
  email?: string | null;
  plan?: string | null;
  quota_remaining?: number | null;
  quota_limit?: number | null;
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

function normalizePlan(plan?: string | null) {
  const raw = String(plan || "").trim().toLowerCase();
  if (raw === "ultime") return "ultime";
  if (raw === "pro") return "pro";
  if (raw === "essentiel") return "essentiel";
  if (raw === "free") return "essentiel";
  return "essentiel";
}

function formatPlanLabel(plan?: string | null) {
  const value = normalizePlan(plan);
  if (value === "ultime") return "ULTIME";
  if (value === "pro") return "PRO";
  return "ESSENTIEL";
}

function formatPlanName(plan?: string | null) {
  const value = normalizePlan(plan);
  if (value === "ultime") return "Plan Ultime LGD";
  if (value === "pro") return "Plan Pro LGD";
  return "Accès de base LGD";
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("fr-FR").format(Number(value || 0));
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<SubscriptionResponse | null>(null);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);
  const supportEmail = "contact@legenerateurdigital.com";

  useEffect(() => {
    let active = true;

    async function loadSubscription() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${apiBaseUrl}/auth/subscription`, {
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
          throw new Error(
            data?.detail || "Impossible de charger le statut abonnement."
          );
        }

        if (!active) return;

        setSub({
          email: data?.email ?? "",
          plan: data?.plan ?? "essentiel",
          quota_remaining: Number(data?.quota_remaining ?? 0),
          quota_limit: Number(data?.quota_limit ?? 0),
        });
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || "Erreur de chargement.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSubscription();

    return () => {
      active = false;
    };
  }, [apiBaseUrl]);

  const currentPlan = formatPlanLabel(sub?.plan);
  const currentPlanName = formatPlanName(sub?.plan);
  const quotaRemaining = Number(sub?.quota_remaining ?? 0);
  const quotaLimit = Number(sub?.quota_limit ?? 0);

  const mailSubject = encodeURIComponent("Demande de résiliation abonnement LGD");
  const mailBody = encodeURIComponent(
    `Bonjour,\n\nJe souhaite résilier mon abonnement LGD.\n\nEmail du compte LGD : ${sub?.email || "[à compléter]"}\nPlan actuel : ${currentPlan}\nDate de la demande : ${new Date().toLocaleDateString("fr-FR")}\n\nMerci de prendre en compte ma demande.\n\nCordialement`
  );
  const mailtoUrl = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopySuccess(true);
      window.setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-14 pt-8 md:px-8">
        <div className="mx-auto mb-8 flex w-full max-w-5xl flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-3">
            <FaCog className="text-3xl text-[#cfc3d9]" />
            <h1 className="text-3xl font-black tracking-tight text-[#f5b700] md:text-4xl">
              Paramètres du compte
            </h1>
          </div>

          <p className="max-w-4xl text-sm text-white/80 md:text-base">
            Gère ton abonnement LGD, vérifie ton plan actif et consulte la procédure officielle de résiliation.
          </p>
        </div>

        {error ? (
          <div className="mx-auto mb-6 w-full max-w-4xl rounded-3xl border border-red-800 bg-red-950/40 px-5 py-4 text-center text-sm text-red-100 shadow-[0_0_24px_rgba(220,38,38,0.10)]">
            {error}
          </div>
        ) : null}

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-[#1f1607] bg-[#050505] p-7 shadow-[0_0_32px_rgba(245,183,0,0.08)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-[#d6a300]">
                  Abonnement LGD
                </p>
                <h2 className="text-2xl font-extrabold text-[#f5b700] md:text-[2rem]">
                  Statut du compte
                </h2>
              </div>

              <div className="rounded-full border border-[#6d5500] bg-[#231a00] px-4 py-2 text-xs font-bold text-[#ffe082]">
                {loading ? "..." : currentPlan}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/20 bg-white/[0.03] p-5">
                <p className="mb-2 text-sm text-white/55">Compte</p>
                <p className="break-all text-xl font-semibold text-white md:text-[1.75rem]">
                  {loading ? "Chargement..." : sub?.email || "—"}
                </p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/[0.03] p-5">
                <p className="mb-2 text-sm text-white/55">Plan actif</p>
                <p className="text-xl font-semibold text-white md:text-[1.75rem]">
                  {loading ? "Chargement..." : currentPlanName}
                </p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/[0.03] p-5">
                <p className="mb-2 text-sm text-white/55">Quota IA restant</p>
                <p className="text-xl font-semibold text-white md:text-[1.75rem]">
                  {loading ? "Chargement..." : `${formatNumber(quotaRemaining)} / ${formatNumber(quotaLimit)}`}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#1f1607] bg-[#050505] p-7 shadow-[0_0_32px_rgba(245,183,0,0.08)]">
            <div className="mb-6">
              <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-[#d6a300]">
                Gestion abonnement
              </p>
              <h2 className="text-2xl font-extrabold text-[#f5b700] md:text-[2rem]">
                Résiliation par email
              </h2>
            </div>

            <p className="mb-5 text-base leading-7 text-white/85">
              Pour résilier ton abonnement LGD, envoie simplement ta demande à notre équipe depuis l’adresse email liée à ton compte.
            </p>

            <div className="mb-5 rounded-3xl border border-[#6d5500] bg-[#231a00]/40 p-5">
              <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-[#d6a300]">
                Adresse de contact
              </p>
              <p className="break-all text-xl font-bold text-white md:text-[1.6rem]">
                {supportEmail}
              </p>
            </div>

            <div className="mb-5 rounded-3xl border border-white/20 bg-white/[0.03] p-5 text-sm leading-7 text-white/80 md:text-base">
              <p>
                Envoie ta demande de résiliation à <span className="font-semibold text-[#f5bf21]">{supportEmail}</span> depuis l’adresse email de ton compte LGD pour faciliter la vérification.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={mailtoUrl}
                className="flex w-full items-center justify-center gap-3 rounded-3xl bg-[#f5bf21] px-6 py-5 text-center text-xl font-extrabold text-black transition hover:brightness-105 md:text-2xl"
              >
                <FaEnvelope className="text-lg" />
                Envoyer la demande de résiliation
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full rounded-3xl border border-white/25 bg-white/[0.03] px-6 py-5 text-center text-lg font-bold text-white transition hover:bg-white/[0.06] md:text-xl"
              >
                {copySuccess ? "Adresse email copiée" : "Copier l’adresse email de contact"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
