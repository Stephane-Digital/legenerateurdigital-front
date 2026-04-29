import type { CMOModule } from "../types";

type Props = {
  value: CMOModule | null;
  onChange: (module: CMOModule) => void;
  onBack: () => void;
  onFinish: () => void;
};

const modules: Array<{ key: CMOModule; label: string; description: string }> = [
  {
    key: "email",
    label: "Emailing IA",
    description: "Préparer une campagne contextualisée autour de ton offre et de ton blocage.",
  },
  {
    key: "lead",
    label: "Leads IA",
    description: "Créer une ressource ou une landing page pour capter des prospects qualifiés.",
  },
  {
    key: "editor",
    label: "Éditeur intelligent",
    description: "Créer un post ou carrousel orienté problème, promesse et CTA.",
  },
  {
    key: "coach",
    label: "Coach Alex",
    description: "Transformer le brief en plan d’action clair et priorisé.",
  },
];

export default function StepModule({ value, onChange, onBack, onFinish }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-yellow-400">Quel module veux-tu exploiter ?</h2>
        <p className="mt-2 text-sm text-gray-400">
          Le CMO prépare le contexte. Le module choisi exécute ensuite l’action.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {modules.map((item) => (
          <button
            key={item.key}
            className={`rounded-2xl border p-4 text-left transition ${
              value === item.key
                ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_30px_rgba(250,204,21,0.12)]"
                : "border-white/10 bg-black/40 hover:border-yellow-400/40"
            }`}
            onClick={() => onChange(item.key)}
            type="button"
          >
            <div className="font-black text-white">{item.label}</div>
            <div className="mt-2 text-xs leading-relaxed text-gray-400">{item.description}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          className="rounded-xl border border-white/15 px-5 py-3 font-bold text-gray-200 transition hover:border-yellow-400/50 hover:text-yellow-300"
          onClick={onBack}
          type="button"
        >
          Retour
        </button>
        <button
          className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!value}
          onClick={onFinish}
          type="button"
        >
          Lancer dans le module
        </button>
      </div>
    </div>
  );
}
