type LeadEngineBlockProps = {
  onDiscover: () => void;
  ctaLabel?: string;
  hideSoonBadge?: boolean;
};

function SoonBadge() {
  return (
    <div className="inline-flex items-center rounded-full border border-yellow-600/20 bg-yellow-500/10 px-3 py-1 text-[11px] font-medium text-yellow-200">
      Fonction révolutionnaire — bientôt disponible
    </div>
  );
}

export default function LeadEngineBlock({
  onDiscover,
  ctaLabel = "Découvrir",
  hideSoonBadge = false,
}: LeadEngineBlockProps) {
  return (
    <div className="rounded-[28px] border border-yellow-600/20 bg-[#0b0b0b] p-6 shadow-[0_0_30px_rgba(255,184,0,0.08)]">
      <div className="text-center">
        <div className="text-lg font-bold text-yellow-300">Générateur de Leads IA</div>
        <p className="mt-2 text-sm text-white/70">
          Transforme ton contenu en machine à capturer des emails.
        </p>

        {!hideSoonBadge && (
          <div className="mt-3">
            <SoonBadge />
          </div>
        )}

        <button
          type="button"
          onClick={onDiscover}
          className="mt-5 w-full rounded-2xl bg-[#ffb800] px-5 py-3 font-bold text-black"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
