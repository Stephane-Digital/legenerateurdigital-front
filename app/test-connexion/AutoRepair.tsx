"use client";

export function AutoRepair({ issueType }: { issueType: string }) {
  const getCommand = () => {
    switch (issueType) {
      case "CORS":
        return `Ajoute "http://localhost:3000" dans ta variable CORS_ORIGINS du fichier backend/.env, puis redémarre le backend avec run_local.ps1`;
      case "URL":
        return `Vérifie la variable NEXT_PUBLIC_API_URL dans frontend/.env.local (doit être: http://127.0.0.1:8000)`;
      case "BACKEND":
        return `Démarre ton backend avec: .\\run_local.ps1`;
      default:
        return `Aucune correction automatique disponible pour ce type d’erreur.`;
    }
  };

  return (
    <div className="mt-3 p-3 bg-neutral-800 border border-yellow-700/40 rounded-xl text-sm text-gray-300">
      <p className="mb-2 text-[#ffb800] font-semibold">💡 Suggestion de réparation</p>
      <p>{getCommand()}</p>
    </div>
  );
}
