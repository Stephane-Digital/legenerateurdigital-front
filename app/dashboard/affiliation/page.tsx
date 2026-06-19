"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import AffiliationSubnav from "./components/AffiliationSubnav";
import CopyField from "./components/CopyField";

const BASE_LGD_URL = "https://legenerateurdigital.systeme.io";
const DEFAULT_AFFILIATE_ID = "TON_ID_AFFILIÉ";
const EXAMPLE_AFFILIATE_ID = "sa02698613581505ce9959d1609a94205a3a64efb9";

const CANVA_VISUALS_URL = "https://canva.link/gotybx267eh8rb4";
const CANVA_KIT_URL = "https://canva.link/146b24iq6gjzc1m";

const COMMISSION_RATE = 0.6;

const OFFERS = {
  essentiel: { label: "Essentiel", price: 17, note: "Entrée simple" },
  pro: { label: "Pro", price: 47, note: "Bon équilibre" },
  ultime: { label: "Ultime", price: 97, note: "Plus rentable" },
} as const;

type OfferKey = keyof typeof OFFERS;

type StatCard = {
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "green" | "gold" | "red" | "neutral";
};

const stats: StatCard[] = [
  { label: "Prospects envoyés", value: "0", helper: "En attente SIO", tone: "blue" },
  { label: "Essais gratuits", value: "0", helper: "Lien recommandé", tone: "blue" },
  { label: "Abonnés actifs", value: "0", helper: "Récurrent", tone: "green" },
  { label: "Conversion", value: "0 %", helper: "Essais → abonnés", tone: "gold" },
  { label: "En attente", value: "0 €", helper: "Validation 30 jours", tone: "gold" },
  { label: "Validées", value: "0 €", helper: "Payables", tone: "green" },
  { label: "Annulées", value: "0 €", helper: "Avant 30 jours", tone: "red" },
  { label: "CA généré", value: "0 €", helper: "Attribué", tone: "neutral" },
];

const activityRows = [
  {
    date: "Aujourd'hui",
    event: "Essai gratuit généré",
    contact: "En attente",
    source: "Lien essai 7 jours",
    status: "À venir",
    commission: "—",
  },
  {
    date: "Cycle paiement",
    event: "Commission validée",
    contact: "Après 30 jours actifs",
    source: "Systeme.io",
    status: "Payable le 10 suivant",
    commission: "—",
  },
  {
    date: "Sécurité",
    event: "Annulation avant 30 jours",
    contact: "Abonnement annulé",
    source: "Systeme.io",
    status: "0 € versé",
    commission: "0 €",
  },
];

function normalizeAffiliateId(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/legenerateurdigital\.systeme\.io\/trial\?sa=/i, "")
    .replace(/^https?:\/\/legenerateurdigital\.systeme\.io\/lgd\?sa=/i, "")
    .replace(/^https?:\/\/legenerateurdigital\.systeme\.io\/?\?sa=/i, "")
    .replace(/^\?sa=/i, "")
    .replace(/^sa=/i, "")
    .replace(/\s+/g, "");
}

function euro(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`w-full rounded-[24px] border border-yellow-600/20 bg-gradient-to-br from-[#101010] via-[#070707] to-[#120d03] shadow-[0_0_45px_rgba(255,184,0,0.08)] sm:rounded-[30px] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "left" ? "mb-5 text-left sm:mb-6" : "mb-5 text-center sm:mb-6"}>
      {eyebrow ? (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.20em] text-yellow-300/75 sm:text-xs sm:tracking-[0.24em]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-[22px] font-black leading-tight text-[#ffb800] sm:text-3xl">{title}</h2>
      {text ? (
        <p className={`${align === "left" ? "" : "mx-auto"} mt-3 max-w-4xl text-sm leading-6 text-white/60 sm:text-base`}>
          {text}
        </p>
      ) : null}
    </div>
  );
}

function StatCardView({ stat }: { stat: StatCard }) {
  const toneClass = {
    blue: "border-blue-400/20 bg-blue-400/5",
    green: "border-green-400/20 bg-green-400/5",
    gold: "border-yellow-500/25 bg-yellow-500/10",
    red: "border-red-400/20 bg-red-400/5",
    neutral: "border-white/10 bg-white/[0.03]",
  }[stat.tone];

  return (
    <div className={`min-h-[112px] rounded-2xl border px-3 py-4 text-center sm:min-h-[132px] sm:rounded-3xl sm:px-5 sm:py-5 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45 sm:text-xs sm:tracking-[0.16em]">
        {stat.label}
      </p>
      <p className="mt-3 text-2xl font-black text-white sm:text-3xl">{stat.value}</p>
      <p className="mt-2 text-[11px] text-white/50 sm:text-xs">{stat.helper}</p>
    </div>
  );
}

