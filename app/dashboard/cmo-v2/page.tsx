import CMOWizard from "./components/CMOWizard";

export default function CMOV2Page() {
  return (
   <main className="min-h-screen bg-[#050509] px-5 pt-24 pb-10 text-white md:px-8">
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-10">
        <div className="max-w-3xl text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300/70">
            Le Générateur Digital
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-yellow-300 md:text-5xl">
            CMO IA Dispatch System
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
            Le CMO ne remplace plus les modules. Il analyse ton objectif, identifie le blocage, construit une offre claire,
            choisit l’angle, puis envoie un payload structuré au module adapté.
          </p>
        </div>

        <div className="w-full max-w-3xl">
          <CMOWizard />
        </div>
      </section>
    </main>
  );
}
