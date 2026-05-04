export default function StepBlocker({
  value,
  onChange,
  situation,
  onSituationChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  situation: string;
  onSituationChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-yellow-300">Qu’est-ce qui bloque vraiment ?</h2>
        <p className="mt-2 text-sm text-white/55">
          Le blocage permet au CMO de construire une promesse, un angle et un CTA utiles, pas une stratégie générique.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300/75">
          Blocage principal
        </label>
        <textarea
          className="min-h-[140px] w-full rounded-2xl border border-yellow-500/20 bg-black/45 p-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/60"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex : Ma cible pense qu’elle doit être copywriter pour vendre par email, donc elle repousse toujours le passage à l’action."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-yellow-300/75">
          Situation actuelle
        </label>
        <p className="text-xs leading-5 text-white/45">
          Ajoute le contexte réel : niveau, ce qui a déjà été essayé, fatigue, doutes, offre, audience, marché, peur principale.
        </p>
        <textarea
          className="min-h-[170px] w-full rounded-2xl border border-yellow-500/20 bg-black/45 p-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-yellow-400/60"
          value={situation}
          onChange={(e) => onSituationChange(e.target.value)}
          placeholder="Ex : Je me suis lancé dans le marketing digital, MRR et affiliation. J’ai déjà testé plusieurs outils et formations, mais je suis à l’arrêt total. Mes contenus ne mènent à rien, mes emails ne sont pas alignés, et j’ai peur de repartir encore sur un outil que je n’utiliserai pas."
        />
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
          onClick={onNext}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
