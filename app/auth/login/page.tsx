// app/auth/login/page.tsx
"use client";

import { useState } from "react";

export const metadata = {
  title: "Se connecter | LeGenerateurDigital",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: appeler votre API de login ici
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        padding: "40px 16px",
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

      {/* --- TITRE GLOBAL --- */}
      <h1
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          margin: 0,
          zIndex: 2,
          fontSize: "clamp(24px, 3vw, 34px)",
          fontWeight: 700,
          letterSpacing: "0.4px",
          background:
            "linear-gradient(90deg, #00e0ff 0%, #00ffb3 50%, #00a3ff 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 2px 12px rgba(0, 224, 255, 0.25)",
          whiteSpace: "nowrap",
        }}
        aria-label="LeGenerateurDigital"
      >
        LeGenerateurDigital
      </h1>

      {/* Carte de connexion */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 720,
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 20,
        }}
      >
        <div
          style={{
            margin: "0 auto",
            width: "100%",
            maxWidth: 640,
            background: "rgba(21, 36, 50, 0.65)",
            borderRadius: 18,
            boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            padding: "28px 24px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              margin: "0 0 18px",
              fontSize: 28,
              fontWeight: 700,
              color: "#cfefff",
            }}
          >
            Se connecter
          </h2>

          <form
            onSubmit={onSubmit}
            style={{
              display: "grid",
              gap: 14,
              maxWidth: 560,
              margin: "0 auto",
            }}
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
  padding: "14px 16px",
  borderRadius: 12,
  border: "none",
  fontSize: 16,
  background: "rgba(255,255,255,0.14)",
  color: "white",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #00e0ff, #007bff)",
  color: "white",
  padding: "14px 0",
  border: "none",
  borderRadius: 12,
  fontSize: 17,
  cursor: "pointer",
};
