import type { CMOModule } from "../types";

export default function StepModule({
  value,
  onChange,
  onBack,
  onFinish,
}: {
  value: CMOModule | null;
  onChange: (m: CMOModule) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const options: CMOModule[] = ["email", "lead", "editor", "coach"];

  return (
    <div className="space-y-4">
      <h2 className="text-xl text-yellow-400">
        Sur quoi veux-tu travailler maintenant ?
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {options.map((m) => (
          <button
            key={m}
            className={`p-3 border rounded ${
              value === m ? "border-yellow-400" : "border-gray-700"
            }`}
            onClick={() => onChange(m)}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack}>Retour</button>
        <button className="btn-primary" onClick={onFinish}>
          Lancer
        </button>
      </div>
    </div>
  );
}
