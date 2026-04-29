import CMOWizard from "./components/CMOWizard";

export default function CMOV2Page() {
  return (
    <main className="min-h-[calc(100vh-120px)] px-6 py-12 text-white md:py-16">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 w-fit rounded-full border border-yellow-400/35 bg-yellow-400/10 px-5 py-1 text-xs font-black uppercase tracking-[0.26em] text-yellow-300">
            Mode CMO IA
          </div>

          <h1 className="text-4xl font-black tracking-tight text-yellow-400 md:text-5xl">
            CMO IA — mode assisté
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
            Réponds à quelques questions pour lancer une action utile, contextualisée et exploitable dans le bon module.
          </p>
        </div>

        <div className="w-full max-w-3xl">
          <CMOWizard />
        </div>
      </section>
    </main>
  );
}
