export const metadata = {
  title: "Suppression des données — Le Générateur Digital",
  description:
    "Instructions de suppression des données utilisateur (LGD) liées aux réseaux sociaux.",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-yellow-500/20 bg-black/40 p-8 shadow-[0_0_0_1px_rgba(255,184,0,0.08),0_10px_40px_rgba(0,0,0,0.6)]">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              Suppression des données{" "}
              <span className="text-[#ffb800]">— LGD</span>
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Instructions pour supprimer vos données liées aux réseaux sociaux.
            </p>
          </div>

          <section className="space-y-6 text-white/85 leading-relaxed">
            <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-5">
              <p className="font-semibold text-white">
                Méthode simple (recommandée)
              </p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/80">
                <li>Connectez-vous à LGD.</li>
                <li>
                  Allez dans <span className="text-white">Réseaux sociaux</span>{" "}
                  (ou Paramètres → Réseaux sociaux).
                </li>
                <li>
                  Cliquez sur <span className="text-white">Déconnecter</span>{" "}
                  pour le réseau concerné (Facebook, Instagram, etc.).
                </li>
              </ol>
              <p className="mt-3 text-white/75">
                Cette action supprime les jetons d’accès et informations de
                connexion associées au réseau déconnecté.
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-500/15 bg-black/30 p-5">
              <p className="font-semibold text-white">Alternative par email</p>
              <p className="mt-2 text-white/80">
                Si vous ne pouvez pas accéder à votre compte LGD, envoyez un
                email à{" "}
                <span className="text-[#ffb800] font-semibold">
                  contact@profitsduweb.com
                </span>{" "}
                avec l’objet :
              </p>
              <div className="mt-3 rounded-xl border border-yellow-500/15 bg-black/40 px-4 py-3 font-mono text-sm text-white/80">
                Suppression données Facebook
              </div>
              <p className="mt-3 text-white/75">
                Merci d’indiquer l’email utilisé sur LGD afin que nous puissions
                identifier le compte.
              </p>
            </div>

            <p className="text-xs text-white/50">
              Cette page est destinée à satisfaire les exigences de suppression
              des données utilisateur des plateformes partenaires (ex : Meta).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
