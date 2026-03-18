"use client";

type Props = {
  type?: "email" | "sequences" | "social" | string;
  title?: string;
  description?: string;
};

export default function CampaignAIGenerator({
  type = "campaign",
  title = "Générateur IA — Campagnes",
  description = "Ce module sera branché sur les endpoints IA. (Stub de build Vercel)",
}: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-6 shadow-[0_0_30px_rgba(255,184,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-white">
              {title}
            </h1>
            <p className="mt-2 text-yellow-200/80 text-sm md:text-base">
              {description}
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-4 py-2 text-yellow-200 text-sm">
            {String(type).toUpperCase()}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-yellow-500/15 bg-black/30 p-4">
          <p className="text-white/80 text-sm leading-relaxed">
            ✅ Build débloqué. Prochaine étape : brancher la génération IA + templates
            + sauvegarde dans l’historique / campagnes.
          </p>
        </div>
      </div>
    </div>
  );
}
