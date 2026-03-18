export const metadata = {
  title: "Politique de confidentialité — Le Générateur Digital",
  description:
    "Politique de confidentialité (LGD) — connexion réseaux sociaux, publication programmée, données et sécurité.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-yellow-500/20 bg-black/40 p-8 shadow-[0_0_0_1px_rgba(255,184,0,0.08),0_10px_40px_rgba(0,0,0,0.6)]">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Politique de confidentialité{" "}
              <span className="text-[#ffb800]">— LGD</span>
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>

          <section className="space-y-5 text-white/85 leading-relaxed">
            <p>
              <span className="font-semibold text-white">
                Le Générateur Digital (LGD)
              </span>{" "}
              est une plateforme SaaS permettant de créer, stocker, programmer et
              publier du contenu marketing, notamment sur les réseaux sociaux.
            </p>

            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-5">
              <p className="font-semibold text-white">
                Données traitées (réseaux sociaux)
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-white/80">
                <li>
                  Identifiant de compte et informations de connexion (via OAuth).
                </li>
                <li>
                  Jetons d’accès (<span className="italic">access tokens</span>)
                  nécessaires à la publication.
                </li>
                <li>
                  Nom/ID de pages ou comptes professionnels, selon le réseau.
                </li>
                <li>Contenu de publication (texte, médias, métadonnées).</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-5">
              <p className="font-semibold text-white">Finalité</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-white/80">
                <li>Permettre à l’utilisateur de connecter ses réseaux.</li>
                <li>Programmer des publications dans le Planner LGD.</li>
                <li>Publier automatiquement au moment prévu.</li>
                <li>Afficher un historique et des logs de publication.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-5">
              <p className="font-semibold text-white">Conservation & sécurité</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-white/80">
                <li>
                  Les jetons sont stockés de manière sécurisée et utilisés
                  uniquement pour exécuter les actions demandées par
                  l’utilisateur.
                </li>
                <li>
                  L’utilisateur peut déconnecter un réseau à tout moment, ce qui
                  supprime les données d’authentification correspondantes.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-5">
              <p className="font-semibold text-white">Contact</p>
              <p className="mt-2 text-white/80">
                Pour toute question (confidentialité, données, suppression),
                contactez :{" "}
                <span className="text-[#ffb800] font-semibold">
                  contact@profitsduweb.com
                </span>
              </p>
            </div>

            <p className="text-xs text-white/50">
              Cette page est fournie pour satisfaire les exigences de conformité
              des plateformes partenaires (ex : Meta/Facebook) et informer les
              utilisateurs de façon claire.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
