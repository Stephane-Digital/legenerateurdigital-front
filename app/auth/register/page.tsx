"use client";
import { useState } from "react";
import { api } from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const r = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // ← Assure-toi que le backend expose bien POST /auth/register
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setOk(true);
      setTimeout(() => r.push("/auth/login"), 800);
    } catch (err: any) {
      setError(err.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Créer un compte</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Nom"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full border rounded p-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {ok && <p className="text-green-600 text-sm">Compte créé ✔️</p>}

        <button className="w-full bg-black text-white rounded p-2 disabled:opacity-50" disabled={loading}>
          {loading ? "Création..." : "Créer le compte"}
        </button>

        <p className="text-sm">
          Déjà un compte ?{" "}
          <a className="underline" href="/auth/login">
            Se connecter
          </a>
        </p>
      </form>
    </main>
  );
}
