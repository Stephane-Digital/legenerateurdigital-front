"use client";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] px-6 text-white">
      <h1 className="text-gradient mb-10 text-center text-4xl font-extrabold">⚙️ Paramètres</h1>

      <div className="mb-[20px] flex w-full max-w-[900px] justify-center">
        <button className="btn-luxe w-full py-4 text-center">Modifier mes préférences</button>
      </div>

      <div className="card-luxe w-full max-w-[900px] text-center">
        <h2 className="text-gradient mb-4 text-2xl font-semibold">Configuration du compte</h2>
        <p className="mb-2 text-gray-300">
          Personnalisez votre profil et gérez la sécurité de votre compte.
        </p>
        <p className="text-sm text-gray-400">
          Toutes les modifications sont enregistrées automatiquement.
        </p>
      </div>
    </div>
  );
}
