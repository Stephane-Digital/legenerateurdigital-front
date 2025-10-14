"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Email ou mot de passe invalide");
      }

      // Sauvegarde du token
      localStorage.setItem("token", data.access_token || data.token);
      setMessage("✅ Connexion réussie !");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🌌 Dégradé animé */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #1a2a6c, #0f2027)",
          backgroundSize: "400% 400%",
          animation: "gradientMove 15s ease infinite",
          zIndex: 0,
        }}
      ></div>

      {/* ✨ Lumières IA */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 25% 30%, rgba(0,255,255,0.1) 0%, transparent 70%), radial-gradient(circle at 75% 70%, rgba(0,100,255,0.15) 0%, transparent 70%)",
          zIndex: 1,
        }}
      ></div>

      {/* 🔐 Formulaire Login */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(255, 255, 255, 0.1)",
          padding: "40px 50px",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          maxWidth: 420,
          width: "90%",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}
      >
        <h1 style={{ color: "#00e0ff", marginBottom: 6, fontWeight: 600 }}>
          Connexion
        </h1>
        <p style={{ fontSize: 14, marginBottom: 20, color: "#d0eaff" }}>
          Bienvenue dans <strong>Le Générateur Digital</strong>
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {message && (
          <p style={{ color: "#00ffb3", marginTop: 16, fontWeight: "bold" }}>
            {message}
          </p>
        )}
        {error && (
          <p style={{ color: "#ff8080", marginTop: 16, fontWeight: "bold" }}>
            {error}
          </p>
        )}

        <p style={{ marginTop: 20, fontSize: 14 }}>
          Pas encore de compte ?{" "}
          <a
            href="/auth/register"
            style={{
              color: "#00e0ff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            S’inscrire
          </a>
        </p>
      </div>

      {/* 🌀 Animation CSS */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </main>
  );
}

const inputStyle = {
  padding: "16px 18px",
  borderRadius: 12,
  border: "none",
  fontSize: 16,
  background: "rgba(255,255,255,0.15)",
  color: "white",
  outline: "none",
};

const buttonStyle = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "16px 0",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.3s ease",
};
