type Props = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function StepBlocker({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-yellow-400">Qu’est-ce qui te bloque ?</h2>
        <p className="mt-2 text-sm text-gray-400">
          Le CMO utilisera ce blocage pour préparer un brief vraiment utile au module choisi.
        </p>
      </div>

      <textarea
        className="min-h-[140px] w-full rounded-2xl border border-yellow-500/20 bg-black/70 p-4 text-sm font-semibold text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Exemple : je ne sais pas rédiger une campagne emailing qui vend sans sonner trop agressif."
      />

      <div className="grid gap-3 md:grid-cols-2">
        <button
          className="rounded-xl border border-white/15 px-5 py-3 font-bold text-gray-200 transition hover:border-yellow-400/50 hover:text-yellow-300"
          onClick={onBack}
          type="button"
        >
          Retour
        </button>
        <button
          className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
          onClick={onNext}
          type="button"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
