export default function StepGoal({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-yellow-300">Ton objectif aujourd’hui ?</h2>
        <p className="mt-2 text-sm text-white/55">
          Décris ce que tu veux obtenir. Le CMO va ensuite analyser, cadrer et dispatcher vers le bon module.
        </p>
      </div>

      <textarea
        className="min-h-[150px] w-full rounded-2xl border border-yellow-500/20 bg-black/45 p-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/60"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex : Je veux vendre ma formation emailing à des débutants qui n’arrivent pas à écrire des emails qui convertissent."
      />

      <button
        type="button"
        className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
        onClick={onNext}
      >
        Continuer
      </button>
    </div>
  );
}
