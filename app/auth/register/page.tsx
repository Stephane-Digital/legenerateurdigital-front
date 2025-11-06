"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { register as registerUser, setToken, me } from "@/lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Tentative d’inscription :", formData.email);
      const res = await registerUser(formData);

      if (!res.access_token) throw new Error("Aucun token reçu !");
      setToken(res.access_token);

      const user = await me();
      setUserName(user.full_name || user.email);
      setShowWelcome(true); // ✅ affiche la modale

      // ✅ attend 2.5 secondes puis redirige vers le dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3500);
    } catch (err: any) {
      console.error("❌ Erreur d’inscription :", err);
      alert(`Erreur : ${err.message || "Impossible de créer le compte"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] text-white relative">
      <div className="card-luxe w-full max-w-[600px] p-10 rounded-2xl shadow-xl bg-gradient-to-b from-[#111] to-[#1c1c1c] border border-[#2a2a2a] text-center">
        {/* === LOGO === */}
        <div className="flex justify-center mb-4">
          <Image
  src="/images/logo-lgd.png"
  alt="Logo Le Générateur Digital"
  width={140}
  height={140}
  unoptimized
  className="mx-auto drop-shadow-[0_0_15px_rgba(255,184,0,0.6)]"
/>

        </div>

        {/* === TITRE === */}
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-[#ffb800] to-[#ff8800] bg-clip-text text-transparent">
          Le Générateur Digital
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Rejoins la plateforme tout-en-un pour automatiser et propulser ton business ✨
        </p>

        <h2 className="text-3xl font-bold mb-8 text-gradient">Créer un compte</h2>

        {/* === FORMULAIRE === */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full gap-5 text-left"
        >
          {/* Nom complet */}
          <div className="w-4/5">
            <label className="block mb-2 text-sm text-gray-300">Nom complet</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="block w-full rounded-lg bg-[#222] border border-[#333] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffb800]"
              placeholder="Ex : Stéphane Dupont"
            />
          </div>

          {/* Email */}
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

          {/* Mot de passe */}
          <div className="w-4/5">
            <label className="block mb-2 text-sm text-gray-300">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="block w-full rounded-lg bg-[#222] border border-[#333] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffb800] mb-[20px]"
              placeholder="********"
            />
          </div>

          {/* Bouton inscription */}
          <button
            type="submit"
            disabled={loading}
            className="btn-luxe py-3 px-10 font-semibold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Création..." : "S’inscrire"}
          </button>
        </form>

        {/* === Lien vers connexion === */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Déjà un compte ?{" "}
          <Link
            href="/auth/login"
            className="text-[#ffb800] hover:text-[#ff8800] transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>

      {/* === MODALE DE BIENVENUE === */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="bg-[#111] border border-[#ffb800]/40 rounded-2xl shadow-[0_0_25px_rgba(255,184,0,0.3)] p-10 text-center max-w-[400px]"
            >
              <h3 className="text-3xl font-bold mb-4 text-[#ffb800]">
                🎉 Bienvenue {userName} !
              </h3>
              <p className="text-gray-300 mb-6">
                Ton espace LGD est prêt. Redirection en cours vers ton tableau de bord...
              </p>
              <div className="w-12 h-12 mx-auto border-4 border-t-[#ffb800] border-gray-700 rounded-full animate-spin"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
