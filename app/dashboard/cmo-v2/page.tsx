import CMOWizard from "./components/CMOWizard";

export default function CMOV2Page() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mx-auto mb-3 inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">
            Mode CMO IA
          </p>
          <h1 className="text-3xl font-black text-yellow-400 md:text-4xl">
            CMO IA — mode assisté
          </h1>
          <p className="mt-3 text-sm text-gray-300 md:text-base">
            Réponds à quelques questions pour lancer une action utile, contextualisée et exploitable dans le bon module.
          </p>
        </div>

        <CMOWizard />
      </div>
    </div>
  );
}
