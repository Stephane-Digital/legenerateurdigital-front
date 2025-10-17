"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: branche ton appel /auth/login ici si besoin
    // await login(email, pwd)
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        fontFamily: "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        padding: "24px 16px",
      }}
    >
      {/* Dégradé animé de fond */}
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
      />

      {/* ====== TITRE (le brand) ====== */}
      <h1
        style={{
          zIndex: 2,
          margin: 0,
          fontSize: "clamp(28px, 4vw, 42px)",
          fontWeight: 800,
          letterSpacing: "0.5px",
          textAlign: "center",
          background:
            "linear-gradient(90deg, #00e0ff 0%, #00ffb3 50%, #2ee59d 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 4px 24px rgba(0, 224, 255, .15)",
        }}
      >
        LeGenerateurDigital
      </h1>

      {/* ====== CARD DE CONNEXION ====== */}
      <div
        style={{
          zIndex: 2,
          width: "min(92vw, 680px)",
          borderRadius: 20,
          padding: "32px 28px",
          background:
            "radial-gradient(120% 120% at 0% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.04) 100%)",
          boxShadow: "0 16px 44px rgba(0,0,0,.35)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2
          style={{
            margin: "6px 0 22px",
            textAlign: "center",
            fontSize: "clamp(22px, 2.4vw, 30px)",
            fontWeight: 700,
            color: "#e8f7ff",
          }}
        >
          Se connecter
        </h2>

        <form
          onSubmit={onSubmit}
          style={{ display: "grid", gap: 14, marginTop: 8 }}
        >
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
          <button type="submit" style={buttonStyle}>
            Se connecter
          </button>
        </form>
      </div>

      {/* Animation CSS */}
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: 12,
  border: "none",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  outline: "none",
  fontSize: 16,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: 12,
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  color: "#fff",
  cursor: "pointer",
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  boxShadow: "0 10px 26px rgba(0, 123, 255, .35)",
};
