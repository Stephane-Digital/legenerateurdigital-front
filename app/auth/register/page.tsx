"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);

  // ✅ Compteur d'utilisateurs actifs (aléatoire)
  useEffect(() => {
    const min = 120;
    const max = 380;
    const randomCount = Math.floor(Math.random() * (max - min + 1)) + min;
    setActiveUsers(randomCount);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ fullName, email, password });
    alert("Compte créé avec succès !");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0d2a3b] to-[#163b52] px-4">
      <div className="w-full max-w-md bg-[#102f44]/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-[#1f4a66] text-gray-100">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">
          Créer un compte
        </h1>

        {/* 🧮 Compteur dynamique */}
        <p className="text-center text-sm text-[#6dd5ed] mb-8">
          🔥 {activeUsers} utilisateurs actifs actuellement
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm mb-2 font-medium">
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#163b52] border border-[#285a73] text-gray-200 focus:ring-2 focus:ring-[#6dd5ed] focus:outline-none"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-2 font-medium">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#163b52] border border-[#285a73] text-gray-200 focus:ring-2 focus:ring-[#6dd5ed] focus:outline-none"
              placeholder="exemple@mail.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2 font-medium">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#163b52] border border-[#285a73] text-gray-200 focus:ring-2 focus:ring-[#6dd5ed] focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#6dd5ed] to-[#2193b0] text-white font-semibold rounded-lg hover:scale-[1.02] transition-transform"
          >
            S’inscrire
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Déjà un compte ?{" "}
          <Link
            href="/auth/login"
            className="text-[#6dd5ed] hover:text-[#a0e6f9] transition"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
