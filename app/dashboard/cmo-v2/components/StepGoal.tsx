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
    <div className="space-y-4">
      <h2 className="text-xl text-yellow-400">Ton objectif aujourd’hui ?</h2>
      <textarea
        className="w-full p-3 bg-black border border-yellow-500/20 rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="btn-primary" onClick={onNext}>
        Continuer
      </button>
    </div>
  );
}
