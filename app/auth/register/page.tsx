"use client";

import React, { useState } from "react";

export default function RegisterPage() {
  // 🧠 États pour stocker les données du formulaire
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // États de chargement et message
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🖊️ Mise à jour du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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
        // ✅ Succès : l’inscription a fonctionné
        alert("✅ Inscription réussie !");
        setFormData({ name: "", email: "", password: "" });
      } else {
        // ❌ Erreur serveur ou mauvaise réponse
        const errorData = await response.json().catch(() => null);
        alert(
          errorData?.message ||
            "❌ Échec de l’inscription. Vérifie tes informations ou réessaie plus tard."
        );
      }
    } catch (error) {
      // ❌ Erreur de connexion (CORS, Render offline, etc.)
      console.error("Erreur d’inscription :", error);
      alert("❌ Impossible de contacter le serveur. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Interface utilisateur
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">Créer un compte</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-lg shadow-lg w-80 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium">Nom complet</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 rounded bg-slate-700 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Adresse email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 rounded bg-slate-700 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 rounded bg-slate-700 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded transition duration-200"
        >
          {loading ? "⏳ Enregistrement..." : "S’inscrire"}
        </button>

        {message && (
          <p className="text-center text-sm text-gray-300 mt-2">{message}</p>
        )}
      </form>

      <p className="mt-6 text-sm text-gray-300">
        Déjà un compte ?{" "}
        <a href="/auth/login" className="text-cyan-400 hover:underline">
          Se connecter
        </a>
      </p>
    </div>
  );
}
