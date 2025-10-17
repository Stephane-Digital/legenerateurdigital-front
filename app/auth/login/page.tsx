"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // login attend UN objet { email, password }
      const data = await login({ email, password: pwd });

      if (!data?.access_token) {
        throw new Error("Token manquant");
      }

      setToken(data.access_token);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          padding: "34px 40px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          width: "min(480px, 92%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ color: "#00e0ff", marginTop: 0, marginBottom: 12 }}>Se connecter</h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
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
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        {err && (
          <p style={{ color: "#ff8080", marginTop: 16, fontWeight: "bold" }}>
            {err}
          </p>
        )}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "none",
  fontSize: 16,
  background: "rgba(255,255,255,0.15)",
  color: "white",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "14px 0",
  border: "none",
  borderRadius: 12,
  fontSize: 16,
  cursor: "pointer",
};
