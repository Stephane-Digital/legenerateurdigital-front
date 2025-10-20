"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://legenerateurdigital-backend.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setMessage("✅ Compte créé avec succès !");
      } else {
        const errorData = await response.json();
        setMessage(`❌ Erreur : ${errorData.detail || "Inconnue"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Impossible de se connecter au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Créer un compte</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nom complet"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Adresse email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
        >
          {loading ? "Création..." : "S’inscrire"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </main>
  );
}
