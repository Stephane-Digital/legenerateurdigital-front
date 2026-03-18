
"use client";

type Props = {
  contacts: number;
  campaigns: number;
  sales: number;
  activationRate: number;
  conversionRate: number;
  salesPerCampaign: number;
  loading?: boolean;
};

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#7a5c16]/20 bg-[#0d0d0d]/80 px-4 py-3">
      <span className="text-sm text-[#dddddd]">{label}</span>
      <span className="text-sm font-semibold text-[#f4d98f]">{value}</span>
    </div>
  );
}

export default function AnalyticsFunnelCard({
  contacts,
  campaigns,
  sales,
  activationRate,
  conversionRate,
  salesPerCampaign,
  loading = false,
}: Props) {
  return (
    <section className="rounded-[28px] border border-[#7a5c16]/35 bg-[linear-gradient(180deg,#111111_0%,#090909_100%)] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c8a64d]">
        Tunnel marketing
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">
        Rendement actuel de l’automation
      </h2>

      <div className="mt-6 space-y-4">
        <div className="rounded-[24px] border border-[#7a5c16]/25 bg-[#0c0c0c] p-4">
          <div className="flex items-center justify-between text-sm text-[#ececec]">
            <span>Leads capturés</span>
            <span className="font-semibold text-[#f4d98f]">{loading ? "..." : contacts}</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#191919]">
            <div className="h-full w-full rounded-full bg-[linear-gradient(90deg,#70530f_0%,#b99232_60%,#f3d68a_100%)]" />
          </div>
        </div>

        <div className="rounded-[24px] border border-[#7a5c16]/20 bg-[#0b0b0b] px-5 py-4">
          <div className="flex items-center justify-between text-sm text-[#ececec]">
            <span>Campagnes lancées</span>
            <span className="font-semibold text-[#f4d98f]">{loading ? "..." : campaigns}</span>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#7a5c16]/15 bg-[#0a0a0a] px-5 py-4">
          <div className="flex items-center justify-between text-sm text-[#ececec]">
            <span>Ventes générées</span>
            <span className="font-semibold text-[#f4d98f]">{loading ? "..." : sales}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <MetricRow label="Taux d’activation" value={`${activationRate}%`} />
        <MetricRow label="Taux de conversion" value={`${conversionRate}%`} />
        <MetricRow label="Ventes par campagne" value={String(salesPerCampaign)} />
      </div>
    </section>
  );
}
