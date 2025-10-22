"use client";

export default function OverviewPage() {
  return (
    <section className="mx-auto w-full max-w-3xl my-[10px]">
      {/* Titre de section */}
      <h2 className="text-center text-3xl font-extrabold text-white mb-[20px]">
        Vue d’ensemble
      </h2>

      {/* Bloc des cartes – 15px d’espace entre elles */}
      <div className="flex flex-col gap-[15px] scale-[1.3] origin-top transition-transform duration-300">
        {/* Carte 1 */}
        <div className="flex flex-col items-center justify-center text-center rounded-[10px] bg-[#0d2a3b]/90 backdrop-blur-md shadow-2xl py-8 px-[50px] border border-cyan-700 hover:scale-[1.02] transition-transform duration-200">
          <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ffb800] to-[#ff6b00]">
            Automatisations actives
          </h3>
          <p className="text-sm text-cyan-200 mt-2">3 workflows en cours</p>
        </div>

        {/* Carte 2 */}
        <div className="flex flex-col items-center justify-center text-center rounded-[10px] bg-[#0d2a3b]/90 backdrop-blur-md shadow-2xl py-8 px-[50px] border border-cyan-700 hover:scale-[1.02] transition-transform duration-200">
          <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ffb800] to-[#ff6b00]">
            Nouveaux clients
          </h3>
          <p className="text-sm text-cyan-200 mt-2">+24 cette semaine 🚀</p>
        </div>

        {/* Carte 3 */}
        <div className="flex flex-col items-center justify-center text-center rounded-[10px] bg-[#0d2a3b]/90 backdrop-blur-md shadow-2xl py-8 px-[50px] border border-cyan-700 hover:scale-[1.02] transition-transform duration-200">
          <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ffb800] to-[#ff6b00]">
            Campagnes
          </h3>
          <p className="text-sm text-cyan-200 mt-2">2 actives – 1 en attente</p>
        </div>
      </div>
    </section>
  );
}
