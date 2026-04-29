export default function StepGoal({ value, onChange, onNext }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-yellow-400 text-lg font-semibold">
        Ton objectif aujourd’hui ?
      </h2>

      <textarea
        className="w-full p-3 bg-black border border-yellow-500/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <button
        onClick={onNext}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded-lg transition"
      >
        Continuer
      </button>
    </div>
  );
}
