
"use client";

import { ArrowLeft, BarChart3, MailCheck, RefreshCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AnalyticsFunnelCard from "./components/AnalyticsFunnelCard";
import AnalyticsHero from "./components/AnalyticsHero";
import AnalyticsMiniBars from "./components/AnalyticsMiniBars";
import AnalyticsStatCard from "./components/AnalyticsStatCard";
import { fetchEmailAnalyticsDashboard } from "./components/api";
import type { EmailAnalyticsDashboardResponse } from "./components/types";

function buildFallback(): EmailAnalyticsDashboardResponse {
  return {
    module: "LGD Emailing IA",
    stats: {
      contacts_captured: 0,
      campaigns_started: 0,
      sales_generated: 0,
    },
    events_tracked: 0,
  };
}

export default function EmailAnalyticsDashboardPage() {
  const [data, setData] = useState<EmailAnalyticsDashboardResponse>(buildFallback());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await fetchEmailAnalyticsDashboard();
      setData(response);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger les analytics Emailing IA.");
      setData(buildFallback());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboard(false);
  }, []);

  const metrics = useMemo(() => {
    const contacts = Math.max(0, Number(data?.stats?.contacts_captured || 0));
    const campaigns = Math.max(0, Number(data?.stats?.campaigns_started || 0));
    const sales = Math.max(0, Number(data?.stats?.sales_generated || 0));
    const events = Math.max(0, Number(data?.events_tracked || 0));

    const activationRate = contacts > 0 ? Math.round((campaigns / contacts) * 100) : 0;
    const conversionRate = contacts > 0 ? Math.round((sales / contacts) * 100) : 0;
    const salesPerCampaign = campaigns > 0 ? Number((sales / campaigns).toFixed(2)) : 0;

    return {
      contacts,
      campaigns,
      sales,
      events,
      activationRate,
      conversionRate,
      salesPerCampaign,
    };
  }, [data]);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/email-campaigns"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#7a5c16]/60 bg-[#101010] px-4 py-2 text-sm font-medium text-[#f2d27a] transition hover:border-[#c8a64d] hover:bg-[#151515]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux campagnes
            </Link>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#7a5c16]/40 bg-[#0d0d0d] px-4 py-2 text-l font-semibold uppercase tracking-[0.28em] text-[#fac508]">
              <BarChart3 className="h-4 w-4" />
              Dashboard Analytics
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7a5c16]/60 bg-gradient-to-r from-[#1b1710] to-[#141414] px-5 py-3 text-sm font-semibold text-[#f5d77d] transition hover:border-[#c8a64d] hover:shadow-[0_0_25px_rgba(200,166,77,0.18)]"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </button>
        </div>

        <AnalyticsHero
          title="Pilotage premium de l’Emailing IA"
          subtitle="Visualise les leads capturés, les campagnes déclenchées, les ventes générées et la dynamique du tunnel Emailing IA — sans polluer les autres modules LGD."
          loading={loading}
          error={error}
          moduleLabel={data.module || "LGD Emailing IA"}
          eventsTracked={metrics.events}
        />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <AnalyticsStatCard
            title="Contacts capturés"
            value={metrics.contacts}
            icon={MailCheck}
            accent="gold"
            helper="Leads injectés dans le moteur Emailing IA."
            loading={loading}
          />
          <AnalyticsStatCard
            title="Campagnes lancées"
            value={metrics.campaigns}
            icon={Sparkles}
            accent="gold"
            helper="Campagnes réellement démarrées côté automation."
            loading={loading}
          />
          <AnalyticsStatCard
            title="Ventes générées"
            value={metrics.sales}
            icon={BarChart3}
            accent="gold"
            helper="Conversions détectées par le tracking LGD."
            loading={loading}
          />
          <AnalyticsStatCard
            title="Événements suivis"
            value={metrics.events}
            icon={RefreshCcw}
            accent="gold"
            helper="Volume d’activité traqué via webhooks et analytics."
            loading={loading}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.95fr]">
          <AnalyticsMiniBars
            title="Vue rapide du moteur Emailing IA"
            description="Une lecture instantanée du niveau d’activité actuel du module."
            loading={loading}
            items={[
              {
                label: "Contacts capturés",
                value: metrics.contacts,
                max: Math.max(metrics.contacts, metrics.campaigns, metrics.sales, 1),
              },
              {
                label: "Campagnes lancées",
                value: metrics.campaigns,
                max: Math.max(metrics.contacts, metrics.campaigns, metrics.sales, 1),
              },
              {
                label: "Ventes générées",
                value: metrics.sales,
                max: Math.max(metrics.contacts, metrics.campaigns, metrics.sales, 1),
              },
            ]}
          />

          <AnalyticsFunnelCard
            loading={loading}
            contacts={metrics.contacts}
            campaigns={metrics.campaigns}
            sales={metrics.sales}
            activationRate={metrics.activationRate}
            conversionRate={metrics.conversionRate}
            salesPerCampaign={metrics.salesPerCampaign}
          />
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-[28px] border border-[#7a5c16]/35 bg-[radial-gradient(circle_at_top,rgba(200,166,77,0.12),transparent_40%),linear-gradient(180deg,#111111_0%,#090909_100%)] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] lg:col-span-2">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c8a64d]">
                Lecture stratégique
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Interprétation rapide du tableau de bord
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-[#7a5c16]/25 bg-[#0d0d0d]/80 p-4">
                <p className="text-sm font-medium text-[#f3d98b]">Acquisition</p>
                <p className="mt-2 text-sm leading-6 text-[#d1d1d1]">
                  Plus le nombre de contacts grimpe, plus ton moteur Emailing IA alimente automatiquement le CRM marketing.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#7a5c16]/25 bg-[#0d0d0d]/80 p-4">
                <p className="text-sm font-medium text-[#f3d98b]">Activation</p>
                <p className="mt-2 text-sm leading-6 text-[#d1d1d1]">
                  Le taux d’activation mesure la part des leads qui entrent réellement dans un workflow ou une campagne.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#7a5c16]/25 bg-[#0d0d0d]/80 p-4">
                <p className="text-sm font-medium text-[#f3d98b]">Conversion</p>
                <p className="mt-2 text-sm leading-6 text-[#d1d1d1]">
                  Le taux de conversion montre si le couple séquence IA + automation Systeme.io commence à produire du chiffre.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#7a5c16]/35 bg-[linear-gradient(180deg,#111111_0%,#080808_100%)] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c8a64d]">
              État du module
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Stabilité LGD Emailing IA
            </h2>

            <div className="mt-5 space-y-3">
              {[
                "Génération IA",
                "Préparation payload Systeme.io",
                "Dispatcher automation",
                "Tracking marketing",
                "Dashboard analytics",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-[#7a5c16]/20 bg-[#0d0d0d]/80 px-4 py-3"
                >
                  <span className="text-sm text-[#e7e7e7]">{item}</span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Stable
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
