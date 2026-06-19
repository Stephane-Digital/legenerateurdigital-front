"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import CardLuxe from "@/components/ui/CardLuxe";
import AffiliationSubnav from "./components/AffiliationSubnav";
import CopyField from "./components/CopyField";

const BASE_LGD_URL = "https://legenerateurdigital.systeme.io";
const DEFAULT_AFFILIATE_ID = "TON_ID_AFFILIÉ";
const EXAMPLE_AFFILIATE_ID = "sa02698613581505ce9959d1609a94205a3a64efb9";

const CANVA_VISUALS_URL = "https://canva.link/gotybx267eh8rb4";
const CANVA_KIT_URL = "https://canva.link/146b24iq6gjzc1m";

const COMMISSION_RATE = 0.6;

const OFFERS = {
  essentiel: { label: "Essentiel", price: 17, note: "Entrée simple pour démarrer" },
  pro: { label: "Pro", price: 47, note: "Meilleur équilibre valeur / prix" },
  ultime: { label: "Ultime", price: 97, note: "Offre la plus rentable à promouvoir" },
} as const;

type OfferKey = keyof typeof OFFERS;

type StatCard = {
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "green" | "gold" | "red" | "neutral";
};

const stats: StatCard[] = [
  { label: "Prospects envoyés", value: "0", helper: "En attente des données SIO", tone: "blue" },
  { label: "Essais gratuits", value: "0", helper: "Lien recommandé", tone: "blue" },
  { label: "Abonnés actifs", value: "0", helper: "Revenus récurrents", tone: "green" },
  { label: "Conversion", value: "0 %", helper: "Essais → abonnés", tone: "gold" },
  { label: "Commissions en attente", value: "0 €", helper: "Validation 30 jours", tone: "gold" },
  { label: "Commissions validées", value: "0 €", helper: "Payables au cycle suivant", tone: "green" },
  { label: "Commissions annulées", value: "0 €", helper: "Annulation avant 30 jours", tone: "red" },
  { label: "CA généré", value: "0 €", helper: "Abonnements attribués", tone: "neutral" },
];

