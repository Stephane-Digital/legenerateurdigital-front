import type { CMODispatchResult } from "../types";

export default function StepStrategy({
  dispatch,
  onBack,
  onConfirm,
  loading,
}: {
  dispatch: CMODispatchResult;
  onBack: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const context = dispatch.context;
  const recommended = dispatch.decision.recommended_module;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300/70">
          CMO Dispatch System
        </div>
        <h2 className="mt-2 text-xl font-semibold text-yellow-300">
          Brief stratégique prêt pour le module
        </h2>
        <p className="mt-2 text-sm text-white/55">
          Le CMO a analysé le contexte. Il ne rédige pas le contenu final : il transmet un payload propre au module.
        </p>
      </div>

      <div className="rounded-2xl border border-yellow-500/20 bg-black/45 p-4 text-sm text-white/75">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-yellow-300/75">Diagnostic</div>
        <p className="leading-6">{dispatch.diagnostic}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Info label="Module recommandé" value={recommended} />
        <Info label="Action prioritaire" value={dispatch.decision.priority_action} />
        <Info label="Offre" value={context.offer} />
        <Info label="Cible" value={context.audience} />
        <Info label="Angle" value={context.angle} />
        <Info label="Promesse" value={context.promise} />
        <Info label="Objection" value={context.objection || "À préciser par le module"} />
        <Info label="CTA" value={context.cta} />
      </div>

      {dispatch.assumptions?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Hypothèses utilisées</div>
          <ul className="space-y-1 text-sm text-white/60">
            {dispatch.assumptions.map((item, index) => (
              <li key={`${item}-${index}`}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-yellow-400/40 hover:text-yellow-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Retour
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Préparation..." : "Valider et ouvrir le module"}
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">{label}</div>
      <div className="mt-2 text-sm leading-5 text-white/80">{value}</div>
    </div>
  );
}
