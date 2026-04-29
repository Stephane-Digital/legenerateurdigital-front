export default function StepStrategy({
  strategy,
  onBack,
  onConfirm,
}: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-yellow-400 text-lg font-semibold">
        Stratégie proposée par ton CMO
      </h2>

      <div className="bg-black border border-yellow-500/20 rounded-xl p-4 space-y-2 text-sm">
        <p><b>Cible :</b> {strategy.target}</p>
        <p><b>Problème :</b> {strategy.pain}</p>
        <p><b>Désir :</b> {strategy.desire}</p>
        <p><b>Promesse :</b> {strategy.promise}</p>
        <p><b>Angle :</b> {strategy.angle}</p>
        <p><b>Mécanisme :</b> {strategy.mechanism}</p>
        <p><b>CTA :</b> {strategy.cta}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-700 text-gray-300 py-2 rounded-lg"
        >
          Retour
        </button>

        <button
          onClick={onConfirm}
          className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded-lg font-semibold"
        >
          Valider et lancer
        </button>
      </div>
    </div>
  );
}
