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
import Link from "next/link";

export default function RegisterPage() {
  const [activeUsers, setActiveUsers] = useState(21);

  // Animation du compteur : +/- 1 à 3 toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const variation = Math.floor(Math.random() * 3) * (Math.random() > 0.5 ? 1 : -1);
        const next = prev + variation;
        return Math.max(18, Math.min(24, next));
      });
    }, 2000);
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a2230] to-[#0f2f45] text-white px-4">
      <div className="w-full max-w-md bg-[#0d2a3b]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-cyan-600">
        <h1 className="text-2xl font-bold text-center mb-2">Créer un compte</h1>
        <p className="text-center text-sm text-cyan-400 mb-8">
          🔥 {activeUsers} utilisateurs actifs actuellement
        </p>

        <form className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Nom complet</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 rounded-md bg-[#102f45] border border-cyan-700 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>

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
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-2 rounded-md font-semibold text-white hover:opacity-90 transition-all duration-200"
          >
            S’inscrire
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}

