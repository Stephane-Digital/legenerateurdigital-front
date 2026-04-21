"use client";

import { useEffect, useMemo, useState } from "react";
import { FaCog, FaEnvelope } from "react-icons/fa";

type SubscriptionResponse = {
  email?: string | null;
  plan?: string | null;
  plan_label?: string | null;
  quota_remaining?: number | null;
  quota_limit?: number | null;
  status?: string | null;
  subscription_status?: string | null;
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

function formatPlanLabel(plan?: string | null) {
  const raw = String(plan || "").trim().toLowerCase();

  if (raw === "ultime") return "ULTIME";
  if (raw === "pro") return "PRO";
  if (raw === "essentiel") return "ESSENTIEL";
  if (raw === "free") return "ESSENTIEL";

  return "ESSENTIEL";
}

function formatPlanName(plan?: string | null) {
  const raw = String(plan || "").trim().toLowerCase();

  if (raw === "ultime") return "Plan Ultime LGD";
  if (raw === "pro") return "Plan Pro LGD";
  if (raw === "essentiel") return "Accès de base LGD";
  if (raw === "free") return "Accès de base LGD";

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
  const userEmail = sub?.email || "";
  const mailSubject = encodeURIComponent("Demande de résiliation abonnement LGD");
  const mailBody = encodeURIComponent(
    `Bonjour,

Je souhaite résilier mon abonnement LGD.

Email du compte LGD : ${userEmail || "[à compléter]"}
Plan actuel : ${formatPlanLabel(sub?.plan)}
Date de la demande : ${new Date().toLocaleDateString("fr-FR")}

Merci de prendre en compte ma demande.

Cordialement`
  );

  const mailtoUrl = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;

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
          plan_label: data?.plan_label ?? formatPlanLabel(data?.plan),
          quota_remaining: Number(data?.quota_remaining ?? 0),
          quota_limit: Number(data?.quota_limit ?? 0),
          status: data?.status ?? "",
          subscription_status: data?.subscription_status ?? "",
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
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-16 pt-10 md:px-8">
        <div className="mx-auto mb-10 flex w-full max-w-5xl flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-4">
            <FaCog className="text-4xl text-[#cfc3d9]" />
            <h1 className="text-4xl font-black tracking-tight text-[#f5b700] md:text-5xl">
              Paramètres du compte
            </h1>
          </div>

          <p className="max-w-4xl text-base text-white/85 md:text-lg">
            Gère ton abonnement LGD, vérifie ton plan actif et consulte la
            procédure officielle de résiliation.
          </p>
        </div>

        {error ? (
          <div className="mx-auto mb-8 w-full max-w-4xl rounded-3xl border border-red-800 bg-red-950/40 px-6 py-5 text-center text-sm text-red-100 shadow-[0_0_24px_rgba(220,38,38,0.10)] md:text-base">
            {error}
          </div>
        ) : null}

        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-[28px] border border-[#1f1607] bg-[#050505] p-8 shadow-[0_0_32px_rgba(245,183,0,0.08)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#d6a300]">
                  Abonnement LGD
                </p>
                <h2 className="text-3xl font-extrabold text-[#f5b700]">
                  Statut du compte
                </h2>
              </div>

              <div className="rounded-full border border-[#6d5500] bg-[#231a00] px-4 py-2 text-sm font-bold text-[#ffe082]">
                {loading ? "..." : currentPlan}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-white/20 bg-white/[0.03] p-5">
                <p className="mb-2 text-sm text-white/55">Compte</p>
                <p className="text-2xl font-semibold text-white break-all">
                  {loading ? "Chargement..." : sub?.email || "—"}
                </p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/[0.03] p-5">
                <p className="mb-2 text-sm text-white/55">Plan actif</p>
                <p className="text-2xl font-semibold text-white">
                  {loading ? "Chargement..." : currentPlanName}
                </p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/[0.03] p-5">
                <p className="mb-2 text-sm text-white/55">Quota IA restant</p>
                <p className="text-2xl font-semibold text-white">
                  {loading
                    ? "Chargement..."
                    : `${formatNumber(quotaRemaining)} / ${formatNumber(
                        quotaLimit
                      )}`}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#1f1607] bg-[#050505] p-8 shadow-[0_0_32px_rgba(245,183,0,0.08)]">
            <div className="mb-6">
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#d6a300]">
                Gestion abonnement
              </p>
              <h2 className="text-3xl font-extrabold text-[#f5b700]">
                Résiliation par email
              </h2>
            </div>

            <p className="mb-6 text-lg leading-8 text-white/85">
              Pour résilier ton abonnement LGD, envoie simplement ta demande à
              notre équipe depuis l’adresse email liée à ton compte.
            </p>

            <div className="mb-6 rounded-3xl border border-[#6d5500] bg-[#231a00]/40 p-5">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d6a300]">
                Adresse de contact
              </p>
              <p className="text-2xl font-bold text-white break-all">
                {supportEmail}
              </p>
            </div>

            <div className="mb-6 rounded-3xl border border-white/20 bg-white/[0.03] p-5 text-base leading-8 text-white/80">
              <p className="mb-3 font-semibold text-white">
                Procédure officielle :
              </p>
              <p>
                1. Envoie un email de demande de résiliation à{" "}
                <span className="font-semibold text-[#f5bf21]">{supportEmail}</span>.
              </p>
              <p>
                2. Utilise de préférence l’adresse email de ton compte LGD pour
                faciliter la vérification.
              </p>
              <p>
                3. L’abonnement sera ensuite résilié manuellement depuis le
                tableau de bord Systeme.io.
              </p>
              <p>
                4. Une fois la résiliation effectuée, LGD se synchronisera via
                webhook pour mettre à jour ton plan et tes quotas.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href={mailtoUrl}
                className="flex w-full items-center justify-center gap-3 rounded-3xl bg-[#f5bf21] px-6 py-5 text-center text-2xl font-extrabold text-black transition hover:brightness-105"
              >
                <FaEnvelope className="text-xl" />
                Envoyer la demande de résiliation
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full rounded-3xl border border-white/25 bg-white/[0.03] px-6 py-5 text-center text-xl font-bold text-white transition hover:bg-white/[0.06]"
              >
                {copySuccess
                  ? "Adresse email copiée"
                  : "Copier l’adresse email de contact"}
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/25 bg-white/[0.02] p-5 text-base leading-8 text-white/65">
              Sécurité LGD : aucune annulation automatique n’est simulée côté
              application. Toute résiliation passe par une demande email,
              traitée manuellement, puis synchronisée proprement dans LGD.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
