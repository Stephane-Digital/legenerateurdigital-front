import type { CMOStrategy } from "../types";

type StepStrategyProps = {
  strategy: CMOStrategy;
  isLive: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

export default function StepStrategy({ strategy, isLive, onBack, onConfirm }: StepStrategyProps) {
  const rows = [
    ["Cible", strategy.target],
    ["Problème", strategy.pain],
    ["Désir", strategy.desire],
    ["Promesse", strategy.promise],
    ["Angle", strategy.angle],
    ["Mécanisme", strategy.mechanism],
    ["CTA", strategy.cta],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-black text-yellow-400 md:text-2xl">
            Stratégie proposée par ton CMO
          </h2>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            Valide cette stratégie avant d’ouvrir le module choisi.
          </p>
        </div>

        <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${
          isLive
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
            : "border-yellow-400/40 bg-yellow-400/10 text-yellow-200"
        }`}>
          {isLive ? "IA live" : "Fallback sécurisé"}
        </span>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-black/70 p-5 text-sm leading-relaxed text-white md:text-base">
        <div className="space-y-3">
          {rows.map(([label, value]) => (
            <p key={label}>
              <span className="font-black text-yellow-200">{label} : </span>
              <span className="font-semibold text-white">{value}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-slate-700/80 bg-black/30 px-6 py-4 font-black text-white transition hover:border-yellow-400/50 hover:bg-yellow-400/5"
        >
          Retour
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 font-black text-black shadow-[0_14px_35px_rgba(234,179,8,0.22)] transition hover:scale-[1.01] hover:from-yellow-300 hover:to-yellow-400"
        >
          Valider et lancer
        </button>
      </div>
    </div>
  );
}
