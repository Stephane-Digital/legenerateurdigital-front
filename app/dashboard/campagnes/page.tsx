"use client";

export default function CampagnesPage() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center text-white bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] px-6">
      <h1 className="text-4xl font-extrabold mb-10 text-gradient text-center">
        📣 Campagnes
      </h1>

      <div className="w-full max-w-[400px] mb-[20px] flex justify-center">
        <button className="btn-luxe w-full py-4 text-center">
          + Créer une campagne
        </button>
      </div>

      <div className="w-full max-w-[900px] card-luxe text-center">
        <h2 className="text-2xl font-semibold text-gradient mb-4">
          Gestion des campagnes
        </h2>
        <p className="text-gray-300 mb-2">
          Créez, suivez et ajustez vos campagnes marketing depuis un seul endroit.
        </p>
        <p className="text-gray-400 text-sm">
          Visualisez la performance de chaque campagne et améliorez vos résultats.
        </p>
      </div>
    </div>
  );
}
