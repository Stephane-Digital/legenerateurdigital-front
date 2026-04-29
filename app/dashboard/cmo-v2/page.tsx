export default function CMOV2Page() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl text-yellow-400 font-bold mb-2 text-center">
          CMO IA — mode assisté
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Réponds à quelques questions pour lancer une action réellement utile
        </p>

        <CMOWizard />
      </div>
    </div>
  );
}
