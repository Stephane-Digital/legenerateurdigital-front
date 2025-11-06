"use client";

export default function OverviewPage() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white px-6">
      {/* --- TITRE PRINCIPAL --- */}
      <h1 className="text-4xl font-extrabold mb-10 text-gradient text-center">
        📊 Vue d’ensemble
      </h1>

      {/* --- BOUTON PRINCIPAL --- */}
      <div className="w-full max-w-[400px] mb-[20px] flex justify-center">
        <button className="btn-luxe w-full py-4 text-center">
          + Nouvelle campagne
        </button>
      </div>

      {/* --- BLOC PRINCIPAL --- */}
      <div className="w-full max-w-[900px] card-luxe text-center">
        <h2 className="text-2xl font-semibold text-gradient mb-4">
          Résumé des performances
        </h2>

        <p className="text-gray-300 mb-2">
          Visualisez l’impact de vos actions marketing et des campagnes automatisées.
        </p>

        <p className="text-gray-400 text-sm">
          Suivez vos statistiques clés et accédez à une vision claire de votre progression.
        </p>
      </div>
    </div>
  );
}