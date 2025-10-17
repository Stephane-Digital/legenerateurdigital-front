"use client";
import { useEffect, useState } from "react";
import { register } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await register(name, email, pwd);
      setMsg("Compte créé ! Redirection…");
      router.push("/auth/login");
    } catch (err: any) {
      setMsg(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} style={{ width: 420, maxWidth: "92%", display: "grid", gap: 12 }}>
        <h1>Créer un compte</h1>
        <input placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Adresse email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Mot de passe" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
        <button disabled={loading}>{loading ? "Création…" : "Créer un compte"}</button>
        {msg && <p>{msg}</p>}
      </form>
    </main>
  );
}

