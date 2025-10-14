"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Erreur lors de l'inscription");
      }

      // ✅ Afficher le message immédiatement
      setMessage("✅ Compte créé avec succès 🎉");
      setLoading(false);

      // ✅ Attendre 2 secondes avant redirection
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
      
      return; // ⛔ empêcher d'aller plus loin

    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Créer un compte</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer un compte"}
        </button>
      </form>

      {/* ✅ Le message reste visible avant redirection */}
      {message && (
        <p style={{ color: "green", marginTop: 10, fontWeight: "bold" }}>
          {message}
        </p>
      )}
      {error && (
        <p style={{ color: "red", marginTop: 10, fontWeight: "bold" }}>
          {error}
        </p>
      )}
    </main>
  );
}
