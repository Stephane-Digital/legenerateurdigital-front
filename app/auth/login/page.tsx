"use client";
import { useState } from "react";
import { login, setToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const data = await login(email, pwd); // { access_token: "..." }
      if (!data?.access_token) throw new Error("Token manquant");
      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setMsg(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} style={{ width: 420, maxWidth: "92%", display: "grid", gap: 12 }}>
        <h1>Se connecter</h1>
        <input placeholder="Adresse email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Mot de passe" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
        <button disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button>
        {msg && <p>{msg}</p>}
      </form>
    </main>
  );
}