function ResourceCard({ icon, title, text, href }: { icon: string; title: string; text: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex min-h-[150px] flex-col rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:bg-yellow-500/10 sm:min-h-[190px] sm:rounded-3xl sm:p-5"
    >
      <div className="text-2xl sm:text-3xl">{icon}</div>
      <h3 className="mt-3 text-base font-black text-yellow-100 sm:mt-4 sm:text-lg">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-white/58">{text}</p>
      <p className="mt-4 text-sm font-bold text-[#ffb800] group-hover:text-yellow-200">Ouvrir →</p>
    </a>
  );
}

function ActivityMobileCard({ row }: { row: (typeof activityRows)[number] }) {
  return (
    <div className="rounded-2xl border border-yellow-600/15 bg-[#070707] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-yellow-300/70">{row.date}</p>
          <p className="mt-2 text-sm font-black text-white/90">{row.event}</p>
        </div>
        <p className="shrink-0 rounded-full border border-yellow-600/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-100">
          {row.commission}
        </p>
      </div>
      <div className="mt-4 grid gap-2 text-xs leading-5 text-white/60">
        <p><span className="text-white/35">Contact :</span> {row.contact}</p>
        <p><span className="text-white/35">Source :</span> {row.source}</p>
        <p><span className="text-white/35">Statut :</span> {row.status}</p>
      </div>
    </div>
  );
}

