"use client";

import React, { useState } from "react";
import Link from "next/link";

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
            "❌ Erreur lors de l’inscription. Vérifie tes informations."
        );
      }
    } catch (error) {
      alert("⚠️ Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#0d2a3b] text-white">
      <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-xl w-[400px]">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-6">
          Créer un compte
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom complet</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="Stéphane Martin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Adresse email</label>
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
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
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
        </form>

        <p className="text-center text-sm text-gray-300 mt-5">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-cyan-400 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
