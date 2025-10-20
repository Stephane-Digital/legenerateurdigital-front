"use client";

import React, { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://legenerateurdigital-backend.onrender.com/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert("✅ Inscription réussie !");
        setFormData({ name: "", email: "", password: "" });
      } else {
        const errorData = await response.json().catch(() => null);
        alert(
          errorData?.message ||
            "❌ Échec de l’inscription. Vérifie tes informations ou réessaie plus tard."
        );
      }
    } catch (error) {
      console.error("Erreur d’inscription :", error);
      alert("❌ Impossible de contacter le serveur. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0d2a3b] text-white">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-cyan-400 drop-shadow-md mb-3">
          LeGenerateurDigital
        </h1>
        <p className="text-gray-300 text-sm">
          Bienvenue 👋 — Crée ton compte pour accéder à ton espace.
        </p>
      </div>

      {/* Bloc principal */}
      <div className="flex justify-center items-center w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/70 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 space-y-5 border border-slate-700"
        >
          <h2 className="text-center text-2xl font-bold text-cyan-400 mb-4">
            Créer un compte
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="Ex: Stéphane Martin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="exemple@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md"
          >
            {loading ? "⏳ Enregistrement..." : "S’inscrire"}
          </button>

          <p className="text-center text-sm text-gray-300 mt-4">
            Déjà un compte ?{" "}
            <a href="/auth/login" className="text-cyan-400 hover:underline">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
