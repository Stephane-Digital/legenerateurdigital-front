import type { CMOModule } from "../types";

type StepModuleProps = {
  value: CMOModule | null;
  onChange: (module: CMOModule) => void;
  onBack: () => void;
  onFinish: () => void;
  loading?: boolean;
};

const modules: Array<{
  id: CMOModule;
  title: string;
  description: string;
}> = [
  {
    id: "email",
    title: "Emailing IA",
    description: "Préparer une campagne contextualisée autour de ton offre et de ton blocage.",
  },
  {
    id: "lead",
    title: "Leads IA",
    description: "Créer une ressource ou une landing page pour capter des prospects qualifiés.",
  },
  {
    id: "editor",
    title: "Éditeur intelligent",
    description: "Créer un post ou carrousel orienté problème, promesse et CTA.",
  },
  {
    id: "coach",
    title: "Coach Alex",
    description: "Transformer le brief en plan d’action clair et priorisé.",
  },
];

export default function StepModule({ value, onChange, onBack, onFinish, loading = false }: StepModuleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-yellow-400 md:text-2xl">
          Quel module veux-tu exploiter ?
        </h2>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          Le CMO prépare le contexte. Le module choisi exécute ensuite l’action.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((item) => {
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-yellow-400 bg-yellow-400/10 shadow-[0_0_30px_rgba(234,179,8,0.12)]"
                  : "border-slate-800 bg-black/30 hover:border-yellow-400/40 hover:bg-yellow-400/5"
              }`}
            >
              <div className="text-lg font-black text-white">{item.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.description}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-2xl border border-slate-700/80 bg-black/30 px-6 py-4 font-black text-white transition hover:border-yellow-400/50 hover:bg-yellow-400/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Retour
        </button>

        <button
          type="button"
          onClick={onFinish}
          disabled={loading}
          className="rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4 font-black text-black shadow-[0_14px_35px_rgba(234,179,8,0.22)] transition hover:scale-[1.01] hover:from-yellow-300 hover:to-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Le CMO analyse…" : "Générer la stratégie"}
        </button>
      </div>
    </div>
  );
}
