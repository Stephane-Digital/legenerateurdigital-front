
"use client";

type Props = {
  title: string;
  subtitle: string;
  moduleLabel: string;
  eventsTracked: number;
  loading?: boolean;
  error?: string | null;
};

export default function AnalyticsHero({
  title,
  subtitle,
  moduleLabel,
  eventsTracked,
  loading = false,
  error = null,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[#8b6a1b]/35 bg-[radial-gradient(circle_at_top_left,rgba(200,166,77,0.2),transparent_30%),linear-gradient(135deg,#141414_0%,#080808_100%)] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.38)]">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c8a64d]">
            {moduleLabel}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d6d6d6] md:text-base">
            {subtitle}
          </p>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[24px] border border-[#7a5c16]/30 bg-[#0d0d0d]/80 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-[#c8a64d]">Événements</p>
            <div className="mt-4 min-h-[36px]">
              {loading ? (
                <div className="h-9 w-20 animate-pulse rounded-2xl bg-[#1b1b1b]" />
              ) : (
                <p className="text-3xl font-semibold text-white">{eventsTracked}</p>
              )}
            </div>
            <p className="mt-3 text-sm text-[#cfcfcf]">Signaux marketing suivis par LGD.</p>
          </div>

          <div className="rounded-[24px] border border-[#7a5c16]/30 bg-[#0d0d0d]/80 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-[#c8a64d]">Positionnement</p>
            <p className="mt-4 text-lg font-semibold text-white">Luxe sombre doré</p>
            <p className="mt-3 text-sm text-[#cfcfcf]">UI alignée avec le design premium validé de LGD.</p>
          </div>

          <div className="col-span-2 rounded-[24px] border border-[#7a5c16]/30 bg-[#0d0d0d]/80 p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-[#c8a64d]">Lecture instantanée</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#1a1a1a]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#6f5313_0%,#c8a64d_48%,#f5df9f_100%)] transition-all duration-700"
                style={{ width: `${Math.max(12, Math.min(100, eventsTracked * 8))}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-[#cfcfcf]">
              La jauge augmente à mesure que le moteur Emailing IA enregistre plus d’activité.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