const activityRows = [
  {
    date: "Aujourd’hui",
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

function StatCardView({ stat }: { stat: StatCard }) {
  const toneClass = {
    blue: "border-blue-400/20 bg-blue-400/5 text-blue-100",
    green: "border-green-400/20 bg-green-400/5 text-green-100",
    gold: "border-yellow-500/25 bg-yellow-500/10 text-yellow-100",
    red: "border-red-400/20 bg-red-400/5 text-red-100",
    neutral: "border-white/10 bg-white/[0.03] text-white/80",
  }[stat.tone];

  return (
    <div className={`rounded-3xl border px-5 py-5 text-center ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{stat.label}</p>
      <p className="mt-3 text-3xl font-black text-white">{stat.value}</p>
      <p className="mt-2 text-xs text-white/50">{stat.helper}</p>
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mb-5 text-center">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-yellow-300/75">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-black text-[#ffb800] sm:text-3xl">{title}</h2>
      {text ? <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-white/60 sm:text-base">{text}</p> : null}
    </div>
  );
}

function ResourceCard({ icon, title, text, href }: { icon: string; title: string; text: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-3xl border border-yellow-600/20 bg-[#0b0b0b] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:bg-yellow-500/10"
    >
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 text-lg font-black text-yellow-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/58">{text}</p>
      <p className="mt-4 text-sm font-bold text-[#ffb800] group-hover:text-yellow-200">Ouvrir →</p>
    </a>
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
    <div className="min-h-screen bg-[#050505] px-4 pb-16 pt-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.30em] text-yellow-300/80">
            Programme Ambassadeur LGD
          </p>
          <h1 className="text-4xl font-black leading-tight text-yellow-400 sm:text-5xl lg:text-6xl">
            🤝 Centre de Croissance Ambassadeur
          </h1>
          <p className="mx-auto mt-4 max-w-4xl text-base leading-7 text-white/68 sm:text-lg">
            Transforme ton audience en revenus récurrents. Suis tes essais, tes abonnés, tes commissions
            et récupère tous tes outils pour promouvoir LGD avec sérieux.
          </p>
        </motion.div>

        <div className="mt-8">
          <AffiliationSubnav />
        </div>

        <div className="space-y-8">
          <CardLuxe className="w-full overflow-hidden px-5 py-7 sm:px-8 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <div>
                <div className="inline-flex rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-100">
                  🔒 Suivi Systeme.io + Dashboard LGD
                </div>
                <h2 className="mt-5 text-3xl font-black text-[#ffb800] sm:text-4xl">
                  Ton tableau de bord pour piloter tes commissions.
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
                  LGD enregistre le lien entre chaque prospect et l’ambassadeur qui l’a envoyé. Même si le prospect
                  revient plus tard sans lien affilié, le rattachement initial par email permet de suivre l’essai,
                  l’abonnement et les éventuelles annulations.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">Partenaire depuis</p>
                    <p className="mt-2 text-2xl font-black text-yellow-100">0 jour</p>
                  </div>
                  <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">Commission</p>
                    <p className="mt-2 text-2xl font-black text-yellow-100">60 %</p>
                  </div>
                  <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">Objectif du mois</p>
                    <p className="mt-2 text-2xl font-black text-yellow-100">5 abonnés</p>
                  </div>
                  <div className="rounded-2xl border border-yellow-500/20 bg-black/35 p-4 text-center">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/45">Prochain paiement</p>
                    <p className="mt-2 text-2xl font-black text-yellow-100">À venir</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-yellow-500/25 bg-gradient-to-br from-yellow-500/15 via-black/40 to-[#0b0b0b] p-6 text-center shadow-[0_0_55px_rgba(255,184,0,0.10)]">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-yellow-300/75">Revenus récurrents estimés</p>
                <p className="mt-4 text-5xl font-black text-white">0 €/mois</p>
                <p className="mt-3 text-sm leading-6 text-white/55">
                  Les chiffres réels seront calculés depuis les événements Systeme.io attribués à ton lien ambassadeur.
                </p>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[0%] rounded-full bg-gradient-to-r from-[#ffb800] to-[#ffcc4d]" />
                </div>
                <p className="mt-2 text-xs text-white/45">0 / 5 abonnés actifs ce mois-ci</p>
              </div>
            </div>
          </CardLuxe>

          <section>
            <SectionTitle
              eyebrow="Performance"
              title="Tes indicateurs clés"
              text="Une lecture simple : prospects envoyés, essais gratuits, abonnements actifs, commissions et CA généré."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCardView key={stat.label} stat={stat} />
              ))}
            </div>
          </section>

          <CardLuxe className="w-full px-5 py-7 sm:px-8">
            <SectionTitle
              eyebrow="Activité"
              title="📈 Évolution de ton activité ambassadeur"
              text="Prototype visuel avant branchement définitif sur les données webhook Systeme.io."
            />
            <div className="mb-5 flex flex-wrap justify-center gap-3">
              {['Aujourd’hui', '7 jours', 'Mois en cours', '90 jours'].map((period, index) => (
                <span
                  key={period}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-bold",
                    index === 2
                      ? "border-yellow-400/70 bg-yellow-500/15 text-yellow-100"
                      : "border-yellow-600/20 bg-[#0b0b0b] text-white/55",
                  ].join(" ")}
                >
                  {period}
                </span>
              ))}
            </div>
            <div className="relative h-[280px] overflow-hidden rounded-[28px] border border-yellow-600/20 bg-[#070707] p-5">
              <div className="absolute inset-x-5 bottom-10 top-8 grid grid-rows-4">
                {[1, 2, 3, 4].map((line) => (
                  <div key={line} className="border-t border-white/6" />
                ))}
              </div>
              <div className="absolute bottom-10 left-6 right-6 flex h-[190px] items-end justify-between gap-3">
                {[18, 35, 28, 52, 44, 70, 62, 86, 74, 95, 82, 100].map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#ffb800] to-[#ffdd72] opacity-80 shadow-[0_0_18px_rgba(255,184,0,0.20)]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between text-xs text-white/45">
                <span>Jour en cours</span>
                <span>Mois en cours</span>
              </div>
            </div>
          </CardLuxe>

          <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
            <CardLuxe className="w-full px-5 py-7 sm:px-8">
              <SectionTitle
                eyebrow="Simulation"
                title="🚀 Simule ton potentiel de commissions"
                text="Fais varier l’offre et le nombre d’abonnés actifs pour visualiser ton revenu récurrent potentiel."
              />

              <div className="grid gap-3 sm:grid-cols-3">
                {(Object.keys(OFFERS) as OfferKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedOffer(key)}
                    className={[
                      "rounded-2xl border px-4 py-4 text-center transition-all",
                      selectedOffer === key
                        ? "border-yellow-400/80 bg-yellow-500/15 text-yellow-100 shadow-[0_0_24px_rgba(255,184,0,0.12)]"
                        : "border-yellow-600/15 bg-[#0b0b0b] text-white/60 hover:bg-yellow-500/8",
                    ].join(" ")}
                  >
                    <p className="font-black">{OFFERS[key].label}</p>
                    <p className="mt-1 text-sm">{OFFERS[key].price} €/mois</p>
                    <p className="mt-2 text-xs text-white/45">{OFFERS[key].note}</p>
                  </button>
                ))}
              </div>

              <div className="mt-7 rounded-3xl border border-yellow-600/15 bg-black/35 p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-white/80">Nombre d’abonnés actifs visés</p>
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

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-yellow-600/15 bg-[#0b0b0b] p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Commission / client</p>
                  <p className="mt-2 text-2xl font-black text-yellow-100">{euro(commissionPerClient)}</p>
                </div>
                <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Mensuel estimé</p>
                  <p className="mt-2 text-2xl font-black text-green-100">{euro(monthlyRevenue)}</p>
                </div>
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Annuel estimé</p>
                  <p className="mt-2 text-2xl font-black text-yellow-100">{euro(yearlyRevenue)}</p>
                </div>
              </div>
            </CardLuxe>

            <CardLuxe className="w-full px-5 py-7 sm:px-8">
              <SectionTitle
                eyebrow="Confiance"
                title="💰 Paiements & commissions"
                text="Règle claire, sans ambiguïté : une commission n’est acquise qu’après 30 jours d’abonnement actif."
              />

              <div className="space-y-4 text-sm leading-6 text-white/68">
                <div className="rounded-3xl border border-yellow-600/20 bg-[#0b0b0b] p-5">
                  <p className="text-lg font-black text-yellow-100">✅ Cas validé</p>
                  <p className="mt-3">Abonnement validé le 19 juin → actif pendant 30 jours → commission validée le 19 juillet → paiement le 10 août.</p>
                </div>
                <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-5">
                  <p className="text-lg font-black text-red-100">❌ Cas annulé</p>
                  <p className="mt-3">Si l’abonnement est annulé avant la fin des 30 jours, la commission est annulée : 0 € versé.</p>
                </div>
                <div className="rounded-3xl border border-blue-400/20 bg-blue-400/5 p-5">
                  <p className="text-lg font-black text-blue-100">🔒 Intermédiaire de paiement</p>
                  <p className="mt-3">Systeme.io récupère les paiements des abonnements, calcule les commissions, puis reverse la commission à l’ambassadeur et le solde à LGD.</p>
                  <p className="mt-3">L’ambassadeur connecte son compte Stripe ou PayPal dans son espace affilié Systeme.io.</p>
                </div>
              </div>
            </CardLuxe>
          </div>

          <CardLuxe className="w-full px-5 py-7 sm:px-8">
  <SectionTitle
    eyebrow="Conversion"
    title="💡 La stratégie recommandée"
    text="Commence par l'essai gratuit : c'est généralement plus simple à proposer et plus facile à accepter pour un prospect."
  />

            <div className="mb-7 rounded-3xl border border-yellow-500/25 bg-yellow-500/10 p-5 text-center">
              <p className="text-lg font-black text-yellow-100">Je ne vends pas LGD. Je fais découvrir LGD.</p>
              <p className="mx-auto mt-2 max-w-3xl text-sm leading-6 text-white/65">
                Si ton prospect est déjà convaincu, tu peux lui envoyer la page de vente. Sinon, partage l’essai gratuit 7 jours et laisse la plateforme démontrer sa valeur.
              </p>
            </div>

            <div className="mb-6 rounded-3xl border border-yellow-600/20 bg-[#0b0b0b] p-5">
              <label className="text-sm font-bold text-yellow-100" htmlFor="affiliate-id">
                Ton identifiant affilié Systeme.io
              </label>
              <input
                id="affiliate-id"
                value={affiliateId}
                onChange={(event) => setAffiliateId(event.target.value)}
                placeholder={EXAMPLE_AFFILIATE_ID}
                className="mt-3 w-full rounded-2xl border border-yellow-600/25 bg-black px-4 py-3 text-yellow-100 outline-none transition focus:border-yellow-400"
              />
              <p className="mt-2 text-xs text-white/45">Colle uniquement ton identifiant, ou un lien complet contenant ?sa=. LGD nettoie le format automatiquement.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-green-400/25 bg-green-400/5 p-5">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs font-black text-green-100">⭐ Recommandé</span>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/55">Convertit généralement mieux</span>
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

              <div className="rounded-[28px] border border-yellow-500/25 bg-yellow-500/5 p-5">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-100">🚀 Vente directe</span>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/55">Prospects déjà convaincus</span>
                </div>
                <CopyField
                  label="🚀 Lien Page de Vente / Abonnement"
                  value={salesLink}
                  helper="À utiliser quand ton argumentaire est solide ou que le prospect est déjà prêt à s’abonner."
                />
                <a href={salesLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-yellow-400/25 bg-yellow-400/10 px-6 py-3 font-semibold text-yellow-100 transition hover:bg-yellow-400/15 sm:w-auto">
                  Ouvrir le lien
                </a>
              </div>
            </div>
          </CardLuxe>

          <CardLuxe className="w-full px-5 py-7 sm:px-8">
            <SectionTitle
              eyebrow="Suivi"
              title="🧾 Activité récente"
              text="Cette zone sera alimentée par les webhooks Systeme.io : essais, ventes, annulations, paiements échoués et commissions."
            />
            <div className="overflow-x-auto rounded-3xl border border-yellow-600/20">
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
          </CardLuxe>

          <CardLuxe className="w-full px-5 py-7 sm:px-8">
            <SectionTitle
              eyebrow="Ressources"
              title="📚 Centre de Ressources Ambassadeur"
              text="Tous les supports pour passer à l’action rapidement : visuels, kit, scripts, emails et conditions."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ResourceCard icon="🎨" title="Visuels Canva" text="Visuels prêts à publier pour posts, stories, lives et campagnes." href={CANVA_VISUALS_URL} />
              <ResourceCard icon="🤝" title="Kit Ambassadeur" text="Support complet pour présenter LGD et vendre avec méthode." href={CANVA_KIT_URL} />
              <ResourceCard icon="📚" title="Académie Ambassadeur" text="Modules 1 à 10 pour comprendre quoi faire et dans quel ordre." href="/dashboard/affiliation/kit" />
              <ResourceCard icon="🎥" title="Scripts Live" text="Angles de lives pour présenter LGD sans pression commerciale." href="/dashboard/affiliation/kit" />
              <ResourceCard icon="✉️" title="Emails de prospection" text="Relances et messages prêts à adapter selon ton audience." href="/dashboard/affiliation/kit" />
              <ResourceCard icon="📜" title="Paiements & conditions" text="Règles de commission, validation 30 jours et paiement." href="/dashboard/affiliation/payouts" />
            </div>
          </CardLuxe>
        </div>
      </div>
    </div>
  );
}
