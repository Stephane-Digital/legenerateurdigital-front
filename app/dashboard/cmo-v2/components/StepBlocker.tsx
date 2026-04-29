export default function StepBlocker({ value, onChange, onNext, onBack }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-yellow-400 text-lg font-semibold">
        Qu’est-ce qui te bloque ?
      </h2>

      <textarea
        className="w-full p-3 bg-black border border-yellow-500/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-700 text-gray-300 py-2 rounded-lg"
        >
          Retour
        </button>

        <button
          onClick={onNext}
          className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded-lg"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
