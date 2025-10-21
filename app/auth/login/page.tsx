"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a2230] to-[#0f2f45] text-white px-4">
      <div className="w-full max-w-md bg-[#0d2a3b]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-cyan-600">
        <h1 className="text-2xl font-bold text-center mb-2">Connexion</h1>
        <p className="text-center text-sm text-cyan-400 mb-8">
          🔐 Accédez à votre espace personnel
        </p>

        <form className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Adresse email</label>
            <input
              type="email"
              placeholder="exemple@email.com"
              className="w-full px-3 py-2 rounded-md bg-[#102f45] border border-cyan-700 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Mot de passe</label>
            <input
              type="password"
              placeholder="******"
              className="w-full px-3 py-2 rounded-md bg-[#102f45] border border-cyan-700 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-2 rounded-md font-semibold text-white hover:opacity-90 transition-all duration-200"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            S’inscrire
          </Link>
        </p>
      </div>
    </main>
  );
}
