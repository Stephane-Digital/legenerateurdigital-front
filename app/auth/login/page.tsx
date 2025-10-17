"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      // IMPORTANT: pass a single object { email, password }
      const data = await login({ email, password: pwd });

      if (!data?.access_token) {
        throw new Error("Token manquant");
      }

      setToken(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setMsg(err?.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 480,
          maxWidth: "92vw",
          padding: 24,
          borderRadius: 16,
          background: "rgba(0,0,0,0.35)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        }}
      >
        <h1 style={{ marginBottom: 16, color: "#00e0ff", textAlign: "center" }}>
          Se connecter
        </h1>

        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {msg && (
          <p style={{ color: "#ff7b7b", marginTop: 12, textAlign: "center" }}>
            {msg}
          </p>
        )}
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: 12,
  borderRadius: 10,
  border: "none",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  background: "linear-gradient(90deg,#00e0ff,#007bff)",
  fontWeight: 600,
};
