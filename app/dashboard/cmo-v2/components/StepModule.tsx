import type { CMOModule } from "../types";

const options: Array<{
  value: CMOModule;
  label: string;
  description: string;
}> = [
  {
    value: "email",
    label: "Emailing IA",
    description: "Séquence, offre, objections, CTA.",
  },
  {
    value: "lead",
    label: "Lead Engine",
    description: "Lead magnet, landing, promesse de capture.",
  },
  {
    value: "editor",
    label: "Éditeur intelligent",
    description: "Post, carrousel, angle créatif, caption.",
  },
  {
    value: "coach",
    label: "Coach IA",
    description: "Plan d’action, clarification, priorités.",
  },
];

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
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-yellow-300">Vers quel module dispatcher ?</h2>
        <p className="mt-2 text-sm text-white/55">
          Le CMO ne génère pas le contenu final : il prépare le meilleur brief pour le module choisi.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className={`rounded-2xl border p-4 text-left transition ${
              value === option.value
                ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_26px_rgba(234,179,8,0.12)]"
                : "border-white/10 bg-white/[0.03] hover:border-yellow-400/35"
            }`}
            onClick={() => onChange(option.value)}
          >
            <div className="text-sm font-bold text-yellow-200">{option.label}</div>
            <div className="mt-1 text-xs text-white/50">{option.description}</div>
          </button>
        ))}
      </div>

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
          onClick={onFinish}
        >
          Analyser et préparer le dispatch
        </button>
      </div>
    </div>
  );
}
