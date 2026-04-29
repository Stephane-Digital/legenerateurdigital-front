export default function StepBlocker({
  value,
  onChange,
  onNext,
  onBack,
}: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl text-yellow-400">Qu’est-ce qui te bloque ?</h2>
      <textarea
        className="w-full p-3 bg-black border border-yellow-500/20 rounded"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={onBack}>Retour</button>
        <button className="btn-primary" onClick={onNext}>
          Continuer
        </button>
      </div>
    </div>
  );
}
