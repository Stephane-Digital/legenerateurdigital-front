export const metadata = {
  title: "Conditions d’utilisation — Le Générateur Digital",
  description: "Conditions d’utilisation (LGD).",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-yellow-500/20 bg-black/40 p-8 shadow-[0_0_0_1px_rgba(255,184,0,0.08),0_10px_40px_rgba(0,0,0,0.6)]">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Conditions d’utilisation{" "}
              <span className="text-[#ffb800]">— LGD</span>
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>

          <section className="space-y-5 text-white/85 leading-relaxed">
            <p>
              LGD fournit des outils de création, stockage, programmation et
              publication de contenus marketing. En utilisant LGD, vous vous
              engagez à respecter les règles des plateformes (Meta, TikTok,
              LinkedIn, etc.) et à ne pas publier de contenu illégal ou
              interdit.
            </p>

            <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-5">
              <p className="font-semibold text-white">Responsabilité</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-white/80">
                <li>
                  Vous êtes responsable du contenu publié et des autorisations
                  associées.
                </li>
                <li>
                  LGD agit comme outil technique d’automatisation à votre
                  demande.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-5">
              <p className="font-semibold text-white">Contact</p>
              <p className="mt-2 text-white/80">
                Assistance :{" "}
                <span className="text-[#ffb800] font-semibold">
                  contact@profitsduweb.com
                </span>
              </p>
            </div>

            <p className="text-xs text-white/50">
              Version simplifiée pour usage SaaS / conformité partenaires.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