export default function AffiliationDashboardPage() {
  const [affiliateId, setAffiliateId] = useState(DEFAULT_AFFILIATE_ID);
  const [selectedOffer, setSelectedOffer] = useState<OfferKey>("ultime");
  const [subscriberGoal, setSubscriberGoal] = useState(25);

  const cleanAffiliateId = useMemo(() => normalizeAffiliateId(affiliateId) || DEFAULT_AFFILIATE_ID, [affiliateId]);
  const trialLink = `${BASE_LGD_URL}/trial?sa=${cleanAffiliateId}`;
  const salesLink = `${BASE_LGD_URL}/lgd?sa=${cleanAffiliateId}`;

  const selected = OFFERS[selectedOffer];
  const commissionPerClient = selected.price * COMMISSION_RATE;
  const monthlyRevenue = commissionPerClient * subscriberGoal;
  const yearlyRevenue = monthlyRevenue * 12;

  return (
    <div className="min-h-screen w-full bg-[#050505] px-0 pb-12 pt-4 text-white sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-3 sm:gap-8 sm:px-0">
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-300/80 sm:mb-3 sm:text-xs sm:tracking-[0.30em]">
            Programme Ambassadeur LGD
          </p>
          <h1 className="mx-auto max-w-[920px] text-[28px] font-black leading-tight text-yellow-400 sm:text-5xl lg:text-6xl">
            🤝 Centre de Croissance Ambassadeur
          </h1>
          <p className="mx-auto mt-3 max-w-5xl text-sm leading-6 text-white/68 sm:mt-4 sm:text-lg sm:leading-7">
            Transforme ton audience en revenus récurrents. Suis tes essais, tes abonnés, tes commissions et récupère tous tes outils pour promouvoir LGD avec sérieux.
          </p>
          <div className="mt-5 w-full overflow-x-auto pb-1 sm:mt-6">
            <div className="flex min-w-max justify-start sm:min-w-0 sm:justify-center">
              <AffiliationSubnav />
            </div>
          </div>
        </motion.header>

        <Panel className="overflow-hidden p-4 sm:p-7 lg:p-9">
          <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr] xl:items-stretch">
            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-flex rounded-full border border-green-400/20 bg-green-400/10 px-3 py-2 text-xs font-bold text-green-100 sm:px-4 sm:text-sm">
                  🔒 Suivi Systeme.io + Dashboard LGD
                </div>
                <h2 className="mt-4 max-w-4xl text-[26px] font-black leading-tight text-[#ffb800] sm:mt-5 sm:text-4xl lg:text-5xl">
                  Ton tableau de bord pour piloter tes commissions.
                </h2>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-white/65 sm:mt-4 sm:text-base sm:leading-7">
                  LGD enregistre le lien entre chaque prospect et l'ambassadeur qui l'a envoyé. Même si le prospect revient plus tard sans lien affilié, le rattachement initial par email permet de suivre l'essai, l'abonnement et les éventuelles annulations.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-7 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-3 text-center sm:p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 sm:text-xs sm:tracking-[0.16em]">Partenaire depuis</p>
                  <p className="mt-2 text-xl font-black text-yellow-100 sm:text-2xl">0 jour</p>
                </div>
                <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-3 text-center sm:p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 sm:text-xs sm:tracking-[0.16em]">Commission</p>
                  <p className="mt-2 text-xl font-black text-yellow-100 sm:text-2xl">60 %</p>
                </div>
                <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-3 text-center sm:p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 sm:text-xs sm:tracking-[0.16em]">Objectif du mois</p>
                  <p className="mt-2 text-xl font-black text-yellow-100 sm:text-2xl">5 abonnés</p>
                </div>
                <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-3 text-center sm:p-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/45 sm:text-xs sm:tracking-[0.16em]">Prochain paiement</p>
                  <p className="mt-2 text-xl font-black text-yellow-100 sm:text-2xl">À venir</p>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col justify-center rounded-[24px] border border-yellow-500/25 bg-gradient-to-br from-yellow-500/15 via-black/40 to-[#0b0b0b] p-5 text-center shadow-[0_0_45px_rgba(255,184,0,0.10)] sm:rounded-[30px] sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.20em] text-yellow-300/75 sm:text-sm sm:tracking-[0.22em]">Revenus récurrents estimés</p>
              <p className="mt-3 text-4xl font-black text-white sm:mt-4 sm:text-6xl">0 €/mois</p>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Les chiffres réels seront calculés depuis les événements Systeme.io attribués à ton lien ambassadeur.
              </p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10 sm:mt-6">
                <div className="h-full w-[0%] rounded-full bg-gradient-to-r from-[#ffb800] to-[#ffcc4d]" />
              </div>
              <p className="mt-2 text-xs text-white/45">0 / 5 abonnés actifs ce mois-ci</p>
            </div>
          </div>
        </Panel>

        <section>
          <SectionTitle
            eyebrow="Performance"
            title="Tes indicateurs clés"
            text="Une lecture simple : prospects envoyés, essais gratuits, abonnements actifs, commissions et CA généré."
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCardView key={stat.label} stat={stat} />
            ))}
          </div>
        </section>

        <div className="grid gap-5 sm:gap-8 xl:grid-cols-[1.25fr_0.95fr]">
          <Panel className="p-4 sm:p-7 lg:p-8">
            <SectionTitle
              eyebrow="Activité"
              title="📈 Évolution de ton activité ambassadeur"
              text="Prototype visuel avant branchement définitif sur les données webhook Systeme.io."
            />
            <div className="mb-4 flex flex-wrap justify-center gap-2 sm:mb-5 sm:gap-3">
              {["Aujourd'hui", "7 jours", "Mois", "90 jours"].map((period, index) => (
                <span
                  key={period}
                  className={[
                    "rounded-full border px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm",
                    index === 2
                      ? "border-yellow-400/70 bg-yellow-500/15 text-yellow-100"
                      : "border-yellow-600/20 bg-[#0b0b0b] text-white/55",
                  ].join(" ")}
                >
                  {period}
                </span>
              ))}
            </div>
            <div className="relative h-[250px] overflow-hidden rounded-[22px] border border-yellow-600/20 bg-[#070707] p-4 sm:h-[360px] sm:rounded-[28px] sm:p-5">
              <div className="absolute inset-x-4 bottom-10 top-8 grid grid-rows-4 sm:inset-x-5 sm:bottom-12">
                {[1, 2, 3, 4].map((line) => (
                  <div key={line} className="border-t border-white/6" />
                ))}
              </div>
              <div className="absolute bottom-10 left-4 right-4 flex h-[170px] items-end justify-between gap-1.5 sm:bottom-12 sm:left-6 sm:right-6 sm:h-[250px] sm:gap-3">
                {[18, 35, 28, 52, 44, 70, 62, 86, 74, 95, 82, 100].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#ffb800] to-[#ffdd72] opacity-80 shadow-[0_0_18px_rgba(255,184,0,0.20)] sm:rounded-t-xl"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] text-white/45 sm:left-5 sm:right-5 sm:text-xs">
                <span>Jour</span>
                <span>Mois en cours</span>
              </div>
            </div>
          </Panel>

          <Panel className="p-4 sm:p-7 lg:p-8">
            <SectionTitle
              eyebrow="Simulation"
              title="🚀 Simule ton potentiel de commissions"
              text="Fais varier l'offre et le nombre d'abonnés actifs pour visualiser ton revenu récurrent potentiel."
            />

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(Object.keys(OFFERS) as OfferKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedOffer(key)}
                  className={[
                    "rounded-2xl border px-2 py-3 text-center transition-all sm:px-4 sm:py-4",
                    selectedOffer === key
                      ? "border-yellow-400/80 bg-yellow-500/15 text-yellow-100 shadow-[0_0_24px_rgba(255,184,0,0.12)]"
                      : "border-yellow-600/15 bg-[#0b0b0b] text-white/60 hover:bg-yellow-500/10",
                  ].join(" ")}
                >
                  <p className="text-sm font-black sm:text-base">{OFFERS[key].label}</p>
                  <p className="mt-1 text-xs sm:text-sm">{OFFERS[key].price} €/mois</p>
                  <p className="mt-2 hidden text-xs text-white/45 sm:block">{OFFERS[key].note}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-600/15 bg-black/35 p-4 sm:mt-7 sm:rounded-3xl sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-white/80 sm:text-base">Abonnés actifs visés</p>
                <p className="text-2xl font-black text-yellow-300">{subscriberGoal}</p>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={subscriberGoal}
                onChange={(event) => setSubscriberGoal(Number(event.target.value))}
                className="mt-5 w-full accent-yellow-400"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] p-4 text-center">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 sm:text-xs sm:tracking-[0.16em]">Commission / client</p>
                <p className="mt-2 text-2xl font-black text-yellow-100">{euro(commissionPerClient)}</p>
              </div>
              <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-4 text-center">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 sm:text-xs sm:tracking-[0.16em]">Mensuel estimé</p>
                <p className="mt-2 text-2xl font-black text-green-100">{euro(monthlyRevenue)}</p>
              </div>
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-center">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45 sm:text-xs sm:tracking-[0.16em]">Annuel estimé</p>
                <p className="mt-2 text-2xl font-black text-yellow-100">{euro(yearlyRevenue)}</p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 sm:gap-8 xl:grid-cols-[0.95fr_1.25fr]">
          <Panel className="p-4 sm:p-7 lg:p-8">
            <SectionTitle
              eyebrow="Confiance"
              title="💰 Paiements & commissions"
              text="Règle claire : une commission n'est acquise qu'après 30 jours d'abonnement actif."
            />

            <div className="space-y-3 text-sm leading-6 text-white/68 sm:space-y-4">
              <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-4 sm:rounded-3xl sm:p-5">
                <p className="text-base font-black text-green-100 sm:text-lg">✅ Cas validé</p>
                <p className="mt-3">Abonnement validé le 19 juin → actif 30 jours → commission validée le 19 juillet → paiement le 10 août.</p>
              </div>
              <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4 sm:rounded-3xl sm:p-5">
                <p className="text-base font-black text-red-100 sm:text-lg">❌ Cas annulé</p>
                <p className="mt-3">Si l'abonnement est annulé avant la fin des 30 jours, la commission est annulée : 0 € versé.</p>
              </div>
              <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4 sm:rounded-3xl sm:p-5">
                <p className="text-base font-black text-blue-100 sm:text-lg">🔒 Intermédiaire de paiement</p>
                <p className="mt-3">Systeme.io récupère les paiements, calcule les commissions, puis reverse la commission à l'ambassadeur et le solde à LGD.</p>
                <p className="mt-3">L'ambassadeur connecte son compte Stripe ou PayPal dans son espace affilié Systeme.io.</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-4 sm:p-7 lg:p-8">
            <SectionTitle
              eyebrow="Conversion"
              title="💡 La stratégie recommandée"
              text="Commence par l'essai gratuit : c'est généralement plus simple à proposer et plus facile à accepter pour un prospect."
            />

            <div className="mb-5 rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-center sm:mb-7 sm:rounded-3xl sm:p-5">
              <p className="text-base font-black text-yellow-100 sm:text-lg">Je ne vends pas LGD. Je fais découvrir LGD.</p>
              <p className="mx-auto mt-2 max-w-3xl text-sm leading-6 text-white/65">
                Si ton prospect est déjà convaincu, tu peux lui envoyer la page de vente. Sinon, partage l'essai gratuit 7 jours et laisse la plateforme démontrer sa valeur.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-yellow-600/20 bg-[#0b0b0b] p-4 sm:mb-6 sm:rounded-3xl sm:p-5">
              <label className="text-sm font-bold text-yellow-100" htmlFor="affiliate-id">
                Ton identifiant affilié Systeme.io
              </label>
              <input
                id="affiliate-id"
                value={affiliateId}
                onChange={(event) => setAffiliateId(event.target.value)}
                placeholder={EXAMPLE_AFFILIATE_ID}
                className="mt-3 w-full rounded-2xl border border-yellow-600/25 bg-black px-4 py-3 text-sm text-yellow-100 outline-none transition focus:border-yellow-400 sm:text-base"
              />
              <p className="mt-2 text-xs leading-5 text-white/45">Colle uniquement ton identifiant, ou un lien complet contenant ?sa=. LGD nettoie le format automatiquement.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[22px] border border-green-400/25 bg-green-400/5 p-4 sm:rounded-[28px] sm:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-black text-green-100">⭐ Recommandé</span>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/55">Convertit mieux</span>
                </div>
                <CopyField
                  label="🟢 Lien Essai Gratuit 7 jours"
                  value={trialLink}
                  helper="À partager en priorité avec les prospects froids, tièdes ou curieux."
                />
                <a href={trialLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-green-400/25 bg-green-400/10 px-6 py-3 font-semibold text-green-100 transition hover:bg-green-400/15 sm:w-auto">
                  Ouvrir le lien
                </a>
              </div>

              <div className="rounded-[22px] border border-yellow-500/25 bg-yellow-500/5 p-4 sm:rounded-[28px] sm:p-5">
                <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-100">🚀 Vente directe</span>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/55">Déjà convaincus</span>
                </div>
                <CopyField
                  label="🚀 Lien Page de Vente / Abonnement"
                  value={salesLink}
                  helper="À utiliser quand ton argumentaire est solide ou que le prospect est prêt à s'abonner."
                />
                <a href={salesLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-6 py-3 font-semibold text-yellow-100 transition hover:bg-yellow-400/15 sm:w-auto">
                  Ouvrir le lien
                </a>
              </div>
            </div>
          </Panel>
        </div>

        <Panel className="p-4 sm:p-7 lg:p-8">
          <SectionTitle
            eyebrow="Suivi"
            title="🧾 Activité récente"
            text="Cette zone sera alimentée par les webhooks Systeme.io : essais, ventes, annulations, paiements échoués et commissions."
          />

          <div className="grid gap-3 md:hidden">
            {activityRows.map((row) => (
              <ActivityMobileCard key={`${row.date}-${row.event}`} row={row} />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-3xl border border-yellow-600/20 md:block">
            <table className="w-full min-w-[760px] border-collapse bg-[#070707] text-left text-sm">
              <thead className="bg-yellow-500/10 text-yellow-100">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Événement</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Commission</th>
                </tr>
              </thead>
              <tbody>
                {activityRows.map((row) => (
                  <tr key={`${row.date}-${row.event}`} className="border-t border-yellow-600/10 text-white/65">
                    <td className="px-4 py-4">{row.date}</td>
                    <td className="px-4 py-4 font-semibold text-white/85">{row.event}</td>
                    <td className="px-4 py-4">{row.contact}</td>
                    <td className="px-4 py-4">{row.source}</td>
                    <td className="px-4 py-4">{row.status}</td>
                    <td className="px-4 py-4 font-bold text-yellow-100">{row.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-4 sm:p-7 lg:p-8">
          <SectionTitle
            eyebrow="Ressources"
            title="📚 Centre de Ressources Ambassadeur"
            text="Tous les supports pour passer à l'action rapidement : visuels, kit, scripts, emails et conditions."
          />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            <ResourceCard icon="🎨" title="14 Visuels Canva" text="Visuels prêts pour vos live TikTok, posts, stories et campagnes." href={CANVA_VISUALS_URL} />
            <ResourceCard icon="🤝" title="Kit Ambassadeur" text="Support complet pour présenter LGD et vendre avec méthode." href={CANVA_KIT_URL} />
            <ResourceCard icon="📚" title="Académie Ambassadeur" text="Modules 1 à 10 pour comprendre quoi faire et dans quel ordre." href="/dashboard/affiliation/kit" />
            <ResourceCard icon="🎥" title="Scripts Live" text="Angles de lives pour présenter LGD sans pression commerciale." href="/dashboard/affiliation/kit" />
            <ResourceCard icon="✉️" title="Emails de prospection" text="Relances et messages prêts à adapter selon ton audience." href="/dashboard/affiliation/kit" />
            <ResourceCard icon="📜" title="Paiements & conditions" text="Règles de commission, validation 30 jours et paiement." href="/dashboard/affiliation/payouts" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

