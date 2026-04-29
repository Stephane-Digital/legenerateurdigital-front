import type { CMOModule } from "../types";

export default function StepModule({ value, onChange, onBack, onFinish }: any) {
  const modules: CMOModule[] = ["email", "lead", "editor", "coach"];

  return (
    <div className="space-y-4">
      <h2 className="text-yellow-400 text-lg font-semibold">
        Sur quoi veux-tu travailler ?
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {modules.map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`p-3 rounded-lg border ${
              value === m
                ? "border-yellow-400 bg-yellow-500/10"
                : "border-gray-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-700 text-gray-300 py-2 rounded-lg"
        >
          Retour
        </button>

        <button
          onClick={onFinish}
          className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded-lg"
        >
          Lancer
        </button>
      </div>
    </div>
  );
}
