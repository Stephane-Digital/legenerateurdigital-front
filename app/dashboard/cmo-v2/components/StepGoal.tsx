type StepGoalProps = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

export default function StepGoal({ value, onChange, onNext }: StepGoalProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-yellow-400 md:text-2xl">
          Ton objectif aujourd’hui ?
        </h2>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          Exemple : “Je veux vendre ma formation avec une campagne emailing.”
        </p>
      </div>

      <textarea
        className="min-h-[140px] w-full rounded-2xl border border-yellow-500/25 bg-black/70 p-5 text-base font-semibold leading-relaxed text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Décris ce que tu veux obtenir concrètement aujourd’hui…"
      />

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 font-black text-black shadow-[0_14px_35px_rgba(234,179,8,0.22)] transition hover:scale-[1.01] hover:from-yellow-300 hover:to-yellow-400"
      >
        Continuer
      </button>
    </div>
  );
}
