"use client";

import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(fullName, email, password);
      router.push("/auth/login");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'inscription.");
    }

    setLoading(false);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-white">
      <form
        onSubmit={submit}
        className="bg-[#111] border border-yellow-600 p-10 rounded-xl w-[380px]"
      >
        <h2 className="text-center text-xl font-bold mb-6 text-[#f2c200]">
          Créer un compte
        </h2>

        <input
          type="text"
          placeholder="Votre nom complet"
          className="w-full mb-4 p-3 bg-black border border-yellow-700 rounded-lg"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 bg-black border border-yellow-700 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full mb-4 p-3 bg-black border border-yellow-700 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full p-3 bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-semibold rounded-lg"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        {error && <p className="text-red-500 mt-4 text-center">❌ {error}</p>}
      </form>
    </div>
  );
}
