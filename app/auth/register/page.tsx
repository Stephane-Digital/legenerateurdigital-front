"use client";

import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [activeUsers, setActiveUsers] = useState(0);

  // --- compteur animé ---
  useEffect(() => {
    let start = 0;
    const end = 18; // nombre cible
    const duration = 2000;
    const step = Math.ceil(duration / end);
    const interval = setInterval(() => {
      start += 1;
      setActiveUsers(start);
      if (start >= end) clearInterval(interval);
    }, step);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b1a2f] to-[#0e223d]">
      <div className="card w-full max-w-md mx-4 text-center animate-fade-in">
        <h1 className="text-2xl font-bold mb-4 text-white">Créer un compte</h1>
        <p className="text-gray-300 mb-6">
          <span className="text-orange-400 text-lg">🔥</span>{" "}
          {activeUsers} utilisateurs actifs actuellement
        </p>

        <form className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-orange-400 focus:ring-0"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              placeholder="exemple@email.com"
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-orange-400 focus:ring-0"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:border-orange-400 focus:ring-0"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition-all duration-200"
          >
            S'inscrire
          </button>
        </form>

        <p className="mt-6 text-gray-300 text-sm">
          Déjà un compte ?{" "}
          <a href="/auth/login" className="text-orange-400 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}

