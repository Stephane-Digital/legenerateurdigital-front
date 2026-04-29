export default function StepBlocker({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-yellow-300">Qu’est-ce qui bloque vraiment ?</h2>
        <p className="mt-2 text-sm text-white/55">
          Le blocage permet au CMO de construire une promesse, un angle et un CTA utiles, pas une stratégie générique.
        </p>
      </div>

      <textarea
        className="min-h-[150px] w-full rounded-2xl border border-yellow-500/20 bg-black/45 p-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/60"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex : Ma cible pense qu’elle doit être copywriter pour vendre par email, donc elle repousse toujours le passage à l’action."
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-yellow-400/40 hover:text-yellow-200"
        >
          Retour
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
          onClick={onNext}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
