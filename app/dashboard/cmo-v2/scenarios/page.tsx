"use client";

import { useRouter } from "next/navigation";

export default function CMOScenariosRemovedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
        <div className="w-full rounded-3xl border border-yellow-500/20 bg-[#0B0B0F] p-6 text-center shadow-[0_0_60px_rgba(234,179,8,0.10)] md:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-2xl">
            ✦
          </div>

          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300/75">
            CMO Dispatch System
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-yellow-300 md:text-4xl">
            Les scénarios CMO ont été retirés
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
            LGD passe maintenant par le CMO Dispatch direct : tu renseignes ton objectif,
            ton blocage et ton contexte, puis le CMO prépare directement le bon module
            sans générer d’étape intermédiaire coûteuse.
          </p>

          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm leading-6 text-white/65">
            <div className="mb-2 font-semibold text-yellow-200">
              Nouveau tunnel actif
            </div>
            <p>
              CMO intelligent → brief stratégique → module prérempli
              (Emailing IA, Coach IA, Lead Engine ou Éditeur intelligent).
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push("/dashboard/cmo-v2")}
              className="rounded-2xl bg-yellow-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
            >
              Ouvrir le CMO Dispatch
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-2xl border border-yellow-500/25 px-6 py-3 text-sm font-semibold text-yellow-100 transition hover:border-yellow-400/50 hover:bg-yellow-500/10"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
