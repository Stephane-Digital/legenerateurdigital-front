"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { login, me, setToken } from "@/lib/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Tentative de connexion…", formData.email);

      const res = await login({
        email: formData.email,
        password: formData.password,
      });

      console.log("✅ Réponse du backend :", res);

      if (!res.access_token) throw new Error("Aucun token reçu !");
      setToken(res.access_token);

      const token = localStorage.getItem("token");
      console.log("📦 Token dans localStorage :", token ? token.slice(0, 30) + "..." : "❌ Vide");

      const user = await me();
      console.log("👤 Utilisateur connecté :", user);

      alert(`✅ Bienvenue ${user.full_name || user.email} !`);
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("❌ Erreur de connexion :", err);
      alert(`Erreur : ${err.message || "Connexion impossible"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white">
      <div className="card-luxe w-full max-w-[600px] p-10 rounded-2xl shadow-xl bg-gradient-to-b from-[#111] to-[#1c1c1c] border border-[#2a2a2a] text-center">
        
        {/* Logo LGD */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo-lgd.png"
            alt="Logo Le Générateur Digital"
            width={140}
            height={140}
            className="mx-auto drop-shadow-[0_0_15px_rgba(255,184,0,0.6)]"
          />
        </div>

        {/* Titre principal */}
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-[#ffb800] to-[#ff8800] bg-clip-text text-transparent">
          Le Générateur Digital
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Un outil tout-en-un pour booster votre business dans le marketing digital.
        </p>

        <h2 className="text-3xl font-bold mb-8 text-gradient">Se connecter</h2>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full gap-5 text-left">
          {/* Champ email */}
          <div className="w-4/5">
            <label className="block mb-2 text-sm text-gray-300">Adresse e-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full rounded-lg bg-[#222] border border-[#333] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffb800]"
              placeholder="exemple@mail.com"
            />
          </div>

          {/* Champ mot de passe */}
          <div className="w-4/5">
            <label className="block mb-2 text-sm text-gray-300">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="block w-full rounded-lg bg-[#222] border border-[#333] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffb800] mb-[20px]" // ✅ marge ajoutée ici
              placeholder="********"
            />
          </div>

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={loading}
            className="btn-luxe py-3 px-10 font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Lien vers inscription */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="text-[#ffb800] hover:text-[#ff8800] transition-colors"
          >
            S’inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
