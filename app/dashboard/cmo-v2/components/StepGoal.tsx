type Props = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

export default function StepGoal({ value, onChange, onNext }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-yellow-400">Ton objectif aujourd’hui ?</h2>
        <p className="mt-2 text-sm text-gray-400">
          Exemple : “Je veux vendre ma formation Code Liberté avec une campagne emailing.”
        </p>
      </div>

      <textarea
        className="min-h-[140px] w-full rounded-2xl border border-yellow-500/20 bg-black/70 p-4 text-sm font-semibold text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Décris ton objectif, ton offre, ton canal ou ce que tu veux obtenir."
      />

      <button
        className="w-full rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300"
        onClick={onNext}
        type="button"
      >
        Continuer
      </button>
    </div>
  );
}
