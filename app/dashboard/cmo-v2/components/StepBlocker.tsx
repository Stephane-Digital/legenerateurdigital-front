type StepBlockerProps = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function StepBlocker({ value, onChange, onNext, onBack }: StepBlockerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-yellow-400 md:text-2xl">
          Qu’est-ce qui te bloque ?
        </h2>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          Le CMO utilisera ce blocage pour préparer un brief vraiment utile au module choisi.
        </p>
      </div>

      <textarea
        className="min-h-[140px] w-full rounded-2xl border border-yellow-500/25 bg-black/70 p-5 text-base font-semibold leading-relaxed text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Exemple : je veux vendre sans paraître agressif…"
      />

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
          onClick={onNext}
          className="rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 font-black text-black shadow-[0_14px_35px_rgba(234,179,8,0.22)] transition hover:scale-[1.01] hover:from-yellow-300 hover:to-yellow-400"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
