import CMOWizard from "./components/CMOWizard";

export default function CMOV2Page() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl text-yellow-400 mb-4">
        CMO IA — mode assisté
      </h1>
      <CMOWizard />
    </div>
  );
}
