"use client";

export default function SettingsPage() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white px-6">
      <h1 className="text-4xl font-extrabold mb-10 text-gradient text-center">
        ⚙️ Paramètres
      </h1>

      <div className="w-full max-w-[900px] mb-[20px] flex justify-center">
        <button className="btn-luxe w-full py-4 text-center">
          Modifier mes préférences
        </button>
      </div>

      <div className="w-full max-w-[900px] card-luxe text-center">
        <h2 className="text-2xl font-semibold text-gradient mb-4">
          Configuration du compte
        </h2>
        <p className="text-gray-300 mb-2">
          Personnalisez votre profil et gérez la sécurité de votre compte.
        </p>
        <p className="text-gray-400 text-sm">
          Toutes les modifications sont enregistrées automatiquement.
        </p>
      </div>
    </div>
  );
}
